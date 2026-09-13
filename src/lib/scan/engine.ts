import { barcodeVariants } from "@/lib/utils";
import { inspectScannedBarcode } from "./gtin";
import { VIEWFINDER_CROP, VIEWFINDER_CROP_PADDED } from "./geometry";
import type { ReadResult, ReaderOptions } from "zxing-wasm/reader";
import type { WorkerDecodeRequest, WorkerDecodeResponse } from "./decode-worker";

export type ScanCorner = { x: number; y: number };

export type ScanHit = {
  barcode: string;
  lot?: string;
  expiry?: string;
  format: string;
  engine: "zxing" | "native";
  corners: ScanCorner[];
  videoSize: { w: number; h: number };
  lineCount: number;
  widthPx: number;
};

export type FrameQuality = {
  luminance: number;
  contrast: number;
};

type ReaderMod = typeof import("zxing-wasm/reader");

type NativeDetector = {
  detect: (source: ImageBitmapSource) => Promise<
    {
      rawValue: string;
      format?: string;
      cornerPoints?: { x: number; y: number }[];
    }[]
  >;
};

const RETAIL_FORMATS: ReaderOptions["formats"] = ["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128"];

const FAST: ReaderOptions = {
  formats: RETAIL_FORMATS,
  tryHarder: false,
  tryRotate: false,
  tryInvert: false,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
  minLineCount: 1,
  textMode: "Plain",
};

const HARD: ReaderOptions = {
  formats: [...RETAIL_FORMATS, "QRCode"],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
  minLineCount: 1,
  textMode: "Plain",
};

let zxing: ReaderMod | null = null;
let zxingFailed = false;
let nativeDetector: NativeDetector | null | undefined;

export async function ensureScanEngine(): Promise<"zxing" | "native" | "none"> {
  if (!zxing && !zxingFailed) {
    try {
      const mod = await import("zxing-wasm/reader");
      await mod.prepareZXingModule({
        fireImmediately: true,
        overrides: {
          locateFile: (path: string, prefix: string) => {
            if (path.endsWith(".wasm")) return "/zxing_reader.wasm";
            return `${prefix}${path}`;
          },
        },
      });
      zxing = mod;
    } catch {
      zxingFailed = true;
    }
  }
  if (nativeDetector === undefined) {
    const Ctor = (
      window as unknown as {
        BarcodeDetector?: new (opts: { formats: string[] }) => NativeDetector;
      }
    ).BarcodeDetector;
    nativeDetector = null;
    if (Ctor) {
      const attempts = [
        ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
        ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
        ["ean_13", "ean_8", "upc_a", "upc_e"],
      ];
      for (const formats of attempts) {
        try {
          nativeDetector = new Ctor({ formats });
          break;
        } catch {
          nativeDetector = null;
        }
      }
    }
  }
  if (zxing) return "zxing";
  if (nativeDetector) return "native";
  return "none";
}

const canvases: Record<string, HTMLCanvasElement> = {};

function canvas(key: string): HTMLCanvasElement {
  return (canvases[key] ??= document.createElement("canvas"));
}

export function grabFrame(
  video: HTMLVideoElement,
  cropNorm: { x: number; y: number; w: number; h: number },
  maxWidth = 960,
): { image: ImageData; sx: number; sy: number; sw: number; sh: number } | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;
  const sx = Math.max(0, Math.floor(cropNorm.x * vw));
  const sy = Math.max(0, Math.floor(cropNorm.y * vh));
  const sw = Math.max(16, Math.min(vw - sx, Math.floor(cropNorm.w * vw)));
  const sh = Math.max(16, Math.min(vh - sy, Math.floor(cropNorm.h * vh)));
  const scale = Math.min(1, maxWidth / sw);
  const dw = Math.max(16, Math.round(sw * scale));
  const dh = Math.max(16, Math.round(sh * scale));
  const el = canvas("grab");
  el.width = dw;
  el.height = dh;
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
  return { image: ctx.getImageData(0, 0, dw, dh), sx, sy, sw, sh };
}

export function sampleFrameQuality(video: HTMLVideoElement): FrameQuality {
  const grabbed = grabFrame(video, { x: 0.2, y: 0.3, w: 0.6, h: 0.4 }, 48);
  if (!grabbed) return { luminance: 128, contrast: 40 };
  const d = grabbed.image.data;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let i = 0; i < d.length; i += 16) {
    const y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    sum += y;
    sumSq += y * y;
    n += 1;
  }
  if (!n) return { luminance: 128, contrast: 40 };
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  return { luminance: mean, contrast: Math.sqrt(variance) };
}

