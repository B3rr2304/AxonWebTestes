---
name: axon-rotinas-planejamento
description: "Plano completo da feature de Rotinas do Axon — fases, estado de implementação e testes pendentes"
metadata: 
  node_type: memory
  type: project
  originSessionId: e83aa46d-d511-489f-b935-099adfc56c3f
---

Feature de **Rotinas** (`/rotinas`) planejada e em andamento.

**Why:** Usuário quer gerenciar rotinas nomeadas com múltiplos itens, agendamento pelo Axon via blocos de energia do cronotipo, streak, pausa/retomada e detecção de conflito.

**How to apply:** Usar o plano de fases abaixo para continuar. Backend vai antes, frontend via prompt para a colega.

## Modelo de dados (Fase 1 — ✅ SQL rodado)
- `routines(id, user_id, name, status, start_date, end_date, paused_until, generated_until, created_at, updated_at)`
- `routine_items(id, routine_id, user_id, title, days_of_week int[], start_time, end_time, duration_minutes, created_at, updated_at)`
- `tasks.routine_item_id` (FK → routine_items, nullable) — ✅ coluna adicionada

Convenção `days_of_week`: 0=Seg, 1=Ter, ..., 6=Dom (Python date.weekday()).

## Estado de implementação

| Fase | Descrição | Status |
|---|---|---|
| 1 | SQL: routines + routine_items + tasks.routine_item_id | ✅ Concluído |
| 2 | Schemas + services/routines_service.py + routers/routines.py + main.py | ✅ Concluído |
| 3 | Geração de tarefas (fixo + Axon flexível + conflito) | ✅ Concluído (16 testes E2E) |
| 4 | Pausa/Retomada | ✅ Concluído (18 testes E2E) |
| 5 | Streak task-based + renovação automática lazy | ✅ Concluído (14 testes E2E) |
| 6 | Frontend: página /rotinas (lista) | ✅ Concluído (Claude, branch alteracoes-gerais) |
| 7 | Frontend: criação (bottom sheet stepper) | ✅ Concluído (Claude) |
| 8 | Frontend: detalhe/edição/pausa/retomada/exclusão | ✅ Concluído (Claude) |
| 9 | Frontend: card "Rotinas hoje" no Dashboard | ⬜ ADIADO (baixa prioridade, decidido em 2026-06-24) |

**Estado em 2026-06-24:** Fases 6–8 do frontend prontas, build e `tsc --noEmit` limpos. Fase 9 adiada a pedido do Bernardo — projeto de rotinas pausado por ora.

**Fase 9 (quando retomar) — card "Rotinas hoje" no `pages/Dashboard.tsx`:** mostrar progresso diário por rotina ativa ("Estudos: 1/2 concluídos hoje"). DECISÃO PENDENTE de arquitetura: as tasks de rotina só guardam `routine_item_id` (NÃO routine_id nem nome — ver `_materialize` em routines_service.py; não seta group_name), e `GET /routines` (lista) não traz os itens. Então mapear task→rotina exige OU (a) endpoint novo no backend tipo `GET /routines/today` retornando `[{id,name,completed,total}]` das ativas — 1 chamada, limpo, recomendado; OU (b) frontend N+1: getRoutines + getRoutine de cada ativa (paralelo) + getTasks(scheduled_date=hoje) e agrupar por routine_item_id. Precisa também adicionar `routine_item_id` ao tipo `Task` em api.ts (backend já expõe). Perguntei a escolha ao Bernardo mas ele adiou antes de responder.

