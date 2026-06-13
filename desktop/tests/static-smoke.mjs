import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const main = readFileSync(join(root, "src", "main.js"), "utf8");
const css = readFileSync(join(root, "src", "styles.css"), "utf8");
const tauriConfig = readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8");
const rustMain = readFileSync(join(root, "src-tauri", "src", "main.rs"), "utf8");

const requiredUiPhrases = [
  "Meetings & Notices",
  "Records Requests",
  "Code & Ordinances",
  "Search City Knowledge",
  "System Health",
  "Audit Trail",
  "module manager"
];

for (const phrase of requiredUiPhrases) {
  if (!main.includes(phrase)) {
    throw new Error(`missing desktop UI phrase: ${phrase}`);
  }
}

for (const phrase of ["Docker", "WSL"]) {
  if (main.includes(`Start ${phrase}`) || main.includes(`Install ${phrase}`)) {
    throw new Error(`desktop shell should not direct clerks to start/install ${phrase}`);
  }
}

if (!tauriConfig.includes('"identifier": "org.civicsuite.desktop"')) {
  throw new Error("Tauri identifier is missing");
}

if (!rustMain.includes('include_str!("../../../installer/modules.json")')) {
  throw new Error("desktop shell must read the suite module registry at compile time");
}

if (css.includes("blur(") || css.includes("radial-gradient")) {
  throw new Error("desktop shell should avoid blurred/orb-like decorative styling");
}

console.log("PASS: desktop static smoke checks passed");
