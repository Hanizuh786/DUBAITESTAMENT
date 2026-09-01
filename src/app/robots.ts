import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/questionnaire-prototype/"],
    },
    sitemap: new URL("sitemap.xml", siteUrl).toString(),
    host: siteUrl.toString(),
  };
}
