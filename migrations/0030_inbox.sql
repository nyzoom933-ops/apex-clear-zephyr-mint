alter table advisors add column if not exists imap_host text not null default '';
alter table advisors add column if not exists imap_port integer not null default 993;
alter table advisors add column if not exists imap_user text not null default '';
alter table advisors add column if not exists imap_password text not null default '';
alter table advisors add column if not exists imap_secure boolean not null default true;
alter table advisors add column if not exists imap_last_uid integer not null default 0;

create table if not exists inbox_messages (
  id text primary key,
  advisor_id text not null,
  direction text not null default 'in',
  uid integer not null default 0,
  message_id text not null default '',
  from_name text not null default '',
  from_email text not null default '',
  to_name text not null default '',
  to_email text not null default '',
  subject text not null default '',
  body_text text not null default '',
  lead_id text not null default '',
  received_at timestamptz not null default now(),
  seen boolean not null default false
);

create index if not exists inbox_messages_received_idx on inbox_messages (received_at desc);
