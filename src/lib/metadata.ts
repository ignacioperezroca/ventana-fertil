import type { Metadata } from "next";

import { getSiteUrl, toAbsoluteUrl } from "@/lib/site";

export const APP_NAME = "Ventana Fértil";
export const SEO_TITLE = "🥚 Ventana Fértil | Calculá tus días fértiles del mes";
export const SEO_DESCRIPTION =
  "Ingresá cuándo te vino y estimá tu ventana fértil, ovulación y días de mayor fertilidad. Herramienta educativa, visual y privada.";
export const SEO_KEYWORDS = [
  "Ventana Fértil",
  "ventana fértil estimada",
  "ovulación estimada",
  "simulador educativo",
  "marcador por día",
  "privacidad local",
];

export function buildAppMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = toAbsoluteUrl("/og/ventana-fertil-og.png");

  return {
    metadataBase: new URL(siteUrl),
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    applicationName: APP_NAME,
    appleWebApp: {
      capable: true,
      title: APP_NAME,
      statusBarStyle: "default",
    },
    creator: "Ignacio Pérez Roca",
    authors: [{ name: "Ignacio Pérez Roca" }],
    category: "health",
    alternates: {
      canonical: "/",
    },
    keywords: SEO_KEYWORDS,
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
    openGraph: {
      type: "website",
      url: "/",
      siteName: APP_NAME,
      locale: "es_AR",
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: "Vista previa de Ventana Fértil, una app educativa para visualizar ciclo, ovulación y ventana fértil.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      images: [
        {
          url: ogImage,
          alt: "Vista previa de Ventana Fértil, una app educativa para visualizar ciclo, ovulación y ventana fértil.",
          type: "image/png",
        },
      ],
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}
