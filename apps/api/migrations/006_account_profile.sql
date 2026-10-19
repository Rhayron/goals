alter table users add column profile jsonb not null default '{}'::jsonb;
alter table users add constraint users_profile_object check (jsonb_typeof(profile) = 'object');
