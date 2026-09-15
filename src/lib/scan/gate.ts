import { cameraIsEmbedded } from "./engine";

/** Iframe and denied-host pages cannot hold a camera. Install is the lens. */
export function openLensOrInstall(start: () => void): void {
  if (typeof window === "undefined") return;
  let embedded = false;
  try {
    embedded = window !== window.top || cameraIsEmbedded();
  } catch {
    embedded = true;
  }
  if (embedded) {
    window.location.assign("/install");
    return;
  }
  start();
}
