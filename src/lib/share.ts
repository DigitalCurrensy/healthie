export const SHARE = {
  siteName: "Healthie",
  tagline: "Scan a pack. See the score.",
  description:
    "Independent scores for food, body & beauty, and pet food. Scan a barcode. Read what’s in it. See the better neighbour.",
  ogImage: "/og.jpg",
  logo: "/brand/og-logo.png",
  mark: "/brand/healthie-mark.png",
  lockup: "/brand/healthie-logo.png",
} as const;

export function packShareText(opts: { title: string; score: number; headline: string }) {
  return `${opts.title} · ${opts.score}/100 on Healthie. ${opts.headline}`;
}

export async function shareOrCopy(opts: {
  title: string;
  text: string;
  url?: string;
}): Promise<"shared" | "copied" | "cancelled"> {
  const url = opts.url ?? (typeof window !== "undefined" ? window.location.href : undefined);
  const payload: ShareData = { title: opts.title, text: opts.text, url };
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const withLogo = await attachShareImage(payload);
      await navigator.share(withLogo);
      return "shared";
    }
  } catch (err) {
    const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
    if (name === "AbortError") return "cancelled";
  }
  const line = url ? `${opts.text}\n${url}` : opts.text;
  await navigator.clipboard.writeText(line);
  return "copied";
}

async function attachShareImage(payload: ShareData): Promise<ShareData> {
  try {
    const res = await fetch(SHARE.ogImage);
    if (!res.ok) return payload;
    const blob = await res.blob();
    const file = new File([blob], "healthie.jpg", { type: blob.type || "image/jpeg" });
    const next: ShareData = { ...payload, files: [file] };
    if (typeof navigator.canShare === "function" && navigator.canShare(next)) return next;
  } catch {
    /* share the link without the card */
  }
  return payload;
}
