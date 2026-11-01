alter table notifications add column if not exists resend_id text not null default '';
alter table notifications add column if not exists mail_status text not null default '';
alter table notifications add column if not exists status_at timestamptz;
