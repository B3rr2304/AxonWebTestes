---
name: axon-agent-tool-use-next
description: Estado completo do agente Axon — tool use, memória, blocos de foco e features de produção implementadas
metadata: 
  node_type: memory
  type: project
  originSessionId: c5a5c600-6979-4f9c-bf4c-4b9431d3d0f1
---

**Última atualização: 2026-06-15. Tudo testado e funcionando em produção.**

---

## Tool use (function calling) — COMPLETO

O agente Axon age de verdade durante o chat via Anthropic function calling.

**Arquivos-chave:**
- [services/tasks_service.py](backend/services/tasks_service.py): CRUD Supabase com `user_id` explícito — fonte única para router HTTP e agente
- [services/agent_tools.py](backend/services/agent_tools.py): 7 tools ativas:
  - `criar_tarefa`, `listar_tarefas`, `atualizar_tarefa`, `deletar_tarefa`
  - `salvar_memoria`, `listar_memorias`, `atualizar_memoria`
  - `execute_tool(name, input, user_id)` faz dispatch. `MUTATING_TOOLS` sinaliza refetch no frontend
- [services/claude_service.py](backend/services/claude_service.py): `stream_chat_with_tools` — loop SSE com tool use (teto 5 rodadas). **Bug crítico resolvido:** serializa `final.content` para dicts limpos antes de reenviar (SDK adiciona `caller`/`citations` que a API rejeita). Emite eventos `{"tool", "status", "ok", "mutating", "label", "summary?"}`.
- [routers/chat.py](backend/routers/chat.py): passa `user_id` ao loop; erros emitidos via SSE (não mais engolidos silenciosamente)

**Pill de ação no chat:** para tools de memória mostra o conteúdo salvo — ex: *"Registrando aprendizado ✓ — 'Academia sextas 10h-12h'"*

---

## Memória persistente do agente — COMPLETO

O Axon aprende sobre o usuário entre conversas.

- **Tabela Supabase:** `user_memories` (id, user_id, content, created_at, updated_at) com RLS ativa
- [services/memory_service.py](backend/services/memory_service.py): `save_memory`, `load_memories`, `list_memories_with_ids`, `update_memory`, `delete_memory`
- **Carregamento:** `_load_perfil` em `chat.py` busca memórias → passadas para `build_agent_prompt` → entram no system prompt como bloco "O QUE VOCÊ JÁ APRENDEU SOBRE ESTE USUÁRIO"
- **Limite:** 60 memórias por usuário (~1200 tokens extras máximo)
- **Atualização:** agente usa `listar_memorias` (retorna IDs) + `atualizar_memoria(id, novo_conteúdo)` para corrigir informações desatualizadas

---

## System prompt do agente — estrutura atual

`build_agent_prompt(perfil, memories)` em [services/prompts.py](backend/services/prompts.py) monta:
1. `BASE_IDENTITY` — identidade "colaborador guiado" + capacidade de agir com tools
2. `DATA DE HOJE` — data atual em PT para resolver "amanhã/sexta" → AAAA-MM-DD
3. Bloco do cronotipo (pico de energia, janela de foco, baixa energia)
4. Bloco de agenda (flexible/fixed/desconhecida)
5. **BLOCO DE FOCO ATUAL** — level_label + horário + descrição do bloco de 90min atual
6. **O QUE VOCÊ JÁ APRENDEU** — memórias do usuário (só se houver)
7. Dados do usuário (nome, sono, respostas do questionário)

---

## Blocos de foco cronobiológicos — COMPLETO

Sistema de 16 blocos de 90 minutos que cobrem 24h, 6 níveis de classificação.

**Arquivos:** [services/chronotype.py](backend/services/chronotype.py)

**Estruturas principais:**
- `ENERGY_LEVELS`: curvas horárias de energia por perfil (morning/intermediate/evening/night/bimodal) — editável manualmente
- `BLOCK_LEVELS`: mapeamento nível → energy%, focus%, label
- `CHRONOTYPE_BLOCKS`: 16 blocos por perfil com `(nível, descrição)` — descrições editáveis manualmente
- `get_chronotype_context(chronotype, hour)`: retorna energy, focus, level, meta do bloco atual

**Regras de classificação dos blocos:**
- Sono: horários fixos por cronotipo (Matutino 22:30-06:00, Misto/Bimodal 00:00-07:30, Vespertino/Noturno 01:30-09:00)
- 0–20: Recuperação | 21–40: Foco Leve | 41–60: Foco Moderado | 61–75: Foco Profundo | 76–100: Pico

**Dashboard API** retorna `current_block` e `next_block` (próximo imediato, mesmo que sono/recuperação). `next_focus` continua retornando a próxima janela de foco relevante (foco_moderado ou acima).

**Auto-refresh frontend:** a colega deve implementar `setInterval(load, 30*60*1000)` + `visibilitychange` em Dashboard.tsx.

---

## Planning.tsx — sem dados mockados

Tarefas reais do backend, carry-forward automático de pendências de ontem.

- `getTasks/createTask/updateTask/deleteTask` em [lib/api.ts](axonweb/src/lib/api.ts)
- Carry-forward: `POST /tasks/carry-forward` move tarefas `todo/progress` de ontem para hoje (idempotente). Banner âmbar notifica o usuário
- Calendário derivado de `scheduled_date` reais; empty state em conta nova
- Modal "+" cria via backend; botões marcar/remover funcionando

---

## Chat — histórico persistente e paginação

