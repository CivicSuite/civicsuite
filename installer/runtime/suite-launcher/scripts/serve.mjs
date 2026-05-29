import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = new Map(process.argv.slice(2).map((arg, index, all) => {
  if (!arg.startsWith("--")) return [arg, true];
  const next = all[index + 1];
  return [arg, next && !next.startsWith("--") ? next : true];
}));

const port = Number(args.get("--port") || process.env.PORT || 4179);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolveRequest(urlPath) {
  const cleanPath = decodeURIComponent(new URL(urlPath, "http://localhost").pathname);
  const candidate = normalize(join(root, cleanPath === "/" ? "index.html" : cleanPath));
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

const server = createServer((request, response) => {
  const path = resolveRequest(request.url || "/");
  if (!path) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stats = statSync(path);
    if (!stats.isFile()) throw new Error("not a file");
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`suite-launcher: http://127.0.0.1:${port}`);
});
