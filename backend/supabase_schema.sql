-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/<seu-projeto>/sql

-- =============================================
-- TABELA: conversations
-- =============================================
create table if not exists public.conversations (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  type        text check (type in ('general', 'planning', 'focus', 'project')) default 'general',
  archived    boolean default false,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

alter table public.conversations enable row level security;

create policy "Usuários veem apenas suas próprias conversas"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas suas próprias conversas"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Usuários editam apenas suas próprias conversas"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Usuários excluem apenas suas próprias conversas"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- =============================================
-- TABELA: messages
-- =============================================
create table if not exists public.messages (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role            text check (role in ('user', 'assistant')) not null,
  content         text not null,
  created_at      timestamp with time zone default now()
);

alter table public.messages enable row level security;

create policy "Usuários veem apenas suas próprias mensagens"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas suas próprias mensagens"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Usuários excluem apenas suas próprias mensagens"
  on public.messages for delete
  using (auth.uid() = user_id);

-- =============================================
-- TABELA: profiles
-- =============================================
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  name        text,
  chronotype  text check (chronotype in ('morning', 'intermediate', 'evening', 'night', 'Matutino', 'Vespertino', 'Noturno', 'Misto', 'Bimodal')),
  chronotype_scores     jsonb,
  questionnaire_answers jsonb,
  google_access_token   text,
  google_refresh_token  text,
  qualidade_sono       text,
  schedule_type        text check (schedule_type in ('flexible', 'fixed')),
  onboarding_completed boolean default false,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- Se a tabela já existir, rode estas migrações separadamente:
-- alter table public.profiles add column if not exists google_access_token text;
-- alter table public.profiles add column if not exists google_refresh_token text;

-- Atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Row Level Security (opcional se usar service_role key no backend)
alter table public.profiles enable row level security;

create policy "Usuários veem apenas seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários editam apenas seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários inserem apenas seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =============================================
-- TABELA: chat_projects (pastas de conversas)
-- =============================================
create table if not exists public.chat_projects (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

create index if not exists chat_projects_user_id_idx on public.chat_projects(user_id);

drop trigger if exists chat_projects_updated_at on public.chat_projects;
create trigger chat_projects_updated_at
  before update on public.chat_projects
  for each row execute procedure public.handle_updated_at();

alter table public.chat_projects enable row level security;

create policy "Usuários veem apenas seus próprios projetos"
  on public.chat_projects for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seus próprios projetos"
  on public.chat_projects for insert
  with check (auth.uid() = user_id);

create policy "Usuários editam apenas seus próprios projetos"
  on public.chat_projects for update
  using (auth.uid() = user_id);

create policy "Usuários excluem apenas seus próprios projetos"
  on public.chat_projects for delete
  using (auth.uid() = user_id);

-- Vínculo opcional de conversa -> projeto (null = aba "Todas")
alter table public.conversations
  add column if not exists project_id uuid
  references public.chat_projects(id) on delete set null;

create index if not exists conversations_project_id_idx on public.conversations(project_id);
