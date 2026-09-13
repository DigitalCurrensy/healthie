import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScannerSheet, useScanSession } from "@/components/lumen/scanner";
import { ReadingOverlay } from "@/components/lumen/pack-photo";
import { readPackPhoto } from "@/lib/scan/read-pack";
import { startLiveScan, unlockPreviewCamera } from "@/lib/scan/engine";
import { normalizeBarcode } from "@/lib/utils";

export const Route = createFileRoute("/lens")({
  validateSearch: (s: Record<string, unknown>) => ({
    autostart: s.autostart === "1" || s.autostart === true,
    mode: s.mode === "photo" ? ("photo" as const) : ("barcode" as const),
  }),
  component: LensPage,
});

function LensPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const scan = useScanSession();
  const [busy, setBusy] = useState<string | null>(null);

  const apply = scan.apply;
  useEffect(() => {
    unlockPreviewCamera();
    const pending = startLiveScan();
    apply({ mode, stream: null, error: null, demo: false });
    void pending.then((result) => {
      apply({ mode, stream: result.stream, error: result.error, demo: result.demo });
    });
  }, [mode, apply]);

  function publish(barcode: string) {
    const code = normalizeBarcode(barcode);
    try {
      window.opener?.postMessage({ type: "healthie-scan", barcode: code }, window.location.origin);
    } catch {
      /* no opener */
    }
    scan.stop();
    void navigate({ to: "/product/$barcode", params: { barcode: code } });
  }

  async function onImage(file: File) {
    setBusy("Reading the pack…");
    const result = await readPackPhoto(file);
    setBusy(null);
    if (result.status === "error") return;
    publish(result.barcode);
  }

  return (
    <div className="min-h-dvh bg-fg text-accent-fg">
      {busy ? <ReadingOverlay title={busy} /> : null}
      <ScannerSheet
        open
        mode={scan.mode}
        liveStream={scan.stream}
        cameraError={scan.error}
        demo={scan.demo}
        onClose={() => {
          scan.stop();
          if (window.opener) window.close();
          else void navigate({ to: "/" });
        }}
        onRetry={() => void scan.retry()}
        onDetect={publish}
        onLabel={(f) => void onImage(f)}
      />
    </div>
  );
}