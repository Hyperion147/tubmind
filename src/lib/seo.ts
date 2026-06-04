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
  title: "Tubmind | Private idea capture workspace",
  description:
    "Tubmind is a private idea-capture workspace for thoughts that strike anywhere, including in the bathroom. Sign in with Google, save rough ideas fast, refine them with notes, features, and structure, and publish the strongest ideas as public listings for reactions and discussion.",
  ogImage: "/og-image.png",
  ogImageAlt:
    "Tubmind preview showing private idea capture, Google sign-in, and published listings for discussion.",
  keywords: [
    "idea capture app",
    "random ideas",
    "thought capture",
    "idea workspace",
    "idea management",
    "idea dashboard",
    "private idea drafting",
    "private idea board",
    "brainstorm capture",
    "publish ideas",
    "public listings",
  ],
} as const;
