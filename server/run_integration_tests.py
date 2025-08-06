#!/usr/bin/env python3
"""
Integration test runner for LLM client - tests actual API calls.
Make sure you have the required environment variables set before running:
- OPENAI_API_KEY
- PUSHER_APP_ID
- PUSHER_KEY
- PUSHER_SECRET
- PUSHER_CLUSTER

Run from the server directory:
    python run_integration_tests.py
"""

import asyncio
import json
import os
from datetime import datetime
import traceback

# Since we're running from the server directory, imports should work directly
from custom_types import (
    ResponseRequiredRequest,
    ResponseResponse,
    Utterance,
    ToolCallInvocationResponse,
    ToolCallResultResponse,
)
from llm import LlmClient
from dotenv import load_dotenv

load_dotenv()

class Colors:
    """ANSI color codes for prettier output."""
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'
    BOLD = '\033[1m'


async def test_basic_functionality(client: LlmClient):
    """Test basic LLM client functionality."""
    print(f"\n{Colors.CYAN}=== Testing Basic Functionality ==={Colors.END}")
    
    # Test 1: Begin message
    print(f"\n{Colors.YELLOW}1. Testing begin message:{Colors.END}")
    response = client.draft_begin_message()
    print(f"   Begin message: {Colors.GREEN}{response.content[:50]}...{Colors.END}")
    print(f"   Response ID: {response.response_id}")
    
    # Test 2: Transcript conversion
    print(f"\n{Colors.YELLOW}2. Testing transcript conversion:{Colors.END}")
    test_transcript = [
        Utterance(role="user", content="Hello"),
        Utterance(role="agent", content="Hi there!"),
    ]
    messages = client.convert_transcript_to_openai_messages(test_transcript)
    print(f"   Converted {len(test_transcript)} utterances to {len(messages)} messages")
    
    return True


async def test_simple_chat(client: LlmClient):
    """Test a simple chat interaction."""
    print(f"\n{Colors.CYAN}=== Testing Simple Chat ==={Colors.END}")
    
    request = ResponseRequiredRequest(
        interaction_type="response_required",
        response_id=1,
        transcript=[
            Utterance(role="user", content="Hi Bill! Tell me about yourself in one sentence.")
        ]
    )
    
    print(f"User: {Colors.BLUE}{request.transcript[0].content}{Colors.END}")
    print(f"Bill: ", end="", flush=True)
    
    response_count = 0
    async for response in client.draft_response(request):
        if isinstance(response, ResponseResponse):
            if response.content:
                print(f"{Colors.GREEN}{response.content}{Colors.END}", end="", flush=True)
            response_count += 1
    
    print(f"\n{Colors.YELLOW}(Received {response_count} response chunks){Colors.END}")
    return True


async def test_tool_calls(client: LlmClient):
    """Test tool calling functionality."""
    print(f"\n{Colors.CYAN}=== Testing Tool Calls ==={Colors.END}")
    
    test_prompts = [
        ("Show me your homepage", "display_homepage"),
        ("Display your education", "display_education_page"),
        ("Show me the SlugLoop project", "display_project"),
    ]
    
    for prompt, expected_tool in test_prompts:
        print(f"\n{Colors.YELLOW}Testing: '{prompt}'{Colors.END}")
        
        request = ResponseRequiredRequest(
            interaction_type="response_required",
            response_id=10,
            transcript=[Utterance(role="user", content=prompt)]
        )
        
        tool_called = False
        message_parts = []
        
        async for response in client.draft_response(request):
            if isinstance(response, ResponseResponse) and response.content:
                message_parts.append(response.content)
                
            elif isinstance(response, ToolCallInvocationResponse):
                tool_called = True
                print(f"   {Colors.GREEN}✓ Tool called: {response.name}{Colors.END}")
                if response.name == expected_tool:
                    print(f"   {Colors.GREEN}✓ Correct tool!{Colors.END}")
                else:
                    print(f"   {Colors.RED}✗ Expected: {expected_tool}{Colors.END}")
                    
            elif isinstance(response, ToolCallResultResponse):
                print(f"   Tool result: {response.content}")
        
        if message_parts:
            full_message = "".join(message_parts)
            print(f"   Message: {Colors.CYAN}{full_message[:100]}...{Colors.END}")
        
        if not tool_called:
            print(f"   {Colors.RED}✗ No tool was called{Colors.END}")
    
    return True


