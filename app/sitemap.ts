import type { MetadataRoute } from "next";
import { EXAMS } from "@/lib/exams";
import { SITE } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "", "/exams", "/pricing", "/blog", "/about", "/contact",
    "/privacy", "/terms", "/disclaimer",
  ];
  const examPaths = EXAMS.map((e) => `/exams/${e.slug}`);
  return [...staticPaths, ...examPaths].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
