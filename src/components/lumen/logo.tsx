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

export function HealthieWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <HealthieMark className="size-7" />
      <span className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-fg">
        Healthie
      </span>
    </span>
  );
}

export function HealthieLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <HealthieMark className="size-8" />
      <span className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-fg">
        Healthie
      </span>
    </span>
  );
}

export const LumenMark = HealthieMark;
export const LumenWordmark = HealthieWordmark;
