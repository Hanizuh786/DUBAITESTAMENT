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
    answer = post.trim();
  }

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
