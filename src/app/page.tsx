import Image, { type StaticImageData } from "next/image";
import Faq from "@/components/Faq";
import HeroScene from "@/components/HeroScene";
import QuestionnairePrototype from "@/components/QuestionnairePrototype";
import { faqs } from "@/content/faqs";
import { landingSections } from "@/content/content";
import { siteUrl } from "@/lib/site";
import coupleImage from "../../content/images/img1.jpg";
import businessImage from "../../content/images/img2.jpg";
import propertyImage from "../../content/images/img3.jpg";
import familyImage from "../../content/images/img4.jpg";
import draftingImage from "../../content/images/img5.jpg";

const sectionImages: {
  src: StaticImageData;
  alt: string;
  position?: string;
}[] = [
  {
    src: businessImage,
    alt: "Internationale kantoorgebouwen als symbool voor grensoverschrijdende estate planning",
  },
  {
    src: coupleImage,
    alt: "Een stel dat samen vooruitkijkt naar de toekomst",
    position: "center 68%",
  },
  {
    src: propertyImage,
    alt: "Modelwoning met sleutels als onderdeel van een nalatenschap",
  },
  {
    src: draftingImage,
    alt: "Vulpen op papier tijdens het opstellen van een testament",
  },
  {
    src: familyImage,
    alt: "Een familie samen bij zonsondergang",
    position: "center 60%",
  },
];

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</>;
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: "DubaiTestament.nl",
        description:
          "Cross-border estate planning en UAE-testamenten voor expats.",
        inLanguage: "nl-NL",
        publisher: { "@id": `${siteUrl}#legal-service` },
      },
      {
        "@type": "LegalService",
        "@id": `${siteUrl}#legal-service`,
        name: "DubaiTestament.nl",
        alternateName: "Holland Legal Services",
        url: siteUrl,
        description:
          "Juridische en fiscale begeleiding bij UAE-testamenten en internationale estate planning voor expats.",
        areaServed: [
          { "@type": "Country", name: "United Arab Emirates" },
          { "@type": "City", name: "Dubai" },
          { "@type": "City", name: "Abu Dhabi" },
        ],
        knowsLanguage: ["nl", "en"],
        founder: {
          "@type": "Person",
          name: "mr. Hilda van der Tuin",
          jobTitle: "Advocaat, notaris, mediator en Registered Wills Draftsman",
          knowsAbout: [
            "UAE-testamenten",
            "Cross-border estate planning",
            "ADJD-testamenten",
            "DIFC-testamenten",
            "Internationale nalatenschappen",
          ],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Estate planning diensten",
          itemListElement: [
            "ADJD-testamenten",
            "DIFC-testamenten",
            "Cross-border estate planning",
            "Huwelijkse voorwaarden",
            "Bedrijfsopvolging",
            "Probate en estate administration",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="header">
        <a className="brand" href="#top">DUBAI<span>TESTAMENT</span>.NL</a>
        <nav aria-label="Hoofdnavigatie">
          <a href="#estate">Estate Planning</a>
          <a href="#questionnaire">Vragenlijst</a>
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
        <section id="questionnaire" className="section">
  <div className="wrap">
    <p className="eyebrow">TESTAMENT</p>

    <h2>Gegevens testament</h2>

    <div className="accordions">
      <details className="accordion">
        <summary>
          <span>_</span>
          <strong>
            Klik hier om de testamentvragenlijst te openen
          </strong>
        </summary>

        <div className="answer">
        <QuestionnairePrototype />
        </div>
      </details>
    </div>
  </div>
</section>
       
        {landingSections.slice(1).map((section, index) => (
          <section className={`section ${index % 2 ? "tint" : ""}`} key={section.title}>
            <div className="wrap grid">
              <div className="sectionIntro">
                <p className="sectionNo">{String(index + 1).padStart(2, "0")}</p>
                <h2>{section.title}</h2>
                <figure className="sectionVisual">
                  <Image
                    src={sectionImages[index].src}
                    alt={sectionImages[index].alt}
                    fill
                    sizes="(max-width: 760px) calc(100vw - 28px), 42vw"
                    style={{ objectPosition: sectionImages[index].position }}
                  />
                </figure>
              </div>
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
