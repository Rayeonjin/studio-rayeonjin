-- Coffee chat requests from the studio site.
-- Rows are written only by the coffee-chat Edge Function (service role).
-- RLS is on with no policies, so the public anon key can neither read nor write.

create table public.coffee_chats (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 60),
  contact     text not null check (char_length(contact) between 3 and 120),
  topic       text not null check (char_length(topic) between 10 and 2000),
  preference  text check (char_length(preference) <= 200),
  lang        text check (lang in ('ko', 'en', 'zh', 'es')),
  status      text not null default 'new' check (status in ('new', 'replied', 'declined', 'done')),
  notified    boolean not null default false
);

comment on table public.coffee_chats is 'Coffee chat requests submitted on studio-rayeonjin.vercel.app';

alter table public.coffee_chats enable row level security;
revoke all on table public.coffee_chats from anon, authenticated;

create index coffee_chats_created_at_idx on public.coffee_chats (created_at desc);
