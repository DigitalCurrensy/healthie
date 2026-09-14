import type { ReactNode } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, House, LayoutGrid, ScanLine, Sparkles, UserRound } from "lucide-react";
import { HealthieBrand } from "./logo";
import { AccountChip } from "./account-chip";
import { AccountSync } from "./account-sync";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/lib/prefs";
import { shoppingModeLabel } from "@/lib/catalog/mode";
import { normalizeBarcode } from "@/lib/utils";

const DESKTOP_NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/catalog", label: "Aisles", exact: false },
  { to: "/guides", label: "Guides", exact: false },
  { to: "/insights", label: "Insights", exact: false },
  { to: "/you", label: "You", exact: false },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: House, exact: true, primary: false },
  { to: "/catalog", label: "Aisles", icon: LayoutGrid, exact: false, primary: false },
  { to: "/scan", label: "Scan", icon: ScanLine, exact: true, primary: true },
  { to: "/guides", label: "Guides", icon: BookOpen, exact: false, primary: false },
  { to: "/you", label: "You", icon: UserRound, exact: false, primary: false },
] as const;

const YOU_PATHS = ["/history", "/method", "/compare", "/saved", "/ingredients", "/ingredient", "/lists", "/brand", "/install", "/recalls", "/demo", "/login"];

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compareCount = usePrefs((s) => s.compare.length);
  const lifeStage = usePrefs((s) => s.lifeStage);
  const modeLabel = shoppingModeLabel(lifeStage);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const mast = document.getElementById("masthead-search") as HTMLInputElement | null;
        const home = document.getElementById("home-search") as HTMLInputElement | null;
        const catalog = document.getElementById("catalog-search") as HTMLInputElement | null;
        (mast || home || catalog)?.focus();
        if (!mast && !home && !catalog) void navigate({ to: "/catalog" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      void navigate({ to: "/catalog" });
      return;
    }
    const digits = normalizeBarcode(q);
    if (digits.length >= 8 && digits.length <= 14) {
      void navigate({ to: "/product/$barcode", params: { barcode: digits } });
      return;
    }
    void navigate({ to: "/catalog", search: { q } });
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <AccountSync />

      <header className="sticky top-0 z-30 hidden border-b border-border bg-bg md:block">
        <div className="flex items-end justify-between gap-8 px-8 pt-6 lg:px-12">
          <Link to="/" aria-label="Healthie home" className="min-w-0 pb-4">
            <HealthieBrand />
          </Link>
          <div className="flex items-center gap-3 pb-5">
            <form onSubmit={onSearch} className="hidden lg:block">
              <input
                id="masthead-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or barcode"
                aria-label="Search a name or barcode"
                className="h-11 w-56 border-0 border-b border-border bg-transparent px-0 text-sm outline-none placeholder:text-subtle focus:border-fg"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
            </form>
            <Link
              to="/scan"
              className="inline-flex h-11 items-center gap-2 bg-pine px-5 text-[13px] font-medium tracking-[0.08em] text-accent-fg uppercase"
            >
              <ScanLine className="size-4" strokeWidth={1.7} />
              Scan
            </Link>
            <AccountChip />
          </div>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-7 px-8 pb-4 lg:px-12">
          {DESKTOP_NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative pb-1 text-[13px] tracking-[0.14em] uppercase transition-colors",
                  active ? "font-semibold text-fg" : "font-medium text-muted hover:text-fg",
                )}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-4 h-px bg-fg" /> : null}
              </Link>
            );
          })}
          <span className="ml-auto text-[11px] text-subtle">{modeLabel || "Independent pack scores"}</span>
        </nav>
      </header>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/94 px-4 pb-2.5 pt-[max(0.55rem,env(safe-area-inset-top))] backdrop-blur-sm md:hidden">
        <Link to="/" aria-label="Healthie home" className="min-w-0 flex-1">
          <HealthieBrand compact />
        </Link>
        <AccountChip />
      </header>

      <main className="px-4 pb-[max(8.75rem,calc(6.5rem+env(safe-area-inset-bottom)))] pt-6 md:px-12 md:pb-24 md:pt-12">
        <div className={cn("mx-auto w-full min-w-0", wide ? "max-w-[92rem]" : "max-w-4xl")}>{children}</div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/96 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm md:hidden"
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5 items-end">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            if (item.primary) {
              return (
                <li key={item.to} className="flex justify-center">
                  <Link
                    to={item.to}
                    aria-label="Scan"
                    className="-mt-5 flex size-14 items-center justify-center rounded-full bg-pine text-accent-fg"
                  >
                    <ScanLine className="size-6" strokeWidth={1.8} />
                  </Link>
                </li>
              );
            }
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
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 bg-accent px-4 py-2 text-sm font-medium text-accent-fg md:bottom-6"
        >
          Compare tray · {compareCount} of 2
        </Link>
      ) : null}
    </div>
  );
}

function isActive(pathname: string, item: { to: string; exact?: boolean }) {
  if (item.exact) return pathname === item.to;
  if (item.to === "/you") {
    return pathname.startsWith("/you") || YOU_PATHS.some((p) => pathname.startsWith(p));
  }
  if (item.to === "/catalog") {
    return pathname.startsWith("/catalog") || pathname.startsWith("/aisle") || pathname.startsWith("/product");
  }
  return pathname.startsWith(item.to);
}
