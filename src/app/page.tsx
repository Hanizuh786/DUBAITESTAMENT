import Faq from "@/components/Faq";
import HeroScene from "@/components/HeroScene";
import { faqs } from "@/content/faqs";
import { landingSections } from "@/content/content";

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</>;
}

export default function Home() {
  return (
    <>
      <header className="header">
        <a className="brand" href="#top">DUBAI<span>TESTAMENT</span>.NL</a>
        <nav aria-label="Hoofdnavigatie">
          <a href="#estate">Estate Planning</a>
          <a href="#faq">Veelgestelde vragen</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <main id="top">
        <section className="hero" id="estate">
          <HeroScene />
          <div className="heroGlow" />
          <div className="wrap heroContent">
            <p className="eyebrow">DUBAI · UAE · INTERNATIONAL</p>
            <h1>{landingSections[0].title}</h1>
            <div className="lead"><Paragraphs text={landingSections[0].body} /></div>
            <a className="button" href="#faq">Veelgestelde vragen <b>↓</b></a>
          </div>
        </section>
        {landingSections.slice(1).map((section, index) => (
          <section className={`section ${index % 2 ? "tint" : ""}`} key={section.title}>
            <div className="wrap grid">
              <div><p className="sectionNo">{String(index + 1).padStart(2, "0")}</p><h2>{section.title}</h2></div>
              <div className="prose"><Paragraphs text={section.body} /></div>
            </div>
          </section>
        ))}
        <Faq items={faqs} />
        <section id="contact" className="contact"><div className="wrap"><p className="eyebrow">DUBAITESTAMENT.NL</p><h2>Cross-border estate planning UAE | UAE-testamenten voor expats</h2></div></section>
      </main>
      <footer><div className="wrap">© DUBAITESTAMENT.NL</div></footer>
    </>
  );
}
