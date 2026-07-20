import type { MetadataRoute } from "next";

const SITE_URL = "https://almidutch.almiworld.com";

// Private / app-only paths — blocked for ALL bots (unchanged from current).
const PRIVATE = ["/practice/", "/account", "/admin", "/api/"];

// Deep per-origin long-tail leaves (the ×country×university / ×country×hub fan-out,
// ~3.29M URLs). The /study-in-netherlands/<subject>, /work-in-netherlands/<role> and
// /exams/<level> hubs plus all landing pages stay crawlable; only the /from/ leaves
// are trimmed for generic bots.
const DEEP_LEAVES = ["/study-in-netherlands/*/from/", "/work-in-netherlands/*/from/"];

// Heavy crawlers that burn Vercel invocations + edge requests with ~no SEO upside.
// robots.txt is advisory — these DO obey it; truly abusive scrapers need BotID/WAF.
// Google-Extended = Gemini/Vertex TRAINING token, NOT search — blocking it does not
// affect ranking. Trim this list if you want AI-search (ChatGPT/Perplexity) citations.
const HEAVY_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai",
  "CCBot", "Bytespider", "Amazonbot", "PerplexityBot", "Google-Extended",
  "AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "DataForSeoBot", "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Real search engines: full access to the long-tail leaves — that IS the pSEO product.
      { userAgent: ["Googlebot", "Bingbot"], allow: "/", disallow: PRIVATE },
      // Everyone else: landing + hubs only, skip the per-origin leaves, gentle pace.
      { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...DEEP_LEAVES], crawlDelay: 10 },
      // Heavy, no-SEO-value crawlers: off entirely.
      { userAgent: HEAVY_BOTS, disallow: "/" },
    ],
    // Next 16's generateSitemaps has no auto-index at /sitemap.xml — point crawlers
    // at our explicit sitemap index, which lists all sharded sitemaps.
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}
