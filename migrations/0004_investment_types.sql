create table if not exists investment_types (
  id text primary key,
  name text not null,
  issuer text not null default '',
  structure text not null default '',
  currency text not null default '',
  jurisdiction text not null default '',
  interest_rate text not null default '',
  coupon_type text not null default '',
  minimum_investment text not null default '',
  term text not null default '',
  payment_frequencies text not null default '',
  credit_rating text not null default ''
);

insert into investment_types (
  id, name, issuer, structure, currency, jurisdiction,
  interest_rate, coupon_type, minimum_investment, term, payment_frequencies, credit_rating
) values (
  'cd',
  'CDs',
  'American Eagle Financial Credit Union',
  'Fixed Income Instrument',
  'USD',
  'United States',
  '6.00%',
  'Fixed Coupon',
  '$100,000.00',
  '6-12 mth',
  'Quarterly|Bi-annually|Annually',
  'A+'
) on conflict (id) do nothing;

insert into investment_types (id, name, structure, currency, jurisdiction)
values ('bond', 'Bonds', 'Fixed Income Instrument', 'USD', 'United States')
on conflict (id) do nothing;

create table if not exists fundings (
  id text primary key,
  email text not null,
  type_id text not null,
  amount text not null,
  frequency text not null,
  created_at timestamptz not null default now()
);
