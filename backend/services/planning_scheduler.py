"""
Scheduler de lembretes de planejamento.

Roda a cada minuto via APScheduler e cria notificações de planejamento
para usuários cujo horário configurado foi atingido.

Fluxo:
  1. Busca todos os usuários com cronótipo definido (onboarding completo)
  2. Para cada um, calcula o horário efetivo (configurado ou baseado em cronótipo)
  3. Se a hora atual (no fuso do usuário) bate com o horário efetivo → cria notificação
  4. Cooldowns impedem duplicatas no mesmo dia / semana
"""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from database import supabase
from services import notification_service
from services import user_tz as user_tz_service

# Horários de disparo por cronótipo quando planning_use_chronotype = true
_CHRONOTYPE_TIME = {
    "morning":      "07:00",
    "intermediate": "08:30",
    "evening":      "09:30",
    "night":        "10:30",
    "bimodal":      "08:00",
    # aliases em português
    "Matutino":  "07:00",
    "Misto":     "08:30",
    "Vespertino":"09:30",
    "Noturno":   "10:30",
    "Bimodal":   "08:00",
}

_DEFAULT_WEEKLY_DAY = 0  # Segunda-feira

_CURVE_KEY = {
    "Matutino": "morning", "Vespertino": "evening", "Noturno": "night",
    "Misto": "intermediate", "Bimodal": "bimodal",
    "morning": "morning", "evening": "evening",
    "night": "night", "intermediate": "intermediate", "bimodal": "bimodal",
}

_DAILY_BODY = {
    "morning":      "Seu período de maior clareza está começando. Reserve alguns minutos para definir o que é essencial hoje — vai fazer diferença no aproveitamento do dia.",
    "intermediate": "É um bom momento para organizar suas prioridades. Definir suas tarefas agora vai te ajudar a manter o foco ao longo do dia.",
    "evening":      "Você ainda tem bastante energia pela frente. Planejar o dia agora garante que você vai aproveitar bem os próximos blocos.",
    "night":        "Antes de entrar em ritmo pleno, reserve alguns minutos para definir o que é essencial hoje.",
    "bimodal":      "Você tem dois picos de energia hoje. Planejar agora garante que você vai aproveitá-los ao máximo.",
}

_WEEKLY_BODY = {
    "morning":      "Semana começando! Matutinos costumam render mais quando a semana está bem planejada desde o início. Que tal organizar suas prioridades?",
    "intermediate": "É o momento ideal para definir o norte da semana. Reserve alguns minutos para distribuir suas metas pelos próximos dias.",
    "evening":      "Mesmo que você funcione melhor à tarde, planejar a semana cedo evita perder oportunidades antes do seu pico de energia.",
    "night":        "Sabe aquela semana que parece caótica? Costuma ser a que não foi planejada. Reserve 10 minutos agora para organizar os próximos dias.",
    "bimodal":      "Com dois picos de energia por dia, planejar bem a semana faz toda a diferença no aproveitamento deles.",
}

_WEEKDAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]


def _daily_fire_time(prefs: dict) -> str:
    if _bool(prefs.get("daily_use_chronotype"), True):
        return _CHRONOTYPE_TIME.get(prefs.get("chronotype", "intermediate"), "08:30")
    return prefs.get("daily_planning_time") or "08:30"


def _weekly_fire_time(prefs: dict) -> str:
    if _bool(prefs.get("weekly_use_chronotype"), True):
        return _CHRONOTYPE_TIME.get(prefs.get("chronotype", "intermediate"), "08:30")
    return prefs.get("daily_planning_time") or "08:30"


def _effective_weekly_day(prefs: dict) -> int:
    day = prefs.get("weekly_planning_day")
    return day if day is not None else _DEFAULT_WEEKLY_DAY


def _bool(val, default: bool) -> bool:
    return val if val is not None else default


def run() -> None:
    """Job chamado pelo APScheduler a cada minuto."""
    now_utc = datetime.now(timezone.utc)

    try:
        res = (
            supabase.table("profiles")
            .select(
                "id, name, chronotype, timezone, "
                "daily_planning_enabled, daily_planning_time, daily_use_chronotype, "
                "weekly_planning_enabled, weekly_planning_day, weekly_use_chronotype"
            )
            .not_.is_("chronotype", "null")
            .execute()
        )
        users = res.data or []
    except Exception as e:
        print(f"[planning_scheduler] erro ao buscar usuários: {e}", flush=True)
        return

    for user in users:
        try:
            _process_user(user, now_utc)
        except Exception as e:
            print(f"[planning_scheduler] erro user={user.get('id')}: {e}", flush=True)


def _process_user(user: dict, now_utc: datetime) -> None:
    user_id = user["id"]
    daily_enabled  = _bool(user.get("daily_planning_enabled"),  True)
    weekly_enabled = _bool(user.get("weekly_planning_enabled"), True)

    if not daily_enabled and not weekly_enabled:
        return

    tz_name   = user_tz_service.stored_tz(user_id)
    now_local = now_utc.astimezone(ZoneInfo(tz_name))
    current_hhmm    = now_local.strftime("%H:%M")
    current_weekday = now_local.weekday()

    curve_key  = _CURVE_KEY.get(user.get("chronotype", "intermediate"), "intermediate")
    first_name = (user.get("name") or "você").split()[0]

    weekly_day       = _effective_weekly_day(user)
    weekly_fire_time = _weekly_fire_time(user)
    daily_fire_time  = _daily_fire_time(user)

    # Semanal: dispara no dia + horário específico para semanal
    if weekly_enabled and current_weekday == weekly_day and current_hhmm == weekly_fire_time:
        if not notification_service.has_planning_reminder_this_week(user_id):
            body = _WEEKLY_BODY.get(curve_key, _WEEKLY_BODY["intermediate"])
            notification_service.create_notification(
                user_id=user_id,
                notif_type="planning_weekly",
                title=f"Planejamento da semana, {first_name}",
                body=body,
            )
            print(f"[planning_scheduler] planning_weekly → user={user_id}", flush=True)

    # Diário: dispara todo dia no horário específico para diário
    if daily_enabled and current_hhmm == daily_fire_time:
        if not notification_service.has_planning_reminder_today(user_id):
            body = _DAILY_BODY.get(curve_key, _DAILY_BODY["intermediate"])
            notification_service.create_notification(
                user_id=user_id,
                notif_type="planning_daily",
                title=f"Planejamento do dia, {first_name}",
                body=body,
            )
            print(f"[planning_scheduler] planning_daily → user={user_id}", flush=True)
