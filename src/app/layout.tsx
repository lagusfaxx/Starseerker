import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

/** Condensada para titulares, como en la referencia. */
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

/** Inter para el texto corrido. */
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "STARSEEKER Chile — Distribuidor oficial",
    template: "%s | STARSEEKER Chile",
  },
  description:
    "Molinos eléctricos, máquinas de espresso portátiles y accesorios STARSEEKER. Distribuidor oficial en Chile, con despacho a todo el país y pago con Mercado Pago.",
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
    <html lang="es-CL" className={`${oswald.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
