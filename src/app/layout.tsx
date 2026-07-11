import type { Metadata } from "next";
import { Inter, Allura } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/components/GlobalHeader";
import { GlobalFooter } from "@/components/GlobalFooter";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const allura = Allura({ variable: "--font-allura", subsets: ["latin"], weight: "400", display: "swap" });

const SITE_URL = "https://almidutch.almiworld.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AlmiDutch — NT2 Staatsexamen & Inburgering practice with honest AI feedback",
    template: "%s · AlmiDutch",
  },
  description:
    "Practise Dutch for the NT2 Staatsexamen (Programma I B1 · Programma II B2) and the Inburgering exam (language, KNM, ONA) with honest per-skill readiness estimates and AI feedback. $12/month with a 7-day free trial. Original material, never copied from official exam papers. Part of the AlmiWorld family.",
  applicationName: "AlmiDutch",
  authors: [{ name: "AlmiWorld" }],
  keywords: ["NT2", "Staatsexamen NT2", "Inburgering", "inburgeringsexamen", "Dutch exam practice", "Programma I", "Programma II", "KNM", "ONA", "leren Nederlands", "Dutch proficiency", "learn Dutch", "AlmiDutch", "AlmiWorld"],
  openGraph: {
    title: "AlmiDutch — honest NT2 & Inburgering practice",
    description: "Original Dutch practice for the NT2 Staatsexamen and the Inburgering exam — honest per-skill readiness estimates and AI feedback.",
    url: SITE_URL,
    siteName: "AlmiDutch",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "AlmiDutch — NT2 & Inburgering Dutch practice", description: "Honest Dutch practice — per-skill readiness estimates, ranges not inflated numbers." },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${allura.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <GlobalHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <GlobalFooter />
      </body>
    </html>
  );
}
