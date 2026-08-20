"use client";

import { useMemo, useState } from "react";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

type FaqProps = {
  items: FaqItem[];
};

export default function Faq({ items }: FaqProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      `${item.question} ${item.answer}`
        .toLocaleLowerCase("nl")
        .includes(normalizedQuery),
    );
  }, [items, query]);

  return (
    <section id="faq" className="section faq">
      <div className="wrap">
        <p className="eyebrow">FAQ</p>
        <h2>Veelgestelde vragen</h2>

        <div className="faqTools">
          <label htmlFor="faq-search" className="srOnly">
            Zoeken
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek binnen alle FAQ's..."
          />
          <span aria-live="polite">
            {filteredItems.length} / {items.length}
          </span>
        </div>

        <div className="accordions">
          {filteredItems.map((item, index) => (
            <details key={item.id} className="accordion">
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.question}</strong>
              </summary>
             <div className="answer">
  {item.answer ? (
    item.answer
      .split(/\n{2,}/)
      .map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph}
        </p>
      ))
  ) : (
    <p>Answer not loaded.</p>
  )}
</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
