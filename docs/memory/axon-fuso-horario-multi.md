---
name: axon-fuso-horario-multi
description: "Como o Axon resolve fuso horário por usuário (multi-fuso, mundo todo)"
metadata: 
  node_type: memory
  type: project
  originSessionId: d839b9dc-0356-4ac6-ae91-f33d977fe8cf
---

O Axon suporta usuários de qualquer fuso (e que viajam). Arquitetura:

- **Fonte da verdade durável:** coluna `profiles.timezone` (string IANA, default `America/Sao_Paulo`). Necessária para jobs sem requisição (notificações, sync Google).
- **Sinal ao vivo:** frontend manda header `X-Timezone` (do `Intl.DateTimeFormat().resolvedOptions().timeZone`) em toda requisição. Acompanha viagem automaticamente.
- **Módulo central:** [services/user_tz.py](backend/services/user_tz.py) — `normalize()` (valida contra `available_timezones()`), `zone()` (ZoneInfo c/ fallback), `stored_tz()`, `resolve(user_id, header, stored=)` que persiste no perfil só quando o header muda.

Quem usa: `prompts.build_agent_prompt` (DATA DE HOJE), `chat._load_perfil` (bloco atual + lê header), `notification_analyzer` (corrigiu bug de UTC puro), `calendar_sync` (timeZone do evento Google). Prioridade sempre: header válido > perfil > default.

**Pré-requisito:** rodar no Supabase `alter table public.profiles add column if not exists timezone text default 'America/Sao_Paulo';`. Frontend (colega): adicionar `X-Timezone` no helper `request` de api.ts. Ver [[axon-arquitetura-debug]].
