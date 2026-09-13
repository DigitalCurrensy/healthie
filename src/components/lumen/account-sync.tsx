import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useHistory } from "@/lib/history";
import { usePrefs, type LabCardSlice } from "@/lib/prefs";
import { mergeHistory, mergeList, shouldSkipCloudPush } from "@/lib/account-merge";

let pushPaused = false;

export function pauseAccountPush() {
  pushPaused = true;
}

export function resumeAccountPush() {
  pushPaused = false;
}

function snapshot() {
  const history = useHistory.getState();
  const prefs = usePrefs.getState();
  return {
    scans: history.items.map((i) => ({
      barcode: i.barcode,
      title: i.title,
      brand: i.brand,
      type: i.type,
      score: i.score,
      scannedAt: i.scannedAt,
    })),
    saved: prefs.favorites,
    list: prefs.list,
    prefs: {
      diet: prefs.diet,
      lifeStage: prefs.lifeStage,
      allergens: prefs.allergens,
      avoidPalm: prefs.avoidPalm,
      avoidFragrance: prefs.avoidFragrance,
      avoidNitrites: prefs.avoidNitrites,
      avoidUpf: prefs.avoidUpf,
      sensitiveSkin: prefs.sensitiveSkin,
      labName: prefs.labName,
      onboardingDone: prefs.onboardingDone,
    },
  };
}

function whenHydrated(store: { persist?: { hasHydrated?: () => boolean; onFinishHydration?: (fn: () => void) => () => void } }) {
  return new Promise<void>((resolve) => {
    const persist = store.persist;
    if (!persist?.hasHydrated || persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = persist.onFinishHydration?.(() => {
      unsub?.();
      resolve();
    });
    window.setTimeout(() => resolve(), 800);
  });
}

/** Pulls the cloud lab on sign-in, then keeps this phone and the account in step. */
export function AccountSync() {
  const { user, isPending } = useCurrentUserState();
  const merging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    merging.current = true;
    resumeAccountPush();

    void (async () => {
      try {
        await Promise.all([whenHydrated(useHistory), whenHydrated(usePrefs)]);
        if (cancelled) return;
        const { pullAccount, pushAccount } = await import("@/lib/server/account");
        const remote = await pullAccount();
        if (cancelled) return;
        const history = useHistory.getState();
        const prefs = usePrefs.getState();
        history.replace(mergeHistory(history.items, remote.scans));
        const saved = Array.from(new Set([...remote.saved, ...prefs.favorites]));
        const list = mergeList(prefs.list, remote.list);
        if (remote.prefs) {
          const slice: LabCardSlice = {
            labName: remote.prefs.labName || prefs.labName,
            diet: remote.prefs.diet !== "none" ? remote.prefs.diet : prefs.diet,
            lifeStage: remote.prefs.lifeStage !== "none" ? remote.prefs.lifeStage : prefs.lifeStage,
            allergens: Array.from(new Set([...remote.prefs.allergens, ...prefs.allergens])),
            avoidPalm: remote.prefs.avoidPalm || prefs.avoidPalm,
            avoidFragrance: remote.prefs.avoidFragrance || prefs.avoidFragrance,
            avoidNitrites: remote.prefs.avoidNitrites || prefs.avoidNitrites,
            avoidUpf: remote.prefs.avoidUpf || prefs.avoidUpf,
            sensitiveSkin: remote.prefs.sensitiveSkin || prefs.sensitiveSkin,
          };
          prefs.applyLabCard(slice);
          if (remote.prefs.onboardingDone) prefs.setOnboardingDone(true);
        }
        usePrefs.setState({ favorites: saved, list });
        await pushAccount({ data: snapshot() });
      } catch {
        /* guest or network — local notes stay */
      } finally {
        merging.current = false;
      }
    })();

    const pushSoon = () => {
      if (merging.current) return;
      if (shouldSkipCloudPush({ paused: pushPaused, snapshot: snapshot() })) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void import("@/lib/server/account")
          .then(({ pushAccount }) => pushAccount({ data: snapshot() }))
          .catch(() => undefined);
      }, 900);
    };

    const unsubH = useHistory.subscribe(pushSoon);
    const unsubP = usePrefs.subscribe(pushSoon);
    return () => {
      cancelled = true;
      unsubH();
      unsubP();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.id, isPending]);

  return null;
}