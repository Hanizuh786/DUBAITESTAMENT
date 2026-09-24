import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/site";
import socialImage from "../../content/images/img5.jpg";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "UAE-testament voor expats | DubaiTestament.nl",
    template: "%s | DubaiTestament.nl",
  },
  description:
    "Cross-border estate planning en UAE-testamenten voor expats in Dubai en Abu Dhabi. Persoonlijke begeleiding bij ADJD- en DIFC-testamenten.",
  applicationName: "DubaiTestament.nl",
  authors: [{ name: "mr. Hilda van der Tuin" }],
  creator: "DubaiTestament.nl",
  publisher: "DubaiTestament.nl",
  category: "Legal services",
  keywords: [
    "UAE testament",
    "Dubai testament",
    "Abu Dhabi testament",
    "testament expats UAE",
    "cross-border estate planning",
    "ADJD testament",
    "DIFC testament",
    "estate planning Dubai",
    "Nederlandse expats UAE",
  ],
  alternates: {
    canonical: "/",
    languages: { "nl-NL": "/" },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    siteName: "DubaiTestament.nl",
    title: "UAE-testamenten en cross-border estate planning voor expats",
    description:
      "Persoonlijke juridische begeleiding bij UAE-testamenten, ADJD, DIFC en internationale nalatenschappen.",
    images: [
      {
        url: socialImage.src,
        width: socialImage.width,
        height: socialImage.height,
        alt: "Het opstellen van een UAE-testament",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UAE-testamenten voor expats | DubaiTestament.nl",
    description:
      "Cross-border estate planning en persoonlijke begeleiding bij UAE-testamenten.",
    images: [socialImage.src],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "JOUBV5jbHGglf5POFLOLGiIUVEEHJRSKsAguA_1gd3w",
  },
  other: {
    "content-language": "nl-NL",
    "geo.region": "AE-DU",
    "geo.placename": "Dubai, United Arab Emirates",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
