create sequence if not exists funding_code_seq;

alter table fundings add column if not exists deposit_code text;
alter table fundings add column if not exists deposit_number text;
alter table fundings add column if not exists account_number text;
alter table fundings add column if not exists reference_number text;

update fundings f
set
  deposit_code = 'AH-CD-' || lpad(s.n::text, 8, '0'),
  deposit_number = 'AH-' || lpad(s.n::text, 8, '0'),
  account_number = lpad(s.n::text, 12, '0'),
  reference_number = lpad(s.n::text, 8, '0')
from (
  select id, nextval('funding_code_seq') as n
  from fundings
  where deposit_code is null
) s
where f.id = s.id;

create unique index if not exists fundings_deposit_code_key on fundings (deposit_code);
create unique index if not exists fundings_deposit_number_key on fundings (deposit_number);
create unique index if not exists fundings_account_number_key on fundings (account_number);
create unique index if not exists fundings_reference_number_key on fundings (reference_number);
