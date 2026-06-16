import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { getSiteUrl, seoConfig } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    metadataBase: getSiteUrl(),
    title: {
        default: seoConfig.title,
        template: seoConfig.titleTemplate,
    },
    description: seoConfig.description,
    applicationName: seoConfig.siteName,
    referrer: "origin-when-cross-origin",
    keywords: [...seoConfig.keywords],
    authors: [{ name: seoConfig.siteName }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    alternates: {
        canonical: seoConfig.canonicalPath,
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: seoConfig.canonicalPath,
        siteName: seoConfig.siteName,
        title: `${seoConfig.title} | Private idea workspace`,
        description: seoConfig.description,
        images: [
            {
                url: seoConfig.ogImage,
                alt: seoConfig.ogImageAlt,
                width: 1901,
                height: 956,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `${seoConfig.title} | Private idea workspace`,
        description: seoConfig.description,
        images: [seoConfig.ogImage],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    category: "technology",
};

export const viewport: Viewport = {
    themeColor: "#f4efe5",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} h-full antialiased`}>
            <body
                className="min-h-full bg-background text-foreground"
                suppressHydrationWarning
            >
                {children}
                <Analytics />
            </body>
        </html>
    );
}
