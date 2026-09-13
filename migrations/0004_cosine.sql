-- Optional SQL cosine. If this file fails on a backend without plpgsql,
-- ranking still works via the TypeScript fallback in src/lib/server/catalog.ts.

create or replace function cosine_similarity(a float8[], b float8[])
returns float8
language plpgsql
immutable
as $$
declare
  dot float8 := 0;
  na float8 := 0;
  nb float8 := 0;
  i int;
  n int;
begin
  if a is null or b is null then return 0; end if;
  n := least(cardinality(a), cardinality(b));
  if n is null or n = 0 then return 0; end if;
  for i in 1..n loop
    dot := dot + coalesce(a[i], 0) * coalesce(b[i], 0);
    na := na + coalesce(a[i], 0) * coalesce(a[i], 0);
    nb := nb + coalesce(b[i], 0) * coalesce(b[i], 0);
  end loop;
  if na = 0 or nb = 0 then return 0; end if;
  return dot / (sqrt(na) * sqrt(nb));
end;
$$;
