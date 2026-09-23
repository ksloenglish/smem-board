import { copyFile, access } from "node:fs/promises";

const target = new URL("../src/generated/public-data.json", import.meta.url);
const sample = new URL("../src/generated/public-data.sample.json", import.meta.url);

try {
  await access(target);
} catch {
  await copyFile(sample, target);
}
