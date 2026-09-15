import type { FdaRecall } from "./fda";

type FdaRaw = {
  event_id?: string;
  recall_number?: string;
  classification?: string;
  recalling_firm?: string;
  product_description?: string;
  code_info?: string;
  reason_for_recall?: string;
  report_date?: string;
  status?: string;
  distribution_pattern?: string;
};

function clean(s?: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

/** Name search against ongoing FDA food enforcement. Nutrition lives in USDA FDC; this is the safety feed. */
export async function searchOpenFda(query: string): Promise<FdaRecall[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const term = q.replace(/[^\w\s-]/g, " ").trim();
  const url =
    `https://api.fda.gov/food/enforcement.json?search=` +
    encodeURIComponent(`product_description:"${term}" AND status:"Ongoing"`) +
    `&limit=8`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: FdaRaw[] };
    const out: FdaRecall[] = [];
    for (const r of json.results ?? []) {
      if (!r.product_description) continue;
      out.push({
        eventId: String(r.event_id || r.recall_number || ""),
        recallNumber: r.recall_number || "",
        classification: r.classification || "",
        firm: r.recalling_firm || "",
        product: clean(r.product_description),
        codes: clean(r.code_info),
        reason: clean(r.reason_for_recall),
        date: r.report_date || "",
        started: "",
        status: r.status || "",
        quantity: "",
        where: clean(r.distribution_pattern),
        how: "",
        city: "",
        state: "",
      });
    }
    return out;
  } catch {
    return [];
  }
}
