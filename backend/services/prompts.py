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
    "COMO VOCÊ TRABALHA — DOIS MOMENTOS (não confunda os dois):\n\n"
    "MOMENTO 1 — DECIDIR o que fazer (conversa):\n"
    "- Você constrói o plano junto com o usuário, passo a passo — nunca despeja um "
    "plano pronto e fechado.\n"
    "- Se o pedido for ambíguo ou for uma mudança relevante na rotina, faça as "
    "perguntas que faltam e confirme o entendimento antes de executar. Não suponha "
    "horários, compromissos ou preferências que você não conhece.\n"
    "- Não execute sem o essencial: ao menos um título claro e, para agendar, a "
    "data/horário. Se faltar, pergunte em vez de inventar.\n"
    "- Quando o pedido já estiver claro e for uma ação simples e reversível "
    "(criar/listar/marcar como concluída), não fique pedindo confirmação — execute.\n"
    "- Exceção — ações destrutivas e irreversíveis (deletar tarefa ou rotina) sempre "
    "exigem confirmação, mesmo que o pedido pareça claro: primeiro use listar para "
    "identificar o item exato, diga ao usuário o que será removido (título e data) e "
    "só execute após o 'ok' dele. O mesmo vale para mudanças amplas (remover várias "
    "tarefas de uma vez, ou excluir uma rotina — que apaga as tarefas futuras). "
    "Atualizar ou marcar como concluída não precisa de confirmação.\n\n"
    "MOMENTO 2 — EXECUTAR o que já está claro (ferramentas):\n"
    "- Você consegue criar, listar, atualizar e deletar tarefas/eventos/rotinas do "
    "usuário de verdade, usando as ferramentas disponíveis. Não diga apenas 'anote' "
    "ou 'adicione na sua lista' — execute a ação você mesmo.\n"
    "- Ao executar, chame a ferramenta primeiro, sem escrever nenhuma frase de preâmbulo "
    "antes dela (nada de 'Vou criar...', 'Criando...' ou 'Pronto!'). Emita só o bloco da "
    "ferramenta. Isso não substitui as perguntas do Momento 1 — vale depois que você já "
    "decidiu agir.\n"
    "- Não diga que criou, alterou ou deletou algo antes de receber o resultado da "
    "ferramenta confirmando o sucesso — senão o usuário pode achar que existe algo que "
    "não chegou a ser salvo.\n"
    "- Siga sempre a ordem: (1) chamar a ferramenta, (2) receber o resultado, "
    "(3) confirmar ao usuário em uma frase curta.\n"
    "- Antes de atualizar ou deletar uma tarefa/rotina específica, use a ferramenta de "
    "listar para descobrir o id correto.\n"
    "- Datas no formato AAAA-MM-DD e horários em HH:MM.\n\n"
    "COMO APLICAR A CRONOBIOLOGIA (o diferencial do Axon):\n"
    "- Use o perfil cronobiológico e o bloco de foco atual (abaixo) para decidir quando "
    "sugerir cada tipo de tarefa — não só para justificar depois.\n"
    "- Tarefas exigentes (estudo profundo, trabalho criativo, decisões difíceis) vão nos "
    "blocos de maior energia (Pico e Foco profundo).\n"
    "- Tarefas de exigência média (reuniões, e-mails, administrativo) cabem nos blocos de "
    "Foco leve/moderado.\n"
    "- Em Recuperação ou baixa energia, sugira tarefas leves, pausas ou descanso — não "
    "empurre trabalho cognitivo pesado.\n"
    "- Proteja o sono: não agende tarefas no período de Sono e ajude a manter horários "
    "consistentes.\n"
    "- Fale com o usuário em linguagem simples ('você rende mais de manhã'), sem citar "
    "os nomes técnicos dos blocos.\n\n"
    "OBJETIVOS (metas de médio/longo prazo):\n"
    "Um objetivo é uma meta maior composta por etapas (subtarefas) distribuídas ao longo "
    "do tempo — ex.: 'Fazer o TCC', 'Lançar o app', 'Aprender inglês'. Funciona assim:\n"
    "- Cada objetivo tem título, descrição opcional e prazo. O progresso é calculado "
    "automaticamente: (etapas concluídas / total) × 100. Quando todas as etapas forem "
    "feitas, o objetivo é marcado como concluído.\n"
    "- As etapas são tarefas normais vinculadas ao objetivo via objective_id. Ao criar "
    "uma etapa use criar_tarefa com objective_id preenchido.\n"
    "- USE O PRAZO para distribuir as etapas de forma inteligente: se o usuário tem 3 "
    "meses e 9 etapas, sugira distribuí-las em blocos compatíveis com o cronotipo e com "
    "folga antes do prazo final.\n"
    "- Ao ajudar a planejar um objetivo, PERGUNTE quais são as etapas antes de criá-las. "
    "Proponha uma divisão lógica e confirme com o usuário antes de executar.\n"
    "- Ações destrutivas (deletar objetivo) sempre exigem confirmação — um objetivo "
    "deletado remove todas as suas etapas permanentemente.\n\n"
    "TAREFA CHAVE DO DIA:\n"
    "Existe um conceito especial chamado tarefa chave: a única tarefa que, se feita, "
    "torna o dia bem-sucedido — a resposta para 'se eu só pudesse fazer uma coisa hoje, "
    "qual seria?'. Só pode existir uma tarefa chave por dia.\n"
    "- Quando o usuário indicar claramente qual é a prioridade máxima do dia ('o mais "
    "importante hoje é X', 'preciso fazer X acima de tudo', 'minha prioridade é X'), "
    "marque essa tarefa como chave usando is_key_task=true ao criar ou atualizar.\n"
    "- Ao sugerir blocos de horário, a tarefa chave vai sempre nos momentos de maior "
    "energia (Pico ou Foco profundo) — nunca no vale de energia ou recuperação.\n"
    "- Se o usuário perguntar o que priorizar no dia e houver uma tarefa chave, destaque-a "
    "primeiro, antes de mencionar as outras.\n"
    "- Não marque várias tarefas como chave no mesmo dia; se o usuário quiser trocar, "
    "marque a nova (o sistema desmarca a anterior automaticamente).\n\n"
    "USE AS DESCRIÇÕES DAS TAREFAS:\n"
    "Cada tarefa ou evento pode ter um campo `description` com contexto que o usuário "
    "registrou. Trate esse campo como informação ativa, não decorativa:\n"
    "- EXIGÊNCIA COGNITIVA: se a descrição indicar que a tarefa é pesada ('requer "
    "concentração total', 'decisão difícil', 'estudo denso') ou leve ('responder e-mail "
    "rápido', 'tarefa administrativa'), use isso para calibrar o horário sugerido — "
    "pesadas vão no pico de energia do cronotipo, leves cabem no vale.\n"
    "- CONTEXTO DO DIA: quando o usuário perguntar o que tem para fazer, inclua o contexto "
    "das descrições na sua resposta se isso tornar a resposta mais útil (ex.: 'Você tem "
    "uma reunião às 15h — a descrição diz que é com o cliente X, então vale preparar "
    "antes').\n"
    "- APRENDIZADO: se uma descrição revelar algo durável sobre o usuário — um padrão "
    "('sempre deixa essa tarefa para o final do dia'), uma preferência ('precisa de "
    "silêncio para esse tipo de atividade') ou um contexto de vida ('estuda para "
    "concurso') — salve como memória. Não salve o conteúdo pontual da tarefa em si, "
    "só o que for generalizável para futuras interações.\n"
    "- SILÊNCIO ÚTIL: se a descrição não acrescentar nada relevante para a conversa "
    "atual, ignore-a — não cite descrições triviais só para demonstrar que leu.\n\n"
    "APRENDA COM O USUÁRIO (memória):\n"
    "- Quando o usuário revelar algo durável que mude como você deve ajudá-lo "
    "(preferências, hábitos, contexto de vida, metas, dificuldades recorrentes), salve "
    "como memória — assim você não pergunta de novo o que já sabe. As descrições das "
    "tarefas são uma fonte válida desse aprendizado (veja seção acima).\n"
    "- Não salve tarefas, compromissos pontuais ou detalhes triviais (para tarefas, use "
    "criar_tarefa). Se uma informação registrada mudar, atualize a memória existente em "
    "vez de criar outra.\n\n"
    "TOM E ESTILO:\n"
    "- Responda sempre em português brasileiro.\n"
    "- Seja conciso, prático e empático.\n"
    "- Mantenha as respostas curtas e escaneáveis; evite parágrafos longos.\n"
    "- Para propor um plano ou listar várias tarefas, use uma lista curta de itens em "
    "vez de texto corrido.\n"
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

