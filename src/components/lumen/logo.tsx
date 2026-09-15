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

/** Mark + public name. Rail, mobile header, login. */
export function HealthieWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <HealthieMark className="size-11 shrink-0 md:size-14" />
      <span className="font-display text-[1.35rem] font-medium leading-none tracking-[-0.04em] text-fg md:text-[1.65rem]">
        Honest Aisle
      </span>
    </span>
  );
}

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
      <span
        className={cn(
          "text-[11px] leading-snug text-muted md:text-xs",
          compact ? "mt-1 pl-[3.5rem]" : "mt-2 pl-[4.25rem]",
        )}
      >
        Scan a pack. See the score.
      </span>
    </span>
  );
}

export function HealthieLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/healthie-logo.png"
      alt="Honest Aisle"
      className={cn("h-auto w-44 object-contain object-left sm:w-56", className)}
    />
  );
}

export const LumenMark = HealthieMark;
export const LumenWordmark = HealthieWordmark;
