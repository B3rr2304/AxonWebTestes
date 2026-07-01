---
name: axon-arquitetura-debug
description: "Armadilhas de arquitetura do AxonWeb já resolvidas (fonte da verdade = backend, não localStorage)"
metadata: 
  node_type: memory
  type: project
  originSessionId: c5a5c600-6979-4f9c-bf4c-4b9431d3d0f1
---

Lições de arquitetura do AxonWeb resolvidas em 2026-06-08. Princípio central: **a fonte da verdade é o backend (Supabase), não o `localStorage` nem valores fixos no frontend.**

- Backend Supabase usa `SUPABASE_SERVICE_KEY` (bypassa RLS) — updates sempre funcionam, RLS não é causa de "não salvou".
- O questionário só salva no banco se `api.isLoggedIn()` for true → chama `/classify/save`; senão chama `/classify/` que NÃO persiste. Tokens do Supabase expiram em ~1h e o frontend NÃO renova automaticamente — token expirado dá 401. (Possível melhoria futura: refresh automático no 401 usando o refresh_token guardado.)
- Páginas que ANTES tinham dados fixos/localStorage e foram corrigidas para ler do backend: `Profile.tsx`, `Sidebar.tsx` (ambas agora chamam `api.getProfile()`). Criado o endpoint que faltava `/dashboard/` em [routers/dashboard.py](backend/routers/dashboard.py).
- Bug clássico de rota: a rota é `/chat/:chatId` mas o componente lia `useParams().conversationId` (sempre undefined). Como `/chat/message` exige `conversation_id`, isso dava 400. Padrão: conferir se o nome do param do `useParams` bate com o da rota em [app/App.jsx](axonweb/src/app/App.jsx).
- Erros engolidos por `catch {}` vazio escondiam falhas (questionário). Sempre logar/expor o erro real ao depurar.

Ver [[axon-agent-tool-use-next]] para o próximo passo do produto.
