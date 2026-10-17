-- Participação global é voluntária. Grupos só expõem totais aos próprios membros.
create table community_profiles (
  user_id uuid primary key references users on delete cascade,
  nickname text not null check (length(nickname) between 1 and 40),
  global_enabled boolean not null default false,
  focus text not null default '' check (length(focus) <= 100)
);
create table study_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users on delete cascade,
  name text not null check (length(name) between 1 and 80),
  description text not null default '' check (length(description) <= 500),
  created_at timestamptz not null default now()
);
create table group_members (
  group_id uuid not null references study_groups on delete cascade,
  user_id uuid not null references users on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on group_members(user_id);
create table group_invites (
  token_hash text primary key,
  group_id uuid not null references study_groups on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index group_invites_group_idx on group_invites(group_id);
create index studies_ranking_date_idx on studies(date, user_id);
