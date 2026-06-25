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

from datetime import datetime, timedelta

from services import chronotype as chronotype_service
from services import user_tz

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
    "- REGRA ABSOLUTA DE EXECUÇÃO: chame a ferramenta PRIMEIRO, sem texto antes dela. "
    "NÃO gere nenhuma frase antes do bloco de ferramenta quando for executar uma ação "
    "(nem 'Vou criar...', nem 'Criando...', nem 'Pronto!'). Emita apenas o bloco da "
    "ferramenta. Só após receber o resultado da ferramenta escreva a confirmação ao usuário.\n"
    "- NUNCA diga que criou, alterou ou deletou algo sem ter recebido o resultado da "
    "ferramenta confirmando o sucesso. Dizer 'Criei' antes do resultado da ferramenta "
    "é um erro crítico — o usuário pensa que a tarefa existe mas ela pode não estar no sistema.\n"
    "- A ordem correta é sempre: (1) chamar a ferramenta silenciosamente, "
    "(2) receber o resultado, (3) confirmar ao usuário. Nunca inverta essa ordem.\n"
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

def _memory_block(memories: list[str]) -> str:
    linhas = ["O QUE VOCÊ JÁ APRENDEU SOBRE ESTE USUÁRIO:"]
    for m in memories:
        linhas.append(f"- {m}")
    linhas.append(
        "Use estes aprendizados para personalizar suas respostas sem precisar perguntar "
        "de novo o que já sabe. Se algo tiver mudado (ex.: horário diferente), salve uma "
        "nova memória corrigindo a informação anterior."
    )
    return "\n".join(linhas)


def _focus_block_context(block: dict) -> str:
    return (
        f"BLOCO DE FOCO ATUAL: {block['level_label']} ({block['start']}–{block['end']})\n"
        f"- {block['description']}\n"
        "Use este contexto para calibrar suas sugestões: num bloco de Sono ou "
        "Recuperação, evite propor tarefas cognitivas pesadas; num bloco de Pico, "
        "encoraje o usuário a dedicar tempo à sua tarefa mais importante."
    )


def build_agent_prompt(perfil: dict, memories: list[str] | None = None) -> list[dict]:
    """
    Monta o system prompt do agente certo para o usuário.

    Retorna uma LISTA de blocos de texto (formato da API Anthropic), dividida em:
      1. Bloco ESTÁVEL  — identidade + cronotipo + agenda. Igual entre requisições
         (e compartilhado entre usuários do mesmo cronotipo/agenda). Recebe
         `cache_control` para ser servido do cache de prompt.
      2. Bloco VOLÁTIL  — data/hora, calendário, bloco de foco atual, memórias e
         dados do usuário. Muda a cada minuto, então fica DEPOIS do ponto de cache.
         Também marcado para cache, o que reaproveita o prefixo nas várias rodadas
         do loop de tool use de uma mesma mensagem (onde o prompt é idêntico).

    A ordem (estável antes de volátil) é o que torna o cache eficaz: qualquer byte
    que muda invalida tudo que vem depois dele.

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

    tz = user_tz.zone(perfil.get("timezone"))
    agora = datetime.now(tz)
    hoje = agora.date()

    # ---- Bloco ESTÁVEL (cacheável entre requisições) ----------------------
    estaveis = [
        BASE_IDENTITY,
        _chronotype_block(cronotipo),
    ]
    # O bloco de agenda só entra se soubermos o tipo.
    # Se ainda não sabemos, instruímos o agente a descobrir.
    if schedule_type in SCHEDULE_BEHAVIOR:
        estaveis.append(SCHEDULE_BEHAVIOR[schedule_type])
    else:
        estaveis.append(
            "AGENDA DO USUÁRIO: ainda desconhecida.\n"
            "Antes de organizar a rotina, descubra de forma natural se ele tem "
            "horários flexíveis ou compromissos fixos de trabalho/estudo."
        )

    # ---- Bloco VOLÁTIL (muda a cada requisição) ---------------------------
    # Calendário de referência: o modelo é ruim em CALCULAR datas (erra "amanhã"
    # por um dia), mas ótimo em COPIAR de uma tabela. Listamos os próximos 14 dias
    # já resolvidos para ele nunca precisar fazer aritmética de data de cabeça.
    linhas_cal = []
    for i in range(15):
        d = hoje + timedelta(days=i)
        rotulo = d.isoformat() + f" ({_WEEKDAYS_PT[d.weekday()]})"
        if i == 0:
            rotulo += "  ← HOJE"
        elif i == 1:
            rotulo += "  ← AMANHÃ"
        linhas_cal.append("  " + rotulo)
    calendario = "\n".join(linhas_cal)

    data_atual = (
        f"DATA E HORA AGORA: {hoje.isoformat()} ({_WEEKDAYS_PT[hoje.weekday()]}), "
        f"{agora.strftime('%H:%M')} no fuso do usuário ({tz.key}).\n\n"
        "CALENDÁRIO DE REFERÊNCIA (apenas para você raciocinar e conversar):\n"
        f"{calendario}\n"
        "REGRAS DE DATA (críticas, erros aqui são graves):\n"
        "- Ao chamar uma ferramenta, para datas relativas passe a PALAVRA-CHAVE no campo "
        "de data em vez de calcular: use 'hoje', 'amanhã', 'depois de amanhã' ou o nome do "
        "dia da semana ('sexta', 'segunda', ...). O sistema converte para a data exata no "
        "fuso do usuário automaticamente. NÃO calcule a data você mesmo — você erra a conta.\n"
        "- Use o formato AAAA-MM-DD APENAS quando o usuário disser uma data de calendário "
        "específica (ex.: 'dia 25', '03/07'). Nesse caso, copie da tabela acima.\n"
        "- Ao criar VÁRIAS tarefas para o mesmo dia, repita a mesma palavra-chave (ex.: "
        "'hoje') em todas — não mude para outra data no meio.\n"
        "- Ao confirmar ao usuário, releia o resultado da ferramenta e repita a data que "
        "realmente foi gravada (o campo scheduled_date que voltou) — nunca um rótulo diferente.\n"
        "- Se houver qualquer dúvida sobre qual data o usuário quis, pergunte antes de agendar."
    )

    volateis = [data_atual]

    current_block = perfil.get("current_block")
    if current_block:
        volateis.append(_focus_block_context(current_block))

    if memories:
        volateis.append(_memory_block(memories))

    volateis.append(_user_block(perfil))

    # Dois blocos com ponto de cache cada. O 1º (estável) é reaproveitado entre
    # requisições/usuários; o 2º (volátil) é reaproveitado entre as rodadas de
    # tool use de uma mesma mensagem.
    return [
        {
            "type": "text",
            "text": "\n\n".join(estaveis),
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": "\n\n".join(volateis),
            "cache_control": {"type": "ephemeral"},
        },
    ]
