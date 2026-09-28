import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Keep this date aligned with the latest meaningful public content change.
// A stable value prevents the sitemap from claiming every build is a content update.
const contentLastModified = "2026-09-28";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl.toString(),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("testamentvragenlijst/", siteUrl).toString(),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
