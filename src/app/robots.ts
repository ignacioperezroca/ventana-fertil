import type { MetadataRoute } from "next";
import { toAbsoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host: toAbsoluteUrl("/").replace(/\/$/, ""),
  };
}