function stretchContrast(image: ImageData): ImageData {
  const d = image.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  const range = Math.max(8, max - min);
  const out = new ImageData(image.width, image.height);
  const o = out.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    const v = Math.max(0, Math.min(255, Math.round(((y - min) / range) * 255)));
    o[i] = v;
    o[i + 1] = v;
    o[i + 2] = v;
    o[i + 3] = 255;
  }
  return out;
}

function hitFromZxing(
  result: ReadResult,
  crop: { sx: number; sy: number; sw: number; sh: number },
  image: ImageData,
  video: HTMLVideoElement,
): ScanHit | null {
  if (!result.isValid || !result.text) return null;
  const barcode = pickBarcode(result.text);
  if (!barcode) return null;
  const p = result.position;
  const scaleX = crop.sw / Math.max(1, image.width);
  const scaleY = crop.sh / Math.max(1, image.height);
  const corners = p
    ? [p.topLeft, p.topRight, p.bottomRight, p.bottomLeft].map((pt) => ({
        x: crop.sx + pt.x * scaleX,
        y: crop.sy + pt.y * scaleY,
      }))
    : [];
  const xs = corners.map((c) => c.x);
  return {
    barcode: barcode.gtin,
    lot: barcode.lot,
    expiry: barcode.expiry,
    format: result.format,
    engine: "zxing",
    corners,
    videoSize: { w: video.videoWidth, h: video.videoHeight },
    lineCount: result.lineCount || 1,
    widthPx: xs.length ? Math.max(...xs) - Math.min(...xs) : 0,
  };
}

function pickBarcode(text: string): { gtin: string; lot?: string; expiry?: string } | null {
  const direct = inspectScannedBarcode(text);
  if (direct) return { gtin: direct.gtin, lot: direct.lot, expiry: direct.expiry };
  for (const v of barcodeVariants(text)) {
    const ok = inspectScannedBarcode(v);
    if (ok) return { gtin: ok.gtin, lot: ok.lot, expiry: ok.expiry };
  }
  return null;
}

let decodeWorker: Worker | null | undefined;
let workerSeq = 0;
const workerWaiters = new Map<number, (msg: WorkerDecodeResponse) => void>();

function getDecodeWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  if (decodeWorker !== undefined) return decodeWorker;
  try {
    decodeWorker = new Worker(new URL("./decode-worker.ts", import.meta.url), { type: "module" });
    decodeWorker.onmessage = (event: MessageEvent<WorkerDecodeResponse>) => {
      const waiter = workerWaiters.get(event.data.id);
      if (waiter) {
        workerWaiters.delete(event.data.id);
        waiter(event.data);
      }
    };
    decodeWorker.onerror = () => {
      decodeWorker?.terminate();
      decodeWorker = null;
    };
  } catch {
    decodeWorker = null;
  }
  return decodeWorker;
}

function decodeWithWorker(
  image: ImageData,
  harder: boolean,
): Promise<WorkerDecodeResponse | null> {
  const worker = getDecodeWorker();
  if (!worker) return Promise.resolve(null);
  const id = (workerSeq += 1);
  const buffer = image.data.slice().buffer;
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      workerWaiters.delete(id);
      resolve(null);
    }, 280);
    workerWaiters.set(id, (msg) => {
      window.clearTimeout(timer);
      resolve(msg);
    });
    const payload: WorkerDecodeRequest = {
      id,
      width: image.width,
      height: image.height,
      buffer,
      harder,
    };
    worker.postMessage(payload, [buffer]);
  });
}

async function decodeWithZxing(
  image: ImageData,
  crop: { sx: number; sy: number; sw: number; sh: number },
  video: HTMLVideoElement,
  options: ReaderOptions,
): Promise<ScanHit | null> {
  const harder = Boolean(options.tryHarder);
  const fromWorker = await decodeWithWorker(image, harder);
  if (fromWorker?.text) {
    const barcode = pickBarcode(fromWorker.text);
    if (!barcode) return null;
    const scaleX = crop.sw / Math.max(1, image.width);
    const scaleY = crop.sh / Math.max(1, image.height);
    const corners = (fromWorker.corners ?? []).map((pt) => ({
      x: crop.sx + pt.x * scaleX,
      y: crop.sy + pt.y * scaleY,
    }));
    const xs = corners.map((c) => c.x);
    return {
      barcode: barcode.gtin,
      lot: barcode.lot,
      expiry: barcode.expiry,
      format: fromWorker.format ?? "zxing",
      engine: "zxing",
      corners,
      videoSize: { w: video.videoWidth, h: video.videoHeight },
      lineCount: fromWorker.lineCount || 1,
      widthPx: xs.length ? Math.max(...xs) - Math.min(...xs) : 0,
    };
  }
  if (!zxing) return null;
  try {
    const results = await zxing.readBarcodes(image, options);
    const valid = results.find((r) => r.isValid && r.text);
    if (!valid) return null;
    return hitFromZxing(valid, crop, image, video);
  } catch {
    return null;
  }
}