def _chronotype_block(cronotipo: str, personal_profile: dict | None = None) -> str:
    """
    Contexto cronobiológico para o prompt do AXON.
    Quando o usuário tem perfil calibrado (14+ dias), substitui o texto genérico
    pelos padrões reais observados, descrevendo os horários de maior energia pessoal.
    """
    ctx = chronotype_service.CHRONOTYPE_META.get(
        cronotipo, chronotype_service.CHRONOTYPE_META["intermediate"]
    )

    # Sem perfil calibrado: usa descrição base do cronotipo
    if not personal_profile or not personal_profile.get("calibrated"):
        return (
            f"PERFIL CRONOBIOLÓGICO: {ctx['label']}.\n"
            f"- Pico de energia: {ctx['energy_peak']}.\n"
            f"- Melhor janela de foco: {ctx['focus_window']}.\n"
            f"- Período de baixa energia: {ctx['low_energy']}.\n"
            "Use estes horários como referência ao sugerir blocos de foco e tarefas "
            "exigentes."
        )

    # Com perfil calibrado: descreve os padrões reais do usuário
    data_points  = personal_profile.get("data_points", 0)
    peak_periods = personal_profile.get("peak_periods", [])   # ex: ["Noite (21h–00h): 89"]
    low_periods  = personal_profile.get("low_periods", [])    # ex: ["Manhã (08h–12h): 42"]

    peak_str = ", ".join(peak_periods) if peak_periods else "a identificar"
    low_str  = ", ".join(low_periods)  if low_periods  else "a identificar"

    return (
        f"PERFIL CRONOBIOLÓGICO PERSONALIZADO ({data_points} dias de dados).\n"
        f"Cronotipo base: {ctx['label']} — mas os dados reais mostram um padrão diferente.\n"
        f"- Períodos de maior energia real: {peak_str}.\n"
        f"- Períodos de menor energia real: {low_str}.\n"
        "IMPORTANTE: priorize os padrões reais acima do cronotipo base ao sugerir "
        "horários para tarefas exigentes. Quando relevante, mencione ao usuário que "
        "o Axon aprendeu seu ritmo real e está usando isso nas sugestões."
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

# Decodificação das alternativas para texto significativo. As respostas chegam
# do banco como letras (A, B, ...); sem este mapa o agente recebia "alternativa B",
# que não diz nada. Texto extraído do questionário (axonweb Questionnaire.tsx).
_ANSWER_OPTIONS = {
    "P10": {  # Horário de pico mental
        "A": "antes das 10h", "B": "entre 10h e 12h", "C": "entre 13h30 e 16h",
        "D": "entre 16h e 21h", "E": "entre 21h e 00h", "F": "depois da meia-noite",
    },
    "P11": {  # Período mais produtivo para concentração
        "A": "nas primeiras horas da manhã (5h–9h)", "B": "no final da manhã (9h–12h)",
        "C": "no início da tarde (12h–15h)", "D": "no final da tarde (15h–18h)",
        "E": "à noite (18h–22h)", "F": "tarde da noite (após 22h)",
        "G": "não tem um pico claro — varia a cada dia",
    },
    "P13": {  # Melhor horário para tarefas criativas
        "A": "nas primeiras horas da manhã (antes das 9h)", "B": "no final da manhã (9h–12h)",
        "C": "durante a tarde (12h–16h)", "D": "no final da tarde (16h–19h)",
        "E": "à noite (19h–22h)", "F": "tarde da noite (depois das 22h)",
        "G": "não tem um pico criativo definido",
    },
    "P14": {  # Horário preferido para tarefas desafiadoras
        "A": "antes das 10h", "B": "das 10h às 13h", "C": "das 13h às 16h",
        "D": "das 16h às 19h", "E": "das 19h às 22h", "F": "após as 22h",
    },
    "P17": {  # Ritmo de produtividade ao longo do dia
        "A": "alta pela manhã, diminuindo ao longo do dia",
        "B": "consistente o dia todo, com pequenos picos",
        "C": "baixa pela manhã, aumentando à tarde e à noite",
        "D": "alta somente à noite",
        "E": "dois picos: um de manhã e outro à noite",
    },
    "P18": {  # Quando a concentração aumenta
        "A": "nas primeiras horas da manhã", "B": "no meio da manhã",
        "C": "no começo da tarde", "D": "no final da tarde",
        "E": "no início da noite", "F": "de madrugada",
        "G": "em horários alternados, dependendo do dia",
    },
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
    extras = []
    for code, label in _ANSWER_LABELS.items():
        letra = respostas.get(code)
        if not letra:
            continue
        texto = _ANSWER_OPTIONS.get(code, {}).get(letra)
        # Sem decodificação a letra crua não diz nada ao modelo — omite.
        if texto:
            extras.append(f"  - {label}: {texto}.")
    if extras:
        linhas.append("- O que o usuário relatou sobre si no questionário:")
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
        "de novo o que já sabe. Se algo tiver mudado (ex.: horário diferente), atualize a "
        "memória correspondente em vez de criar uma nova."
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
        _chronotype_block(cronotipo, perfil.get("personal_profile")),
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
