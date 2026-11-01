alter table advisors add column if not exists personal_phone text not null default '';
alter table lead_invites add column if not exists advisor_personal_phone text not null default '';
