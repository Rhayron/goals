-- Base editorial compartilhada. Nenhum upload pessoal entra neste catálogo.
create schema catalog;
create table catalog.notices (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  source_hash text not null,
  metadata jsonb not null,
  pdf_url text,
  version integer not null default 1,
  status text not null default 'pending' check (status in ('pending','published','archived')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  unique(provider, external_id)
);
create index notices_public_idx on catalog.notices(status, last_seen_at desc);
create table catalog.revisions (
  notice_id uuid not null references catalog.notices on delete cascade,
  version integer not null,
  metadata jsonb not null,
  source_hash text not null,
  recorded_at timestamptz not null default now(),
  primary key(notice_id,version)
);
create table catalog.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,
  requests integer not null default 0,
  records integer not null default 0,
  error text
);
