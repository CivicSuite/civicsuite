import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = {
  html: readFileSync(join(root, "index.html"), "utf8"),
  js: readFileSync(join(root, "src", "app.js"), "utf8"),
  css: readFileSync(join(root, "src", "styles.css"), "utf8"),
  readme: readFileSync(join(root, "README.md"), "utf8")
};

const requiredSnippets = [
  ["html", "CivicSuite Launcher"],
  ["js", "Staff"],
  ["js", "Resident"],
  ["js", "IT-Admin"],
  ["js", "CivicRecords AI"],
  ["js", "CivicClerk"],
  ["js", "CivicCode"],
  ["js", "command-palette"],
  ["js", "audit-drawer"],
  ["js", "state=loading|success|empty|error|partial"],
  ["css", "--paper"],
  ["css", "--navy"],
  ["css", "--gold"],
  ["css", "Source Serif"],
  ["css", "JetBrains Mono"],
  ["readme", "?state=partial"]
];

const missing = requiredSnippets.filter(([file, snippet]) => !files[file].includes(snippet));
if (missing.length) {
  for (const [file, snippet] of missing) {
    console.error(`missing required launcher scaffold text in ${file}: ${snippet}`);
  }
  process.exit(1);
}

console.log("suite-launcher smoke: PASS");
