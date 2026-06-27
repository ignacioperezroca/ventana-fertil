import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();

  return {
    name: "Ventana Fértil",
    short_name: "Ventana Fértil",
    description:
      "Simulador visual y educativo para entender la ventana fértil, la ovulación y la incertidumbre del ciclo, día por día.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6f2",
    theme_color: "#fbf6f2",
    lang: "es-AR",
    orientation: "portrait-primary",
    icons: [
      {
        src: `${base}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/maskable-icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
