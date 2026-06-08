"""
Montagem dos prompts (system prompts) dos agentes Axon.

A ideia central: NÃO escrevemos 10 prompts separados (5 cronotipos x 2 agendas).
Montamos 1 prompt na hora, encaixando peças:

    PROMPT FINAL =
        BASE_IDENTITY              (quem é o Axon — igual para todos)
      + bloco do cronotipo         (Matutino, Vespertino, ...)
      + bloco do tipo de agenda    (flexible | fixed)
      + bloco de dados do usuário  (nome, sono, respostas relevantes)

Assim, mexer numa regra geral = editar 1 lugar só.
"""

from datetime import date

from services import chronotype as chronotype_service

_WEEKDAYS_PT = [
    "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira",
    "sexta-feira", "sábado", "domingo",
]


# =============================================================
# 1. BASE — identidade e comportamento comuns a TODOS os agentes
# =============================================================

BASE_IDENTITY = (
    "Você é o Axon, um assistente de produtividade pessoal baseado em cronobiologia "
    "(o estudo dos ritmos biológicos e de como a energia, o foco e o sono variam ao "
    "longo do dia de cada pessoa).\n\n"
    "Seu papel é ajudar o usuário a organizar a rotina, priorizar tarefas e criar "
    "blocos de foco respeitando o ritmo natural dele.\n\n"
    "COMO VOCÊ TRABALHA (colaborador guiado):\n"
    "- Você constrói o plano JUNTO com o usuário, passo a passo — nunca despeja um "
    "plano pronto e fechado.\n"
    "- Antes de propor uma organização, faça as perguntas que faltam. Não suponha "
    "horários, compromissos ou preferências que você não conhece.\n"
    "- Confirme o entendimento antes de sugerir mudanças concretas na rotina.\n"
    "- Quando o usuário decidir alterações na rotina, deixe claro e combinado com ele "
    "exatamente o que será feito antes de tratar como decidido.\n\n"
    "AÇÕES QUE VOCÊ PODE EXECUTAR (ferramentas):\n"
    "- Você consegue criar, listar, atualizar e deletar tarefas/eventos/rotinas do "
    "usuário de verdade, usando as ferramentas disponíveis. Não diga apenas 'anote' "
    "ou 'adicione na sua lista' — execute a ação você mesmo.\n"
    "- Só execute depois de ter o necessário (pelo menos um título claro). Se faltar "
    "informação essencial (como a data/horário), pergunte antes em vez de inventar.\n"
    "- Antes de atualizar ou deletar uma tarefa específica, use a ferramenta de "
    "listar para descobrir o id correto.\n"
    "- Datas no formato AAAA-MM-DD e horários em HH:MM. Após executar, confirme em uma "
    "frase curta o que foi feito.\n\n"
    "TOM E ESTILO:\n"
    "- Responda sempre em português brasileiro.\n"
    "- Seja conciso, prático e empático.\n"
    "- Evite respostas longas: no máximo 3 parágrafos curtos por mensagem.\n"
    "- Use a cronobiologia para justificar suas sugestões de forma simples, sem jargão."
)


# =============================================================
# 2. BLOCO DA AGENDA — flexível vs. fixo
# =============================================================

SCHEDULE_BEHAVIOR = {
    "flexible": (
        "AGENDA DO USUÁRIO: flexível.\n"
        "Ele tem liberdade para organizar o dia do próprio jeito, sem horários fixos "
        "de trabalho ou estudo.\n"
        "- Otimize integralmente pelo cronotipo: pode sugerir horários ideais para "
        "acordar, dormir e concentrar as tarefas importantes nos picos de energia.\n"
        "- Aproveite a ausência de restrições externas para alinhar a rotina ao ritmo "
        "biológico natural dele."
    ),
    "fixed": (
        "AGENDA DO USUÁRIO: com horários fixos.\n"
        "Ele tem compromissos em horários determinados (trabalho e/ou estudo) que NÃO "
        "podem ser ignorados.\n"
        "- Nunca sugira atividades que conflitem com os horários comprometidos.\n"
        "- Se você ainda não sabe quais são esses horários fixos, PERGUNTE antes de "
        "propor qualquer organização.\n"
        "- Trabalhe dentro das janelas livres, encaixando as tarefas mais exigentes "
        "nos melhores momentos de energia que estiverem disponíveis.\n"
        "- Ajude a proteger o sono mesmo com as restrições (por exemplo, se ele precisa "
        "acordar cedo por obrigação, ajude-o a antecipar o horário de dormir)."
    ),
}


