import type { Metadata } from "next";
import {
  Anton,
  Caveat,
  Inter,
  JetBrains_Mono,
  Noto_Naskh_Arabic,
} from "next/font/google";

import "./globals.css";

// Font brand — lihat DESIGN.md §4.1. Variabel dipakai di globals.css (@theme).
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const notoArabic = Noto_Naskh_Arabic({ variable: "--font-noto-arabic", subsets: ["arabic"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NGABINTON",
  description:
    "Komunitas badminton mingguan yang suka kumpul, main bareng, dan sesekali jalan-jalan. Ngobrol, ngaji, ngabinton.",
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
