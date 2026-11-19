import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { LocaleSync } from "@/components/storefront/LocaleSync";
import "./globals.css";

const arabicFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const englishFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CommerceForge | معرض القوالب",
    template: "%s | CommerceForge",
  },
  description: "معرض قوالب CommerceForge ومعاينات المتاجر التجريبية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} ${englishFont.variable}`}>
      <body>
        <LocaleSync />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
