select setval('funding_code_seq', 36536564, true);

update fundings
set deposit_code = null, deposit_number = null, account_number = null, reference_number = null;

update fundings f
set
  deposit_code = 'AH-CD-' || s.n::text,
  deposit_number = 'AH-' || s.n::text,
  account_number = s.n::text,
  reference_number = s.n::text
from (
  select id, nextval('funding_code_seq') as n
  from fundings
  order by created_at, id
) s
where f.id = s.id;
