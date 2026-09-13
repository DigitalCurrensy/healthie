import { analyzeLabelImage, lookupBarcode } from "@/lib/server/functions";
import { decodeBlob } from "./engine";
import { fileToJpegBase64, fileToJpegFile, looksLikeImage } from "./image";
import { rememberPack } from "./session";

export type PackRead =
  | { status: "barcode"; barcode: string }
  | { status: "product"; barcode: string }
  | { status: "error"; error: string };

/** Camera roll, HEIC, live still — decode a barcode if one is in the shot, otherwise read the front of the pack. */
export async function readPackPhoto(file: File): Promise<PackRead> {
  if (!looksLikeImage(file)) {
    return { status: "error", error: "Choose a photo of the pack." };
  }
  let jpeg: File;
  try {
    jpeg = await fileToJpegFile(file);
  } catch {
    return {
      status: "error",
      error: "Could not open that photo. iPhone shots are fine — try the front of the pack, well lit.",
    };
  }
  rememberPack(jpeg);

  try {
    const detected = await decodeBlob(jpeg);
    if (detected) {
      rememberPack(jpeg, detected);
      try {
        const looked = await lookupBarcode({ data: { barcode: detected } });
        if (looked.status === "found") {
          return { status: "barcode", barcode: looked.product.barcode };
        }
      } catch {
        /* not in the index — read the front of the same shot */
      }
    }
  } catch {
    /* no barcode in the frame — read the name instead */
  }

  try {
    const { base64, mimeType } = await fileToJpegBase64(jpeg);
    const result = await Promise.race([
      analyzeLabelImage({ data: { imageBase64: base64, mimeType } }),
      new Promise<{ ok: false; error: string }>((resolve) => {
        window.setTimeout(
          () => resolve({ ok: false, error: "That took too long. Try a sharper shot, or type the barcode." }),
          22000,
        );
      }),
    ]);
    if (!result.ok) return { status: "error", error: result.error };
    rememberPack(jpeg, result.product.barcode);
    return { status: "product", barcode: result.product.barcode };
  } catch {
    return {
      status: "error",
      error: "Could not read that pack. Try a sharper shot of the front, or type the name.",
    };
  }
}
