import os
import json
import anthropic


def build_system_prompt(perfil: dict) -> str:
    from services import chronotype as chronotype_service
    cronotipo = perfil.get("cronotipo", "intermediate")
    ctx = chronotype_service.CHRONOTYPE_META.get(cronotipo, chronotype_service.CHRONOTYPE_META["intermediate"])
    nome = perfil.get("nome") or "usuário"
    qualidade_sono = perfil.get("qualidade_sono") or "não informada"
    respostas = perfil.get("respostas", {})

    respostas_txt = ""
    if respostas:
        labels = {
            "P10": "Horário preferido de acordar",
            "P11": "Horário preferido de dormir",
            "P13": "Nível de energia pela manhã",
            "P14": "Nível de energia à noite",
            "P17": "Facilidade de concentração",
            "P18": "Produtividade percebida",
        }
        linhas = [f"- {labels.get(k, k)}: {v}" for k, v in respostas.items() if k in labels]
        if linhas:
            respostas_txt = "\nDados adicionais do perfil:\n" + "\n".join(linhas)

    return (
        f"Você é o Axon, um assistente de produtividade pessoal baseado em cronobiologia. "
        f"Usuário: {nome}. Cronotipo: {ctx['label']}. "
        f"Pico de energia: {ctx['energy_peak']}. "
        f"Melhor janela de foco: {ctx['focus_window']}. "
        f"Período de baixa energia: {ctx['low_energy']}. "
        f"Qualidade do sono: {qualidade_sono}."
        f"{respostas_txt}\n\n"
        f"Ajude o usuário a organizar seu dia, priorizar tarefas e criar blocos de foco "
        f"respeitando seu ritmo natural. Seja conciso, prático e empático. "
        f"Quando sugerir horários ou blocos, leve em conta o perfil cronobiológico acima. "
        f"Responda sempre em português brasileiro. "
        f"Limite suas respostas a no máximo 3 parágrafos curtos."
    )


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
