-- LifeQuest XP production foundation for Supabase.
-- Run this file in the Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  email text,
  language text not null default 'en' check (language in ('en', 'zh')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_language text not null default 'en' check (display_language in ('en', 'zh')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  date_key date not null,
  growth numeric(10, 2) not null default 0,
  categories text[] not null default '{}',
  entry_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parsed_activities (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.activity_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  category text not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  growth numeric(10, 2) not null default 0,
  activity_data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  score numeric(10, 2) not null default 0,
  summary_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date_key)
);

create index if not exists activity_entries_user_date_idx
  on public.activity_entries (user_id, date_key desc);

create index if not exists activity_entries_user_created_idx
  on public.activity_entries (user_id, created_at desc);

create index if not exists parsed_activities_user_entry_idx
  on public.parsed_activities (user_id, entry_id);

create index if not exists daily_summaries_user_date_idx
  on public.daily_summaries (user_id, date_key desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

drop trigger if exists activity_entries_set_updated_at on public.activity_entries;
create trigger activity_entries_set_updated_at
before update on public.activity_entries
for each row execute function public.set_updated_at();

drop trigger if exists daily_summaries_set_updated_at on public.daily_summaries;
create trigger daily_summaries_set_updated_at
before update on public.daily_summaries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Player')
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.activity_entries enable row level security;
alter table public.parsed_activities enable row level security;
alter table public.daily_summaries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "user_settings_manage_own" on public.user_settings;
create policy "user_settings_manage_own"
on public.user_settings for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "activity_entries_manage_own" on public.activity_entries;
create policy "activity_entries_manage_own"
on public.activity_entries for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "parsed_activities_manage_own" on public.parsed_activities;
create policy "parsed_activities_manage_own"
on public.parsed_activities for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "daily_summaries_manage_own" on public.daily_summaries;
create policy "daily_summaries_manage_own"
on public.daily_summaries for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
