import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Camera, ExternalLink, Flashlight, FlashlightOff, ImageUp, Images, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileHitArea } from "@/components/lumen/pack-photo";
import { normalizeBarcode, cn } from "@/lib/utils";
import {
  applyScanTrackTweaks,
  attachVideoStream,
  cameraErrorCode,
  cameraErrorCopy,
  cameraIsEmbedded,
  decodeBitmap,
  decodeVideoFrame,
  ensureScanEngine,
  grabStill,
  isPhoneCamera,
  lensHref,
  sampleFrameQuality,
  setFocusPoint,
  setTorch,
  setZoom,
  startLiveScan,
  unlockPreviewCamera,
  type ScanHit,
} from "@/lib/scan/engine";
import {
  barcodeWidth,
  coverMapping,
  lerpCorners,
  overlayToVideo,
  videoToOverlay,
} from "@/lib/scan/geometry";
import { videoToJpegFile } from "@/lib/scan/image";
import { rememberPack } from "@/lib/scan/session";
import { SAMPLE_PACKS } from "@/lib/scan/samples";
import { playScanBeep } from "@/lib/scan/beep";

const LOCK_NEEDED = 2;
const TRACE_HOLD = 10;
const DECODE_MS = 120;
const KEYPAD_AFTER_MS = 5000;

export type ScanMode = "barcode" | "photo";

export type CameraSession = {
  mode: ScanMode;
  stream: MediaStream | null;
  error: string | null;
  demo?: boolean;
};

/** Must run from a tap so iOS keeps the getUserMedia gesture. Overlay opens on the first paint. */
export function beginLiveScan(mode: ScanMode, apply: (session: CameraSession) => void): Promise<void> {
  unlockPreviewCamera();
  const pending = startLiveScan();
  apply({
    mode,
    stream: null,
    error: null,
    demo: false,
  });
  if (cameraIsEmbedded()) {
    window.setTimeout(() => {
      try {
        const url = new URL(lensHref(mode), window.location.origin);
        window.open(url.toString(), "healthie-lens");
      } catch {
        /* popup blocked — overlay still opens */
      }
    }, 0);
  }
  return pending.then((result) => {
    apply({ mode, stream: result.stream, error: result.error, demo: result.demo });
  });
}

export function useScanSession() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ScanMode>("barcode");
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setError(null);
    setDemo(false);
    setOpen(false);
  }, []);

  const apply = useCallback((next: CameraSession) => {
    setMode(next.mode);
    if (streamRef.current && streamRef.current !== next.stream) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = next.stream;
    setStream(next.stream);
    setError(next.error);
    setDemo(Boolean(next.demo));
    setOpen(true);
  }, []);

  const retry = useCallback(async () => {
    await beginLiveScan(mode, apply);
  }, [apply, mode]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return { open, mode, stream, error, demo, apply, stop, retry };
}

