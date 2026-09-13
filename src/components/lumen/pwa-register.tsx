import { useEffect } from "react";
import { useHistory } from "@/lib/history";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const id = window.setTimeout(() => {
      void navigator.serviceWorker.register("/sw.js").then((reg) => {
        const barcodes = useHistory.getState().items.slice(0, 50).map((i) => i.barcode);
        const worker = reg.active ?? navigator.serviceWorker.controller;
        worker?.postMessage({ type: "cache-products", barcodes });
      }).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
