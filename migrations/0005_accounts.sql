-- Accounts, world index, retailer prices.
-- user_id is TEXT (Better Auth ids; preview fallback is 'dev-user').

create table if not exists user_scans (
  user_id text not null,
  barcode text not null,
  title text not null default '',
  brand text not null default '',
  type text not null default 'food',
  score int not null default 0,
  scanned_at timestamptz not null default now(),
  primary key (user_id, barcode)
);
create index if not exists user_scans_user_time_idx on user_scans (user_id, scanned_at desc);

create table if not exists user_saved (
  user_id text not null,
  barcode text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, barcode)
);

create table if not exists user_list (
  user_id text not null,
  barcode text not null,
  title text not null default '',
  brand text not null default '',
  score int not null default 0,
  checked boolean not null default false,
  position int not null default 0,
  primary key (user_id, barcode)
);

create table if not exists user_prefs (
  user_id text primary key,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists world_meta (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists dump_runs (
  id serial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  source text not null default '',
  ingested int not null default 0,
  world_food int,
  world_beauty int,
  world_pet int,
  note text
);

create table if not exists product_prices (
  id serial primary key,
  barcode text not null,
  amount double precision not null,
  currency text not null default 'USD',
  store text not null default '',
  country text not null default '',
  observed_on date,
  fetched_at timestamptz not null default now()
);
create index if not exists product_prices_barcode_idx on product_prices (barcode, fetched_at desc);
