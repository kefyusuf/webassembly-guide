// Link checker — verifies every relative markdown link in the repo points
// to a file that exists (and, when a heading anchor is given, to a heading
// that exists). Usage: node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- collect all .md files -----------------------------------------------------
const mdFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", "target", "dist", ".tools", ".git"].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".md")) mdFiles.push(full);
  }
};
walk(root);

// --- extract relative links ------------------------------------------------------
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const headingSlug = (text) =>
  text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");

let broken = 0;
for (const file of mdFiles) {
  const src = readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  for (const [, href] of src.matchAll(LINK)) {
    if (/^(https?:|mailto:|#)/.test(href)) continue; // external / same-page
    const [targetPart, anchor] = href.split("#");
    const target = path.resolve(path.dirname(file), decodeURI(targetPart));
    if (!existsSync(target)) {
      console.error(`BROKEN FILE  ${rel} → ${href}`);
      broken++;
      continue;
    }
    if (anchor) {
      const body = readFileSync(target, "utf8");
      const hasHeading = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)]
        .some((m) => headingSlug(m[1]) === anchor.toLowerCase());
      if (!hasHeading) {
        console.error(`BROKEN ANCHOR  ${rel} → ${href}`);
        broken++;
      }
    }
  }
}

console.log(`checked ${mdFiles.length} markdown files`);
if (broken > 0) {
  console.error(`${broken} broken link(s)`);
  process.exit(1);
}
console.log("all relative links OK ✓");
