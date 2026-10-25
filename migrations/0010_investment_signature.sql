alter table fundings add column if not exists signed_at timestamptz;
alter table fundings add column if not exists signer_name text not null default '';
alter table fundings add column if not exists signature text not null default '';
