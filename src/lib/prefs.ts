import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AllergenId, ProductType } from "@/lib/scoring/types";
import { labStorage } from "@/lib/persist";

export type Diet = "none" | "vegetarian" | "vegan";
export type LifeStage = "none" | "pregnancy" | "child";

export type ListItem = {
  barcode: string;
  title: string;
  brand: string;
  score: number;
  checked: boolean;
};

type PrefsState = {
  diet: Diet;
  lifeStage: LifeStage;
  allergens: AllergenId[];
  avoidPalm: boolean;
  avoidFragrance: boolean;
  avoidNitrites: boolean;
  avoidUpf: boolean;
  sensitiveSkin: boolean;
  onboardingDone: boolean;
  labName: string;
  favorites: string[];
  compare: string[];
  list: ListItem[];
  setDiet: (diet: Diet) => void;
  setLifeStage: (lifeStage: LifeStage) => void;
  toggleAllergen: (id: AllergenId) => void;
  toggleAvoidPalm: () => void;
  toggleAvoidFragrance: () => void;
  toggleAvoidNitrites: () => void;
  toggleAvoidUpf: () => void;
  toggleSensitiveSkin: () => void;
  setOnboardingDone: (done: boolean) => void;
  setLabName: (name: string) => void;
  applyLabCard: (data: LabCardSlice) => void;
  toggleFavorite: (barcode: string) => void;
  toggleCompare: (barcode: string) => "removed" | "replaced" | "first" | "second";
  clearCompare: () => void;
  addToList: (item: Omit<ListItem, "checked">) => void;
  toggleListItem: (barcode: string) => void;
  removeFromList: (barcode: string) => void;
  clearList: () => void;
  resetLab: () => void;
};

export type LabCardSlice = {
  labName?: string;
  diet?: Diet;
  lifeStage?: LifeStage;
  allergens?: AllergenId[];
  avoidPalm?: boolean;
  avoidFragrance?: boolean;
  avoidNitrites?: boolean;
  avoidUpf?: boolean;
  sensitiveSkin?: boolean;
};

export const ALLERGEN_OPTIONS: { id: AllergenId; label: string }[] = [
  { id: "gluten", label: "Gluten" },
  { id: "milk", label: "Milk" },
  { id: "egg", label: "Egg" },
  { id: "nuts", label: "Tree nuts" },
  { id: "peanut", label: "Peanut" },
  { id: "soy", label: "Soy" },
  { id: "fish", label: "Fish" },
  { id: "sesame", label: "Sesame" },
  { id: "celery", label: "Celery" },
  { id: "mustard", label: "Mustard" },
  { id: "sulphites", label: "Sulphites" },
];

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      diet: "none",
      lifeStage: "none",
      allergens: [],
      avoidPalm: false,
      avoidFragrance: false,
      avoidNitrites: false,
      avoidUpf: false,
      sensitiveSkin: false,
      onboardingDone: false,
      labName: "",
      favorites: [],
      compare: [],
      list: [],
      setDiet: (diet) => set({ diet }),
      setLifeStage: (lifeStage) => set({ lifeStage }),
      toggleAllergen: (id) => {
        const cur = get().allergens;
        set({ allergens: cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id] });
      },
      toggleAvoidPalm: () => set({ avoidPalm: !get().avoidPalm }),
      toggleAvoidFragrance: () => set({ avoidFragrance: !get().avoidFragrance }),
      toggleAvoidNitrites: () => set({ avoidNitrites: !get().avoidNitrites }),
      toggleAvoidUpf: () => set({ avoidUpf: !get().avoidUpf }),
      toggleSensitiveSkin: () => set({ sensitiveSkin: !get().sensitiveSkin }),
      setOnboardingDone: (done) => set({ onboardingDone: done }),
      setLabName: (labName) => set({ labName: labName.slice(0, 40) }),
      applyLabCard: (data) =>
        set({
          labName: data.labName?.slice(0, 40) ?? get().labName,
          diet: data.diet ?? get().diet,
          lifeStage: data.lifeStage ?? get().lifeStage,
          allergens: data.allergens ?? get().allergens,
          avoidPalm: data.avoidPalm ?? get().avoidPalm,
          avoidFragrance: data.avoidFragrance ?? get().avoidFragrance,
          avoidNitrites: data.avoidNitrites ?? get().avoidNitrites,
          avoidUpf: data.avoidUpf ?? get().avoidUpf,
          sensitiveSkin: data.sensitiveSkin ?? get().sensitiveSkin,
        }),
      toggleFavorite: (barcode) => {
        const cur = get().favorites;
        set({
          favorites: cur.includes(barcode) ? cur.filter((b) => b !== barcode) : [barcode, ...cur].slice(0, 80),
        });
      },
      toggleCompare: (barcode) => {
        const cur = get().compare;
        if (cur.includes(barcode)) {
          set({ compare: cur.filter((b) => b !== barcode) });
          return "removed" as const;
        }
        if (cur.length >= 2) {
          set({ compare: [cur[1]!, barcode] });
          return "replaced" as const;
        }
        set({ compare: [...cur, barcode] });
        return cur.length === 0 ? ("first" as const) : ("second" as const);
      },
      resetLab: () =>
        set({
          diet: "none",
          lifeStage: "none",
          allergens: [],
          avoidPalm: false,
          avoidFragrance: false,
          avoidNitrites: false,
          avoidUpf: false,
          sensitiveSkin: false,
          onboardingDone: false,
          labName: "",
          favorites: [],
          compare: [],
          list: [],
        }),
      clearCompare: () => set({ compare: [] }),
      addToList: (item) => {
        const cur = get().list;
        if (cur.some((i) => i.barcode === item.barcode)) return;
        set({ list: [{ ...item, checked: false }, ...cur].slice(0, 40) });
      },
      toggleListItem: (barcode) => {
        set({
          list: get().list.map((i) => (i.barcode === barcode ? { ...i, checked: !i.checked } : i)),
        });
      },
      removeFromList: (barcode) => set({ list: get().list.filter((i) => i.barcode !== barcode) }),
      clearList: () => set({ list: [] }),
    }),
    { name: "healthie-prefs", storage: createJSONStorage(() => labStorage) },
  ),
);

export function typeLabel(type: ProductType): string {
  if (type === "cosmetic") return "Body & beauty";
  if (type === "pet") return "Pet";
  return "Food";
}