- **Histórico:** `GET /chat/conversations/{id}/messages` retorna mensagens em ordem cronológica. `ChatConversation.tsx` carrega ao abrir — `historyRef` populado para manter contexto nas próximas mensagens
- **Paginação real:** `GET /chat/conversations?limit=8&offset=0` — máximo 17 queries por chamada (era N×2+1). A colega precisa atualizar o frontend para fazer paginação server-side (ver [[axon-arquitetura-debug]])

---

## Dashboard — dados reais

- Saudação com nome: *"Bom dia, Bernardo. Vamos focar no que move seu dia."*
- `energy_percent` e `focus_percent` derivados do bloco de 90min atual (não mais hora a hora)
- Seção "Hoje": tarefas reais do dia (`status != done`, até 5, ordenadas por horário); empty state quando vazio
- `current_block` e `next_block` disponíveis na resposta do `/dashboard/`

---

## Otimização da IA — 2026-06-25

- **`build_agent_prompt` agora retorna `list[dict]`** (NÃO mais str): 2 blocos de system com `cache_control` — bloco ESTÁVEL (identidade+cronotipo+agenda) e bloco VOLÁTIL (data/hora+calendário+foco+memórias+usuário). Ordem estável→volátil habilita prompt caching (ganho grande nas rodadas do loop de tool use + entre requisições).
- **Raciocínio adaptativo LIGADO**: `thinking={"type":"adaptive"}` em `stream_chat_with_tools` (max_tokens 4096→8192) e `call_chat` (1024→4096). `stream_chat_with_tools` agora reenvia blocos `thinking`/`redacted_thinking` com assinatura ao continuar o loop (exigência da API).
- **`stop_reason == "refusal"` tratado** em ambos os caminhos (antes encerrava em silêncio). `call_chat` agora extrai texto via `_text_from_content` (robusto a thinking/tool_use no 1º bloco).
- **Agente agora gerencia Rotinas pelo chat**: tools `criar_rotina`/`listar_rotinas`/`pausar_rotina`/`retomar_rotina`/`deletar_rotina` em agent_tools.py (usam `routines_service`, todas em MUTATING_TOOLS exceto listar). `_resolve_to_date` converte palavra-chave→objeto date (routines_service espera `date`, não str). days_of_week 0=seg..6=dom. Item fixo (start+end) OU flexível (duration_minutes).
- Pendência futura: aplicar caching também em `notification_analyzer.py`; cache em nível de mensagem para a conversa que cresce no loop.

### Overhaul do system prompt (prompts.py, 2026-06-25, revisão item a item com Bernardo)
- **`BASE_IDENTITY` reestruturado em "DOIS MOMENTOS"**: Momento 1 (Decidir — perguntar/confirmar só se ambíguo ou mudança relevante; agir direto em ações simples/reversíveis) e Momento 2 (Executar — ferramenta primeiro, sem preâmbulo; só depois de decidir). Resolveu a contradição "confirme antes" × "execute primeiro".
- **Confirmação obrigatória para destrutivos**: deletar tarefa/rotina e mudanças amplas exigem confirmar (listar→dizer o que será removido→ok→deletar). Pausar rotina NÃO (reversível).
- **Tom suavizado**: removidas caixas-altas de ênfase (REGRA ABSOLUTA/NUNCA/erro crítico) para evitar overtriggering no Sonnet 4.6; só cabeçalhos seguem em maiúscula.
- **Seção "COMO APLICAR A CRONOBIOLOGIA"**: mapeia nível→tarefa (exigente→Pico/Foco profundo; média→Foco leve/moderado; baixa→leve/pausa; proteger Sono; traduzir p/ usuário sem jargão). Rótulos batem com BLOCK_LEVELS de chronotype.py.
- **Seção "APRENDA COM O USUÁRIO (memória)"**: quando salvar/não salvar; atualizar existente em vez de duplicar. `_memory_block` alinhado para usar `atualizar_memoria`.
- **Questionário decodificado** (`_ANSWER_OPTIONS`): P10/P11/P13/P14/P17/P18 agora viram texto real no `_user_block` (antes era "alternativa B" = ruído). P10/P11/P14 são redundantes entre si — enxugar é refinamento futuro (mexeria em `_RELEVANT_ANSWERS` de chat.py).
- **TOM E ESTILO**: limite rígido de "3 parágrafos" → respostas curtas + listas curtas para planos.
- **agent_tools.py**: `criar_tarefa` agora é só pontual/evento; `recurrence` removido de criar/atualizar_tarefa (era no-op — só `criar_rotina` repete de verdade). Constante `_RECURRENCE` removida.
- **Pendências decididas com Bernardo**: (a) janela criativa via P13 — adiado; (b) agente não grava `schedule_type` no perfil (só questionário) — se descobrir no chat, salvar via memória — ainda não implementado.

## Modelo e infra

- Modelo: `claude-sonnet-4-6` (decisão de 2026-06-25: manter no chat por latência/custo; Opus 4.8 considerado e descartado por ora)
- Roda via `npm run dev` na raiz (front 5173 + back 8000, `--reload`)
- **Armadilha conhecida:** servidor fantasma na porta 8000 de sessão anterior do Claude Code pode impedir o novo de subir. Usar `lsof -i :8000` para verificar

---

## Próximos passos anotados

1. **Fase 2 da memória:** aprender com padrões passivos de uso do app (tasks concluídas, horários frequentes) — aguarda dados reais de usuários
2. **Fase 2 dos blocos de foco:** personalizar curvas de energia com base no comportamento real do usuário
3. **Paginação frontend de conversas:** colega precisa atualizar `getConversations` e Chat.tsx para paginação server-side
4. **Blocos de foco no Dashboard:** colega precisa exibir `current_block` e `next_block` com auto-refresh
5. **Associação tarefas ↔ blocos de foco:** derivar bloco de `start_time` da tarefa (sem campo extra no banco)
