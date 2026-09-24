"use client";

import { useEffect, useMemo, useState } from "react";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category?: string;
};

type FaqProps = {
  items: FaqItem[];
};

export default function Faq({ items }: FaqProps) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const categoryNames = ["ADJD en DIFC", "Singles, partners en gezinnen", "Kinderen en guardians", "Beneficiaries", "Executeurs en probate", "Vastgoed", "Bankrekeningen en beleggingen", "Bedrijven en foundations", "Buitenlandse testamenten", "Belasting", "Uitvaartwensen"];

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");

    return items.filter((item) =>
      `${item.question ?? ""} ${item.answer ?? ""} ${item.category ?? categoryNames[item.id % categoryNames.length]}`
        .toLocaleLowerCase("nl")
        .includes(normalizedQuery) && (!categories.length || categories.includes(item.category ?? categoryNames[item.id % categoryNames.length])),
    );
  }, [items, query, categories]);
  useEffect(() => {
    const match = window.location.hash.match(/^#faq-(\d+)$/);
    if (!match) return;
    const id = Number(match[1]);
    setOpen([id]);
    requestAnimationFrame(() => document.getElementById(`faq-${id}`)?.scrollIntoView({ block: "start" }));
  }, []);
  const toggleAll = (expand: boolean) => setOpen(expand ? [...new Set(filteredItems.map((item) => item.id))] : []);
  const linkedText = (value: string) => {
    const parts = value.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (!part.startsWith("http")) return part;
      const clean = part.replace(/[).,]+$/, "");
      const href = clean.includes("rechtspraak.nl")
        ? "https://www.rechtspraak.nl/onderwerpen/voogdij/aanwijzen-voogd-formulier"
        : clean.includes("bodymuseum")
          ? "https://ku.ac.ae/bodymuseum/"
          : clean.includes("difccourts.ae")
            ? "https://eregistry.difccourts.ae/will-draftsmen"
            : clean.includes("notaris.nl/page/het-opvolgersarchief")
              ? "https://www.notaris.nl/page/het-opvolgersarchief"
              : clean;
      const label = href.includes("rechtspraak")
        ? "het formulier om een voogd aan te wijzen"
        : href.includes("bodymuseum")
          ? "het Body Museum van Khalifa University"
          : href.includes("difccourts")
            ? "het Register of Wills Draftsmen van DIFC"
            : href.includes("opvolgersarchief")
              ? "het Opvolgersarchief van Notaris.nl"
              : clean;
      return <a key={index} href={href}>{label}</a>;
    });
  };

  return (
    <section id="faq" className="section faq">
      <div className="wrap">
        <p className="eyebrow">FAQ</p>
        <h2>Veelgestelde vragen</h2>

        <div className="faqTools">
          <label htmlFor="faq-search">Zoek in de veelgestelde vragen</label>
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
        <div className="faqFilters">{categoryNames.map((category) => <button type="button" className={categories.includes(category) ? "active" : ""} key={category} onClick={() => setCategories((c) => c.includes(category) ? c.filter((x) => x !== category) : [...c, category])}>{category}</button>)} <button type="button" onClick={() => { setCategories([]); setQuery(""); }}>Wis filters</button></div>

        <div className="accordions">
          {filteredItems.map((item) => (
            <details key={item.id} id={`faq-${item.id}`} className="accordion" open={open.includes(item.id)} onToggle={(e) => { const isOpen = e.currentTarget.open; setOpen((current) => isOpen ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)); }}>
              <summary>
                <span>{String(item.id).padStart(2, "0")}</span>
                <strong>{item.question}</strong>
              </summary>
             <div className="answer">
          {item.answer ? (
            String(item.answer).split(/\n{2,}/).map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{linkedText(paragraph)}</p>
            ))
          ) : (
    <p>Answer not loaded.</p>
  )}
              </div>
            </details>
          ))}
        </div>
        {!filteredItems.length && <p>Geen antwoord gevonden. Probeer een andere zoekterm of <a href="https://dutchlawyerindeuae.youcanbook.me">boek een gesprek</a>.</p>}
        <a className="button" href="https://dutchlawyerindeuae.youcanbook.me">Boek een gesprek</a>
      </div>
    </section>
  );
}
