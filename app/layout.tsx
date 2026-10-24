import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MotionRoot from "@/components/MotionRoot";
import { BRAND, TAGLINE } from "@/lib/site";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: `${BRAND} is a shared sensor network that records every drone track across many sites, follows the trail back to the launch point, and cues the police drones already in service to follow it home.`,
  applicationName: BRAND,
  keywords: [TAGLINE, "drone detection", "drone attribution", "counter-UAS"],
  robots: { index: false, follow: false }, // stealth: keep search engines out until launch
};

export const viewport: Viewport = {
  themeColor: "#0a0e13",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <MotionRoot />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