async def test_conversation_flow(client: LlmClient):
    """Test a multi-turn conversation."""
    print(f"\n{Colors.CYAN}=== Testing Conversation Flow ==={Colors.END}")
    
    conversation = [
        Utterance(role="user", content="Hi Bill!"),
        Utterance(role="agent", content="Hey! I'm Bill Zhang, engineer and hackathon enthusiast."),
        Utterance(role="user", content="Tell me about your hackathon wins and show me a project"),
    ]
    
    request = ResponseRequiredRequest(
        interaction_type="response_required",
        response_id=100,
        transcript=conversation
    )
    
    print("Conversation history:")
    for utt in conversation[:-1]:  # Show all but the last user message
        color = Colors.BLUE if utt.role == "user" else Colors.GREEN
        print(f"  {color}{utt.role.upper()}: {utt.content}{Colors.END}")
    
    print(f"\nLatest user message:")
    print(f"  {Colors.BLUE}USER: {conversation[-1].content}{Colors.END}")
    
    print(f"\n{Colors.YELLOW}Bill's response:{Colors.END}")
    
    tool_count = 0
    message_buffer = ""
    
    async for response in client.draft_response(request):
        if isinstance(response, ResponseResponse) and response.content:
            message_buffer += response.content
            print(f"{Colors.GREEN}{response.content}{Colors.END}", end="", flush=True)
            
        elif isinstance(response, ToolCallInvocationResponse):
            tool_count += 1
            print(f"\n\n{Colors.CYAN}[Tool: {response.name}]{Colors.END}")
            
        elif isinstance(response, ToolCallResultResponse):
            print(f" → {response.content}")
            print("")  # New line to continue message
    
    print(f"\n\n{Colors.YELLOW}Summary: {tool_count} tools called{Colors.END}")
    return True


async def test_error_scenarios(client: LlmClient):
    """Test error handling scenarios."""
    print(f"\n{Colors.CYAN}=== Testing Error Scenarios ==={Colors.END}")
    
    # Empty transcript
    print(f"\n{Colors.YELLOW}1. Empty transcript:{Colors.END}")
    request = ResponseRequiredRequest(
        interaction_type="response_required",
        response_id=200,
        transcript=[]
    )
    
    try:
        response_count = 0
        async for response in client.draft_response(request):
            response_count += 1
        print(f"   {Colors.GREEN}✓ Handled empty transcript (got {response_count} responses){Colors.END}")
    except Exception as e:
        print(f"   {Colors.RED}✗ Error: {e}{Colors.END}")
    
    # Very long input
    print(f"\n{Colors.YELLOW}2. Long conversation history:{Colors.END}")
    long_transcript = []
    for i in range(20):
        long_transcript.append(
            Utterance(role="user" if i % 2 == 0 else "agent", 
                      content=f"Message {i}: Some conversation content here...")
        )
    
    request = ResponseRequiredRequest(
        interaction_type="response_required",
        response_id=201,
        transcript=long_transcript
    )
    
    try:
        response_count = 0
        async for response in client.draft_response(request):
            response_count += 1
            if response_count == 1 and isinstance(response, ResponseResponse) and response.content:
                print(f"   First response: {Colors.GREEN}{response.content[:50]}...{Colors.END}")
        print(f"   {Colors.GREEN}✓ Handled long conversation (got {response_count} responses){Colors.END}")
    except Exception as e:
        print(f"   {Colors.RED}✗ Error: {e}{Colors.END}")
    
    return True


async def main():
    """Run all integration tests."""
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}🚀 LLM Client Integration Tests{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
    
    # Check environment variables
    required_vars = ["OPENAI_API_KEY", "PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"]
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    if missing:
        print(f"\n{Colors.RED}❌ Missing environment variables:{Colors.END}")
        for var in missing:
            print(f"   - {var}")
        print(f"\n{Colors.YELLOW}Set these variables and try again.{Colors.END}")
        return
    
    print(f"\n{Colors.GREEN}✓ All environment variables present{Colors.END}")
    
    # Initialize client
    try:
        client = LlmClient()
        print(f"{Colors.GREEN}✓ LLM Client initialized{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}❌ Failed to initialize: {e}{Colors.END}")
        return
    
    # Run tests
    tests = [
        ("Basic Functionality", test_basic_functionality),
        ("Simple Chat", test_simple_chat),
        ("Tool Calls", test_tool_calls),
        ("Conversation Flow", test_conversation_flow),
        ("Error Scenarios", test_error_scenarios),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
            await test_func(client)
            results.append((test_name, True, None))
            print(f"\n{Colors.GREEN}✓ {test_name} completed{Colors.END}")
        except Exception as e:
            results.append((test_name, False, str(e)))
            print(f"\n{Colors.RED}✗ {test_name} failed: {e}{Colors.END}")
            traceback.print_exc()
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}📊 Test Summary{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    
    passed = sum(1 for _, success, _ in results if success)
    failed = len(results) - passed
    
    for test_name, success, error in results:
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if success else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status} {test_name}")
        if error:
            print(f"       {Colors.RED}{error[:60]}...{Colors.END}")
    
    print(f"\n{Colors.BOLD}Results:{Colors.END}")
    print(f"  {Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"  {Colors.RED}Failed: {failed}{Colors.END}")
    print(f"  Total: {len(results)}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed!{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ Some tests failed{Colors.END}")
    
    print(f"\n{Colors.YELLOW}Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")


if __name__ == "__main__":
    asyncio.run(main()) 