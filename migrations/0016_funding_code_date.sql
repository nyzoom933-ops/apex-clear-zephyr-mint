select setval('funding_code_seq', 3399, true);

update fundings
set deposit_code = null, deposit_number = null, account_number = null, reference_number = null;

update fundings f
set
  deposit_code = 'AH-CD-' || to_char(f.created_at, 'YYMMDD') || s.n::text,
  deposit_number = 'AH-' || to_char(f.created_at, 'YYMMDD') || s.n::text,
  account_number = to_char(f.created_at, 'YYMMDD') || s.n::text,
  reference_number = to_char(f.created_at, 'YYMMDD') || s.n::text
from (
  select id, nextval('funding_code_seq') as n
  from fundings
  order by created_at, id
) s
where f.id = s.id;
