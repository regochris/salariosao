import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

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
    <html lang="pt-AO">
      <body className="min-h-dvh bg-bg text-ink">
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
