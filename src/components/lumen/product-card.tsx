import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ScoreChip } from "./score-ring";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/scoring/types";
import { typeLabel } from "@/lib/prefs";
import { packInitial, packFaceStyle, packCandidates } from "@/lib/catalog/pack-image";

export function ProductCard({
  barcode,
  title,
  brand,
  type,
  isOrganic,
  score,
  imageUrl,
  categoryPath,
  layout = "row",
}: {
  barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  isOrganic: boolean;
  score: number;
  imageUrl?: string | null;
  categoryPath?: string;
  layout?: "row" | "tile";
}) {
  if (layout === "tile") {
    return (
      <Link
        to="/product/$barcode"
        params={{ barcode }}
        aria-label={`${title}, score ${Math.round(score)}`}
        className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
      >
        <ProductThumb
          title={title}
          type={type}
          imageUrl={imageUrl}
          categoryPath={categoryPath}
          barcode={barcode}
          className="aspect-[4/3] size-auto w-full rounded-none text-3xl"
        />
        <div className="flex items-start gap-3 p-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-snug text-fg">{title}</p>
            <p className="mt-0.5 truncate text-sm text-muted">
              {brand || typeLabel(type)}
              {isOrganic ? " · Organic" : ""}
            </p>
          </div>
          <ScoreChip score={score} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/product/$barcode"
      params={{ barcode }}
      aria-label={`${title}, score ${Math.round(score)}`}
      className="group flex min-h-16 items-center gap-3.5 rounded-xl bg-surface p-3 pr-3 shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 ease-out motion-safe:hover:-translate-y-px hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
    >
      <ProductThumb title={title} type={type} imageUrl={imageUrl} categoryPath={categoryPath} barcode={barcode} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-snug text-fg">{title}</p>
        <p className="mt-0.5 truncate text-sm text-muted">
          {brand || typeLabel(type)}
          {isOrganic ? " · Organic" : ""}
        </p>
      </div>
      <ScoreChip score={score} />
      <ChevronRight className="hidden size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100 sm:block" aria-hidden />
    </Link>
  );
}

export function ProductThumb({
  title,
  type,
  imageUrl,
  categoryPath,
  barcode,
  className,
}: {
  title: string;
  type: ProductType;
  imageUrl?: string | null;
  categoryPath?: string;
  barcode?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(0);
  const candidates = packCandidates(imageUrl, barcode);
  const src = candidates[failed] ?? null;
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className={cn("size-14 shrink-0 rounded-md bg-surface-2 object-contain p-1", className)}
        onError={() => setFailed((n) => n + 1)}
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = packInitial(title);
  const face = packFaceStyle(barcode);
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold tracking-tight",
        className,
      )}
      style={face}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

export function AisleCard({
  slug,
  title,
  kicker,
  image,
  count,
}: {
  slug: string;
  title: string;
  kicker: string;
  image: string;
  count?: number;
}) {
  return (
    <Link
      to="/aisle/$slug"
      params={{ slug }}
      aria-label={`${title} aisle`}
      className="group overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${title} aisle`}
          className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fg/55 via-fg/0 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-accent-fg">
          <p className="font-semibold leading-tight drop-shadow-sm">{title}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-accent-fg/80">
            {count ? `${count} on the shelves` : kicker}
          </p>
        </div>
      </div>
    </Link>
  );
}
