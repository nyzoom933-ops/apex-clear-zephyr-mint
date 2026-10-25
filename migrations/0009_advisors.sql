create table if not exists advisors (
  id text primary key,
  name text not null,
  phone text not null default '',
  email text not null default ''
);

insert into advisors (id, name, phone, email) values
  ('adv_ellen', 'Ellen Ward', '(212) 555-0148', 'ellen.ward@accountholding.com'),
  ('adv_marcus', 'Marcus Hale', '(212) 555-0194', 'marcus.hale@accountholding.com')
on conflict (id) do nothing;

alter table fundings add column if not exists advisor_id text;

update fundings set status = 'pending' where status = 'submitted';
