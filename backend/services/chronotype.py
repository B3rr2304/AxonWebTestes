ENERGY_LEVELS = {
    "morning": {
        0: 12, 1: 8,  2: 8,  3: 10, 4: 30, 5: 55,
        6: 72, 7: 85, 8: 92, 9: 95, 10: 90, 11: 82,
        12: 62, 13: 48, 14: 42, 15: 45, 16: 50, 17: 48,
        18: 42, 19: 36, 20: 30, 21: 22, 22: 16, 23: 12,
    },
    # Misto: platô amplo sem pico único. Fallback para cronotipos desconhecidos.
    "intermediate": {
        0: 18, 1: 12, 2: 10, 3: 12, 4: 22, 5: 36,
        6: 52, 7: 64, 8: 72, 9: 78, 10: 80, 11: 80,
        12: 72, 13: 65, 14: 68, 15: 74, 16: 76, 17: 72,
        18: 64, 19: 56, 20: 46, 21: 36, 22: 26, 23: 20,
    },
    "evening": {
        0: 30, 1: 20, 2: 14, 3: 10, 4: 10, 5: 12,
        6: 18, 7: 26, 8: 36, 9: 46, 10: 55, 11: 62,
        12: 64, 13: 62, 14: 60, 15: 72, 16: 82, 17: 90,
        18: 90, 19: 86, 20: 76, 21: 62, 22: 48, 23: 38,
    },
    "night": {
        0: 70, 1: 55, 2: 40, 3: 28, 4: 18, 5: 10,
        6: 10, 7: 14, 8: 20, 9: 28, 10: 34, 11: 40,
        12: 44, 13: 46, 14: 50, 15: 54, 16: 60, 17: 68,
        18: 76, 19: 84, 20: 88, 21: 90, 22: 88, 23: 80,
    },
    # Bimodal: dois picos distintos. Base: Kleitman (1963), Lavie (1986).
    "bimodal": {
        0: 14, 1: 8,  2: 8,  3: 10, 4: 22, 5: 38,
        6: 55, 7: 70, 8: 82, 9: 92, 10: 92, 11: 84,
        12: 65, 13: 48, 14: 46, 15: 58, 16: 80, 17: 90,
        18: 88, 19: 76, 20: 60, 21: 44, 22: 28, 23: 18,
    },
}

CHRONOTYPE_META: dict[str, dict] = {
    "morning": {
        "label": "Perfil Matutino",
        "energy_peak": "entre 7h e 11h",
        "focus_window": "manhã",
        "low_energy": "fim da tarde e noite",
    },
    "intermediate": {
        "label": "Perfil Misto",
        "energy_peak": "entre 10h e 17h (platô amplo)",
        "focus_window": "múltiplas janelas ao longo do dia",
        "low_energy": "depende do dia e contexto",
    },
    "evening": {
        "label": "Perfil Vespertino",
        "energy_peak": "entre 14h e 20h",
        "focus_window": "tarde e início da noite",
        "low_energy": "início da manhã",
    },
    "night": {
        "label": "Perfil Noturno",
        "energy_peak": "entre 20h e 01h",
        "focus_window": "noite",
        "low_energy": "manhã",
    },
    "Matutino": {
        "label": "Perfil Matutino",
        "energy_peak": "entre 7h e 11h",
        "focus_window": "manhã",
        "low_energy": "fim da tarde e noite",
    },
    "Vespertino": {
        "label": "Perfil Vespertino",
        "energy_peak": "entre 14h e 20h",
        "focus_window": "tarde e início da noite",
        "low_energy": "início da manhã",
    },
    "Noturno": {
        "label": "Perfil Noturno",
        "energy_peak": "entre 20h e 01h",
        "focus_window": "noite",
        "low_energy": "manhã",
    },
    "Misto": {
        "label": "Perfil Misto",
        "energy_peak": "entre 9h e 15h (com variabilidade)",
        "focus_window": "múltiplas janelas ao longo do dia",
        "low_energy": "depende do dia",
    },
    "Bimodal": {
        "label": "Perfil Bimodal",
        "energy_peak": "entre 9h–11h e 16h–18h",
        "focus_window": "manhã e fim de tarde",
        "low_energy": "entre 12h e 15h",
    },
    "bimodal": {
        "label": "Perfil Bimodal",
        "energy_peak": "entre 9h–11h e 16h–18h",
        "focus_window": "manhã e fim de tarde",
        "low_energy": "entre 12h e 15h",
    },
}


# ---------------------------------------------------------------------------
# Níveis de bloco — energia e foco associados a cada classificação
# ---------------------------------------------------------------------------

