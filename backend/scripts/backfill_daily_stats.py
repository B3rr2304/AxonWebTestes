"""
Backfill pontual (rodar 1x, manualmente) após a Migration 18.

Problema: daily_task_stats nunca recebeu nenhuma linha porque reconcile()
ficava preso no ramo de "primeira execução" para usuários cujos primeiros
dias de uso não tinham tarefas — snapshot_days() pula dias com total=0, então
a tabela nunca acumulava histórico e o marcador antigo (inferido de
"existe alguma linha?") nunca avançava.

Este script chama _freeze_past_days() (NÃO reconcile()) para cada usuário com
onboarding completo, com a data REAL de hoje. Congela em daily_task_stats
todo dia passado (< hoje) ainda não snapshotado, sem tocar na tabela `tasks`.

Incidente 2026-07-03: a versão anterior deste script chamava reconcile() com
uma data falsa (hoje+1) para forçar o congelamento do dia atual — isso também
disparou carry_forward_tasks com essa data falsa, movendo tarefas reais de
sexta para sábado. _freeze_past_days() não tem esse efeito colateral: ela
nunca move tarefas, só lê e grava daily_task_stats. Por isso o dia de HOJE
nunca é congelado por este script (só na próxima virada real) — é uma
limitação aceita em troca de nunca arriscar mexer em `tasks`.

Uso:
    cd backend && python scripts/backfill_daily_stats.py           # dry-run
    cd backend && python scripts/backfill_daily_stats.py --apply   # aplica de verdade
"""

import sys
import datetime as dt
from zoneinfo import ZoneInfo

sys.path.insert(0, ".")

from database import supabase
from services import daily_stats_service, user_tz


def main(apply: bool) -> None:
    users = (
        supabase.table("profiles")
        .select("id, name, timezone")
        .not_.is_("chronotype", "null")
        .execute()
    ).data or []

    print(f"{len(users)} usuário(s) com onboarding completo.\n")

    for u in users:
        uid = u["id"]
        tz_name = user_tz.normalize(u.get("timezone")) or user_tz.DEFAULT_TZ
        local_today = dt.datetime.now(ZoneInfo(tz_name)).date()

        print(f"— {u.get('name') or uid} ({tz_name})")
        if not apply:
            print("    [dry-run] _freeze_past_days() seria chamado; nenhuma escrita feita.")
            continue

        try:
            # Só congela snapshots (< local_today). NUNCA move tarefas —
            # carry_forward_tasks não é chamado aqui de propósito.
            daily_stats_service._freeze_past_days(uid, tz_name, local_today)
            print("    OK.")
        except Exception as e:
            print(f"    ERRO: {e}")

    if not apply:
        print("\nNenhuma escrita feita (dry-run). Rode com --apply para aplicar de verdade.")


if __name__ == "__main__":
    main(apply="--apply" in sys.argv)
