import type { Metadata } from "next";
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
        template: `%s | ${seoConfig.siteName}`,
    },
    description: seoConfig.description,
    applicationName: seoConfig.siteName,
    keywords: [...seoConfig.keywords],
    alternates: {
        canonical: "/",
    },
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: seoConfig.siteName,
        title: seoConfig.title,
        description: seoConfig.description,
        images: [
            {
                url: seoConfig.ogImage,
                alt: seoConfig.ogImageAlt,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: seoConfig.title,
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} h-full antialiased`}>
            <body className="min-h-full bg-background text-foreground">
                {children}
                <Analytics />
            </body>
        </html>
    );
}
