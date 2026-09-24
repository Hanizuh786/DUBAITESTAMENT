import type { FaqItem } from "@/components/Faq";
import generated from "./faqs.generated.json";
// Keep every complete item from the reconciled 70-item source available on
// the public page. Repetition that is present in the approved source remains
// visible rather than being silently merged during import.
export const faqs = generated as FaqItem[];
