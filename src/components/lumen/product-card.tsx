import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
        className="group flex flex-col"
      >
        <ProductThumb
          title={title}
          type={type}
          imageUrl={imageUrl}
          categoryPath={categoryPath}
          barcode={barcode}
          className="aspect-[4/5] size-auto w-full text-3xl"
        />
        <div className="mt-3 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-medium leading-snug tracking-[-0.02em] text-fg">{title}</p>
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
      className="group flex min-h-16 items-center gap-4 border-b border-border py-3 transition-colors duration-[var(--motion-ui,180ms)] ease-[var(--ease-out,cubic-bezier(.22,1,.36,1))] hover:bg-surface/60"
    >
      <ProductThumb title={title} type={type} imageUrl={imageUrl} categoryPath={categoryPath} barcode={barcode} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-snug text-fg">{title}</p>
        <p className="mt-0.5 truncate text-sm text-muted">
          {brand || typeLabel(type)}
          {isOrganic ? " · Organic" : ""}
        </p>
      </div>
      <ScoreChip score={score} />
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
  const candidates = packCandidates(imageUrl, barcode, type).slice(0, 3);
  const src = candidates[failed] ?? null;
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className={cn("size-16 shrink-0 bg-surface-2 object-contain", className)}
        onError={() => setFailed((n) => n + 1)}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
      />
    );
  }
  const initial = packInitial(title);
  const face = packFaceStyle(barcode);
  return (
    <div
      className={cn(
        "flex size-16 shrink-0 items-center justify-center font-display text-sm font-medium tracking-tight",
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
    <Link to="/aisle/$slug" params={{ slug }} aria-label={`${title} aisle`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${title} aisle`}
          className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(.22,1,.36,1)] motion-safe:group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fg/70 via-fg/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-accent-fg">
          <p className="font-display text-lg font-medium leading-tight tracking-[-0.02em]">{title}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-accent-fg/80">
            {count ? `${count} on the shelves` : kicker}
          </p>
        </div>
      </div>
    </Link>
  );
}
