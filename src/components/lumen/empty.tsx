import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { to: "/catalog" | "/" | "/guides" | "/you" | "/lists"; label: string };
}) {
  return (
    <div className="mt-6 max-w-prose">
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-muted">{body}</p>
      {action ? (
        <Button asChild className="mt-6 h-12">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      ) : null}
      <p className="mt-5 text-sm text-muted">Or try a pack we already scored:</p>
      <ul className="mt-2 flex flex-col gap-1">
        <li>
          <Link to="/product/$barcode" params={{ barcode: "5449000000996" }} className="tap-link font-medium text-accent">
            Coca-Cola Classic · 35
          </Link>
        </li>
        <li>
          <Link to="/product/$barcode" params={{ barcode: "3017620422003" }} className="tap-link font-medium text-accent">
            Nutella · 35
          </Link>
        </li>
        <li>
          <Link to="/product/$barcode" params={{ barcode: "3274080005003" }} className="tap-link font-medium text-accent">
            Evian · 95
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  body,
  action,
}: {
  kicker?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className="mt-2 font-display text-[2.4rem] font-medium leading-[0.96] tracking-[-0.04em] sm:text-[3.25rem]">
          {title}
        </h1>
        {body ? <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0 self-start sm:self-end">{action}</div> : null}
    </header>
  );
}
