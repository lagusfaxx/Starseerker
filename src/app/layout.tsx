import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "STARSEEKER Chile — Distribuidor oficial",
    template: "%s | STARSEEKER Chile",
  },
  description:
    "Molinos eléctricos, máquinas de espresso portátiles y accesorios STARSEEKER. Distribuidor oficial en Chile: garantía local, despacho a todo el país y pago con Mercado Pago.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "STARSEEKER Chile",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
