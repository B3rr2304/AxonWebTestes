"""
Motor de correlações reais entre hábitos e resultados (Descobertas do Axon).

Diferença para insights_service.py: aquele manda os dados crus para o Claude
e pede para "identificar padrões" em texto livre — LLM não é confiável para
fazer aritmética de correlação a partir de uma lista JSON (generaliza ou
inventa magnitude). Aqui o BACKEND calcula as diferenças reais (código
determinístico); o Claude só traduz números já corretos em frases naturais.

Varredura genérica, não hipóteses fixas: todo par (condição binária dos dados
do usuário) × (métrica de resultado) é testado, no mesmo dia e no dia
seguinte (efeito defasado, ex. "sexta com exercício → sábado melhor"). Só
reporta pares com >= MIN_GROUP_SIZE dias em CADA grupo (evita ruído de
amostra pequena) e ranqueia por magnitude da diferença.

Adicionar uma condição ou métrica nova = adicionar ao dicionário; a
combinatória generaliza sozinha, sem escrever um teste por hipótese.
"""

import json
from datetime import date, timedelta

from services import claude_service

# Mínimo de dias em CADA grupo (com/sem a condição) para considerar a
# comparação confiável — evita "1 dia ruim vs 1 dia bom" virar "padrão".
MIN_GROUP_SIZE = 5

# Diferença mínima entre grupos para valer a pena mostrar ao usuário.
MIN_DIFF_RATIO = 0.10   # 10% de variação na métrica
MIN_DIFF_RATING = 0.4   # ou 0.4 pontos em escalas 1-5

MAX_FINDINGS = 6


# ── Condições binárias (derivadas do daily_log) ─────────────────────────────
# Cada condição é (label, fn(row) -> bool | None). None = dado ausente naquele
# dia (não entra em nenhum dos dois grupos).

def _cond_sleep_lt(hours: float):
    def fn(row):
        h = row.get("hours_slept")
        return None if h is None else h < hours
    return fn


def _cond_rating_le(field: str, threshold: int):
    def fn(row):
        v = row.get(field)
        return None if v is None else v <= threshold
    return fn


def _cond_tag_present(field: str, tag: str):
    def fn(row):
        tags = row.get(field)
        if tags is None:
            return None
        return tag in tags
    return fn


def _base_conditions() -> list[tuple[str, str]]:
    """
    Condições fixas (sempre testadas) — (chave, descrição em pt-BR).
    Cada par é testado só numa direção (ex.: só "não fez exercício", não
    também "fez exercício") — as duas são a mesma comparação de trás para
    frente, e reportar as duas duplicaria a descoberta na lista do usuário.
    """
    return [
        ("sleep_lt6", "dormiu menos de 6 horas"),
        ("sleep_lt7", "dormiu menos de 7 horas"),
        ("sleep_quality_low", "avaliou a qualidade do sono como baixa (nota 1-2)"),
        ("mood_low", "estava com o humor baixo (nota 1-2)"),
        ("no_exercise", "não fez atividade física"),
    ]


_CONDITION_FNS = {
    "sleep_lt6": _cond_sleep_lt(6),
    "sleep_lt7": _cond_sleep_lt(7),
    "sleep_quality_low": _cond_rating_le("sleep_rating", 2),
    "mood_low": _cond_rating_le("mood_rating", 2),
    "no_exercise": lambda row: None if row.get("exercised") is None else not row["exercised"],
}


def _dynamic_tag_conditions(rows: list[dict]) -> list[tuple[str, str]]:
    """
    Descobre condições a partir das tags livres que o próprio usuário usou
    (sleep_tags/mood_tags/productivity_tags) — generaliza para qualquer tag
    sem precisar prever o vocabulário de antemão.
    """
    conds: list[tuple[str, str]] = []
    seen: set[str] = set()
    tag_fields = {
        "sleep_tags": "no registro de sono",
        "mood_tags": "no registro de humor",
        "productivity_tags": "no registro de produtividade",
    }
    for field, ctx in tag_fields.items():
        for row in rows:
            for tag in row.get(field) or []:
                key = f"tag:{field}:{tag}"
                if key in seen:
                    continue
                seen.add(key)
                label = f"marcou '{tag}' {ctx}"
                conds.append((key, label))
                _CONDITION_FNS[key] = _cond_tag_present(field, tag)
    return conds