/**
 * Crop to the viewfinder first (ROI), then a padded band. Full-frame is a last
 * resort on the hard pass only — it was burning CPU and picking up poster QR.
 */
export async function decodeVideoFrame(
  video: HTMLVideoElement,
  pass: "fast" | "hard" = "fast",
): Promise<ScanHit | null> {
  const maxW = pass === "hard" ? 960 : 720;
  const roi = grabFrame(video, VIEWFINDER_CROP, maxW);
  if (roi) {
    const nativeHit = await decodeNativeCanvas(roi, video);
    if (nativeHit) return nativeHit;
    const hit = await decodeWithZxing(roi.image, roi, video, pass === "hard" ? HARD : FAST);
    if (hit) return hit;
  }

  if (pass === "hard") {
    const band = grabFrame(video, VIEWFINDER_CROP_PADDED, 960);
    if (band) {
      const hit = await decodeWithZxing(band.image, band, video, HARD);
      if (hit) return hit;
      const boosted = stretchContrast(band.image);
      const boostedHit = await decodeWithZxing(boosted, band, video, HARD);
      if (boostedHit) return boostedHit;
    }
  }

  return null;
}

async function decodeNativeCanvas(
  crop: { image: ImageData; sx: number; sy: number; sw: number; sh: number },
  video: HTMLVideoElement,
): Promise<ScanHit | null> {
  if (!nativeDetector) return null;
  try {
    const el = canvas("grab");
    const codes = await nativeDetector.detect(el);
    const raw = codes[0];
    if (!raw?.rawValue) return null;
    const barcode = pickBarcode(raw.rawValue);
    if (!barcode) return null;
    const scaleX = crop.sw / Math.max(1, crop.image.width);
    const scaleY = crop.sh / Math.max(1, crop.image.height);
    const corners = (raw.cornerPoints ?? []).map((p) => ({
      x: crop.sx + p.x * scaleX,
      y: crop.sy + p.y * scaleY,
    }));
    const xs = corners.map((c) => c.x);
    return {
      barcode: barcode.gtin,
      lot: barcode.lot,
      expiry: barcode.expiry,
      format: raw.format ?? "native",
      engine: "native",
      corners,
      videoSize: { w: video.videoWidth, h: video.videoHeight },
      lineCount: 3,
      widthPx: xs.length ? Math.max(...xs) - Math.min(...xs) : crop.sw * 0.8,
    };
  } catch {
    return null;
  }
}

