-- =============================================
-- AXON — MIGRAÇÕES INCREMENTAIS
-- Execute no Supabase SQL Editor em ordem.
-- =============================================


-- =============================================
-- MIGRAÇÃO 1: Corrigir e expandir tabela profiles
-- =============================================

-- Remover constraint antiga de chronotype (valores em inglês)
alter table public.profiles
  drop constraint if exists profiles_chronotype_check;

-- Adicionar nova constraint com valores em português + inglês (retrocompatibilidade)
alter table public.profiles
  add constraint profiles_chronotype_check
  check (chronotype in (
    'morning', 'intermediate', 'evening', 'night',
    'Matutino', 'Vespertino', 'Noturno', 'Misto', 'Bimodal'
  ));

-- Adicionar qualidade_sono — guarda a LETRA da pergunta P9 (A–F).
-- A tradução para texto significativo é feita no backend (services/prompts.py).
alter table public.profiles
  add column if not exists qualidade_sono text;

-- Adicionar schedule_type: controla qual agente será usado
alter table public.profiles
  add column if not exists schedule_type text
  check (schedule_type in ('flexible', 'fixed'))
  default null;

-- Adicionar onboarding_completed: sinaliza que o usuário terminou o questionário
alter table public.profiles
  add column if not exists onboarding_completed boolean default false;


-- =============================================
-- MIGRAÇÃO 2: Criar tabela respostas (já usada no código)
-- =============================================

create table if not exists public.respostas (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  pergunta    text not null,
  alternativa text not null,
  created_at  timestamp with time zone default now()
);

create index if not exists respostas_user_id_idx on public.respostas(user_id);

alter table public.respostas enable row level security;

create policy "Usuários veem apenas suas próprias respostas"
  on public.respostas for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas suas próprias respostas"
  on public.respostas for insert
  with check (auth.uid() = user_id);

create policy "Usuários deletam apenas suas próprias respostas"
  on public.respostas for delete
  using (auth.uid() = user_id);


-- =============================================
-- MIGRAÇÃO 3: Criar tabela tasks
-- =============================================

create table if not exists public.tasks (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,

  -- Conteúdo
  title           text not null,
  description     text,

  -- Tipo e status
  task_type       text check (task_type in ('task', 'event', 'routine')) not null default 'task',
  status          text check (status in ('todo', 'progress', 'done', 'scheduled')) not null default 'todo',
  priority        text check (priority in ('low', 'medium', 'high')) default 'medium',

  -- Agendamento
  scheduled_date  date,
  start_time      time,
  end_time        time,

  -- Progresso (0–100)
  progress        integer default 0 check (progress >= 0 and progress <= 100),

  -- Recorrência (apenas para task_type = 'routine')
  recurrence      text check (recurrence in ('daily', 'weekly', 'monthly')),

  -- Local ou link (apenas para task_type = 'event')
  location        text,

  -- Hierarquia: subtarefas de um projeto maior
  parent_task_id  uuid references public.tasks(id) on delete cascade,

  -- Agrupamento: conjunto de tarefas similares criado pelo sub-agente agrupador
  group_name      text,

  -- Prazo final: usado pelo sub-agente quebrador de tarefas
  deadline        date,

  -- Origem: indica se foi criada pelo agente ou pelo usuário
  created_by      text check (created_by in ('user', 'agent')) default 'user',

  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone default now()
);

-- Índices para queries frequentes
create index if not exists tasks_user_id_idx       on public.tasks(user_id);
create index if not exists tasks_scheduled_date_idx on public.tasks(scheduled_date);
create index if not exists tasks_parent_task_id_idx on public.tasks(parent_task_id);
create index if not exists tasks_status_idx         on public.tasks(status);

-- Trigger updated_at
drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.tasks enable row level security;

-- =============================================
-- MIGRAÇÃO 4: Adicionar end_date à tabela tasks
-- =============================================

alter table public.tasks
  add column if not exists end_date date null;

create policy "Usuários veem apenas suas próprias tarefas"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas suas próprias tarefas"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuários editam apenas suas próprias tarefas"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Usuários excluem apenas suas próprias tarefas"
  on public.tasks for delete
  using (auth.uid() = user_id);


-- =============================================
-- MIGRAÇÃO 5: Colunas adicionadas diretamente no Supabase (documentação)
-- Estas colunas já existem no banco — este bloco serve apenas como registro.
-- =============================================

-- Tarefa chave: máximo 1 por dia por usuário (unicidade garantida no backend).
alter table public.tasks
  add column if not exists is_key_task boolean default false;

-- Contador de carries: quantas vezes uma tarefa foi postergada para o dia seguinte.
alter table public.tasks
  add column if not exists carry_count integer default 0;

-- Timestamp de conclusão: preenchido automaticamente ao marcar status = 'done'.
alter table public.tasks
  add column if not exists completed_at timestamp with time zone;

-- ID do evento espelhado no Google Agenda (integração Google Calendar).
alter table public.tasks
  add column if not exists google_event_id text;

-- Vínculo com item de rotina que gerou esta tarefa (ON DELETE SET NULL).
alter table public.tasks
  add column if not exists routine_item_id uuid
  references public.routine_items(id) on delete set null;


-- =============================================
-- MIGRAÇÃO 6: Janela de horário em routine_items (not_before / not_after)
-- Permite que itens flexíveis respeitem uma preferência de janela informada
-- pelo usuário no chat (ex: "leitura depois do almoço" → not_before = '13:00').
-- O Axon ainda escolhe o melhor bloco de energia DENTRO dessa janela.
-- =============================================

alter table public.routine_items
  add column if not exists not_before time null,
  add column if not exists not_after  time null;
