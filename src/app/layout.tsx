import type { Metadata } from "next";
import {
  Anton,
  Caveat,
  Inter,
  JetBrains_Mono,
  Noto_Naskh_Arabic,
} from "next/font/google";

import "./globals.css";
import { APP_URL } from "@/lib/constants";

// Font brand — lihat DESIGN.md §4.1. Variabel dipakai di globals.css (@theme).
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const notoArabic = Noto_Naskh_Arabic({ variable: "--font-noto-arabic", subsets: ["arabic"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

/** Deskripsi brand — dipakai untuk `<meta name="description">` & OG. */
const SITE_DESCRIPTION =
  "Komunitas badminton mingguan yang suka kumpul, main bareng, dan sesekali jalan-jalan. Ngobrol, ngaji, ngabinton.";

export const metadata: Metadata = {
  // Basis URL absolut untuk resolve OG/Twitter image (RULES.md §6.3).
  metadataBase: new URL(APP_URL ?? "http://localhost:3000"),
  title: "NGABINTON",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "NGABINTON",
    description: SITE_DESCRIPTION,
    siteName: "NGABINTON",
    locale: "id_ID",
    type: "website",
    // OG default (`ASSETS.md` §1) — halaman event menimpanya dengan `cover_image_url`.
    images: [
      { url: "/og/default.jpg", width: 1200, height: 630, alt: "Komunitas badminton NGABINTON" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${anton.variable} ${inter.variable} ${caveat.variable} ${notoArabic.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