# ── Métricas de resultado ────────────────────────────────────────────────

_METRICS: dict[str, tuple[str, str]] = {
    # chave -> (campo na linha, descrição em pt-BR)
    "tasks_completed": ("tarefas_concluidas", "tarefas concluídas"),
    "productivity_rating": ("produtividade_percebida_1a5", "produtividade percebida (1-5)"),
    "mood_rating": ("humor_1a5", "humor (1-5)"),
}

_RATING_METRICS = {"productivity_rating", "mood_rating"}


def _metric_value(row: dict, metric_key: str) -> float | None:
    field, _ = _METRICS[metric_key]
    v = row.get(field)
    return None if v is None else float(v)


# ── Motor de varredura ──────────────────────────────────────────────────

def _split_groups(
    rows_by_date: dict[date, dict],
    cond_fn,
    metric_key: str,
    lag_days: int,
) -> tuple[list[float], list[float]] | None:
    """
    Separa os dias em grupo COM a condição e SEM ela, olhando a métrica no
    dia + lag_days (lag_days=0 → mesmo dia; lag_days=1 → dia seguinte).
    Retorna (valores_com, valores_sem) ou None se não há como comparar.
    """
    with_cond: list[float] = []
    without_cond: list[float] = []

    for d, row in rows_by_date.items():
        has = cond_fn(row)
        if has is None:
            continue
        target_row = rows_by_date.get(d + timedelta(days=lag_days))
        if target_row is None:
            continue
        val = _metric_value(target_row, metric_key)
        if val is None:
            continue
        (with_cond if has else without_cond).append(val)

    if len(with_cond) < MIN_GROUP_SIZE or len(without_cond) < MIN_GROUP_SIZE:
        return None
    return with_cond, without_cond


def find_correlations(rows: list[dict]) -> list[dict]:
    """
    Varre todo par (condição × métrica × mesmo-dia/dia-seguinte) nos dados
    já agregados por insights_service.aggregate_daily (que usa chaves em
    pt-BR: 'data', 'tarefas_concluidas', 'produtividade_percebida_1a5', etc.)
    e retorna as descobertas estatisticamente confiáveis, ranqueadas pela
    magnitude da diferença. Pura — sem I/O — testável isoladamente.
    """
    rows_by_date: dict[date, dict] = {}
    for r in rows:
        try:
            d = date.fromisoformat(r["data"])
        except (KeyError, ValueError, TypeError):
            continue
        rows_by_date[d] = r

    if len(rows_by_date) < MIN_GROUP_SIZE * 2:
        return []

    conditions = _base_conditions() + _dynamic_tag_conditions(rows)

    findings = []
    for cond_key, cond_label in conditions:
        cond_fn = _CONDITION_FNS[cond_key]
        for metric_key, (_, metric_label) in _METRICS.items():
            for lag_days, lag_label in ((0, "no mesmo dia"), (1, "no dia seguinte")):
                split = _split_groups(rows_by_date, cond_fn, metric_key, lag_days)
                if not split:
                    continue
                with_vals, without_vals = split

                avg_with = sum(with_vals) / len(with_vals)
                avg_without = sum(without_vals) / len(without_vals)

                if metric_key in _RATING_METRICS:
                    diff_abs = avg_with - avg_without
                    if abs(diff_abs) < MIN_DIFF_RATING:
                        continue
                    diff_pct = None
                else:
                    if avg_without == 0:
                        continue
                    diff_pct = (avg_with - avg_without) / avg_without
                    if abs(diff_pct) < MIN_DIFF_RATIO:
                        continue
                    diff_abs = avg_with - avg_without

                findings.append({
                    "condition": cond_label,
                    "metric": metric_label,
                    "lag": lag_label,
                    "same_day": lag_days == 0,
                    "group_with_n": len(with_vals),
                    "group_without_n": len(without_vals),
                    "avg_with": round(avg_with, 2),
                    "avg_without": round(avg_without, 2),
                    "diff_abs": round(diff_abs, 2),
                    "diff_pct": round(diff_pct * 100, 1) if diff_pct is not None else None,
                    # magnitude comparável entre ratings (0-5) e contagens: normaliza
                    # pela variação relativa quando possível.
                    "_rank": abs(diff_pct) if diff_pct is not None else abs(diff_abs) / 5,
                })

    findings.sort(key=lambda f: f["_rank"], reverse=True)
    for f in findings:
        f.pop("_rank", None)
    return findings[:MAX_FINDINGS]