BLOCK_LEVELS: dict[str, dict] = {
    "sono":          {"energy": 10, "focus":  5, "label": "Sono"},
    "recuperacao":   {"energy": 30, "focus": 20, "label": "Recuperação"},
    "foco_leve":     {"energy": 55, "focus": 48, "label": "Foco leve"},
    "foco_moderado": {"energy": 70, "focus": 63, "label": "Foco moderado"},
    "foco_profundo": {"energy": 85, "focus": 78, "label": "Foco profundo"},
    "pico":          {"energy": 95, "focus": 88, "label": "Pico"},
}

# ---------------------------------------------------------------------------
# Blocos de 90 minutos — 16 blocos cobrem as 24h do dia.
# Índice → horário de início: 0=00:00, 1=01:30, 2=03:00, 3=04:30, 4=06:00,
# 5=07:30, 6=09:00, 7=10:30, 8=12:00, 9=13:30, 10=15:00, 11=16:30,
# 12=18:00, 13=19:30, 14=21:00, 15=22:30
# Cada entrada: (nível, descrição do que o usuário deveria fazer nesse período).
# Para editar: altere o nível ou a descrição do bloco correspondente.
# ---------------------------------------------------------------------------

CHRONOTYPE_BLOCKS: dict[str, list[tuple[str, str]]] = {
    "morning": [
        ("sono",          "Descanso e sono"),                                           # 00:00
        ("sono",          "Descanso e sono"),                                           # 01:30
        ("sono",          "Descanso e sono"),                                           # 03:00
        ("sono",          "Despertar e atividades leves para acordar"),                                                          # 04:30
        ("foco_profundo", "Projetos importantes, criação e trabalhos complexos "),     # 06:00
        ("pico",          "Começo do pico - começar tarefas mais importantes ou desafiadoras"),      # 07:30
        ("pico",          "Pico total — reserve para sua tarefa mais desafiadora"),     # 09:00
        ("pico",          "Pico mantido — continue nas demandas de alto nível"),        # 10:30
        ("foco_moderado", "Almoço e momento ideal para estudos"),            # 12:00
        ("foco_moderado", "Momento idal para estudos, resposta de emails e reuniões"),             # 13:30
        ("foco_moderado", "Momento idal para resposta de mensagens, reuniões e tarefas leves"),     # 15:00
        ("foco_moderado", "Momento idal para resposta de mensagens, reuniões e tarefas leves"),                    # 16:30
        ("foco_moderado", "Momento idal para resposta de mensagens, reuniões e tarefas leves"),            # 18:00
        ("foco_leve",     "Comece a desacelerar, momento ideal para planejamento, atividade física leve e relaxar"),           # 19:30
        ("recuperacao",   "Preparação para dormir evite atividade  cognitivas intensas"),               # 21:00
        ("sono",          "Descanso e sono"),                                      # 22:30
    ],
    "evening": [
        ("foco_leve",     "Desacelere comece a se preparar para descansar"),                    # 00:00
        ("sono",          "Descanso e sono"),                                             # 01:30
        ("sono",          "Descanso e sono"),                                  # 03:00
        ("sono",          "Descanso e sono"),                           # 04:30
        ("sono",          "Descanso e sono"),                     # 06:00
        ("sono",          "Despertar lento — rotina leve, sem demandas cognitivas"),    # 07:30
        ("foco_moderado", "Momento ideal para tarefas leves e fáceis ou planejamento do dia"),    # 09:00
        ("foco_moderado", "Momento ideal para começar tarefas complexas"),   # 10:30
        ("foco_profundo", "Almoço e descanso ativo ideal para estudos e retomar tarefas da manhã"),         # 12:00
        ("foco_profundo", "Comece suas tarefas complexas ou reuniões"),                # 13:30
        ("foco_profundo", "Momento ideal para fazer a principal tarefa do dia"),    # 15:00
        ("pico",          ""),               # 16:30
        ("pico",          "Pico vespertino — sua tarefa mais importante aqui"),         # 18:00
        ("pico",          "Alta performance — bom para escrita, análise e síntese"),    # 19:30
        ("foco_profundo", "Foco residual — finalize o que começou"),                    # 21:00
        ("foco_moderado", "Desaceleração — inicie a rotina de sono"),                   # 22:30
    ],
    "night": [
        ("foco_profundo", "Janela noturna — trabalho com menos distrações"),            # 00:00
        ("sono",          "Produtividade decline — finalize tarefas em andamento"),     # 01:30
        ("sono",          "Desaceleração — inicie a rotina de sono"),                   # 03:00
        ("sono",          "Sono — evite compromissos neste período"),                   # 04:30
        ("sono",          "Sono profundo — não interromper"),                           # 06:00
        ("sono",          "Sono — fase de transição"),                                  # 07:30
        ("foco_leve",     "Despertar gradual — rotina leve, sem exigências"),           # 09:00
        ("foco_leve",     "Aquecimento tardio — tarefas automáticas e rotineiras"),     # 10:30
        ("foco_moderado", "Produtividade iniciando — emails e organização"),            # 12:00
        ("foco_moderado", "Operacional — reuniões leves e tarefas repetitivas"),        # 13:30
        ("foco_moderado", "Energia crescendo — planejamento e revisões"),               # 15:00
        ("foco_moderado", "Pré-aquecimento noturno — prepare as tarefas do pico"),      # 16:30
        ("pico",          "Energia elevada — trabalho analítico e criativo"),           # 18:00
        ("pico",          "Foco noturno — tarefas de alto nível"),                      # 19:30
        ("pico",          "Pico noturno — sua melhor janela cognitiva"),                # 21:00
        ("pico",          "Alta performance — produtividade máxima"),                   # 22:30
    ],
    "bimodal": [
        ("sono",          "Sono profundo — não interromper"),                           # 00:00
        ("sono",          "Sono profundo — fase REM"),                                  # 01:30
        ("sono",          "Sono profundo — consolidação de memória"),                   # 03:00
        ("sono",          "Transição do sono — despertar gradual"),                     # 04:30
        ("sono",          "Rotina matinal — ativação gradual, exercício leve"),         # 06:00
        ("foco_profundo", "Aquecimento — tarefas de média exigência cognitiva"),        # 07:30
        ("pico",          "Primeiro pico — sua tarefa mais importante da manhã"),       # 09:00
        ("pico",          "Pico mantido — continue nas demandas de alto nível"),        # 10:30
        ("foco_profundo", "Transição — finalize o que está em andamento"),              # 12:00
        ("foco_moderado", "Vale bimodal — pausa estratégica, refeição e descanso"),     # 13:30
        ("foco_moderado", "Retomada — segundo pico se aproximando"),                    # 15:00
        ("pico",          "Segundo pico iniciando — trabalho profundo vespertino"),     # 16:30
        ("pico",          "Segundo pico — criatividade e resolução de problemas"),      # 18:00
        ("pico",          "Alta performance vespertina — execução de alto nível"),      # 19:30
        ("foco_moderado", "Desaceleração — tarefas leves e organização"),               # 21:00
        ("foco_leve",     "Rotina noturna — prepare o ambiente para o sono"),           # 22:30
    ],
    "intermediate": [
        ("sono",          "Sono profundo — não interromper"),                           # 00:00
        ("sono",          "Sono profundo — fase REM"),                                  # 01:30
        ("sono",          "Sono profundo — consolidação de memória"),                   # 03:00
        ("sono",          "Transição do sono — despertar gradual"),                     # 04:30
        ("sono",          "Rotina matinal — ativação gradual, alimentação"),            # 06:00
        ("foco_profundo", "Aquecimento cognitivo — planejamento e emails"),             # 07:30
        ("pico",          "Alta performance — trabalho profundo e analítico"),          # 09:00
        ("pico",          "Foco mantido — continue nas tarefas exigentes"),             # 10:30
        ("foco_profundo", "Pós-almoço — reuniões e tarefas colaborativas"),             # 12:00
        ("foco_profundo", "Segunda janela — projetos em andamento"),                    # 13:30
        ("foco_profundo", "Foco moderado — tarefas de média complexidade"),             # 15:00
        ("pico",          "Foco vespertino — boa janela para análise e criação"),       # 16:30
        ("foco_profundo", "Produtividade declinando — finalize tarefas do dia"),        # 18:00
        ("foco_moderado", "Tarefas leves — organização e planejamento do amanhã"),      # 19:30
        ("foco_leve",     "Descompressão — lazer, atividade física, jantar"),           # 21:00
        ("foco_leve",     "Rotina noturna — prepare o ambiente para o sono"),           # 22:30
    ],
}


