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
  chronotype  text check (chronotype in ('morning', 'intermediate', 'evening', 'night')),
  chronotype_scores     jsonb,
  questionnaire_answers jsonb,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

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
