/// <reference lib="webworker" />
import type { ReadResult, ReaderOptions } from "zxing-wasm/reader";

export type WorkerDecodeRequest = {
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  harder: boolean;
};

export type WorkerDecodeResponse = {
  id: number;
  text: string | null;
  format: string | null;
  lineCount: number;
  corners: { x: number; y: number }[] | null;
};

const RETAIL: ReaderOptions["formats"] = ["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128"];

const FAST: ReaderOptions = {
  formats: RETAIL,
  tryHarder: false,
  tryRotate: false,
  tryInvert: false,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
  minLineCount: 1,
  textMode: "Plain",
};

const HARD: ReaderOptions = {
  ...FAST,
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
};

let ready: Promise<typeof import("zxing-wasm/reader")> | null = null;

function load() {
  ready ??= import("zxing-wasm/reader").then(async (mod) => {
    await mod.prepareZXingModule({
      fireImmediately: true,
      overrides: {
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith(".wasm")) return "/zxing_reader.wasm";
          return `${prefix}${path}`;
        },
      },
    });
    return mod;
  });
  return ready;
}

self.onmessage = async (event: MessageEvent<WorkerDecodeRequest>) => {
  const { id, width, height, buffer, harder } = event.data;
  const reply = (payload: WorkerDecodeResponse) => {
    (self as unknown as Worker).postMessage(payload);
  };
  try {
    const mod = await load();
    const image = new ImageData(new Uint8ClampedArray(buffer), width, height);
    const results = await mod.readBarcodes(image, harder ? HARD : FAST);
    const valid = results.find((r: ReadResult) => r.isValid && r.text);
    if (!valid?.text) {
      reply({ id, text: null, format: null, lineCount: 0, corners: null });
      return;
    }
    const p = valid.position;
    const corners = p
      ? [p.topLeft, p.topRight, p.bottomRight, p.bottomLeft].map((pt) => ({ x: pt.x, y: pt.y }))
      : null;
    reply({
      id,
      text: valid.text,
      format: valid.format,
      lineCount: valid.lineCount || 1,
      corners,
    });
  } catch {
    reply({ id, text: null, format: null, lineCount: 0, corners: null });
  }
};
