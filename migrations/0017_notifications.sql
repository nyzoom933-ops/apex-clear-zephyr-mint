create table if not exists notifications (
  id text primary key,
  created_at timestamptz not null default now(),
  audience text not null,
  recipient text not null,
  step text not null,
  subject text not null,
  body text not null,
  related_id text not null default '',
  delivery text not null default 'stored'
);