export async function decodeBlob(blob: Blob): Promise<string | null> {
  await ensureScanEngine();
  try {
    const bmp = await createImageBitmap(blob);
    const el = canvas("blob");
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    el.width = Math.max(16, Math.round(bmp.width * scale));
    el.height = Math.max(16, Math.round(bmp.height * scale));
    const ctx = el.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      bmp.close();
      return null;
    }
    ctx.drawImage(bmp, 0, 0, el.width, el.height);
    bmp.close();
    const image = ctx.getImageData(0, 0, el.width, el.height);
    const fakeVideo = {
      videoWidth: el.width,
      videoHeight: el.height,
    } as HTMLVideoElement;
    const crop = { sx: 0, sy: 0, sw: el.width, sh: el.height };
    const hit =
      (await decodeWithZxing(image, crop, fakeVideo, HARD)) ??
      (await decodeWithZxing(stretchContrast(image), crop, fakeVideo, HARD));
    if (hit) return hit.barcode;
    if (nativeDetector) {
      try {
        const codes = await nativeDetector.detect(el);
        const raw = codes[0]?.rawValue;
        if (raw) return pickBarcode(raw)?.gtin ?? null;
      } catch {
        /* native skipped */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function decodeBitmap(bitmap: ImageBitmap): Promise<string | null> {
  await ensureScanEngine();
  const el = canvas("still");
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  el.width = Math.max(16, Math.round(bitmap.width * scale));
  el.height = Math.max(16, Math.round(bitmap.height * scale));
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, el.width, el.height);
  const image = ctx.getImageData(0, 0, el.width, el.height);
  const fakeVideo = { videoWidth: el.width, videoHeight: el.height } as HTMLVideoElement;
  const crop = { sx: 0, sy: 0, sw: el.width, sh: el.height };
  const hit =
    (await decodeWithZxing(image, crop, fakeVideo, HARD)) ??
    (await decodeWithZxing(stretchContrast(image), crop, fakeVideo, HARD));
  return hit?.barcode ?? null;
}

export function cameraConstraints(): MediaStreamConstraints {
  return cameraConstraintCascade()[0]!;
}

export function cameraIsEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Native capture=environment only helps on a phone. Desktop treats it as an upload. */
export function isPhoneCamera(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
  try {
    return navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

export function cameraBlockReason(): string | null {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  return null;
}

/** Ask the embedder to allow camera, and stamp allow= on our frame when we can reach it. */
export function unlockPreviewCamera(): void {
  if (typeof window === "undefined") return;
  try {
    const frame = window.frameElement;
    if (frame instanceof HTMLIFrameElement) {
      const cur = frame.getAttribute("allow") ?? "";
      const hadCamera = /\bcamera\b/i.test(cur);
      const parts = new Set(
        cur
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean),
      );
      parts.add("camera");
      parts.add("fullscreen");
      frame.setAttribute("allow", [...parts].join("; "));
      frame.setAttribute("allowfullscreen", "true");
      if (!hadCamera) {
        try {
          if (!sessionStorage.getItem("healthie-camera-unlock")) {
            sessionStorage.setItem("healthie-camera-unlock", "1");
            window.location.replace(window.location.href);
            return;
          }
        } catch {
          /* storage blocked */
        }
      }
    }
  } catch {
    /* cross-origin frameElement */
  }
  try {
    window.parent.postMessage(
      {
        channel: "grok-preview-bridge",
        version: 1,
        type: "permissions",
        features: ["camera"],
      },
      "*",
    );
  } catch {
    /* parent closed */
  }
}

export function lensHref(mode: "barcode" | "photo" = "barcode"): string {
  return `/lens?autostart=1&mode=${mode}`;
}

export function openLensWindow(mode: "barcode" | "photo" = "barcode"): Window | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL("/lens", window.location.origin);
    url.searchParams.set("autostart", "1");
    url.searchParams.set("mode", mode);
    return window.open(url.toString(), "healthie-lens", "popup=yes,width=420,height=844");
  } catch {
    return null;
  }
}

export function cameraDefinitelyBlocked(): boolean {
  return cameraBlockReason() !== null;
}

/** UI hint only — never skip getUserMedia because of this unless `cameraBlockReason()` is set. */
export function cameraLikelyBlocked(): boolean {
  return cameraDefinitelyBlocked();
}

/**
 * Gentle constraints first. 1080p-first OverconstrainedError is why a lot of
 * phones never open a lens. Denied/blocked stops the cascade immediately.
 */
export function cameraConstraintCascade(): MediaStreamConstraints[] {
  const lens: MediaTrackConstraints = {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 24, max: 30 },
  };
  return [
    { audio: false, video: lens },
    { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
    { audio: false, video: { facingMode: { ideal: "environment" } } },
    { audio: false, video: true },
  ];
}

export function cameraErrorCode(err: unknown): string {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (name === "NotAllowedError" || /denied|permission/i.test(msg)) return "denied";
  if (name === "NotFoundError" || /not found|no device/i.test(msg)) return "missing";
  if (name === "NotReadableError" || /in use|busy|trackstart/i.test(msg)) return "busy";
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") return "failed";
  if (name === "SecurityError" || /secure|policy|iframe/i.test(msg)) return "blocked";
  if (msg === "camera-timeout") return "timeout";
  if (msg === "no-media") return "unsupported";
  if (msg === "insecure") return "insecure";
  if (msg === "embedded") return "blocked";
  return "failed";
}

export function cameraErrorCopy(code: string): string {
  switch (code) {
    case "denied":
      return "Camera permission is off. Photograph the pack, pick a shot, or type the numbers.";
    case "missing":
      return "No camera on this device. Photograph the pack or type the barcode.";
    case "busy":
      return "Another app is using the camera. Close it, or photograph the pack instead.";
    case "blocked":
    case "insecure":
      return "This preview window cannot use the camera. Open live camera in a new tab — that page can.";
    case "timeout":
      return "The camera took too long to open. Open live camera in a new tab, or photograph the pack.";
    case "unsupported":
      return "This browser will not open a live camera. Photograph the pack or type the numbers.";
    default:
      return "Could not open the camera here. Open live camera in a new tab, or photograph the pack.";
  }
}

function cameraAttemptTimeoutMs(attempt: number): number {
  if (cameraIsEmbedded()) return attempt === 0 ? 700 : 400;
  return attempt === 0 ? 8000 : 2500;
}

/**
 * Race getUserMedia against a timer, but stop any stream that arrives after
 * we already moved on — otherwise the LED stays on with a leaked track.
 */
function getUserMediaGuarded(
  media: MediaDevices,
  constraints: MediaStreamConstraints,
  timeoutMs: number,
): Promise<MediaStream> {
  let timedOut = false;
  let timer = 0;
  const streamPromise = media.getUserMedia(constraints).then(
    (stream) => {
      if (timedOut) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("camera-timeout");
      }
      return stream;
    },
    (err: unknown) => {
      if (timedOut) throw new Error("camera-timeout");
      throw err;
    },
  );
  const timeoutPromise = new Promise<MediaStream>((_, reject) => {
    timer = window.setTimeout(() => {
      timedOut = true;
      reject(new Error("camera-timeout"));
    }, timeoutMs);
  });
  return Promise.race([streamPromise, timeoutPromise]).finally(() => {
    window.clearTimeout(timer);
  });
}

