create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'super')),
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quality_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  format_id text not null,
  record_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quality_records enable row level security;

create or replace function public.is_super_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super'
      and disabled = false
  );
$$;

drop policy if exists "profiles_select_own_or_super" on public.profiles;
create policy "profiles_select_own_or_super"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_super_user());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'user' and disabled = false);

drop policy if exists "profiles_update_super" on public.profiles;
create policy "profiles_update_super"
on public.profiles for update
to authenticated
using (public.is_super_user())
with check (public.is_super_user());

drop policy if exists "records_select_own_or_super" on public.quality_records;
create policy "records_select_own_or_super"
on public.quality_records for select
to authenticated
using (user_id = auth.uid() or public.is_super_user());

drop policy if exists "records_insert_own" on public.quality_records;
create policy "records_insert_own"
on public.quality_records for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "records_update_own_or_super" on public.quality_records;
create policy "records_update_own_or_super"
on public.quality_records for update
to authenticated
using (user_id = auth.uid() or public.is_super_user())
with check (user_id = auth.uid() or public.is_super_user());

drop policy if exists "records_delete_own_or_super" on public.quality_records;
create policy "records_delete_own_or_super"
on public.quality_records for delete
to authenticated
using (user_id = auth.uid() or public.is_super_user());

-- Despues de crear el super usuario desde la app, ejecuta algo como:
-- update public.profiles set role = 'super' where email = 'admin@controlcalidad.com';
