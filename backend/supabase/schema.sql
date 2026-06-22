-- Run this in Supabase: SQL Editor → New query → Run
-- Project: CleanIQ-Dev

create table if not exists public.users (
  id text primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'employee' check (role in ('employee', 'employer')),
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- Backend uses the service role key and bypasses RLS.
-- Still enable RLS so the table is not readable via the anon/publishable key.
alter table public.users enable row level security;
