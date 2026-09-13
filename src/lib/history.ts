import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductType } from "@/lib/scoring/types";
import { labStorage } from "@/lib/persist";

export type HistoryItem = {
  barcode: string;
  title: string;
  brand: string;
  type: ProductType;
  score: number;
  scannedAt: number;
};

type HistoryState = {
  items: HistoryItem[];
  record: (item: Omit<HistoryItem, "scannedAt">) => void;
  replace: (items: HistoryItem[]) => void;
  clear: () => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      record: (item) => {
        const next: HistoryItem = { ...item, scannedAt: Date.now() };
        const rest = get().items.filter((i) => i.barcode !== item.barcode);
        set({ items: [next, ...rest].slice(0, 80) });
      },
      replace: (items) => set({ items: items.slice(0, 80) }),
      clear: () => set({ items: [] }),
    }),
    { name: "healthie-history", storage: createJSONStorage(() => labStorage) },
  ),
);
