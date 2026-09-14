import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, House, LayoutGrid, ScanLine, Sparkles, UserRound } from "lucide-react";
import { HealthieWordmark } from "./logo";
import { AccountChip } from "./account-chip";
import { AccountSync } from "./account-sync";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/lib/prefs";
import { shoppingModeLabel } from "@/lib/catalog/mode";

const NAV = [
  { to: "/", label: "Home", icon: House, exact: true },
  { to: "/scan", label: "Scan", icon: ScanLine, exact: true },
  { to: "/catalog", label: "Aisles", icon: LayoutGrid, exact: false },
  { to: "/guides", label: "Guides", icon: BookOpen, exact: false },
  { to: "/insights", label: "Insights", icon: Sparkles, exact: false },
  { to: "/you", label: "You", icon: UserRound, exact: false },
] as const;

const YOU_PATHS = ["/history", "/method", "/compare", "/saved", "/ingredients", "/ingredient", "/lists", "/brand", "/install", "/recalls", "/demo"];

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compareCount = usePrefs((s) => s.compare.length);
  const lifeStage = usePrefs((s) => s.lifeStage);
  const modeLabel = shoppingModeLabel(lifeStage);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const home = document.getElementById("home-search") as HTMLInputElement | null;
        const catalog = document.getElementById("catalog-search") as HTMLInputElement | null;
        if (home) {
          home.focus();
          return;
        }
        if (catalog) {
          catalog.focus();
          return;
        }
        void navigate({ to: "/catalog" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <AccountSync />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-bg px-6 py-8 md:flex">
        <Link to="/" aria-label="Healthie home" className="mb-8 inline-flex min-h-11 items-center border-b border-border pb-6">
          <HealthieWordmark />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-11 items-center gap-3 border-l-2 px-3 text-[14px] tracking-wide transition-colors duration-150",
                      active
                        ? "border-gold font-medium text-fg"
                        : "border-transparent text-muted hover:text-fg",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.6} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p className="mt-auto text-[11px] leading-relaxed text-subtle">
          {modeLabel ? `${modeLabel}. ` : ""}Independent scores. No brand pays for a better number.
        </p>
        <div className="mt-5 border-t border-border pt-4">
          <AccountChip />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/92 px-4 pb-3 pt-[max(0.7rem,env(safe-area-inset-top))] backdrop-blur-sm md:hidden">
        <Link to="/" aria-label="Healthie home" className="inline-flex min-h-11 items-center">
          <HealthieWordmark />
        </Link>
        <AccountChip />
      </header>

      <main className="px-4 pb-[max(8rem,calc(5.75rem+env(safe-area-inset-bottom)))] md:px-12 md:pb-20 md:pl-64 md:pt-14">
        <div className={cn("mx-auto w-full min-w-0", wide ? "max-w-5xl" : "max-w-3xl")}>{children}</div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm md:hidden"
        aria-label="Primary"
      >
        <ul className="grid grid-cols-6">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium uppercase tracking-[0.12em]",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 1.9 : 1.6} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {compareCount > 0 && pathname !== "/compare" ? (
        <Link
          to="/compare"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 bg-accent px-4 py-2 text-sm font-medium text-accent-fg md:bottom-6"
        >
          Compare tray · {compareCount} of 2
        </Link>
      ) : null}
    </div>
  );
}

function isActive(pathname: string, item: (typeof NAV)[number]) {
  if (item.exact) return pathname === item.to;
  if (item.to === "/you") {
    return pathname.startsWith("/you") || YOU_PATHS.some((p) => pathname.startsWith(p));
  }
  if (item.to === "/catalog") {
    return pathname.startsWith("/catalog") || pathname.startsWith("/aisle") || pathname.startsWith("/product");
  }
  return pathname.startsWith(item.to);
}
