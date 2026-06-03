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
  title: "Bathideas | Bathroom design ideas captured and organized",
  description:
    "Bathideas helps you capture bathroom design ideas from anywhere, organize messy inspiration into useful plans, and refine the details in one focused workspace.",
  ogImage: "/og-image.png",
  ogImageAlt:
    "Bathideas preview showing bathroom inspiration captured from anywhere and organized into a useful plan.",
  keywords: [
    "bathroom ideas",
    "bathroom inspiration",
    "bathroom design inspiration",
    "bathroom planning",
    "bathroom design ideas",
    "bathroom renovation ideas",
    "bathroom mood board",
    "bathroom idea organizer",
    "save bathroom ideas",
    "interior planning",
  ],
} as const;
