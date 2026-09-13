import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const publicDir = join(root, "public");
const wasmSrc = join(root, "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm");
if (existsSync(wasmSrc)) {
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(wasmSrc, join(publicDir, "zxing_reader.wasm"));
  const vercelStatic = join(root, ".vercel/output/static");
  if (existsSync(vercelStatic)) {
    copyFileSync(wasmSrc, join(vercelStatic, "zxing_reader.wasm"));
  }
}

const EXPORT_ALL_HELPER = `function __exportAll$1(all, no_symbols) {
	let target = {};
	for (var name in all) Object.defineProperty(target, name, { get: all[name], enumerable: true });
	if (!no_symbols) Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
	return target;
}
`;

const ssrDir = join(root, ".vercel/output/functions/__server.func/_ssr");
const ssrEntry = join(ssrDir, "ssr.mjs");
if (existsSync(ssrEntry)) {
  let src = readFileSync(ssrEntry, "utf8");
  src = src.replace("ssr_exports as s", "server_default as s");
  writeFileSync(ssrEntry, src);
}
const ssr2 = join(ssrDir, "ssr2.mjs");
if (existsSync(ssr2)) {
  let src = readFileSync(ssr2, "utf8");
  if (src.includes('import { c as __exportAll$1 } from "./ssr.mjs";')) {
    src = src.replace('import { c as __exportAll$1 } from "./ssr.mjs";\n', EXPORT_ALL_HELPER);
    writeFileSync(ssr2, src);
  }
}

if (!existsSync(destDir)) {
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, file);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, file));
}
