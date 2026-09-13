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
      <HealthieMark className="size-10" />
      <span className="font-display text-[1.4rem] font-bold tracking-[-0.04em] text-fg">
        Healthie
      </span>
    </span>
  );
}

export function HealthieLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/healthie-logo.png"
      alt="Healthie — wellness and vitality platform"
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}

export const LumenMark = HealthieMark;
export const LumenWordmark = HealthieWordmark;
