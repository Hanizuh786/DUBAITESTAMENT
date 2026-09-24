import type { FaqItem } from "@/components/Faq";
import generated from "./faqs.generated.json";
// Keep every complete item from the reconciled source available on the public
// page while excluding accidental exact duplicates from the import source.
export const faqs = generated as FaqItem[];
