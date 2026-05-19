import type { Metadata } from "next";
import { Outfit, Syne, Space_Grotesk, Noto_Sans_Devanagari } from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne"
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space"
});

const noto = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto"
});

export const metadata: Metadata = {
  title: "CivicReport Mumbai | Community Action Platform",
  description: "Report civic issues like potholes, garbage, and broken streetlights to improve Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${syne.variable} ${space.variable} ${noto.variable} font-sans antialiased`}>
        <I18nProvider>
          <LanguageSwitcher />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
