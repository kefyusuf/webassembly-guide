// Renders docs/en/*.md and docs/tr/*.md into static HTML pages for GitHub
// Pages: English lands at <out>/, Turkish at <out>/tr/.
// Usage: node scripts/render-docs.mjs <out-dir>   (run from repo root)
// Uses `marked` via npx — no build-time dependency in the repo.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.resolve(root, process.argv[2] ?? "_pages/docs");
mkdirSync(outDir, { recursive: true });

// docs/en and docs/tr share chapter numbering (01–07) but filenames are
// localized (01-what-is-wasm.md ↔ 01-wasm-nedir.md) — the language switch
// maps by that leading number.
const LANGS = [
  { code: "en", dir: "en", sub: "", label: "EN" },
  { code: "tr", dir: "tr", sub: "tr", label: "TR" },
];

const hrefOf = (file) => file.replace(/\.md$/, ".html");
const filesOf = {};
for (const lang of LANGS) {
  filesOf[lang.code] = readdirSync(path.join(root, "docs", lang.dir))
    .filter((f) => f.endsWith(".md"))
    .sort();
}

const titleOf = (file, md) => {
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1];
  return file.replace(/\.md$/, "");
};

const style = `
  body { font-family: system-ui, sans-serif; max-width: 780px; margin: 2rem auto; padding: 0 1rem; background: #111; color: #ddd; line-height: 1.6; }
  h1, h2, h3 { color: #fff; } h1 { font-size: 1.5rem; border-bottom: 1px solid #333; padding-bottom: .4rem; }
  a { color: #6ea8ff; } code { background: #2a2a2a; padding: .1rem .35rem; border-radius: 4px; font-size: .9em; }
  pre { background: #1c1c1c; border: 1px solid #333; border-radius: 8px; padding: 1rem; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; } th, td { border: 1px solid #333; padding: .35rem .6rem; }
  th { background: #1c1c1c; }
  nav { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 2rem; }
  nav a { font-size: .85rem; background: #1c1c1c; border: 1px solid #333; border-radius: 6px; padding: .25rem .6rem; text-decoration: none; }
  blockquote { border-left: 3px solid #2d6cdf; margin-left: 0; padding-left: 1rem; color: #aaa; }
`;

const nav = (lang, file) => {
  const links = filesOf[lang.code].map((f) => {
    const mark = hrefOf(f) === hrefOf(file) ? ' style="color:#fff;font-weight:600"' : "";
    return `<a href="./${hrefOf(f)}"${mark}>${f.replace(/\.md$/, "").replace(/^\d+-/, "")}</a>`;
  });
  // Language switch: same chapter number in the other language
  const num = file.match(/^(\d+)-/)?.[1] ?? "";
  const otherFile = num && filesOf[lang.code === "en" ? "tr" : "en"].find((f) => f.startsWith(`${num}-`));
  const otherPrefix = lang.code === "en" ? "./tr/" : "../";
  const switchLink = otherFile
    ? `<a href="${otherPrefix}${hrefOf(otherFile)}">${lang.code === "en" ? "TR" : "EN"}</a>`
    : "";
  // TR pages sit one level deeper — demo and repo links need the extra hop
  const up = lang.code === "en" ? "../" : "../../";
  return `<nav>${links.join("")}${switchLink}<a href="${up}07-web-demo/">▶ demo</a><a href="https://github.com/kefyusuf/webassembly-guide">GitHub</a></nav>`;
};

let count = 0;
for (const lang of LANGS) {
  mkdirSync(path.join(outDir, lang.sub), { recursive: true });
  for (const file of filesOf[lang.code]) {
    const md = readFileSync(path.join(root, "docs", lang.dir, file), "utf8");
    const body = execFileSync("npx", ["-y", "marked@12", "--gfm"], {
      input: md,
      encoding: "utf8",
      shell: true,
    });
    const title = titleOf(file, md).replace(/<[^>]+>/g, "");
    const html = `<!doctype html>
<html lang="${lang.code}"><head><meta charset="utf-8"><title>${title} — WebAssembly Guide</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><style>${style}</style></head>
<body>${nav(lang, file)}${body}</body></html>`;
    writeFileSync(path.join(outDir, lang.sub, hrefOf(file)), html);
    console.log("rendered", `${lang.dir}/${file}`);
    count++;
  }
}
console.log(`${count} doc pages → ${outDir}`);
