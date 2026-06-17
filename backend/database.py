import os
from supabase import create_client, Client

_url = os.environ["SUPABASE_URL"]
_service_key = os.environ["SUPABASE_SERVICE_KEY"]

# Cliente de DADOS: sempre service_role, NUNCA deve ser mutado por login.
# Usado em todas as operações .table() — bypassa RLS de propósito (o backend
# é a fronteira de segurança e já filtra por user_id explicitamente).
supabase: Client = create_client(_url, _service_key)

# Cliente de AUTH: instância separada, usada só para operações .auth.*
# (sign_up / sign_in_with_password / sign_in_with_id_token / get_user).
# Essas chamadas SETAM a sessão do cliente; mantê-las isoladas impede que o
# cliente de dados acima troque de service_role para o JWT do usuário — o que
# faria os inserts passarem a respeitar RLS e falharem em tabelas sem política
# de INSERT (ex.: notifications).
supabase_auth: Client = create_client(_url, _service_key)