def get_chronotype_context(chronotype: str, hour: int) -> dict:
    block_idx = (hour * 60) // 90
    blocks = CHRONOTYPE_BLOCKS.get(chronotype, CHRONOTYPE_BLOCKS["intermediate"])
    level, _ = blocks[block_idx]
    level_data = BLOCK_LEVELS[level]
    meta = CHRONOTYPE_META.get(chronotype, CHRONOTYPE_META["intermediate"])
    return {
        "energy": level_data["energy"],
        "focus":  level_data["focus"],
        "level":  level,
        "label":  meta["label"],
        "energy_peak":  meta["energy_peak"],
        "focus_window": meta["focus_window"],
        "low_energy":   meta["low_energy"],
    }


def classify_chronotype(scores: dict) -> str:
    return max(scores, key=lambda k: scores[k])


# --- Bloco 2: classificação completa via respostas do questionário ---

TABELA_PONTOS: dict[str, dict[str, dict[str, int]]] = {
    "P1": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 1, "Vespertino": 1, "Noturno": 0, "Misto": 3, "Bimodal": 1},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P2": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "D": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P3": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "D": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P4": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "D": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P5": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 0},
        "B": {"Matutino": 1, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 2},
        "D": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 1},
    },
    "P6": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 1},
    },
    "P7": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 0},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 2},
        "D": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 1},
    },
    "P8": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 1, "Bimodal": 1},
        "D": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P10": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P11": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
        "G": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 3, "Bimodal": 0},
    },
    "P12": {
        "A": {"Matutino": 1, "Vespertino": 1, "Noturno": 1, "Misto": 2, "Bimodal": 1},
        "B": {"Matutino": 1, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 0},
        "C": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "D": {"Matutino": 1, "Vespertino": 2, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "E": {"Matutino": 0, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 1},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 0},
        "G": {"Matutino": 0, "Vespertino": 0, "Noturno": 1, "Misto": 0, "Bimodal": 0},
    },
    "P13": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
        "G": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 3, "Bimodal": 0},
    },
    "P14": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P15": {
        "A": {"Matutino": 0, "Vespertino": 1, "Noturno": 3, "Misto": 0, "Bimodal": 0},
        "B": {"Matutino": 2, "Vespertino": 0, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 3, "Vespertino": 2, "Noturno": 0, "Misto": 1, "Bimodal": 0},
        "D": {"Matutino": 1, "Vespertino": 1, "Noturno": 0, "Misto": 2, "Bimodal": 1},
    },
    "P16": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
    },
    "P17": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 0},
        "B": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 3, "Bimodal": 0},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 2, "Misto": 0, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 3},
    },
    "P18": {
        "A": {"Matutino": 3, "Vespertino": 0, "Noturno": 0, "Misto": 0, "Bimodal": 1},
        "B": {"Matutino": 2, "Vespertino": 1, "Noturno": 0, "Misto": 1, "Bimodal": 2},
        "C": {"Matutino": 0, "Vespertino": 2, "Noturno": 0, "Misto": 2, "Bimodal": 0},
        "D": {"Matutino": 0, "Vespertino": 2, "Noturno": 1, "Misto": 1, "Bimodal": 1},
        "E": {"Matutino": 0, "Vespertino": 0, "Noturno": 2, "Misto": 0, "Bimodal": 2},
        "F": {"Matutino": 0, "Vespertino": 0, "Noturno": 3, "Misto": 0, "Bimodal": 0},
        "G": {"Matutino": 0, "Vespertino": 0, "Noturno": 0, "Misto": 3, "Bimodal": 0},
    },
}

