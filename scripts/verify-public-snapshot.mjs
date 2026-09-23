import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../src/generated/public-data.json", import.meta.url), "utf8"));
const forbidden = new Set([
  "userId",
  "openId",
  "email",
  "token",
  "accessToken",
  "refreshToken",
  "reportUrl",
  "storageKey",
  "rawSnapshotId",
  "contentHash",
]);

function inspect(value, path = "snapshot") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) throw new Error(`Forbidden public-data key: ${path}.${key}`);
    inspect(child, `${path}.${key}`);
  }
}

inspect(data);
console.log("Public snapshot privacy contract passed.");
