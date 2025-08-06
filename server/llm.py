from typing import List
import os
import json

from openai import AsyncOpenAI
from agents import Agent, Runner, function_tool
from agents.items import ItemHelpers
from agents.stream_events import RunItemStreamEvent

from custom_types import (
    ResponseRequiredRequest,
    ResponseResponse,
    Utterance,
    ToolCallInvocationResponse,
    ToolCallResultResponse,
)

from prompts import system_prompt, begin_sentence


@function_tool
async def display_homepage() -> str:
    """Displays the homepage on the frontend."""
    # TODO: Implement actual frontend communication
    return "homepage displayed"


@function_tool
async def display_education_page() -> str:
    """Displays the education page on the frontend."""
    # TODO: Implement actual frontend communication
    return "education page displayed"


@function_tool
async def display_project(project_id: str | None = None) -> str:
    """Displays a projects page on the frontend."""
    # TODO: Implement actual frontend communication
    return f"project {project_id} displayed" if project_id else "project page displayed"


class LlmClient:
    def __init__(self, call_id: str):
        self.call_id = call_id
        self.client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        self.metadata = {}  # Store metadata from the call

        self.agent = Agent(
            name="portfolio-agent",
            instructions=system_prompt,
            model="gpt-4o-mini",
            tools=[display_homepage, display_education_page, display_project],
        )
    
    def set_metadata(self, metadata: dict):
        """Store metadata from the call for use in responses."""
        self.metadata = metadata
        print(f"LLM Client received metadata for user: {metadata.get('user_id', 'unknown')}")

    def draft_begin_message(self):
        response = ResponseResponse(
            response_id=0,
            content=begin_sentence,
            content_complete=True,
            end_call=False,
        )
        return response

    def convert_transcript_to_openai_messages(
        self, transcript: List[Utterance]
    ):
        messages = []
        
        # Add system message with user metadata if available
        if self.metadata:
            user_info = f"User ID: {self.metadata.get('user_id', 'unknown')}"
            if 'session_started' in self.metadata:
                user_info += f"\nSession started: {self.metadata['session_started']}"
            if 'platform' in self.metadata:
                user_info += f"\nPlatform: {self.metadata['platform']}"
            
            messages.append({
                "role": "system",
                "content": f"Current user information:\n{user_info}"
            })
        
        for utterance in transcript:
            role = "assistant" if utterance.role == "agent" else "user"
            messages.append({"role": role, "content": utterance.content})
        return messages

    async def draft_response(self, request: ResponseRequiredRequest):
        messages = self.convert_transcript_to_openai_messages(
            request.transcript
        )
        result = Runner.run_streamed(self.agent, messages)

        async for event in result.stream_events():
            if isinstance(event, RunItemStreamEvent):
                if event.name == "message_output_created":
                    text = ItemHelpers.text_message_output(event.item)
                    yield ResponseResponse(
                        response_id=request.response_id,
                        content=text,
                        content_complete=False,
                        end_call=False,
                    )
                elif event.name == "tool_called":
                    tc = event.item.raw_item
                    # Handle both dict and object cases
                    if isinstance(tc, dict):
                        call_id = tc.get('call_id', tc.get('id', ''))
                        name = tc.get('name', '')
                        arguments = tc.get('arguments', {})
                    else:
                        call_id = getattr(
                            tc, 'call_id', getattr(tc, 'id', '')
                        )
                        name = getattr(tc, 'name', '')
                        arguments = getattr(tc, 'arguments', {})
                    
                    yield ToolCallInvocationResponse(
                        tool_call_id=call_id,
                        name=name,
                        arguments=json.dumps(arguments),
                    )
                elif event.name == "tool_output":
                    output = str(event.item.output)
                    raw_item = event.item.raw_item
                    # Handle both dict and object cases
                    if isinstance(raw_item, dict):
                        call_id = raw_item.get(
                            'call_id', raw_item.get('id', '')
                        )
                    else:
                        call_id = getattr(
                            raw_item, 'call_id', getattr(raw_item, 'id', '')
                        )
                    
                    yield ToolCallResultResponse(
                        tool_call_id=call_id,
                        content=output,
                    )

        yield ResponseResponse(
            response_id=request.response_id,
            content="",
            content_complete=True,
            end_call=False,
        )