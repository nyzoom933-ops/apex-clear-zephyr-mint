alter table fundings add column if not exists payment_file_name text not null default '';
alter table fundings add column if not exists payment_file text not null default '';
alter table fundings add column if not exists payment_uploaded_at timestamptz;
