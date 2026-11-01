create table if not exists lead_invites (
  token text primary key,
  email text not null,
  name text not null,
  months integer not null,
  promo_code text not null default '',
  kind text not null,
  advisor_name text not null default '',
  advisor_phone text not null default '',
  advisor_email text not null default '',
  expires_at timestamptz not null,
  reminded_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
