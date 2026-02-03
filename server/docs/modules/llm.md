# LlmClient Module

Documentation for the LLM client class that handles voice responses.

## File Location

`llm.py` (lines 305-550)

## Purpose

The `LlmClient` class manages:
- OpenAI Agents SDK integration
- Tool registration and execution
- Streaming response generation
- Security guardrail integration

## Class Definition

```python
class LlmClient:
    def __init__(self, call_id: str, debug=None):
        self.call_id = call_id
        self.agent = Agent(
            name="portfolio_agent",
            instructions=system_prompt,
            model="gpt-5-mini",
            tools=self.prepare_functions(),
            input_guardrails=[security_guardrail],
            model_settings=ModelSettings(
                reasoning=Reasoning(effort="minimal"),
            ),
        )
        self.debug = debug or os.getenv("LLM_DEBUG", "0") == "1"
```

## Key Methods

### draft_begin_message()

Returns the initial greeting response.

```python
def draft_begin_message(self):
    return ResponseResponse(
        response_id=0,
        content=begin_sentence,  # "Hey, I'm Bill. How can I help you?"
        content_complete=True,
        end_call=False,
    )
```

### prepare_prompt()

Converts Retell transcript to OpenAI message format.

```python
def prepare_prompt(self, request: ResponseRequiredRequest):
    prompt = [{"role": "system", "content": system_prompt}]
    
    for utterance in request.transcript:
        if utterance.role == "agent":
            prompt.append({"role": "assistant", "content": utterance.content})
        else:
            prompt.append({"role": "user", "content": utterance.content})
    
    # Add voice instruction to last user message
    if last_user_message:
        last_user_message += "\nThis is a VOICE conversation..."
    
    return prompt
```

### draft_response()

Main streaming response generator.

```python
async def draft_response(self, request: ResponseRequiredRequest):
    prompt = self.prepare_prompt(request)
    messages = [m for m in prompt if m.get("role") != "system"]
    
    result = Runner.run_streamed(self.agent, messages)
    
    async for event in result.stream_events():
        if isinstance(event, RawResponsesStreamEvent):
            # Handle text deltas
            yield ResponseResponse(content=delta, ...)
            
        elif isinstance(event, RunItemStreamEvent):
            if event.name == "tool_called":
                # Handle tool invocation
                yield ToolCallInvocationResponse(...)
                yield MetadataResponse(...)  # For navigation
                
            elif event.name == "tool_output":
                yield ToolCallResultResponse(...)
    
    yield ResponseResponse(content_complete=True)
```

### prepare_functions()

Returns the list of available tools.

```python
def prepare_functions(self) -> List[Any]:
    return [
        display_education_page,
        display_homepage,
        display_landing_page,
        display_project,
        search_projects,
        get_project_details,
    ]
```

## Event Types

### RawResponsesStreamEvent

Text content deltas from the LLM:

```python
if getattr(data, "type", "") == "response.output_text.delta":
    delta_content = getattr(data, "delta", "")
    yield ResponseResponse(content=delta_content, content_complete=False)
```

### RunItemStreamEvent

Tool calls and outputs:

```python
if event.name == "tool_called":
    # Tool is being invoked
    yield ToolCallInvocationResponse(
        tool_call_id=call_id,
        name=name,
        arguments=args,
    )

elif event.name == "tool_output":
    # Tool has returned
    yield ToolCallResultResponse(
        tool_call_id=call_id,
        content=str(output),
    )
```

## Tool Message Pattern

Navigation tools have a `message` parameter spoken before action:

```python
if name in ["display_homepage", "display_education_page", ...]:
    args_dict = json.loads(args)
    message_to_speak = args_dict.get("message")
    
    if message_to_speak:
        yield ResponseResponse(content=message_to_speak + " ", ...)
```

## Error Handling

### Guardrail Trigger

```python
if "InputGuardrailTripwireTriggered" in str(type(e).__name__):
    yield ResponseResponse(
        content="I can only share information about my background...",
        content_complete=True,
    )
    return
```

### General Errors

```python
except Exception as e:
    print(f"Error: {e}\n{traceback.format_exc()}")
    yield ResponseResponse(content="", content_complete=True)
```

## Debug Logging

Enable with `LLM_DEBUG=1`:

```python
self._log(f"draft_response: call_id={self.call_id} messages={len(messages)}")

def _log(self, *args, **kwargs):
    if self.debug:
        print(*args, **kwargs, flush=True)
```

## Model Configuration

```python
model_settings=ModelSettings(
    verbosity="low",
    reasoning=Reasoning(
        effort="minimal",
        summary="auto",
    ),
)
```

## Modifications

### Change Model

```python
self.agent = Agent(
    model="gpt-4o",  # Different model
    # ...
)
```

### Add Custom Tool

1. Define the tool function (see [../tools/navigation.md](../tools/navigation.md))
2. Add to `prepare_functions()`
3. Handle in `draft_response()` if needed

### Adjust Reasoning

```python
reasoning=Reasoning(
    effort="high",  # More reasoning
    summary="detailed",
)
```

## Related Files

- [guardrail.md](guardrail.md) - Security guardrail
- [prompts.md](prompts.md) - System prompt
- [../tools/](../tools/) - Tool definitions
- `custom_types.py` - Response types
