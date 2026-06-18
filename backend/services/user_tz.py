"""
Fuso horário do usuário — suporte a usuários do mundo todo.

O servidor roda em UTC. O fuso de cada usuário vem do navegador
(`Intl.DateTimeFormat().resolvedOptions().timeZone`), enviado no header
`X-Timezone` em cada requisição. Como acompanha viagens automaticamente, o
Axon funciona onde quer que a pessoa esteja.

Fonte da verdade durável: coluna `profiles.timezone` (para os jobs de fundo
— notificações, sync do Google — que rodam sem requisição). O header é o
sinal "ao vivo"; quando muda, persistimos no perfil.
"""

from zoneinfo import ZoneInfo, available_timezones

from database import supabase

# Fallback histórico — usuários antigos sem fuso salvo continuam funcionando.
DEFAULT_TZ = "America/Sao_Paulo"

# available_timezones() é relativamente caro; computa uma vez.
_VALID_ZONES = available_timezones()


def normalize(name: str | None) -> str | None:
    """Devolve o nome se for um fuso IANA válido, senão None."""
    if not name:
        return None
    name = name.strip()
    return name if name in _VALID_ZONES else None


def zone(name: str | None) -> ZoneInfo:
    """ZoneInfo do fuso informado, com fallback seguro para o padrão."""
    return ZoneInfo(normalize(name) or DEFAULT_TZ)


def stored_tz(user_id: str) -> str:
    """Lê o fuso salvo no perfil (ou o padrão)."""
    try:
        res = (
            supabase.table("profiles")
            .select("timezone")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return normalize((res.data or {}).get("timezone")) or DEFAULT_TZ
    except Exception:
        return DEFAULT_TZ


def resolve(user_id: str, header_value: str | None, *, stored: str | None = None) -> str:
    """
    Decide o fuso efetivo e o persiste no perfil se o header trouxe um valor
    novo e válido. `stored` pode ser passado por quem já leu o perfil, para
    evitar uma query extra.

    Prioridade: header válido > fuso salvo > padrão.
    """
    incoming = normalize(header_value)
    current = normalize(stored) if stored is not None else stored_tz(user_id)

    if incoming and incoming != current:
        try:
            supabase.table("profiles").update(
                {"timezone": incoming}
            ).eq("id", user_id).execute()
        except Exception:
            pass  # persistência é secundária — não quebra o fluxo
        return incoming

    return current or DEFAULT_TZ
