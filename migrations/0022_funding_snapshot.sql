alter table fundings add column if not exists promo_apy text not null default '';
alter table fundings add column if not exists final_apy text not null default '';
alter table fundings add column if not exists payment_approved_at timestamptz;
