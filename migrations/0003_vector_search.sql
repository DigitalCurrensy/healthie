-- Vector search without pgvector (PGLite has no extensions).
-- embedding_vec is float8[]; ranking uses SQL cosine when the function exists,
-- otherwise the TypeScript cosineSimilarity fallback.

alter table products drop constraint if exists products_type_check;
alter table products add constraint products_type_check
  check (type in ('food', 'cosmetic', 'pet'));

alter table products add column if not exists embedding_vec float8[];
alter table products add column if not exists eco_score int;
alter table products add column if not exists flags jsonb;
