create table if not exists promo_settings (
  id text primary key,
  intro text not null,
  protection text not null,
  fine_print text not null,
  starts_on date not null,
  ends_on date not null
);

create table if not exists promo_tiers (
  id text primary key,
  min_amount numeric not null,
  max_amount numeric,
  bonus_percent numeric not null,
  months text not null,
  sort_order integer not null default 0
);

insert into promo_settings (id, intro, protection, fine_print, starts_on, ends_on)
values (
  'current',
  'Our Promotional New Client Advisory Offer: bonuses apply for the whole duration of the CD and increase as the investment grows.',
  '100% capital protection',
  'Early withdrawal penalties may apply. Minimum balance to open: $100,000 new money required.',
  '2026-10-01',
  '2026-10-31'
)
on conflict (id) do nothing;

insert into promo_tiers (id, min_amount, max_amount, bonus_percent, months, sort_order) values
  ('promo_100', 100000, 174999, 0.75, '10|22', 0),
  ('promo_175', 175000, 249999, 0.99, '10|22', 1),
  ('promo_250', 250000, 499999, 1.125, '10|22', 2),
  ('promo_500', 500000, null, 1.25, '10|22', 3)
on conflict (id) do nothing;
