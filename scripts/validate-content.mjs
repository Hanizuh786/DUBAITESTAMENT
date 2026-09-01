import fs from "node:fs";
import { createHash } from "node:crypto";

const expectedCount = 70;
const source = fs.readFileSync(
  new URL("../content/query.txt", import.meta.url),
);
const expectedHash = fs
  .readFileSync(new URL("../content/query.sha256", import.meta.url), "utf8")
  .trim()
  .split(/\s+/)[0];
const actualHash = createHash("sha256").update(source).digest("hex");

if (actualHash !== expectedHash) {
  console.error("Content validation failed: FAQ source checksum mismatch.");
  process.exit(1);
}

const data = JSON.parse(
  fs.readFileSync(
    new URL("../src/content/faqs.generated.json", import.meta.url),
    "utf8",
  ),
);

if (data.length !== expectedCount) {
  console.error(
    `Content validation failed: expected ${expectedCount} FAQ items, found ${data.length}. Run npm run import:faqs.`,
  );
  process.exit(1);
}

const invalidItem = data.find(
  (item, index) =>
    item.id !== index + 1 ||
    typeof item.question !== "string" ||
    !item.question.trim() ||
    typeof item.answer !== "string" ||
    !item.answer.trim(),
);

if (invalidItem) {
  console.error(
    `Content validation failed: FAQ item ${invalidItem.id ?? "unknown"} is incomplete.`,
  );
  process.exit(1);
}

console.log(`Content validation passed: ${expectedCount} complete FAQ items.`);
