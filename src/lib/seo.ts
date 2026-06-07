const defaultSiteUrl = "https://tubmind.space";

function normalizeSiteUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl() {
  const rawValue =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    defaultSiteUrl;

  return new URL(normalizeSiteUrl(rawValue));
}

export const seoConfig = {
  siteName: "Tubmind",
  title: "Tubmind",
  titleTemplate: "%s | Tubmind",
  description:
    "Tubmind is a private idea workspace for capturing rough thoughts fast, shaping them into structured concepts, and publishing the strongest ideas for feedback.",
  canonicalPath: "/",
  ogImage: "/og-image.png",
  ogImageAlt:
    "Tubmind preview showing private idea capture, structured idea development, and published listings for feedback.",
  keywords: [
    "Tubmind",
    "tubmind space",
    "tubmind app",
    "idea capture app",
    "private idea workspace",
    "idea management platform",
    "thought capture tool",
    "brainstorm workspace",
    "idea organizer app",
    "startup idea tracker",
    "product idea management",
    "private idea drafting",
    "idea validation platform",
    "publish ideas for feedback",
    "public idea listings",
    "build in public ideas",
    "concept development workspace",
  ],
} as const;
