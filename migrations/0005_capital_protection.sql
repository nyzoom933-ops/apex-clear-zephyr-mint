alter table investment_types add column if not exists capital_protection text not null default '';

update investment_types
set capital_protection = 'FDIC insured — 100% cover on the first $250,000 per individual or $500,000 per joint account'
where id = 'cd' and capital_protection = '';
