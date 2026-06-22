create table if not exists public.users (
  id text primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'employee' check (role in ('employee', 'employer')),
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

alter table public.users enable row level security;
