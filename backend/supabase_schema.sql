-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/<seu-projeto>/sql

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
