alter table fundings add column if not exists invoice_billing jsonb not null default '{}'::jsonb;
