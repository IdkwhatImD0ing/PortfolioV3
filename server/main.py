import json
import os
import asyncio
import traceback
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from concurrent.futures import TimeoutError as ConnectionTimeoutError
from retell import Retell
from custom_types import (
    ConfigResponse,
    ResponseRequiredRequest,
)
from typing import Optional
from socket_manager import manager
from llm import LlmClient


load_dotenv(override=True)

# Validate required environment variables at startup
def validate_environment_variables():
    """Validate that all required environment variables are set."""
    required_vars = {
        "RETELL_API_KEY": "Retell API key for voice services",
        "OPENAI_API_KEY": "OpenAI API key for embeddings and LLM",
        "PINECONE_API_KEY": "Pinecone API key for vector database",
    }
    
    optional_vars = {
        "OBFUSCATED_WS_PATH": "WebSocket path obfuscation (defaults to 'ws-default')",
        "LLM_DEBUG": "Enable debug logging for LLM (0 or 1, defaults to 0)",
    }
    
    missing_required = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_required.append(f"  - {var}: {description}")
    
    if missing_required:
        error_msg = "Missing required environment variables:\n" + "\n".join(missing_required)
        error_msg += "\n\nPlease set these variables in your .env file or environment."
        raise ValueError(error_msg)
    
    # Log optional variables status
    print("Environment variables validated successfully:")
    for var in required_vars:
        print(f"  ✓ {var} is set")
    
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print(f"  ✓ {var} is set to: {value}")
        else:
            print(f"  ℹ {var} not set ({description})")

# Validate environment on startup
validate_environment_variables()

app = FastAPI()
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

retell = Retell(api_key=os.getenv("RETELL_API_KEY"))


@app.get("/ping")
async def ping():
    return {"message": "pong"}


# Handle webhook from Retell server. This is used to receive events from Retell server.
# Including call_started, call_ended, call_analyzed
@app.post("/webhook")
async def handle_webhook(request: Request):
    try:
        post_data = await request.json()
        valid_signature = retell.verify(
            json.dumps(post_data, separators=(",", ":"), ensure_ascii=False),
            api_key=str(os.getenv("RETELL_API_KEY")),
            signature=str(request.headers.get("X-Retell-Signature")),
        )
        if not valid_signature:
            print(
                "Received Unauthorized",
                post_data["event"],
                post_data["data"]["call_id"],
            )
            return JSONResponse(status_code=401, content={"message": "Unauthorized"})
        if post_data["event"] == "call_started":
            print("Call started event", post_data["data"]["call_id"])
        elif post_data["event"] == "call_ended":
            print("Call ended event", post_data["data"]["call_id"])
        elif post_data["event"] == "call_analyzed":
            print("Call analyzed event", post_data["data"]["call_id"])
        else:
            print("Unknown event", post_data["event"])
        return JSONResponse(status_code=200, content={"received": True})
    except Exception as err:
        print(f"Error in webhook: {err}")
        return JSONResponse(
            status_code=500, content={"message": "Internal Server Error"}
        )


# Start a websocket server to exchange text input and output with Retell server. Retell server
# will send over transcriptions and other information. This server here will be responsible for
# generating responses with LLM and send back to Retell server.
@app.websocket(f"/{os.environ.get('OBFUSCATED_WS_PATH', 'ws-default')}" + "/{call_id}")
async def websocket_handler(websocket: WebSocket, call_id: str):
    # Initialize tasks set before try block for proper cleanup
    tasks = set()
    
    try:
        print(f"Attempting to accept websocket for call_id={call_id}")
        await websocket.accept()
        print("WebSocket accepted", call_id)
        llm_client = LlmClient(call_id)
        call_metadata = None  # Will store metadata from call_details

        # Send optional config to Retell server
        config = ConfigResponse(
            response_type="config",
            config={
                "auto_reconnect": True,
                "call_details": True,
            },
            response_id=1,
        )
        print("Sent initial config", flush=True)
        await websocket.send_json(config.__dict__)
        response_id = 0

        async def handle_message(request_json):
            try:
                nonlocal response_id
                nonlocal llm_client
                # There are 5 types of interaction_type: call_details, pingpong, update_only, response_required, and reminder_required.
                # Not all of them need to be handled, only response_required and reminder_required.
                print("handle_message received:", request_json.get("interaction_type"))
                if request_json["interaction_type"] == "call_details":
                    # Send first message to signal ready of server
                    first_event = llm_client.draft_begin_message()
                    print("Sent first_event", flush=True)
                    await websocket.send_json(first_event.__dict__)
                    return
                if request_json["interaction_type"] == "ping_pong":
                    await websocket.send_json(
                        {
                            "response_type": "ping_pong",
                            "timestamp": request_json["timestamp"],
                        }
                    )
                    return
                if request_json["interaction_type"] == "update_only":
                    return
                if (
                    request_json["interaction_type"] == "response_required"
                    or request_json["interaction_type"] == "reminder_required"
                ):
                    response_id = request_json["response_id"]
                    request = ResponseRequiredRequest(
                        interaction_type=request_json["interaction_type"],
                        response_id=response_id,
                        transcript=request_json["transcript"],
                    )
                    print(
                        f"Received {request_json['interaction_type']} response_id={response_id}",
                        flush=True,
                    )

                    async for event in llm_client.draft_response(request):
                        await websocket.send_json(event.__dict__)
                        if request.response_id < response_id:
                            print(
                                "Detected newer response_id, abandoning current stream"
                            )
                            break  # new response needed, abandon this one
            except Exception as e:
                print(
                    f"Exception in handle_message: {e}\n{traceback.format_exc()}\nPayload: {request_json}",
                    flush=True,
                )

        async for data in websocket.iter_json():
            # Create task and add to tracking set
            task = asyncio.create_task(handle_message(data))
            tasks.add(task)
            
            # Remove completed tasks from the set
            task.add_done_callback(lambda t: tasks.discard(t))

    except WebSocketDisconnect:
        print(f"LLM WebSocket disconnected for {call_id}")
    except ConnectionTimeoutError as e:
        print("Connection timeout error for {call_id}")
    except Exception as e:
        print(f"Error in LLM WebSocket: {e} for {call_id}")
        await websocket.close(1011, "Server error")
    finally:
        # Cancel all pending tasks to prevent memory leaks
        for task in tasks:
            if not task.done():
                task.cancel()
        
        # Wait for all tasks to complete cancellation
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        
        print(f"LLM WebSocket connection closed for {call_id}")
