import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { SoSite } from "@/components/SoSite";

// Fonte serifada só para os títulos de destaque (descarregada e servida pelo próprio site).
const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "SaláriosAO — Quanto vale o seu trabalho em Angola",
    template: "%s · SaláriosAO",
  },
  description:
    "Salários reais de Angola por cargo, sector e província. Público e privado, partilhados de forma anónima.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" className={serif.variable}>
      <body className="min-h-dvh bg-bg text-ink">
        <SoSite><Header /></SoSite>
        <main className="pb-20 md:pb-0">{children}</main>
        <SoSite><Footer /></SoSite>
        <SoSite><BottomNav /></SoSite>
      </body>
    </html>
  );
}
