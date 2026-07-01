---
name: planning-porcentagem-conclusao
description: Regra da porcentagem de conclusão da página de planejamento — por dia selecionado e eventos contam (concluídos ao passar o horário)
metadata: 
  node_type: memory
  type: project
  originSessionId: a885a411-e3b3-44bd-9e88-88166235827c
---

A porcentagem de conclusão (`CircularProgress`) da página de planejamento é calculada **inteiramente no frontend**, em `axonweb/src/pages/Planning.tsx` (bloco `actionable`/`completedItems`/`progress`, ~linha 281). Não há endpoint de backend para isso.

Regras decididas (jun/2026):
- A porcentagem reflete **só o dia selecionado** (base `dayTasks`, que filtra por `isTaskOnDate(task, selectedIso)`), não a conta inteira.
- **Eventos contam** na porcentagem. Um evento é considerado concluído **automaticamente quando seu horário/dia já passou** (helper `isEventCompleted`: usa `end_time` → senão `start_time` → senão 23:59; e `status === "done"` para eventos multi-dia marcados manualmente). Não há botão manual em evento de dia único.
- Tarefas e rotinas continuam pela marcação manual (`status === "done"`).

Futuro: adicionar visões de semana e mês para a porcentagem/insights (manter a lógica fácil de generalizar a partir do dia).

Fluxo: essas mudanças são frontend, então foram entregues como prompt para a colega implementar na branch dela — ver [[feedback_workflow]].