/**
 * Must be called from a tap — iOS drops getUserMedia if anything (WASM load,
 * React state, a timeout) runs first. Do not await ensureScanEngine before this.
 */
export async function openScanCamera(_opts?: { force?: boolean }): Promise<MediaStream> {
  if (typeof window === "undefined" || !window.isSecureContext) {
    throw new Error("insecure");
  }
  const media = navigator.mediaDevices;
  if (!media?.getUserMedia) {
    throw new Error("no-media");
  }
  let last: unknown;
  const cascade = cameraConstraintCascade();
  for (let i = 0; i < cascade.length; i += 1) {
    const constraints = cascade[i]!;
    try {
      const stream = await getUserMediaGuarded(media, constraints, cameraAttemptTimeoutMs(i));
      if (stream.getVideoTracks().length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        last = new Error("no-media");
        continue;
      }
      return stream;
    } catch (err) {
      last = err;
      const code = cameraErrorCode(err);
      if (code === "denied" || code === "blocked" || code === "insecure") break;
    }
  }
  throw last instanceof Error ? last : new Error("camera-failed");
}

function ean13Bits(code: string): string {
  const d = code.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
  const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
  const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
  const parity = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"][Number(d[0])]!;
  let bits = "101";
  for (let i = 1; i <= 6; i += 1) {
    const n = Number(d[i]);
    bits += (parity[i - 1] === "L" ? L : G)[n]!;
  }
  bits += "01010";
  for (let i = 7; i <= 12; i += 1) bits += R[Number(d[i])]!;
  bits += "101";
  return bits;
}

/** Live viewfinder when the device has no camera (preview, desktop, blocked iframe). */
export async function createDemoScanStream(barcode = "5449000000996"): Promise<MediaStream> {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("no-media");
  ctx.imageSmoothingEnabled = false;
  const bits = ean13Bits(barcode);
  const module = 10;
  const quiet = 10 * module;
  const barH = 360;
  const barW = bits.length * module;
  const x0 = Math.round((canvas.width - barW) / 2);
  const y0 = 170;
  let raf = 0;
  const draw = () => {
    ctx.fillStyle = "#f3f0e9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x0 - quiet, y0 - 40, barW + quiet * 2, barH + 120);
    ctx.fillStyle = "#111411";
    for (let i = 0; i < bits.length; i += 1) {
      if (bits[i] === "1") ctx.fillRect(x0 + i * module, y0, module, barH);
    }
    ctx.font = "600 36px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(barcode.replace(/(\d)(\d{6})(\d{6})/, "$1  $2  $3"), x0 + 80, y0 + barH + 52);
    raf = requestAnimationFrame(draw);
  };
  draw();
  const stream = canvas.captureStream(20);
  const track = stream.getVideoTracks()[0];
  if (track) {
    const stop = track.stop.bind(track);
    track.stop = () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }
  return stream;
}

export type LiveScanResult = {
  stream: MediaStream | null;
  error: string | null;
  demo: boolean;
};