PESOS: dict[str, int] = {
    "P1": 3, "P2": 3, "P3": 3, "P4": 3, "P5": 3, "P7": 3, "P8": 3,
    "P10": 2, "P11": 2, "P14": 2, "P17": 2,
    "P6": 1, "P12": 1, "P13": 1, "P15": 1, "P16": 1, "P18": 1,
}

_CRONOTIPOS = ["Matutino", "Vespertino", "Noturno", "Misto", "Bimodal"]
_DESEMPATE_PERGUNTAS = {"P1", "P4", "P5", "P7", "P8"}


def classificar_cronotipo(respostas: dict) -> tuple[str, dict[str, int]]:
    pontos: dict[str, int] = {c: 0 for c in _CRONOTIPOS}

    if respostas.get("P17") == "E":
        return "Bimodal", pontos

    candidato_misto = respostas.get("P18") == "G"

    for pergunta, alternativa in respostas.items():
        if pergunta == "P9" or pergunta not in TABELA_PONTOS:
            continue
        alternativa_pts = TABELA_PONTOS[pergunta].get(alternativa)
        if alternativa_pts is None:
            continue
        peso = PESOS.get(pergunta, 1)
        for cronotipo, pts in alternativa_pts.items():
            pontos[cronotipo] += pts * peso

    max_pts = max(pontos.values())
    empatados = [c for c in _CRONOTIPOS if pontos[c] == max_pts]

    if len(empatados) == 1:
        vencedor = empatados[0]
    else:
        desempate: dict[str, int] = {c: 0 for c in _CRONOTIPOS}
        for pergunta in _DESEMPATE_PERGUNTAS:
            alternativa = respostas.get(pergunta)
            if not alternativa:
                continue
            alternativa_pts = TABELA_PONTOS.get(pergunta, {}).get(alternativa)
            if alternativa_pts is None:
                continue
            peso = PESOS.get(pergunta, 1)
            for cronotipo, pts in alternativa_pts.items():
                desempate[cronotipo] += pts * peso
        vencedor = max(empatados, key=lambda c: desempate[c])

    if candidato_misto and vencedor != "Misto":
        if pontos[vencedor] - pontos["Misto"] <= 3:
            vencedor = "Misto"

    return vencedor, pontos
