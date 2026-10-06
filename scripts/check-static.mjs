/**
 * Guard rail for the archive's core promise: this site makes zero network
 * calls at runtime and depends on no third-party asset host.
 *
 * The app version of these pages reached /api/site-status and jsDelivr. If a
 * future edit reintroduces either, the archive is no longer an archive, so the
 * build fails loudly instead of shipping a page that silently phones home.
 *
 * Run: node scripts/check-static.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

/** Rules: [label, RegExp, files to skip (relative to src)] */
const RULES = [
  {
    label: "runtime API reference",
    pattern: /import\.meta\.env\.(PUBLIC_API_URL|PUBLIC_)[A-Z_]*/,
    // The one legitimate place: the arcade launcher exposes the debug hook in
    // dev builds only.
    allow: ["games/brickBreakerEngine.js"],
  },
  {
    label: "jsDelivr / CDN asset host",
    pattern: /cdn\.jsdelivr\.net|unpkg\.com|cdnjs\./,
  },
  {
    label: "backend route reference",
    // /api/... only. Site paths like /privacy are fine.
    pattern: /["'`]\/api\//,
  },
  {
    label: "React Query usage",
    pattern: /@tanstack\/react-query|useQuery\(|useQueryClient\(/,
  },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".astro", ".css"]);
const violations = [];

for await (const file of walk(SRC)) {
  const ext = path.extname(file);
  if (!EXTENSIONS.has(ext)) continue;
  const rel = path.relative(SRC, file);
  const contents = await readFile(file, "utf8");
  contents.split("\n").forEach((line, i) => {
    for (const rule of RULES) {
      if (!rule.pattern.test(line)) continue;
      if (rule.allow?.some((a) => rel === a)) continue;
      violations.push(`src/${rel}:${i + 1}  ${rule.label}\n    ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error("check-static: the archive must stay self-contained.\n");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("check-static: no API, CDN or query-client references in src/");
