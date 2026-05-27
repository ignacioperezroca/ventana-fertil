import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ventana-fertil.vercel.app"),
  title: "🥚 Ventana Fértil | Simulador visual de ventana fértil",
  description:
    "Simulador educativo para entender ventana fértil, ovulación, incertidumbre del ciclo y recordatorios día por día.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-app-background text-app-foreground">{children}</body>
    </html>
  );
}