# =============================================================
# 3. BLOCO DO CRONOTIPO — reaproveita os dados de chronotype.py
# =============================================================

def _chronotype_block(cronotipo: str) -> str:
    ctx = chronotype_service.CHRONOTYPE_META.get(
        cronotipo, chronotype_service.CHRONOTYPE_META["intermediate"]
    )
    return (
        f"PERFIL CRONOBIOLÓGICO: {ctx['label']}.\n"
        f"- Pico de energia: {ctx['energy_peak']}.\n"
        f"- Melhor janela de foco: {ctx['focus_window']}.\n"
        f"- Período de baixa energia: {ctx['low_energy']}.\n"
        "Use estes horários como referência ao sugerir blocos de foco e tarefas "
        "exigentes."
    )


# =============================================================
# 4. BLOCO DE DADOS DO USUÁRIO — nome, sono, respostas relevantes
# =============================================================

# Tradução da letra da P9 (qualidade do sono) para algo significativo
_SLEEP_QUALITY = {
    "A": "excelente — dorme direto e acorda totalmente disposto",
    "B": "boa — acorda poucas vezes durante a noite, mas se sente bem",
    "C": "regular — demora a pegar no sono, mas depois dorme bem",
    "D": "ruim — acorda várias vezes e tem o sono leve",
    "E": "dorme, mas acorda cansado e sem energia",
    "F": "não detalhada",
}

# Rótulos legíveis para as respostas mais úteis ao agente
_ANSWER_LABELS = {
    "P10": "Horário de pico mental",
    "P11": "Período mais produtivo para concentração",
    "P13": "Melhor horário para tarefas criativas",
    "P14": "Horário preferido para tarefas desafiadoras",
    "P17": "Ritmo de produtividade ao longo do dia",
    "P18": "Quando a concentração aumenta",
}


def _user_block(perfil: dict) -> str:
    nome = perfil.get("nome") or "usuário"
    sono_letra = perfil.get("qualidade_sono")
    sono_desc = _SLEEP_QUALITY.get(sono_letra, "não informada")

    linhas = [
        f"DADOS DO USUÁRIO:",
        f"- Nome: {nome}.",
        f"- Qualidade do sono: {sono_desc}.",
    ]

    respostas = perfil.get("respostas") or {}
    extras = [
        f"  - {label}: alternativa {respostas[code]}"
        for code, label in _ANSWER_LABELS.items()
        if code in respostas
    ]
    if extras:
        linhas.append("- Respostas relevantes do questionário:")
        linhas.extend(extras)

    return "\n".join(linhas)


# =============================================================
# 5. MONTAGEM FINAL — junta todas as peças
# =============================================================

def build_agent_prompt(perfil: dict) -> str:
    """
    Monta o system prompt do agente certo para o usuário.

    perfil esperado:
      {
        "nome": str | None,
        "cronotipo": str,          # "Matutino", "Vespertino", ... (ou inglês)
        "schedule_type": str|None, # "flexible" | "fixed"
        "qualidade_sono": str|None,# letra A-F da P9
        "respostas": dict,         # {"P10": "B", ...}
      }
    """
    cronotipo = perfil.get("cronotipo") or "intermediate"
    schedule_type = perfil.get("schedule_type")

    hoje = date.today()
    data_atual = (
        f"DATA DE HOJE: {hoje.isoformat()} ({_WEEKDAYS_PT[hoje.weekday()]}).\n"
        "Use esta data como referência para resolver expressões como 'hoje', "
        "'amanhã' ou 'na sexta' ao agendar tarefas."
    )

    partes = [
        BASE_IDENTITY,
        data_atual,
        _chronotype_block(cronotipo),
    ]

    # O bloco de agenda só entra se soubermos o tipo.
    # Se ainda não sabemos, instruímos o agente a descobrir.
    if schedule_type in SCHEDULE_BEHAVIOR:
        partes.append(SCHEDULE_BEHAVIOR[schedule_type])
    else:
        partes.append(
            "AGENDA DO USUÁRIO: ainda desconhecida.\n"
            "Antes de organizar a rotina, descubra de forma natural se ele tem "
            "horários flexíveis ou compromissos fixos de trabalho/estudo."
        )

    partes.append(_user_block(perfil))

    return "\n\n".join(partes)
