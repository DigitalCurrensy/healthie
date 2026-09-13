/** Turn any phone photo — HEIC, HEIF, PNG, huge JPEGs — into a JPEG the server will accept. */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export function looksLikeImage(file: File): boolean {
  if (!file.type || file.type.startsWith("image/")) return true;
  return /\.(heic|heif|jpg|jpeg|png|webp|dng|tif|tiff|bmp|gif)$/i.test(file.name);
}

export function isHeicName(file: File): boolean {
  if (/\.(heic|heif)$/i.test(file.name)) return true;
  const t = (file.type || "").toLowerCase();
  return t === "image/heic" || t === "image/heif" || t === "image/heic-sequence";
}

/**
 * iOS recycles the FileList when the input is cleared. Copy the bytes first so
 * the camera-roll shot still exists after the picker closes.
 */
export async function capturePackFile(input: HTMLInputElement): Promise<File | null> {
  const file = input.files?.[0];
  if (!file) return null;
  const name = file.name || "pack.jpg";
  const type = file.type || "application/octet-stream";
  try {
    const buf = await file.arrayBuffer();
    input.value = "";
    return new File([buf], name, { type });
  } catch {
    try {
      input.value = "";
    } catch {
      /* ignore */
    }
    return file;
  }
}

export async function fileToJpegFile(file: File): Promise<File> {
  if (file.type === "image/jpeg" && file.size < 900_000) return file;
  const bitmap = await bitmapFromFile(file);
  try {
    return await bitmapToJpegFile(bitmap, file.name);
  } finally {
    bitmap.close?.();
  }
}

export async function videoToJpegFile(video: HTMLVideoElement): Promise<File | null> {
  if (!video.videoWidth) return null;
  const el = document.createElement("canvas");
  const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
  el.width = Math.max(16, Math.round(video.videoWidth * scale));
  el.height = Math.max(16, Math.round(video.videoHeight * scale));
  const ctx = el.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, el.width, el.height);
  const blob = await canvasToJpeg(el);
  if (!blob) return null;
  return new File([blob], "pack.jpg", { type: "image/jpeg" });
}

export async function bitmapToJpegFile(bitmap: ImageBitmap, name = "pack.jpg"): Promise<File> {
  const el = document.createElement("canvas");
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  el.width = Math.max(16, Math.round(bitmap.width * scale));
  el.height = Math.max(16, Math.round(bitmap.height * scale));
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("Could not draw that photo.");
  ctx.drawImage(bitmap, 0, 0, el.width, el.height);
  const blob = await canvasToJpeg(el);
  if (!blob) throw new Error("Could not encode that photo.");
  const base = name.replace(/\.[^.]+$/, "") || "pack";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function fileToJpegBase64(file: File): Promise<{ base64: string; mimeType: "image/jpeg" }> {
  const jpeg = await fileToJpegFile(file);
  const base64 = await blobToBase64(jpeg);
  return { base64, mimeType: "image/jpeg" };
}

async function bitmapFromFile(file: File): Promise<ImageBitmap> {
  try {
    return await nativeBitmap(file);
  } catch {
    /* Safari iOS 16+ often decodes HEIC natively; Chromium and older iOS do not. */
  }

  if (isHeicName(file) || (await sniffHeic(file))) {
    if (typeof window === "undefined") {
      throw new Error("Could not open that photo.");
    }
    try {
      const { heicTo } = await import("heic-to/csp");
      return await heicTo({
        blob: file,
        type: "bitmap",
        options: { imageOrientation: "from-image" },
      });
    } catch {
      /* Image() fallback below */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not open that photo."));
      img.src = url;
    });
    return await createImageBitmap(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function nativeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/** HEIC/HEIF brands live in the ftyp box at byte 4. */
export async function sniffHeic(file: File): Promise<boolean> {
  if (isHeicName(file)) return true;
  try {
    const buf = await file.slice(0, 16).arrayBuffer();
    const u8 = new Uint8Array(buf);
    if (u8.length < 12) return false;
    const tag = String.fromCharCode(u8[4]!, u8[5]!, u8[6]!, u8[7]!);
    if (tag !== "ftyp") return false;
    const brand = String.fromCharCode(u8[8]!, u8[9]!, u8[10]!, u8[11]!);
    return /heic|heif|mif1|msf1|heix|hevc/i.test(brand);
  } catch {
    return false;
  }
}

function canvasToJpeg(el: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    el.toBlob((blob) => resolve(blob), "image/jpeg", QUALITY);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
