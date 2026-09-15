import { analyzeLabelImage, lookupBarcode } from "@/lib/server/functions";
import { decodeBlob } from "./engine";
import { fileToJpegBase64, fileToJpegFile, looksLikeImage } from "./image";
import { rememberPack } from "./session";
import { savePackShot } from "./pack-shots";

export type PackRead =
  | { status: "barcode"; barcode: string }
  | { status: "product"; barcode: string }
  | { status: "error"; error: string };

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
  void savePackShot(jpeg, { note: "Unmatched pack photo" });

  try {
    const detected = await decodeBlob(jpeg);
    if (detected) {
      rememberPack(jpeg, detected);
      void savePackShot(jpeg, { barcode: detected, note: "Barcode in photo" });
      try {
        const looked = await lookupBarcode({ data: { barcode: detected } });
        if (looked.status === "found") {
          void savePackShot(jpeg, { barcode: looked.product.barcode, title: looked.product.title });
          return { status: "barcode", barcode: looked.product.barcode };
        }
        return { status: "barcode", barcode: detected };
      } catch {
        return { status: "barcode", barcode: detected };
      }
    }
  } catch {
    /* no barcode in the frame */
  }

  try {
    const { base64, mimeType } = await fileToJpegBase64(jpeg);
    const result = await Promise.race([
      analyzeLabelImage({ data: { imageBase64: base64, mimeType } }),
      new Promise<{ ok: false; error: string }>((resolve) => {
        window.setTimeout(
          () => resolve({ ok: false, error: "That took too long. The photo is saved — type the name or barcode." }),
          22000,
        );
      }),
    ]);
    if (!result.ok) return { status: "error", error: result.error };
    rememberPack(jpeg, result.product.barcode);
    void savePackShot(jpeg, { barcode: result.product.barcode, title: result.product.title });
    return { status: "product", barcode: result.product.barcode };
  } catch {
    return {
      status: "error",
      error: "Could not read that pack. The photo is saved under Pack photos. Type the name or barcode.",
    };
  }
}
