import fs from "node:fs";
import path from "node:path";
const roots = ["src"];
const bad = [];
const amp = String.fromCharCode(38);
const tokens = [amp + "lt;", amp + "gt;", "=" + amp + "gt;", amp + "amp;lt;", amp + "amp;gt;"];
function walk(folder) {
  for (const name of fs.readdirSync(folder)) {
    const file = path.join(folder, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file);
    else if (/\.(?:ts|tsx|js|jsx|mjs|scss|css)$/.test(file)) {
      const text = fs.readFileSync(file, "utf8");
      if (tokens.some(token => text.includes(token))) bad.push(file);
    }
  }
}
for (const root of roots) walk(root);
if (bad.length) {
  console.error("Encoded source entities found:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("Source entity check passed.");
