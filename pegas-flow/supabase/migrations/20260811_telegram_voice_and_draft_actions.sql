create table if not exists public.telegram_messages (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  telegram_chat_id bigint not null,
  telegram_message_id bigint,
  direction text not null check (direction in ('in','out')),
  message_type text not null check (message_type in ('text','voice','callback','system')),
  text text,
  transcript text,
  voice_file_id text,
  voice_duration_sec integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_drafts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  draft_type text not null check (draft_type in ('create_order')),
  status text not null default 'gathering' check (status in ('gathering','editing','awaiting_confirmation','confirmed','cancelled','executed','expired')),
  data jsonb not null default '{}'::jsonb,
  missing_fields text[] not null default '{}',
  source_message_id bigint,
  confirmed_at timestamptz,
  executed_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists telegram_messages_user_created_idx on public.telegram_messages(user_id, created_at desc);
create index if not exists telegram_messages_chat_created_idx on public.telegram_messages(telegram_chat_id, created_at desc);
create index if not exists telegram_messages_voice_file_idx on public.telegram_messages(voice_file_id) where voice_file_id is not null;
create index if not exists bot_drafts_user_status_idx on public.bot_drafts(user_id, status, updated_at desc);
create index if not exists bot_drafts_expires_idx on public.bot_drafts(expires_at) where status in ('gathering','editing','awaiting_confirmation');

alter table public.telegram_messages enable row level security;
alter table public.bot_drafts enable row level security;
revoke all on table public.telegram_messages from anon, authenticated;
revoke all on table public.bot_drafts from anon, authenticated;
grant select, insert, update, delete on table public.telegram_messages to service_role;
grant select, insert, update, delete on table public.bot_drafts to service_role;
grant usage, select on sequence public.telegram_messages_id_seq to service_role;