**Frontend Fases 6–8 (implementado direto, não via prompt):** API em `axonweb/src/lib/api.ts` — tipos `Routine`/`RoutineItem`/`RoutineDetail`/`RoutineCreateInput`/`RoutineItemUpdateInput` + `getRoutines/getRoutine/createRoutine/pauseRoutine/resumeRoutine/updateRoutine/deleteRoutine/updateRoutineItem`. Rotas em `app/App.jsx`: `/rotinas` (lista) e `/rotinas/:id` (detalhe). Link na Sidebar (ícone `Repeat`, abaixo de Insights).
- `pages/Rotinas.tsx`: lista + skeleton + estado vazio + ação rápida pausar/retomar; cards navegam p/ `/rotinas/:id` (botão de ação usa stopPropagation).
- `components/rotinas/NewRoutineSheet.tsx`: criação em sheet 3 passos (nome → itens → datas; modal p/ rotina sem fim). NÃO há rota `/rotinas/nova`.
- `components/rotinas/routineItem.tsx`: módulo compartilhado (WEEKDAYS, DraftItem, blankItem, itemValid, itemToDraft, draftToCreateInput, draftToUpdateInput, RoutineItemEditor) reusado por criação e edição.
- `pages/RotinaDetalhe.tsx`: nome editável inline, card status+streak ("🔥 X dias seguidos" ou "Sem sequência ainda"), lista de itens com edição inline (aviso "Apenas as tarefas futuras serão alteradas"), **adicionar item** (editor inline, usa `addRoutineItem` → `POST /items`) e **excluir item** (botão lixeira por item + modal de confirmação, `deleteRoutineItem` → `DELETE /items/{id}`), pausar (modal c/ data opcional), retomar, excluir rotina (modal destrutivo). API extra: `addRoutineItem`/`deleteRoutineItem` em api.ts.

**Cuidado importante (edição de item):** `RoutineItemUpdate` no backend NÃO tem validador fixo-vs-flexível (só o Create tem) e `update_item` aplica o payload direto com exclude_unset. Por isso `draftToUpdateInput` envia null no lado não usado ao trocar de modo (fixo↔flexível), senão o item ficaria com start/end E duration preenchidos.

## Decisões/detalhes de implementação (Fases 2 e 3)
- **Opção A**: `POST /routines` aceita `items` inline e já gera 60 dias numa chamada. `RoutineCreate.items: list[RoutineItemCreate]`. Endpoint separado `POST /routines/{id}/items` existe para adicionar item depois.
- `RoutineUpdate` tem `status` (active/paused) — prep p/ Fase 4.
- Item é **fixo OU flexível** (model_validator): start_time+end_time OU duration_minutes, nunca os dois/nenhum.
- **Streak** (já pronto na F2): consecutivos terminando hoje; dia sem item previsto é neutro; hoje pendente tem carência; passado incompleto quebra. Lookback 90d.
- **Geração**: `generate_tasks_for_routine(routine_id,user_id,from,until)` (atualiza generated_until) e `_materialize(...)` (insere em lote, NÃO mexe em generated_until). Fixos materializados primeiro p/ flexíveis evitarem conflito.
- **pick_best_slot / _free_slot**: ranqueia os 16 blocos por `BLOCK_LEVELS[nivel]['energy']` desc (empate=mais cedo); `_block_energy` usa `.get(...,0)` pois há typos nos níveis em CHRONOTYPE_BLOCKS (ex.: 'Recuperacao'). Slot precisa caber antes da meia-noite (end<=1440) e não sobrepor (`_overlap`: s1<e2 and s2<e1). Considera tasks já no banco + as do mesmo lote (busy_by_date).
- Tasks geradas: task_type='event' (fixo) ou 'task' (flexível), status='todo', created_by='agent', priority='medium', routine_item_id preenchido.
- `create_routine`: gen_from=max(start,today), gen_until=gen_from+60. `add_item`: gera de hoje até generated_until (se >=hoje). `update_item`: deleta futuras (>=hoje, !=done) e regera de hoje até generated_until.
- **TaskResponse agora expõe `routine_item_id`** (front identifica tasks de rotina).

## Pontos a resolver / flags p/ Bernardo
- **Google Calendar sync NÃO roda na geração em lote** (evitar 100+ threads/refreshes). Tasks ficam só no DB (fonte da verdade). Sincronizar em lote é trabalho futuro.
- **Edge:** criar rotina SEM items deixa generated_until=start-1 (ontem); adicionar item depois NÃO gera nada (range vazio). No fluxo Opção A (criar com items) isso não ocorre. Decidir se add_item deve bootstrapar horizonte de 60d quando não há.
- `update_item` parcial não revalida fixo-vs-flexível (pode deixar item inconsistente se editar só um lado). Avaliar na Fase 4/5.

## Regras de produto decididas
- Rotina sem fim → gera 60 dias à frente, renova automaticamente (renovação = Fase 5)
- Streak = todos os itens do dia concluídos (critério rigoroso)
- Editar item → afeta apenas tarefas futuras (passadas intactas)
- End_date opcional → front exibe aviso + confirmação ao criar sem fim
- Pause: deleta futuras; Resume: regera a partir de hoje (Fase 4)
