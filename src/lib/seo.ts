const defaultSiteUrl = "http://localhost:3000";

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
  siteName: "Bathideas",
  title: "Bathideas",
  description:
    "Bathideas is a focused workspace for drafting bathroom concepts privately, refining the details, and publishing the strongest ideas for discussion.",
  ogImage: "/og-image.png",
  ogImageAlt:
    "Bathideas preview showing a private-to-public workflow for bathroom ideas.",
  keywords: [
    "bathroom ideas",
    "bathroom planning",
    "bathroom design ideas",
    "interior planning",
    "idea dashboard",
    "private drafting",
    "public listings",
  ],
} as const;
