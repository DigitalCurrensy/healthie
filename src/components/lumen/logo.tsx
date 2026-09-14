import { cn } from "@/lib/utils";

export function HealthieMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/healthie-mark.png"
      alt=""
      className={cn("object-contain", className)}
    />
  );
}

/** Rail and mobile masthead. Type only — the 3D PNG is for the icon and OG card. */
export function HealthieWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="font-display text-[1.35rem] font-medium leading-none tracking-[-0.04em] text-fg">
        Healthie
      </span>
      <span className="mb-0.5 inline-block size-1.5 rounded-full bg-gold" aria-hidden />
    </span>
  );
}

/** Full brand lockup. PWA / OG only. Never on a page that already has the wordmark. */
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
