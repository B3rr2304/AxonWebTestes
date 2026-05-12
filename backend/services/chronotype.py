ENERGY_CURVES: dict[str, dict[int, int]] = {
    "morning": {
        0: 10, 1: 8, 2: 8, 3: 10, 4: 35, 5: 55, 6: 70,
        7: 85, 8: 92, 9: 95, 10: 90, 11: 82,
        12: 72, 13: 60, 14: 50, 15: 48, 16: 52, 17: 55,
        18: 50, 19: 45, 20: 38, 21: 30, 22: 22, 23: 15,
    },
    "intermediate": {
        0: 15, 1: 10, 2: 8, 3: 10, 4: 18, 5: 30, 6: 45,
        7: 60, 8: 72, 9: 82, 10: 88, 11: 90,
        12: 88, 13: 78, 14: 82, 15: 85, 16: 80, 17: 72,
        18: 65, 19: 58, 20: 50, 21: 42, 22: 33, 23: 22,
    },
    "evening": {
        0: 28, 1: 18, 2: 12, 3: 10, 4: 12, 5: 15, 6: 22,
        7: 30, 8: 42, 9: 52, 10: 60, 11: 65,
        12: 68, 13: 70, 14: 78, 15: 85, 16: 88, 17: 90,
        18: 88, 19: 85, 20: 78, 21: 68, 22: 55, 23: 40,
    },
    "night": {
        0: 85, 1: 75, 2: 60, 3: 40, 4: 20, 5: 10, 6: 12,
        7: 18, 8: 25, 9: 32, 10: 38, 11: 42,
        12: 45, 13: 48, 14: 52, 15: 55, 16: 58, 17: 62,
        18: 68, 19: 75, 20: 82, 21: 88, 22: 92, 23: 90,
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
        "label": "Perfil Intermediário",
        "energy_peak": "entre 9h e 15h",
        "focus_window": "meio do dia",
        "low_energy": "após longos períodos sem pausa",
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
}

# Aliases em português para compatibilidade com o banco após classificar_cronotipo
CHRONOTYPE_META["Matutino"] = CHRONOTYPE_META["morning"]
CHRONOTYPE_META["Vespertino"] = CHRONOTYPE_META["evening"]
CHRONOTYPE_META["Noturno"] = CHRONOTYPE_META["night"]
CHRONOTYPE_META["Misto"] = CHRONOTYPE_META["intermediate"]
CHRONOTYPE_META["Bimodal"] = CHRONOTYPE_META["intermediate"]


def get_chronotype_context(chronotype: str, hour: int) -> dict:
    curve = ENERGY_CURVES.get(chronotype, ENERGY_CURVES["intermediate"])
    energy = curve.get(hour, 50)
    focus = max(0, min(100, energy - 14))
    meta = CHRONOTYPE_META.get(chronotype, CHRONOTYPE_META["intermediate"])
    return {
        "energy": energy,
        "focus": focus,
        "label": meta["label"],
        "energy_peak": meta["energy_peak"],
        "focus_window": meta["focus_window"],
        "low_energy": meta["low_energy"],
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
