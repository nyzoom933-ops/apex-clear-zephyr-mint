create table if not exists crm_leads (
  id text primary key,
  name text not null,
  email text not null default '',
  phone text not null default '',
  amount text not null default '',
  term text not null default '',
  objective text not null default '',
  liquidity text not null default '',
  source text not null default '',
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
