import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const [route, title] of [
  ["index.html", "SolidMemory Leaderboards"],
  ["awards/index.html", "SolidMemory Awards"],
]) {
  const html = await readFile(new URL(`../dist/${route}`, import.meta.url), "utf8");
  assert.ok(html.includes(`<title>${title} | HKMA K S Lo College</title>`), `${route} has the wrong page title`);
  assert.match(html, /src="\/smem-board\/assets\/[^" ]+\.js"/, `${route} must load its JavaScript from the Pages project base`);
  assert.match(html, /href="\/smem-board\/assets\/[^" ]+\.css"/, `${route} must load its CSS from the Pages project base`);
}
console.log("GitHub Pages root and Awards entry files verified.");
