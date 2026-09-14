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

/** Official mark + word. Used in the rail, mobile header, and login. */
export function HealthieWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <HealthieMark className="size-8 shrink-0 sm:size-9" />
      <span className="font-display text-[1.28rem] font-medium leading-none tracking-[-0.04em] text-fg">
        Healthie
      </span>
    </span>
  );
}

/** Official header block: mark, word, brand line. One per viewport. */
export function HealthieBrand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col items-start", className)}>
      <HealthieWordmark />
      <span className={cn("text-[11px] leading-snug text-muted", compact ? "mt-0.5 pl-[2.55rem]" : "mt-1.5 pl-[2.7rem]")}>
        Scan a pack. See the score.
      </span>
    </span>
  );
}

/** Full lockup PNG. OG / PWA only — not next to HealthieBrand. */
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
