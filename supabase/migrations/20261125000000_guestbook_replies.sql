-- Telegram identifiers stay private; the public endpoint selects display fields only.
alter table public.guestbook
  add column telegram_chat_id bigint,
  add column telegram_message_id bigint;

create unique index guestbook_telegram_message_idx
  on public.guestbook (telegram_chat_id, telegram_message_id)
  where telegram_message_id is not null;

create table public.guestbook_replies (
  id bigint generated always as identity primary key,
  guestbook_id bigint not null references public.guestbook(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'approved' check (status in ('approved', 'hidden')),
  telegram_chat_id bigint not null,
  telegram_message_id bigint not null,
  telegram_update_id bigint not null,
  unique (telegram_chat_id, telegram_message_id)
);

alter table public.guestbook_replies enable row level security;
revoke all on public.guestbook_replies from anon, authenticated;
grant select, insert, update, delete on public.guestbook_replies to service_role;
grant usage, select on sequence public.guestbook_replies_id_seq to service_role;
create index guestbook_replies_entry_idx
  on public.guestbook_replies (guestbook_id, created_at, id);

comment on table public.guestbook_replies is
  'Studio replies from the configured Telegram group; no personal names are stored. Set status to hidden to remove a reply.';
