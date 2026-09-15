#!/usr/bin/env node
const HOST = "https://healthie-hazel.vercel.app";
const CHECKS = [
  { name: "Home", path: "/" },
  { name: "Coke disc", path: "/product/5449000000996" },
  { name: "Evian disc", path: "/product/3274080005003" },
  { name: "Nutella disc", path: "/product/3017620422003" },
  { name: "Catalog demo shelf", path: "/catalog" },
  { name: "Scan", path: "/scan" },
  { name: "Install", path: "/install" },
];

async function hit(name, path) {
  const url = HOST + path;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow" });
    const ms = Date.now() - t0;
    const body = await res.text();
    const ok = res.ok && !/503|Application error/i.test(body);
    const branded = path === "/" ? /Coca-Cola|Evian/i.test(body) : true;
    const pass = ok && branded && ms < 8000;
    console.log(`${pass ? "PASS" : "FAIL"}  ${String(name).padEnd(22)} ${res.status}  ${ms}ms`);
    return pass;
  } catch (err) {
    console.log(`FAIL  ${String(name).padEnd(22)} ${err.message}`);
    return false;
  }
}

const results = [];
for (const c of CHECKS) results.push(await hit(c.name, c.path));
const failed = results.filter((x) => !x).length;
console.log(failed ? `\n${failed} checks failed. Do not start the room.` : "\nWarm. Demo path is up on Vercel.");
process.exit(failed ? 1 : 0);
