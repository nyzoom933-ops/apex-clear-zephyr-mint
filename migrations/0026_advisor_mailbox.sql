alter table advisors add column if not exists mailbox text not null default '';
alter table lead_invites add column if not exists advisor_mailbox text not null default '';