export function ScannerSheet({
  open,
  mode = "barcode",
  liveStream = null,
  cameraError = null,
  demo = false,
  onClose,
  onDetect,
  onLabel,
  onRetry,
}: {
  open: boolean;
  mode?: ScanMode;
  liveStream?: MediaStream | null;
  cameraError?: string | null;
  demo?: boolean;
  onClose: () => void;
  onDetect: (barcode: string) => void;
  onLabel?: (file: File) => void;
  onRetry?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const onLabelRef = useRef(onLabel);
  onLabelRef.current = onLabel;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [engine, setEngine] = useState<"zxing" | "native" | "none" | "loading">("loading");
  const [status, setStatus] = useState("Photograph the barcode or the front of the pack");
  const [manual, setManual] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [torchOk, setTorchOk] = useState(false);
  const [zoom, setZoomState] = useState({ min: 1, max: 1, now: 1, ok: false });
  const [hit, setHit] = useState<ScanHit | null>(null);
  const [locking, setLocking] = useState(false);
  const [lockedCode, setLockedCode] = useState<string | null>(null);
  const [kb, setKb] = useState(0);
  const [shortScreen, setShortScreen] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const [embedded, setEmbedded] = useState(() => (typeof window !== "undefined" ? cameraIsEmbedded() : false));
  const [phone, setPhone] = useState(() => (typeof window !== "undefined" ? isPhoneCamera() : false));
  const [needKeypad, setNeedKeypad] = useState(false);

  useEffect(() => {
    setEmbedded(cameraIsEmbedded());
    setPhone(isPhoneCamera());
  }, []);

  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const measure = () => {
      setShortScreen(window.innerHeight < 640);
      setLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 520);
    };
    measure();
    window.addEventListener("resize", measure);
    const sync = () => {
      if (vv) setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
      measure();
    };
    sync();
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", measure);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || liveStream) return;
    if (cameraError) {
      setError(cameraErrorCopy(cameraError));
      setStatus("Allow the camera, or use camera roll / type the numbers");
      return;
    }
    setError(null);
    setStatus("Opening the camera");
  }, [open, liveStream, cameraError]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let timer = 0;
    let lastCode = "";
    let streak = 0;
    let miss = 0;
    let locked = false;
    let tickN = 0;
    let lastHit: ScanHit | null = null;
    let hitAge = 0;
    let drawn: { x: number; y: number }[] = [];
    let startedAt = 0;
    let lastStill = 0;
    let inFlight = false;
    let slow = false;
    setNeedKeypad(false);
    const keypadTimer = window.setTimeout(() => {
      if (!cancelled && !locked) {
        slow = true;
        setNeedKeypad(true);
        setStatus("No code yet — type the numbers on the pack");
      }
    }, KEYPAD_AFTER_MS);

    async function seal(code: string) {
      locked = true;
      setLockedCode(code);
      setStatus("Got it");
      try {
        navigator.vibrate?.(25);
      } catch {
        /* no haptics */
      }
      playScanBeep();
      try {
        const video = videoRef.current;
        if (video) {
          const shot = await videoToJpegFile(video);
          if (shot) rememberPack(shot, code);
        }
      } catch {
        /* still look the code up */
      }
      if (!cancelled) onDetectRef.current(code);
    }

    async function start() {
      setReady(false);
      setHit(null);
      setLocking(false);
      setLockedCode(null);
      const kindPromise = ensureScanEngine();

      const media = liveStream;
      if (!media) {
        const kind = await kindPromise;
        if (cancelled) return;
        setEngine(kind);
        return;
      }

      try {
        setError(null);
        setStatus("Opening the camera");
        streamRef.current = media;
        let video = videoRef.current;
        if (!video) {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          video = videoRef.current;
        }
        if (!video) {
          setError(cameraErrorCopy("failed"));
          return;
        }
        const tweaks = await applyScanTrackTweaks(media);
        if (cancelled) return;
        setTorchOk(tweaks.torch);
        setZoomState({ min: tweaks.zoomMin, max: tweaks.zoomMax, now: tweaks.zoomNow, ok: tweaks.zoom });
        await attachVideoStream(video, media);
        if (cancelled) return;
        const track = media.getVideoTracks()[0];
        const onEnded = () => {
          if (cancelled || locked) return;
          setReady(false);
          setError(cameraErrorCopy("blocked"));
          setStatus("Camera closed. Open live camera in a new tab, or photograph the pack.");
        };
        track?.addEventListener("ended", onEnded);
        track?.addEventListener("mute", onEnded);
        const kind = await kindPromise;
        if (cancelled) return;
        setEngine(kind);
        setReady(true);
        setStatus(demo ? "Live demo in the window — same lookup as a real pack" : "Hold the barcode in the window");
        startedAt = performance.now();

        const loop = async () => {
          if (cancelled || locked || !videoRef.current) return;
          if (inFlight) {
            timer = window.setTimeout(() => {
              void loop();
            }, DECODE_MS);
            return;
          }
          tickN += 1;
          const videoEl = videoRef.current;
          if (!videoEl.videoWidth) {
            timer = window.setTimeout(() => {
              void loop();
            }, DECODE_MS);
            return;
          }
          const pass = tickN % 4 === 0 ? "hard" : "fast";
          inFlight = true;
          try {
            const decoded = await decodeVideoFrame(videoEl, pass);
            if (cancelled || locked) return;
            if (decoded) {
              lastHit = decoded;
              hitAge = 0;
              setHit(decoded);
              if (decoded.barcode === lastCode) {
                streak += 1;
                setLocking(true);
                setStatus("Hold still");
              } else {
                lastCode = decoded.barcode;
                streak = 1;
                setLocking(false);
                setStatus("Got a code — hold still");
              }
              miss = 0;
              const confident = decoded.lineCount >= 2 || decoded.engine === "native";
              paintTrace(canvasRef.current, stageRef.current, videoRef.current, lastHit, true, drawn);
              const held = performance.now() - startedAt >= 180;
              if (!demo && held && streak >= (confident ? LOCK_NEEDED : LOCK_NEEDED + 1)) {
                await seal(decoded.barcode);
                return;
              }
            } else {
              miss += 1;
              hitAge += 1;
              if (hitAge > TRACE_HOLD) {
                lastHit = null;
                setHit(null);
              }
              if (miss >= 5) {
                streak = 0;
                lastCode = "";
                setLocking(false);
              }
              const quality = sampleFrameQuality(videoEl);
              const now = performance.now();
              if (quality.luminance < 42 && !demo) {
                setStatus("A bit dark — torch helps, or move to the light");
              } else if (lastHit && lastHit.videoSize.w > 0) {
                const frac = lastHit.widthPx / lastHit.videoSize.w;
                if (frac < 0.22) setStatus("Move a little closer");
                else if (!slow) setStatus("Hold the barcode in the window");
              } else if (now - startedAt > 2500 && now - lastStill > 2200) {
                lastStill = now;
                const still = await grabStill(streamRef.current);
                if (cancelled || locked) return;
                if (still) {
                  const code = await decodeBitmap(still);
                  still.close();
                  if (code && !cancelled && !locked) {
                    lastCode = code;
                    streak = Math.max(streak, 1);
                    setStatus("Reading a still frame");
                    if (streak >= LOCK_NEEDED) {
                      await seal(code);
                      return;
                    }
                  }
                }
              } else if (!demo && !slow) {
                setStatus("Hold the barcode in the window");
              }
            }
          } catch {
            /* frame skipped */
          } finally {
            inFlight = false;
          }
          if (lastHit?.corners.length === 4) {
            const stage = stageRef.current;
            const videoNow = videoRef.current;
            if (stage && videoNow && lastHit.videoSize.w) {
              const map = coverMapping(
                lastHit.videoSize.w,
                lastHit.videoSize.h,
                stage.clientWidth,
                stage.clientHeight,
              );
              const target = lastHit.corners.map((c) => videoToOverlay(c.x, c.y, map));
              drawn = drawn.length === 4 ? lerpCorners(drawn, target, 0.38) : target;
            }
          } else {
            drawn = [];
          }
          paintTrace(canvasRef.current, stageRef.current, videoRef.current, lastHit, streak > 0, drawn);
          timer = window.setTimeout(() => {
            void loop();
          }, DECODE_MS);
        };
        timer = window.setTimeout(() => {
          void loop();
        }, DECODE_MS);
      } catch (err) {
        const copy = cameraErrorCopy(cameraErrorCode(err));
        setError(copy);
        setStatus("Photo or type the numbers");
      }
    }

    void start();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(keypadTimer);
      const video = videoRef.current;
      if (video) video.srcObject = null;
      streamRef.current = null;
      setTorchOn(false);
    };
  }, [open, liveStream, demo]);

  async function photographPack() {
    const video = videoRef.current;
    if (!video || !onLabelRef.current) return;
    setStatus("Photographing the pack");
    try {
      const file = await videoToJpegFile(video);
      if (!file) {
        setError("Could not capture that frame. Try again, or pick a shot from your camera roll.");
        return;
      }
      rememberPack(file);
      onLabelRef.current(file);
    } catch {
      setError("Could not capture that frame. Try again, or pick a shot from your camera roll.");
    }
  }

  function onManual(e: FormEvent) {
    e.preventDefault();
    const barcode = normalizeBarcode(manual);
    if (barcode.length >= 8) onDetectRef.current(barcode);
  }

  async function toggleTorch() {
    const next = !torchOn;
    await setTorch(streamRef.current, next);
    setTorchOn(next);
  }

  async function bumpZoom(dir: 1 | -1) {
    if (!zoom.ok) return;
    const step = (zoom.max - zoom.min) / 8;
    const next = Math.min(zoom.max, Math.max(zoom.min, zoom.now + dir * step));
    await setZoom(streamRef.current, next);
    setZoomState((z) => ({ ...z, now: next }));
  }

  function onTapFocus(e: ReactPointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video || !video.videoWidth) return;
    const rect = stage.getBoundingClientRect();
    const map = coverMapping(video.videoWidth, video.videoHeight, rect.width, rect.height);
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const vid = overlayToVideo(localX, localY, map);
    void setFocusPoint(streamRef.current, {
      x: vid.x / video.videoWidth,
      y: vid.y / video.videoHeight,
    });
  }

  function onPackFile(file: File) {
    onLabelRef.current?.(file);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none bg-fg text-accent-fg"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "photo" ? "Take a photo of the pack" : "Scan barcode"}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <p className="min-w-0 flex-1 px-1 font-display text-lg leading-tight">
          {mode === "photo"
            ? ready
              ? "Line up the pack, then snap"
              : "Take a photo"
            : ready || liveStream
              ? landscape
                ? "Barcode"
                : "Point at the barcode"
              : "Scan barcode"}
        </p>
        <div className="flex shrink-0 items-center">
          {torchOk && !shortScreen ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void toggleTorch()}
              aria-label={torchOn ? "Turn torch off" : "Turn torch on"}
              className="text-accent-fg hover:bg-accent-fg/10"
            >
              {torchOn ? <Flashlight /> : <FlashlightOff />}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close scanner"
            className="text-accent-fg hover:bg-accent-fg/10"
          >
            <X />
          </Button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={cn(
          "relative mx-auto mt-2 min-h-0 w-full flex-1 overflow-hidden",
          ready && "touch-none",
        )}
        onPointerDown={ready ? onTapFocus : undefined}
      >
        <video
          ref={videoRef}
          className={cn("absolute inset-0 size-full object-cover", !ready && "invisible")}
          playsInline
          muted
          autoPlay
          style={{ pointerEvents: ready ? "auto" : "none" }}
        />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
        {ready ? (
          <Viewfinder hit={hit} locking={locking || Boolean(lockedCode)} ready={ready} locked={Boolean(lockedCode)} />
        ) : !cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-accent-fg/80">
            Opening the camera…
          </div>
        ) : (
          <div className="absolute inset-4 z-10 flex flex-col items-center justify-center gap-3">
            {embedded ? (
              <Button asChild size="lg" className="h-14 w-full max-w-sm text-base">
                <a href={lensHref(mode)} target="_blank" rel="opener">
                  <ExternalLink className="size-4" />
                  Open live camera
                </a>
              </Button>
            ) : onRetry ? (
              <Button type="button" size="lg" className="h-14 w-full max-w-sm text-base" onClick={() => onRetry()}>
                <Camera />
                Turn camera on
              </Button>
            ) : null}
            <p className="max-w-sm text-center text-sm leading-relaxed text-accent-fg/75">
              {embedded
                ? "This window can’t use your camera. Tap Open live camera, allow the lens, then point at the barcode."
                : (error ?? "Allow the camera, photograph the pack, or type the numbers.")}
            </p>
            {onLabel ? (
              <FileHitArea
                capture={phone}
                onFile={onPackFile}
                label={phone ? "Photograph the pack with your camera" : "Choose a pack photo from your camera roll"}
                className="flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-8 text-accent-fg"
              >
                <span className="flex size-[4.75rem] items-center justify-center rounded-full border-[3px] border-accent-fg">
                  <span className="size-[3.6rem] rounded-full bg-accent-fg" />
                </span>
                <span className="font-display text-2xl font-bold tracking-[-0.04em]">
                  {phone ? "Photograph the pack" : "Pick a pack photo"}
                </span>
                <span className="max-w-xs text-center text-sm leading-relaxed text-accent-fg/80">
                  {phone
                    ? "Opens the phone camera. We’ll read the barcode or the front."
                    : "Use a shot of the barcode or the front. On a phone this opens the camera."}
                </span>
              </FileHitArea>
            ) : (
              <p className="max-w-xs text-center text-sm leading-relaxed text-accent-fg/75">
                Type a barcode below, or pick a sample pack.
              </p>
            )}
          </div>
        )}
        {demo && ready ? (
          <p className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-fg/70 px-3 py-1 text-[11px] font-medium text-accent-fg">
            Sample view — use Open live camera for the real lens
          </p>
        ) : null}
        {zoom.ok && ready && !shortScreen && !landscape ? (
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom in"
              className="bg-fg/40 text-accent-fg hover:bg-fg/55"
              onClick={() => void bumpZoom(1)}
            >
              <Plus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom out"
              className="bg-fg/40 text-accent-fg hover:bg-fg/55"
              onClick={() => void bumpZoom(-1)}
            >
              <Minus />
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className={cn("overflow-y-auto px-4 pt-3", shortScreen || landscape ? "max-h-[38%]" : "max-h-[46%]")}
        style={{ paddingBottom: `max(1rem, calc(env(safe-area-inset-bottom) + ${kb}px))` }}
      >
        {hit || lockedCode ? (
          <p className="mb-1.5 text-center font-mono text-sm tracking-[0.18em] text-accent-fg">
            {(lockedCode ?? hit?.barcode ?? "").replace(/(\d{1})(\d{6})(\d{6})/, "$1 $2 $3")}
          </p>
        ) : null}
        <p className="text-center text-sm text-accent-fg/80">{error ?? status}</p>
        <form onSubmit={onManual} className="mx-auto mt-3 flex w-full max-w-md gap-2">
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus={needKeypad}
            placeholder={needKeypad ? "Type the barcode on the pack" : "Or type the numbers"}
            aria-label="Enter barcode"
            className={cn(
              "border-0 bg-accent-fg/10 text-base text-accent-fg placeholder:text-accent-fg/50",
              needKeypad && "ring-2 ring-accent-fg/40",
            )}
          />
          <Button type="submit" variant="secondary" className="h-12 shrink-0">
            Look up
          </Button>
        </form>
        <div className="mx-auto mt-4 w-full max-w-md">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-accent-fg/50">
            {ready ? "Or open a sample pack" : "Try a sample pack"}
          </p>
          <div className={cn("mt-2 grid gap-2", ready ? "grid-cols-6" : "grid-cols-3 sm:grid-cols-6")}>
            {SAMPLE_PACKS.map((p) => (
              <button
                key={p.barcode}
                type="button"
                onClick={() => onDetectRef.current(p.barcode)}
                className="overflow-hidden rounded-lg bg-accent-fg/10 text-left"
                aria-label={p.title}
              >
                <img src={p.image} alt="" className="aspect-square w-full object-cover" />
                {!ready ? <span className="block truncate px-1 py-1 text-[10px] text-accent-fg/80">{p.title}</span> : null}
              </button>
            ))}
          </div>
        </div>
        {onLabel ? (
          <div className="mx-auto mt-3 flex w-full max-w-md flex-col gap-2">
            {ready ? (
              <>
                <button
                  type="button"
                  onClick={() => void photographPack()}
                  disabled={Boolean(lockedCode)}
                  aria-label={mode === "photo" ? "Take photo" : "Snap this pack"}
                  className="mx-auto flex size-[4.75rem] items-center justify-center rounded-full border-[3px] border-accent-fg disabled:opacity-40"
                >
                  <span className="size-[3.6rem] rounded-full bg-accent-fg" />
                </button>
                <p className="text-center text-[12px] text-accent-fg/55">
                  {mode === "photo" ? "Tap to photograph the pack" : "Hold on a barcode, or tap to snap"}
                </p>
              </>
            ) : (
              <p className="text-center text-[12px] text-accent-fg/55">
                On a phone, the circle opens the camera. Samples work anywhere.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {phone ? (
                <FileHitArea
                  capture
                  onFile={onPackFile}
                  label="Photograph the pack with your camera"
                  className="h-12 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-[15px] font-medium text-accent-fg"
                >
                  <Camera className="size-4" />
                  Phone camera
                </FileHitArea>
              ) : null}
              {onRetry ? (
                <Button
                  type="button"
                  variant="ghost"
                  className={cn("h-12 text-accent-fg hover:bg-accent-fg/10", !phone && "col-span-2")}
                  onClick={() => onRetry()}
                >
                  Try live lens
                </Button>
              ) : null}
              <FileHitArea
                onFile={onPackFile}
                label="Choose a pack photo from your camera roll"
                className={cn(
                  "h-12 items-center justify-center gap-2 rounded-lg bg-accent-fg/10 px-3 text-[15px] font-medium text-accent-fg hover:bg-accent-fg/16",
                  "col-span-2",
                )}
              >
                <Images className="size-4" />
                Camera roll
              </FileHitArea>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function paintTrace(
  canvas: HTMLCanvasElement | null,
  stage: HTMLDivElement | null,
  video: HTMLVideoElement | null,
  hit: ScanHit | null,
  locking: boolean,
  smoothed: { x: number; y: number }[],
) {
  if (!canvas || !stage) return;
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const corners =
    smoothed.length === 4
      ? smoothed
      : hit && video && hit.corners.length === 4 && hit.videoSize.w
        ? hit.corners.map((c) => {
            const map = coverMapping(hit.videoSize.w, hit.videoSize.h, w, h);
            return videoToOverlay(c.x, c.y, map);
          })
        : [];

  if (corners.length === 4) {
    const ink = getComputedStyle(stage).getPropertyValue("--color-score-excellent").trim() || "#2f6b4f";
    const cream = getComputedStyle(stage).getPropertyValue("--color-accent-fg").trim() || "#f3f0e9";
    const stroke = locking ? ink : cream;
    ctx.beginPath();
    ctx.moveTo(corners[0]!.x, corners[0]!.y);
    for (let i = 1; i < 4; i += 1) ctx.lineTo(corners[i]!.x, corners[i]!.y);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.stroke();
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = stroke;
      ctx.fill();
    }
  }
}

function Viewfinder({
  hit,
  locking,
  ready,
  locked,
}: {
  hit: ScanHit | null;
  locking: boolean;
  ready: boolean;
  locked: boolean;
}) {
  const tracing = Boolean(hit && hit.corners.length === 4);
  const close =
    hit && hit.videoSize.w > 0 ? barcodeWidth(hit.corners) / hit.videoSize.w > 0.22 : false;
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={cn("scan-window", (locking || locked) && "scan-window-lock", tracing && "scan-window-dim")}
        style={{ boxShadow: "0 0 0 9999px color-mix(in oklab, var(--color-fg) 58%, transparent)" }}
      >
        <span className={cn("scan-corner scan-tl", (locking || locked) && "scan-lock")} />
        <span className={cn("scan-corner scan-tr", (locking || locked) && "scan-lock")} />
        <span className={cn("scan-corner scan-bl", (locking || locked) && "scan-lock")} />
        <span className={cn("scan-corner scan-br", (locking || locked) && "scan-lock")} />
        {ready && !tracing && !locked ? <span className="scan-laser" /> : null}
      </div>
      {hit && !close && !locked ? (
        <p className="absolute inset-x-0 top-[22%] text-center text-sm text-accent-fg/80">Move closer</p>
      ) : null}
    </div>
  );
}

export function useLensReturn(onBarcode: (code: string) => void) {
  const onBarcodeRef = useRef(onBarcode);
  onBarcodeRef.current = onBarcode;
  useEffect(() => {
    unlockPreviewCamera();
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const code = e.data?.barcode;
      if (e.data?.type === "healthie-scan" && typeof code === "string" && code.length >= 8) {
        onBarcodeRef.current(code);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
}

export function ScanLaunchButton({
  mode = "barcode",
  onSession,
  disabled,
  className,
  variant = "default",
  size = "lg",
  children,
}: {
  mode?: ScanMode;
  onSession: (session: CameraSession) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    unlockPreviewCamera();
  }, []);

  function onClick() {
    if (disabled || opening) return;
    const pending = beginLiveScan(mode, onSession);
    setOpening(true);
    void pending.finally(() => setOpening(false));
  }

  return (
    <Button type="button" variant={variant} size={size} className={className} disabled={disabled || opening} onClick={onClick}>
      {children}
    </Button>
  );
}

export function ScanActions({
  onSession,
  onImage,
  onStart,
  onEmpty,
  disabled,
}: {
  onSession: (session: CameraSession) => void;
  onImage: (file: File) => void;
  onStart?: () => void;
  onEmpty?: () => void;
  disabled?: boolean;
}) {
  useEffect(() => {
    void ensureScanEngine();
    unlockPreviewCamera();
  }, []);

  return (
    <div className="grid gap-2">
      <ScanLaunchButton mode="barcode" onSession={onSession} disabled={disabled} className="h-14 w-full text-base">
        <Camera />
        Scan barcode
      </ScanLaunchButton>
      <div className="grid grid-cols-2 gap-2">
        <ScanLaunchButton
          mode="photo"
          onSession={onSession}
          disabled={disabled}
          variant="secondary"
          className="h-14 w-full text-base"
        >
          <ImageUp className="size-5" />
          Take photo
        </ScanLaunchButton>
        <FileHitArea
          onFile={onImage}
          onStart={onStart}
          onEmpty={onEmpty}
          disabled={disabled}
          label="Choose a pack photo from your camera roll"
          className="h-14 w-full items-center justify-center gap-2 rounded-lg bg-surface px-3 text-base font-medium text-fg shadow-[var(--shadow-border)] hover:bg-surface-2"
        >
          <Images className="size-4" />
          Camera roll
        </FileHitArea>
      </div>
    </div>
  );
}
