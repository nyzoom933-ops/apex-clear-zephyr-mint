alter table fundings add column if not exists contact_phone text not null default '';
alter table fundings add column if not exists contact_by text not null default 'call';
