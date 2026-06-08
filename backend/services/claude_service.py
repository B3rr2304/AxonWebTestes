import os
import json
import anthropic

# Reexportado por compatibilidade: a montagem do prompt agora vive em services/prompts.py
from services.prompts import build_agent_prompt


def call_chat(messages: list[dict], system_prompt: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text


def stream_chat(messages: list[dict], system_prompt: str):
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=512,
        system=system_prompt,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'text': text})}\n\n"
    yield "data: [DONE]\n\n"
