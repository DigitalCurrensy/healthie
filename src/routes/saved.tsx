import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/lumen/shell";
import { ProductCard } from "@/components/lumen/product-card";
import { PageHeader, EmptyState } from "@/components/lumen/empty";
import { getProductsByCodes } from "@/lib/server/functions";
import { usePrefs } from "@/lib/prefs";
import type { EvaluatedProduct } from "@/lib/catalog/evaluate";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const favorites = usePrefs((s) => s.favorites);
  const [products, setProducts] = useState<EvaluatedProduct[] | null>(null);

  useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      return;
    }
    void getProductsByCodes({ data: { barcodes: favorites } }).then(setProducts);
  }, [favorites]);

  return (
    <AppShell>
      <PageHeader kicker="Pinned" title="Saved" body="Kept on this device. Heart a product to pin it here." />
      {products === null ? (
        <p className="mt-10 text-sm text-muted">Loading saved products…</p>
      ) : products.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Open a product you like and tap Save. It will wait here."
          action={{ to: "/catalog", label: "Browse aisles" }}
        />
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {products.map((p) => (
            <ProductCard
              key={p.barcode}
              barcode={p.barcode}
              title={p.title}
              brand={p.brand}
              type={p.type}
              isOrganic={p.isOrganic}
              score={p.score.overall}
              imageUrl={p.imageUrl}
              categoryPath={p.categoryPath}
            />
          ))}
        </div>
      )}
      <Link to="/lists" className="tap-link mt-6 font-medium text-accent underline-offset-4 hover:underline">
        Open shopping list
      </Link>
    </AppShell>
  );
}
