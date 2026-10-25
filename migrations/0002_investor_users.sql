alter table applications add column if not exists password_hash text;

create table if not exists investor_users (
  email text primary key,
  password_hash text not null,
  application_id text,
  created_at timestamptz not null default now()
);
