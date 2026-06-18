import type { MetadataRoute } from "next";

import { seoConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: seoConfig.siteName,
        short_name: seoConfig.siteName,
        description: seoConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#f4efe5",
        theme_color: "#f4efe5",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/icon.png",
                sizes: "209x209",
                type: "image/png",
            },
        ],
    };
}
