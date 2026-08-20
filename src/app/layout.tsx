import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Cross-border estate planning UAE | UAE-testamenten voor expats",
  description: "UAE-testamenten voor expats en cross-border estate planning.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
