import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-stack" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://starseerker.cl"),
  title: {
    default: "STARSEEKER Chile — Distribuidor oficial",
    template: "%s | STARSEEKER Chile",
  },
  description:
    "Molinos y máquinas de espresso portátiles STARSEEKER. Distribuidor oficial en Chile: garantía local, despacho a todo el país y pago con Mercado Pago.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "STARSEEKER Chile",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
