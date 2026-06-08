from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def _user_or_ip(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        # Usa prefixo do token como chave — identifica o usuário sem expor o token completo
        return f"u:{auth[7:23]}"
    return get_remote_address(request)


limiter = Limiter(key_func=get_remote_address)
chat_limiter = Limiter(key_func=_user_or_ip)
