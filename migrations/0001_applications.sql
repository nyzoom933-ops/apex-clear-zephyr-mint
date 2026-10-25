create table if not exists applications (
  id text primary key,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hold')),
  submitted_at timestamptz not null default now(),
  applicant_name text not null,
  email text not null,
  account_type text not null,
  currency text not null,
  payload jsonb not null
);

create index if not exists applications_submitted_at_idx on applications (submitted_at desc);
