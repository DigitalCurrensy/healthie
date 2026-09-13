-- Healthie catalog: food + cosmetic + pet products, ingredients, health embeddings.
-- PGLite (preview) has no pgvector; embeddings are jsonb + float8[] with plpgsql cosine.

create table if not exists ingredients (
  id text primary key,
  name text not null,
  aliases text not null default '[]',
  inci_code text,
  e_number text,
  hazard_rating text not null check (hazard_rating in ('green', 'yellow', 'orange', 'red')),
  risk_class text not null check (risk_class in ('none', 'low', 'moderate', 'high')),
  kind text not null check (kind in ('food', 'cosmetic', 'both')),
  is_additive boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  gtin_barcode text unique not null,
  title text not null,
  brand text not null default '',
  type text not null check (type in ('food', 'cosmetic')),
  category_path text not null,
  is_organic boolean not null default false,
  overall_score int not null check (overall_score between 0 and 100),
  nutri_raw int,
  nutrition_score int,
  additive_score int,
  additive_count int not null default 0,
  image_url text,
  ingredients_text text not null default '',
  nutrition jsonb,
  embedding jsonb,
  source text not null default 'catalog',
  nova_group int,
  updated_at timestamptz not null default now()
);

create table if not exists product_ingredients (
  product_id text not null references products(id) on delete cascade,
  ingredient_id text not null references ingredients(id) on delete cascade,
  position int not null default 0,
  primary key (product_id, ingredient_id)
);

create index if not exists idx_products_barcode on products (gtin_barcode);
create index if not exists idx_products_category on products (category_path);
create index if not exists idx_products_score on products (overall_score desc);
create index if not exists idx_products_type on products (type);
create index if not exists idx_ingredients_enumber on ingredients (e_number);
create index if not exists idx_ingredients_name on ingredients (lower(name));
