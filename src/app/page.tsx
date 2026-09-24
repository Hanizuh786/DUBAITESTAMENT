import Image, { type StaticImageData } from "next/image";
import Faq from "@/components/Faq";
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
  const linkify = (value: string) => {
    const parts = value.split(/(DIFC-Courts|https:\/\/www\.rechtspraak\.nl\/[^\s]+|https:\/\/bodymuseum\.ku\.ac\.ae\/|https:\/\/www\.difccourts\.ae\/ws|https:\/\/www\.notaris\.nl\/page\/het-opvolgersarchief\.?)/g);
    return parts.map((part, index) => {
      const links: Record<string, [string, string]> = {
        "DIFC-Courts": ["Register of Wills Draftsmen", "https://eregistry.difccourts.ae/will-draftsmen"],
      };
      if (links[part]) return <a key={index} href={links[part][1]}>{links[part][0]}</a>;
      if (part.startsWith("http")) {
        const raw = part.replace(/[.,]$/, "");
        const href = raw.includes("rechtspraak.nl") ? "https://www.rechtspraak.nl/onderwerpen/voogdij/aanwijzen-voogd-formulier" : raw.includes("bodymuseum") ? "https://ku.ac.ae/bodymuseum/" : raw.includes("difccourts.ae/ws") ? "https://eregistry.difccourts.ae/will-draftsmen" : raw.includes("notaris.nl") ? "https://www.notaris.nl/page/het-opvolgersarchief" : raw;
        const label = href.includes("rechtspraak") ? "Voogd aanwijzen" : href.includes("bodymuseum") ? "Body Museum van Khalifa University" : href.includes("notaris") ? "Opvolgersarchief" : "Register of Wills Draftsmen";
        return <a key={index} href={href}>{label}</a>;
      }
      return part;
    });
  };
  return <>{text.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{linkify(paragraph)}</p>)}</>;
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
        <div><a className="brand" href="#top">DUBAI<span>TESTAMENT</span>.NL</a><small className="serviceLine">Een service van Dutch Lawyer in de UAE</small></div>
        <nav aria-label="Hoofdnavigatie">
          <a href="#estate">Estate Planning</a>
          <a href="/testamentvragenlijst">Testamentvragenlijst</a>
          <a href="#faq">Veelgestelde vragen</a>
          <a href="#contact">Contact</a>
          <a className="nav-booking" href="https://dutchlawyerindeuae.youcanbook.me">Boek een gesprek</a>
        
        </nav>
        <details className="mobileNav">
          <summary aria-label="Open navigatiemenu"><span></span><span></span><span></span></summary>
          <nav aria-label="Mobiele navigatie">
            <a href="#estate">Estate Planning</a>
            <a href="/testamentvragenlijst">Testamentvragenlijst</a>
            <a href="#faq">Veelgestelde vragen</a>
            <a href="#contact">Contact</a>
            <a className="nav-booking" href="https://dutchlawyerindeuae.youcanbook.me">Boek een gesprek</a>
          </nav>
        </details>
      </header>
      <main id="top">
        <section className="hero" id="estate">
          <div className="heroGlow" />
          <div className="wrap heroContent">
            <p className="eyebrow">DUBAI · UAE · INTERNATIONAL</p>
            <h1>{landingSections[0].title}</h1>
            <div className="lead"><Paragraphs text={landingSections[0].body} /></div>
            <a className="button" href="https://dutchlawyerindeuae.youcanbook.me">Boek een gesprek</a>
            <a className="button secondary" href="#faq-search">Bekijk de veelgestelde vragen</a>
          </div>
        </section>
        <section id="questionnaire" className="section">
  <div className="wrap">
    <p className="eyebrow">TESTAMENT</p>

    <h2>Gegevens voor je UAE-testament</h2>
    <p>Wil je een Single Will of een Mirror Will laten opstellen? Vul dan eerst de testamentvragenlijst in. We gebruiken je antwoorden om je persoonlijke situatie, je vermogen en je bestaande testamenten in kaart te brengen.</p>
    <a className="button" href="/testamentvragenlijst">Open de testamentvragenlijst</a>
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
              <div className="prose">
                {section.title === "Zo verloopt het" && (
                  <figure className="hildaProfile">
                    <Image
                      src="/images/foto-hilda.jpg"
                      alt="mr. Hilda van der Tuin"
                      width={304}
                      height={304}
                    />
                    <figcaption>mr. Hilda van der Tuin</figcaption>
                  </figure>
                )}
                {section.title === "Wat je krijgt en wat het kost" && <div className="priceBlocks">
                  <div className="priceBlock"><h3>Single Will</h3><p>Een Single Will kost AED 7.000 inclusief VAT. De registratie bij ADJD kost AED 950.</p><p className="total">Totaal: AED 7.950</p><p>In de prijs zijn het videogesprek, het juridische en fiscale onderzoek, het onderzoek naar bestaande buitenlandse testamenten, het opstellen en aanpassen van je ADJD-testament, de Arabische vertaling en de begeleiding bij de registratie opgenomen.</p></div>
                  <div className="priceBlock"><h3>Mirror Will</h3><p>Twee min of meer identieke testamenten (Mirror Wills) kosten samen AED 8.000 inclusief VAT. De registratie bij ADJD kost AED 950 per testament.</p><p className="total">Totaal: AED 9.900</p><p>In de prijs zijn opgenomen:</p><ul><li>een persoonlijk videogesprek van een uur met Hilda;</li><li>juridisch en fiscaal onderzoek voor beide partners;</li><li>onderzoek naar bestaande buitenlandse testamenten;</li><li>onderzoek naar internationale regels en verdragen;</li><li>twee afzonderlijk opgestelde ADJD-testamenten;</li><li>fiscale bepalingen die bij de nalatenschap passen;</li><li>verwerking van wijzigingen;</li><li>twee Arabische vertalingen, opgesteld door een erkende rechtbankvertaler;</li><li>begeleiding bij de registratie van je testament;</li><li>als eindproduct twee gelegaliseerde testamenten.</li></ul></div>
                </div>}
                {section.title === "Wat je krijgt en wat het kost" && <a className="button" href="https://dutchlawyerindeuae.youcanbook.me">Boek een gesprek</a>}
                <Paragraphs text={section.body} />
              </div>
            </div>
          </section>
        ))}
        <section className="section tint" id="over-ons">
          <div className="wrap grid">
            <div className="sectionIntro"><p className="sectionNo">06</p><h2>Over ons</h2><figure className="sectionVisual"><Image src="/images/foto-hilda.jpg" alt="mr. Hilda van der Tuin" fill sizes="(max-width: 760px) calc(100vw - 28px), 42vw" /></figure></div>
            <div className="prose"><p>De dienst wordt geleverd door Holland Legal Services FZ-LLC. Dutch Lawyer in de UAE is de handelsnaam van Holland Legal Services FZ-LLC.</p><p>Hilda is advocaat, notaris en mediator in de Verenigde Arabische Emiraten. Zij heeft een Master of Laws in notarieel recht en is Registered Wills Draftsman voor DIFC. Zij werkt al vijftien jaar in de Verenigde Arabische Emiraten.</p><p>Bij de Koninklijke Notariële Beroepsorganisatie in Den Haag was Hilda manager van de afdelingen Praktijkzaken en Juridische Zaken. Zij gaf leiding aan twintig juristen en maakte deel uit van het managementteam.</p></div>
          </div>
        </section>
        <Faq items={faqs} />
        <section id="contact" className="contact"><div className="wrap"><p className="eyebrow">DUBAITESTAMENT.NL</p><h2>Contact</h2><p>Wij zijn een responsief en flexibel advocatenkantoor. Waar mogelijk bieden wij onze diensten aan tegen een vaste prijs. Je hebt rechtstreeks contact met de experts die je zaak behandelen; wij besteden ons werk niet uit.</p><p>Voor de meeste zaken maken wij een eigen omgeving in ons online portaal. Daar kun je de voortgang volgen, correspondentie en documenten lezen en precies zien wat wij namens jou doen.</p><p>Wij behouden ons het recht voor om opdrachten van potentiële cliënten zonder opgaaf van reden te weigeren.</p><p><strong>Ons kantoor in Dubai:</strong><br />Dubai Hills Business Park<br />Building 4, Seventh Floor<br />Dubai, United Arab Emirates</p><p>We spreken je online, want voor een afspraak van een uur in Dubai kunnen we zes uur kwijt zijn aan de heen- en terugreis. Via de knop ‘Boek een gesprek’ maak je een afspraak.</p><p><strong>Direct e-mailen:</strong><br /><a href="mailto:hilda@dutchlawyerindeuae.nl">hilda@dutchlawyerindeuae.nl</a><br /><a href="mailto:paul@dutchlawyerindeuae.nl">paul@dutchlawyerindeuae.nl</a></p><p>Voor meer digitale privacy kun je contact opnemen met Paul via Signal: paulharts.33, of Telegram: @Paul_Holland_Legal_Services.</p><a className="button" href="https://dutchlawyerindeuae.youcanbook.me/">Boek een gesprek</a></div></section>
      </main>
      <footer>
        <div className="wrap">
          <p>© DUBAITESTAMENT.NL · DubaiTestament.nl is een dienst van Holland Legal Services FZ-LLC.</p>
          <p>
            Holland Legal Services FZ-LLC · Free Zone Limited Liability Company<br />
            Licence number: 47002145 · Legal consultancy<br />
            T2-4F-2A, Amenity Centre – RAKEZ, RAKEZ Business Zones,<br />
            Al Jazeera Al Hamra, RAK, United Arab Emirates<br />
            Manager: Hiltje van der Tuin
          </p>
          <p>Dubai office: Dubai Hills Business Park, Building 4, Seventh Floor, Dubai, United Arab Emirates<br />
            <a href="mailto:hilda@dutchlawyerindeuae.nl">hilda@dutchlawyerindeuae.nl</a> · <a href="mailto:paul@dutchlawyerindeuae.nl">paul@dutchlawyerindeuae.nl</a>
          </p>
          <p><a href="https://www.dutchlawyerindeuae.nl/privacy-policy.html">Privacyverklaring</a></p>
        </div>
      </footer>
    </>
  );
}