# ── Tradução para linguagem natural (Claude só escreve, não calcula) ────────

_WRITER_SYSTEM_PROMPT = """Você é o Axon, assistente pessoal de produtividade. Você recebe uma lista de \
descobertas estatísticas JÁ CALCULADAS (o backend fez a matemática) comparando dias em que o usuário \
teve uma condição (ex.: dormiu pouco) contra dias em que não teve, medindo o efeito numa métrica de \
resultado (ex.: tarefas concluídas), no mesmo dia ou no dia seguinte.

Sua ÚNICA tarefa é traduzir cada descoberta em uma frase natural, direta e útil — em primeira pessoa \
do Axon falando com o usuário. Regras estritas:
- NUNCA invente, arredonde de forma enganosa ou altere os números fornecidos. Use exatamente os valores \
  dados (diff_pct ou diff_abs, avg_with, avg_without).
- NUNCA adicione uma causa que não esteja nos dados (ex.: não diga "porque você está estressado" se \
  isso não veio na descoberta).
- Português do Brasil, tom de parceiro próximo, sem jargão estatístico (não diga "grupo", "amostra", \
  "n=", "correlação" — fale em "dias em que você...").
- "lag"="no dia seguinte" significa que a condição foi num dia e o efeito apareceu no dia seguinte — \
  deixe isso claro na frase (ex.: "quando você ... num dia, no dia seguinte ...").
- Cada item tem um "title" curto (até ~60 caracteres) e um "detail" de 1 frase com o número real.

Responda APENAS com JSON válido, sem texto fora dele, neste formato:
[{"title": "...", "detail": "..."}]"""


def _findings_to_user_message(findings: list[dict]) -> str:
    return (
        f"Aqui estão {len(findings)} descobertas estatísticas reais (já calculadas, não altere os "
        "números) sobre os hábitos do usuário. Traduza cada uma em uma frase natural, mantendo a "
        "ordem (a primeira é a mais forte).\n\n"
        + json.dumps(findings, ensure_ascii=False, indent=2)
    )


def _parse_written_findings(text: str) -> list[dict]:
    if not text:
        return []
    cleaned = text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```", 2)
        cleaned = parts[1] if len(parts) > 1 else text
        if cleaned.lstrip().startswith("json"):
            cleaned = cleaned.lstrip()[4:]
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end < start:
        return []
    try:
        data = json.loads(cleaned[start:end + 1])
    except json.JSONDecodeError:
        return []
    if not isinstance(data, list):
        return []
    out = []
    for item in data:
        if not isinstance(item, dict):
            continue
        title = (item.get("title") or "").strip()
        detail = (item.get("detail") or "").strip()
        if title and detail:
            out.append({"title": title, "detail": detail})
    return out


def write_findings(findings: list[dict]) -> list[dict]:
    """
    Traduz as descobertas (já calculadas por find_correlations) em frases
    naturais via Claude. Preserva os dados numéricos originais mesclados no
    resultado (o frontend pode usá-los; o texto é só para leitura).
    """
    if not findings:
        return []
    text = claude_service.call_chat(
        messages=[{"role": "user", "content": _findings_to_user_message(findings)}],
        system_prompt=_WRITER_SYSTEM_PROMPT,
    )
    written = _parse_written_findings(text)
    out = []
    for i, w in enumerate(written):
        if i >= len(findings):
            break
        out.append({**w, **findings[i]})
    return out
