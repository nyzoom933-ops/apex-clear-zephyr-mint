alter table advisors add column if not exists role text not null default '';
alter table lead_invites add column if not exists advisor_role text not null default '';
