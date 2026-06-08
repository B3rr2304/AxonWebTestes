"""
Ferramentas (function calling) do agente Axon.

Define as tools no formato do Anthropic SDK e um dispatcher `execute_tool` que
executa a ação de verdade via tasks_service, sempre respeitando o user_id do
usuário logado.

Datas devem ser passadas pelo modelo no formato YYYY-MM-DD e horários como HH:MM.
"""

from services import tasks_service

# Nomes das tools que ALTERAM o estado das tarefas (usado pelo chat para sinalizar
# ao frontend que o Planejamento precisa ser recarregado).
MUTATING_TOOLS = {"criar_tarefa", "atualizar_tarefa", "deletar_tarefa"}

# Rótulos legíveis em PT-BR para o indicador de ação no chat.
TOOL_LABELS = {
    "criar_tarefa": "Criando tarefa",
    "listar_tarefas": "Consultando tarefas",
    "atualizar_tarefa": "Atualizando tarefa",
    "deletar_tarefa": "Removendo tarefa",
}

_TASK_TYPE = {"type": "string", "enum": ["task", "event", "routine"]}
_PRIORITY = {"type": "string", "enum": ["low", "medium", "high"]}
_STATUS = {"type": "string", "enum": ["todo", "progress", "done", "scheduled"]}
_RECURRENCE = {"type": "string", "enum": ["daily", "weekly", "monthly"]}
_DATE = {"type": "string", "description": "Data no formato YYYY-MM-DD"}
_TIME = {"type": "string", "description": "Horário no formato HH:MM"}

TOOLS = [
    {
        "name": "criar_tarefa",
        "description": (
            "Cria uma nova tarefa, evento ou rotina para o usuário. Use quando o "
            "usuário pedir para adicionar/agendar algo na rotina. Confirme título e "
            "horário com o usuário antes de criar se houver ambiguidade."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Título curto da tarefa"},
                "description": {"type": "string"},
                "task_type": {**_TASK_TYPE, "description": "Padrão: task"},
                "priority": {**_PRIORITY, "description": "Padrão: medium"},
                "scheduled_date": _DATE,
                "start_time": _TIME,
                "end_time": _TIME,
                "recurrence": {**_RECURRENCE, "description": "Apenas para task_type=routine"},
                "location": {"type": "string", "description": "Local ou link (eventos)"},
                "deadline": _DATE,
            },
            "required": ["title"],
        },
    },
    {
        "name": "listar_tarefas",
        "description": (
            "Lista as tarefas do usuário, com filtros opcionais. Use para responder "
            "perguntas como 'o que tenho amanhã?' ou antes de atualizar/deletar uma "
            "tarefa específica (para descobrir o id correto)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "scheduled_date": _DATE,
                "status": _STATUS,
                "task_type": _TASK_TYPE,
            },
        },
    },
    {
        "name": "atualizar_tarefa",
        "description": (
            "Atualiza campos de uma tarefa existente (ex.: marcar como concluída, "
            "mudar horário ou prioridade). Use listar_tarefas antes se não souber o id."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "description": "id (UUID) da tarefa"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "task_type": _TASK_TYPE,
                "status": _STATUS,
                "priority": _PRIORITY,
                "scheduled_date": _DATE,
                "start_time": _TIME,
                "end_time": _TIME,
                "progress": {"type": "integer", "description": "0 a 100"},
                "recurrence": _RECURRENCE,
                "location": {"type": "string"},
                "deadline": _DATE,
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "deletar_tarefa",
        "description": "Remove permanentemente uma tarefa do usuário pelo id.",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "description": "id (UUID) da tarefa"},
            },
            "required": ["task_id"],
        },
    },
]


def execute_tool(name: str, tool_input: dict, user_id: str) -> dict:
    """Executa a tool e devolve um dict serializável para o tool_result."""
    try:
        if name == "criar_tarefa":
            task = tasks_service.create_task(
                user_id, {**tool_input, "created_by": "agent"}
            )
            return {"ok": True, "task": task}

        if name == "listar_tarefas":
            tasks = tasks_service.list_tasks(
                user_id,
                scheduled_date=tool_input.get("scheduled_date"),
                status=tool_input.get("status"),
                task_type=tool_input.get("task_type"),
            )
            return {"ok": True, "count": len(tasks), "tasks": tasks}

        if name == "atualizar_tarefa":
            data = {k: v for k, v in tool_input.items() if k != "task_id"}
            task = tasks_service.update_task(user_id, tool_input["task_id"], data)
            return {"ok": True, "task": task}

        if name == "deletar_tarefa":
            tasks_service.delete_task(user_id, tool_input["task_id"])
            return {"ok": True, "deleted": tool_input["task_id"]}

        return {"ok": False, "error": f"Ferramenta desconhecida: {name}"}
    except ValueError as e:
        return {"ok": False, "error": str(e)}
    except Exception as e:  # noqa: BLE001 — devolve erro ao modelo em vez de quebrar o stream
        return {"ok": False, "error": f"Erro inesperado: {e}"}
