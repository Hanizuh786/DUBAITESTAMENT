import type { Metadata } from "next";
import QuestionnairePrototype from "@/components/QuestionnairePrototype";

export const metadata: Metadata = {
  title: "Testamentvragenlijst",
  alternates: { canonical: "/#questionnaire" },
  robots: { index: false, follow: false },
};

export default function QuestionnairePage() {
  return (
    <main>
      <QuestionnairePrototype />
    </main>
  );
}
