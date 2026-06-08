import os
import json
import anthropic

# Reexportado por compatibilidade: a montagem do prompt agora vive em services/prompts.py
from services.prompts import build_agent_prompt
from services import agent_tools

_MODEL = "claude-sonnet-4-6"
# Teto de rodadas de tool use numa mesma requisição, para evitar laço infinito.
_MAX_TOOL_ROUNDS = 5


def call_chat(messages: list[dict], system_prompt: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model=_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text


def stream_chat(messages: list[dict], system_prompt: str):
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    with client.messages.stream(
        model=_MODEL,
        max_tokens=512,
        system=system_prompt,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'text': text})}\n\n"
    yield "data: [DONE]\n\n"


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def stream_chat_with_tools(messages: list[dict], system_prompt: str, user_id: str):
    """
    Streaming SSE com o loop de tool use do Anthropic.

    A cada rodada: faz streaming do texto; se o modelo pediu ferramentas
    (stop_reason == "tool_use"), executa cada uma via agent_tools.execute_tool
    (respeitando o user_id), devolve os tool_results e continua o loop até o
    modelo dar uma resposta final em texto.

    Eventos SSE emitidos:
      - {"text": "..."}                              delta de texto
      - {"tool": name, "status": "running", "label", "input"}
      - {"tool": name, "status": "done", "ok": bool, "mutating": bool}
      - [DONE]
    """
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    convo = list(messages)

    for _ in range(_MAX_TOOL_ROUNDS):
        with client.messages.stream(
            model=_MODEL,
            max_tokens=1024,
            system=system_prompt,
            tools=agent_tools.TOOLS,
            messages=convo,
        ) as stream:
            for text in stream.text_stream:
                yield _sse({"text": text})
            final = stream.get_final_message()

        if final.stop_reason != "tool_use":
            break

        # Serializa os blocos para dicts limpos — o SDK adiciona campos extras
        # (ex.: "caller", "citations") que a API rejeita quando reenviados.
        content_dicts = []
        for b in final.content:
            if b.type == "text":
                content_dicts.append({"type": "text", "text": b.text})
            elif b.type == "tool_use":
                content_dicts.append({
                    "type": "tool_use",
                    "id": b.id,
                    "name": b.name,
                    "input": b.input,
                })

        convo.append({"role": "assistant", "content": content_dicts})

        tool_results = []
        for block in final.content:
            if block.type != "tool_use":
                continue

            yield _sse({
                "tool": block.name,
                "status": "running",
                "label": agent_tools.TOOL_LABELS.get(block.name, block.name),
                "input": block.input,
            })

            out = agent_tools.execute_tool(block.name, block.input, user_id)

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(out, ensure_ascii=False),
            })

            yield _sse({
                "tool": block.name,
                "status": "done",
                "ok": out.get("ok", False),
                "mutating": block.name in agent_tools.MUTATING_TOOLS,
            })

        convo.append({"role": "user", "content": tool_results})

    yield "data: [DONE]\n\n"
