import type { Metadata } from "next";
import { Inter, Manrope, Marck_Script } from "next/font/google";
import { getSiteUrl, isIndexingEnabled } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
});

const script = Marck_Script({
  variable: "--font-script",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  robots: isIndexingEnabled() ? undefined : { index: false, follow: false },
  title: "ASSORTE — продумані деталі для кращих моментів",
  description:
    "Аксесуари, гаджети та стильні знахідки, які поєднують користь, естетику і турботу про щоденний комфорт.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${manrope.variable} ${script.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