/** Open the camera from a click. Never substitute a fake barcode for a real lens. */
export async function startLiveScan(): Promise<LiveScanResult> {
  void ensureScanEngine();
  unlockPreviewCamera();
  const blocked = cameraBlockReason();
  if (blocked) {
    return { stream: null, error: blocked, demo: false };
  }
  try {
    const stream = await openScanCamera({ force: true });
    return { stream, error: null, demo: false };
  } catch (err) {
    return { stream: null, error: cameraErrorCode(err), demo: false };
  }
}

export async function attachVideoStream(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("autoplay", "true");
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.srcObject = stream;
  try {
    await video.play();
  } catch {
    /* muted autoplay should work; loadeddata wait is the backstop */
  }
  if (video.videoWidth > 0) return;
  await new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("playing", done);
      resolve();
    };
    video.addEventListener("loadeddata", done);
    video.addEventListener("playing", done);
    window.setTimeout(done, 2200);
  });
}

export type TrackTweaks = {
  torch: boolean;
  zoom: boolean;
  zoomMin: number;
  zoomMax: number;
  zoomNow: number;
  focus: boolean;
};

export async function applyScanTrackTweaks(stream: MediaStream): Promise<TrackTweaks> {
  const empty: TrackTweaks = {
    torch: false,
    zoom: false,
    zoomMin: 1,
    zoomMax: 1,
    zoomNow: 1,
    focus: false,
  };
  const track = stream.getVideoTracks()[0];
  if (!track) return empty;
  const caps = (track.getCapabilities?.() ?? {}) as {
    torch?: boolean;
    focusMode?: string[];
    exposureMode?: string[];
    whiteBalanceMode?: string[];
    zoom?: { min: number; max: number };
  };
  const advanced: Record<string, unknown>[] = [];
  if (caps.focusMode?.includes("continuous")) advanced.push({ focusMode: "continuous" });
  else if (caps.focusMode?.includes("single-shot")) advanced.push({ focusMode: "single-shot" });
  if (caps.exposureMode?.includes("continuous")) advanced.push({ exposureMode: "continuous" });
  if (caps.whiteBalanceMode?.includes("continuous")) advanced.push({ whiteBalanceMode: "continuous" });
  if (advanced.length > 0) {
    try {
      await track.applyConstraints({ advanced: advanced as MediaTrackConstraintSet[] });
    } catch {
      /* optional */
    }
  }
  const settings = (track.getSettings?.() ?? {}) as { zoom?: number };
  return {
    torch: Boolean(caps.torch),
    zoom: Boolean(caps.zoom && caps.zoom.max > caps.zoom.min),
    zoomMin: caps.zoom?.min ?? 1,
    zoomMax: caps.zoom?.max ?? 1,
    zoomNow: settings.zoom ?? caps.zoom?.min ?? 1,
    focus: Boolean(caps.focusMode?.includes("continuous") || caps.focusMode?.includes("single-shot")),
  };
}

export async function setTorch(stream: MediaStream | null, on: boolean): Promise<void> {
  const track = stream?.getVideoTracks()[0];
  if (!track) return;
  try {
    await track.applyConstraints({ advanced: [{ torch: on } as unknown as MediaTrackConstraintSet] });
  } catch {
    /* not supported */
  }
}

export async function setZoom(stream: MediaStream | null, zoom: number): Promise<void> {
  const track = stream?.getVideoTracks()[0];
  if (!track) return;
  try {
    await track.applyConstraints({ advanced: [{ zoom } as unknown as MediaTrackConstraintSet] });
  } catch {
    try {
      await track.applyConstraints({ zoom } as unknown as MediaTrackConstraints);
    } catch {
      /* not supported */
    }
  }
}

export async function setFocusPoint(
  stream: MediaStream | null,
  point: { x: number; y: number },
): Promise<void> {
  const track = stream?.getVideoTracks()[0];
  if (!track) return;
  const nx = Math.min(1, Math.max(0, point.x));
  const ny = Math.min(1, Math.max(0, point.y));
  try {
    await track.applyConstraints({
      advanced: [{ pointsOfInterest: [{ x: nx, y: ny }] } as unknown as MediaTrackConstraintSet],
    });
  } catch {
    /* not supported */
  }
}

export async function grabStill(stream: MediaStream | null): Promise<ImageBitmap | null> {
  const track = stream?.getVideoTracks()[0];
  if (!track) return null;
  const Capture = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> } })
    .ImageCapture;
  if (!Capture) return null;
  try {
    return await new Capture(track).grabFrame();
  } catch {
    return null;
  }
}
