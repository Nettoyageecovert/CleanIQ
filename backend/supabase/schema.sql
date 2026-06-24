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

create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  category text not null,
  related_course text not null,
  time_limit integer not null default 30,
  passing_percent integer not null default 80,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists quizzes_created_at_idx on public.quizzes (created_at desc);

alter table public.quizzes enable row level security;

create table if not exists public.quiz_attempts (
  id text primary key,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  passing_percent integer not null,
  answers jsonb not null default '[]'::jsonb,
  time_taken_seconds integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, quiz_id)
);

create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);
create index if not exists quiz_attempts_completed_at_idx on public.quiz_attempts (completed_at desc);

alter table public.quiz_attempts enable row level security;

-- courses table already exists in Supabase with:
-- id uuid, title, description, duration, color, icon, required,
-- created_at, category, difficulty, certifiable, thumbnail_url
-- Draft courses use duration = 'draft'. Published courses use a real duration label.
