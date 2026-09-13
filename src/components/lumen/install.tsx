import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstall = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * Home-screen PWA is the only way the live lens leaves 3.5 in a real phone.
 * This preview still cannot hold a camera — Add to Home Screen can.
 */
export function InstallCard() {
  const [deferred, setDeferred] = useState<BeforeInstall | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    setStandalone(media.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const ua = navigator.userAgent;
    setIosHint(/iPhone|iPad|iPod/.test(ua) && !media.matches);
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstall);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <section className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="kicker">On your home screen</p>
      <p className="mt-1 font-medium">The live camera lives here, not in the preview.</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {iosHint
          ? "On iPhone: Share → Add to Home Screen. Open Healthie from the icon. That’s the lens."
          : "Add Healthie to your home screen. The lens runs as an app, not inside this window."}
      </p>
      {deferred ? (
        <Button className="mt-3" onClick={() => void install()}>
          Add to home screen
        </Button>
      ) : null}
    </section>
  );
}
