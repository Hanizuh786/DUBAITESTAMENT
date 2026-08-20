import fs from "node:fs";
const data=JSON.parse(fs.readFileSync(new URL("../src/content/faqs.generated.json",import.meta.url),"utf8"));
if(data.length!==75){console.error(`Content validation failed: expected 75 FAQ items, found ${data.length}. Run npm run import:faqs.`);process.exit(1)}
console.log("Content validation passed: 75 FAQ items.");
