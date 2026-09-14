import { cn } from "@/lib/utils";

export function HealthieMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/healthie-mark.png"
      alt=""
      className={cn("object-contain object-center", className)}
    />
  );
}

/** Compact official lockup for the rail and mobile top bar. */
export function HealthieWordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <HealthieMark className={cn("shrink-0", compact ? "size-8" : "size-10")} />
      <span className="min-w-0">
        <span className="block font-display text-[1.28rem] font-medium leading-none tracking-[-0.04em] text-fg">
          Healthie
        </span>
        {compact ? null : (
          <span className="mt-1 block text-[11px] leading-snug text-muted">Scan a pack. See the score.</span>
        )}
      </span>
    </span>
  );
}

/** Full official lockup. Use in install / share surfaces only — never next to the rail mark. */
export function HealthieLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/healthie-logo.png"
      alt="Healthie"
      className={cn("h-auto w-44 object-contain object-left sm:w-56", className)}
    />
  );
}

export const LumenMark = HealthieMark;
export const LumenWordmark = HealthieWordmark;
