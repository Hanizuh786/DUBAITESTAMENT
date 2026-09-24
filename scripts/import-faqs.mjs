import fs from "fs";

const source = fs.readFileSync("content/query.txt", "utf8");

const posts = source
  .split(/\nPost\s+\d+\s*\n/i)
  .map(x => x.trim())
  .filter(Boolean);

const faqs = posts.map((post, index) => {
  let title = "";
  let question = "";
  let answer = "";

  const titleMatch = post.match(
    /Title:\s*([\s\S]*?)(?=\n(?:Vraag|raag)\s*[:;]|\nAntwoord\s*[:;]|$)/i
  );

  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const questionMatch = post.match(
    /(?:Vraag|raag)\s*[:;]\s*([\s\S]*?)(?=\nAntwoord\s*[:;]|$)/i
  );

  if (questionMatch) {
    question = questionMatch[1].trim();
  }

  const answerMatch = post.match(
    /Antwoord\s*[:;]\s*([\s\S]*)$/i
  );

  if (answerMatch) {
    answer = answerMatch[1].trim();
  } else if (questionMatch) {
    const [firstLine, ...remainingLines] = question.split("\n");
    question = firstLine.trim();
    answer = remainingLines.join("\n").trim();
  }

  // Standalone articles without Vraag/Antwoord
  if (!title && !question) {
    const firstLine = post
      .split("\n")
      .find(x => x.trim());

    title = firstLine || `Post ${index + 1}`;
    question = title;
    // Standalone exports use their first paragraph as the visible prompt.
    // Do not render that same paragraph a second time in the answer.
    answer = post.trim().startsWith(title)
      ? post.trim().slice(title.length).trim()
      : post.trim();
    if (!answer) answer = "Deze informatie staat in de vraag hierboven.";
  }

  // Remove export-only labels and author/timestamp rows while preserving the
  // substantive question and answer text.
  const cleanImportedMetadata = (value) => value
    .replace(/^Hilda van der Tuin \(Dutch Lawyer\)\s+[^\n]*$/gim, "")
    .replace(/^\s*(?:Vraag|raag|Antwoord)\s*:\s*/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  question = cleanImportedMetadata(question);
  answer = cleanImportedMetadata(answer);

  return {
    id: index + 1,
    slug: `faq-${index + 1}`,
    title,
    question,
    answer
  };
});

fs.writeFileSync(
  "src/content/faqs.generated.json",
  JSON.stringify(faqs, null, 2)
);

console.log(`Generated ${faqs.length} FAQs`);
``
