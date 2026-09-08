import type { FaqItem } from "@/components/Faq";
import generated from "./faqs.generated.json";
// FAQ 50 and 51 are identical source entries; expose one canonical entry and
// keep the public counter sequential.
export const faqs = (generated as FaqItem[])
  .filter((item) => item.id !== 51)
  .map((item, index) => ({ ...item, id: index + 1 }));
