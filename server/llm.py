from dataclasses import dataclass
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
    AgentInterruptResponse,
)
import pusher

from prompts import system_prompt, begin_sentence


@dataclass
class PortfolioContext:
    pusher: pusher.Pusher


@function_tool
async def display_homepage(context: PortfolioContext) -> str:
    """Displays the homepage on the frontend."""
    context.pusher.trigger("frontend", "display_homepage", {})
    return "homepage displayed"


@function_tool
async def display_education_page(context: PortfolioContext) -> str:
    """Displays the education page on the frontend."""
    context.pusher.trigger("frontend", "display_education_page", {})
    return "education page displayed"


@function_tool
async def display_project(context: PortfolioContext, project_id: str | None = None) -> str:
    """Displays a projects page on the frontend."""
    context.pusher.trigger("frontend", "display_project", {"project_id": project_id})
    return "project displayed"


class LlmClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        self.pusher = pusher.Pusher(
            app_id=os.environ["PUSHER_APP_ID"],
            key=os.environ["PUSHER_KEY"],
            secret=os.environ["PUSHER_SECRET"],
            cluster=os.environ["PUSHER_CLUSTER"],
            ssl=True,
        )

        self.agent = Agent(
            name="portfolio-agent",
            instructions=system_prompt,
            model="gpt-4o-mini",
            tools=[display_homepage, display_education_page, display_project],
        )

    def draft_begin_message(self):
        response = ResponseResponse(
            response_id=0,
            content=begin_sentence,
            content_complete=True,
            end_call=False,
        )
        return response

    def convert_transcript_to_openai_messages(self, transcript: List[Utterance]):
        messages = []
        for utterance in transcript:
            role = "assistant" if utterance.role == "agent" else "user"
            messages.append({"role": role, "content": utterance.content})
        return messages

    async def draft_response(self, request: ResponseRequiredRequest):
        context = PortfolioContext(self.pusher)
        messages = self.convert_transcript_to_openai_messages(request.transcript)
        result = Runner.run_streamed(self.agent, messages, context=context)

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
                    yield ToolCallInvocationResponse(
                        tool_call_id=tc.call_id,
                        name=tc.name,
                        arguments=json.dumps(tc.arguments),
                    )
                elif event.name == "tool_output":
                    output = str(event.item.output)
                    yield ToolCallResultResponse(
                        tool_call_id=event.item.raw_item.call_id,
                        content=output,
                    )

        yield ResponseResponse(
            response_id=request.response_id,
            content="",
            content_complete=True,
            end_call=False,
        )
