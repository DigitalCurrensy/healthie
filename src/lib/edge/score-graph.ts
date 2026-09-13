/**
 * Healthie on-device scoring kernel.
 *
 * Same arithmetic as the TypeScript scorers, expressed as an ONNX opset-13
 * graph (Mul / Add / Clip / Min / Round / GreaterOrEqual / Where). A tiny
 * interpreter runs it in JS today. onnxruntime-web can load the JSON IR in
 * public/models/healthie-score.json later — no network, no WASM required
 * for the current path.
 *
 * Caps (Nutri-Score letter, NOVA, high-concern extras) are applied in
 * TypeScript after this mix — they are policy, not arithmetic.
 */

export type ScoreTensor = {
  nutritionQuality: number;
  additiveScore: number;
  processingScore: number;
  organic: number;
  isCosmetic: number;
  isPet: number;
  composition: number;
  hazardCap: number;
  proteinBoost: number;
  letterCap: number;
  novaCap: number;
  riskCap: number;
};

export type GraphOp =
  | { op: "Mul"; a: string; b: string | number; out: string }
  | { op: "Add"; a: string; b: string | number; out: string }
  | { op: "Clip"; x: string; min: number; max: number; out: string }
  | { op: "Min"; a: string; b: string; out: string }
  | { op: "Round"; x: string; out: string }
  | { op: "Gte"; a: string; b: number; out: string }
  | { op: "Where"; cond: string; t: string; f: string; out: string };

/** Opset-13 graph. Food 50/25/20/+5, pet 40/40/15/+5, cosmetic min(comp, cap). */
export const HEALTHIE_GRAPH: GraphOp[] = [
  { op: "Gte", a: "isCosmetic", b: 0.5, out: "cosmeticGate" },
  { op: "Gte", a: "isPet", b: 0.5, out: "petGate" },

  { op: "Clip", x: "composition", min: 0, max: 100, out: "compClipped" },
  { op: "Min", a: "compClipped", b: "hazardCap", out: "cosmeticOut" },

  { op: "Mul", a: "nutritionQuality", b: 0.5, out: "wNut" },
  { op: "Mul", a: "additiveScore", b: 0.25, out: "wAdd" },
  { op: "Mul", a: "processingScore", b: 0.2, out: "wProc" },
  { op: "Mul", a: "organic", b: 5, out: "wOrg" },
  { op: "Add", a: "wNut", b: "wAdd", out: "foodSum1" },
  { op: "Add", a: "foodSum1", b: "wProc", out: "foodSum2" },
  { op: "Add", a: "foodSum2", b: "wOrg", out: "foodSum" },
  { op: "Round", x: "foodSum", out: "foodRound" },
  { op: "Clip", x: "foodRound", min: 0, max: 100, out: "foodOut" },

  { op: "Mul", a: "nutritionQuality", b: 0.4, out: "pNut" },
  { op: "Mul", a: "additiveScore", b: 0.4, out: "pAdd" },
  { op: "Mul", a: "processingScore", b: 0.15, out: "pProc" },
  { op: "Add", a: "pNut", b: "pAdd", out: "pSum1" },
  { op: "Add", a: "pSum1", b: "pProc", out: "pSum2" },
  { op: "Add", a: "pSum2", b: "wOrg", out: "pSum3" },
  { op: "Add", a: "pSum3", b: "proteinBoost", out: "pSum" },
  { op: "Round", x: "pSum", out: "pRound" },
  { op: "Clip", x: "pRound", min: 0, max: 100, out: "petOut" },

  { op: "Where", cond: "petGate", t: "petOut", f: "foodOut", out: "nonCos" },
  { op: "Where", cond: "cosmeticGate", t: "cosmeticOut", f: "nonCos", out: "overall" },
];

function clip(x: number, min: number, max: number) {
  return Math.min(max, Math.max(min, x));
}

export function executeGraph(ops: GraphOp[], feeds: Record<string, number>): number {
  const t: Record<string, number> = { ...feeds };
  const read = (ref: string | number) => (typeof ref === "number" ? ref : (t[ref] ?? 0));
  for (const node of ops) {
    switch (node.op) {
      case "Mul":
        t[node.out] = read(node.a) * read(node.b);
        break;
      case "Add":
        t[node.out] = read(node.a) + read(node.b);
        break;
      case "Clip":
        t[node.out] = clip(read(node.x), node.min, node.max);
        break;
      case "Min":
        t[node.out] = Math.min(read(node.a), read(node.b));
        break;
      case "Round":
        t[node.out] = Math.round(read(node.x));
        break;
      case "Gte":
        t[node.out] = read(node.a) >= node.b ? 1 : 0;
        break;
      case "Where":
        t[node.out] = read(node.cond) >= 0.5 ? read(node.t) : read(node.f);
        break;
    }
  }
  return t.overall ?? 0;
}

export function runScoreGraph(tensor: ScoreTensor): number {
  return executeGraph(HEALTHIE_GRAPH, tensor);
}

export function graphFingerprint(): string {
  return "healthie-opset13-score-v3";
}
