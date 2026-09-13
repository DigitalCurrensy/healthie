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
const distDir = join(root, "dist");
  if (existsSync(distDir)) {
    copyFileSync(wasmSrc, join(distDir, "zxing_reader.wasm"));
    writeFileSync(
      join(distDir, ".assetsignore"),
      "_worker.js\n_routes.json\nnitro.json\n",
    );
  }
}

const EXPORT_ALL_HELPER = `function __exportAll$1(all, no_symbols) {
	let target = {};
	for (var name in all) Object.defineProperty(target, name, { get: all[name], enumerable: true });
	if (!no_symbols) Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
	return target;
}
`;

function patchSsrDir(ssrDir) {
  if (!existsSync(ssrDir)) return;
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
}

function patchSsrRenderer(file) {
  if (!existsSync(file)) return;
  let src = readFileSync(file, "utf8");
  if (src.includes("mod.fetch(req)") && !src.includes("resolveSsrMod")) {
    src = src.replace(
      `function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}`,
      `function resolveSsrMod(_mod) {
	const m = _mod?.default || _mod?.s || _mod;
	if (m && typeof m.fetch === "function") return m;
	if (m?.default && typeof m.default.fetch === "function") return m.default;
	return m;
}
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = resolveSsrMod(_mod));
		return promise.then((m) => m.fetch(req));
	} };
}`,
    );
  }
  writeFileSync(file, src);
}

patchSsrDir(join(root, ".vercel/output/functions/__server.func/_ssr"));
patchSsrDir(join(root, "dist/_worker.js/_ssr"));
patchSsrDir(join(root, ".output/server/_ssr"));
patchSsrRenderer(join(root, "dist/_worker.js/_chunks/ssr-renderer.mjs"));
patchSsrRenderer(join(root, ".output/server/_chunks/ssr-renderer.mjs"));
patchSsrRenderer(join(root, ".vercel/output/functions/__server.func/_chunks/ssr-renderer.mjs"));

if (!existsSync(destDir)) {
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, file);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, file));
}
