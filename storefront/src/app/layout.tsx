import type { Metadata } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { LocaleSync } from "@/components/storefront/LocaleSync";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AiAssistantWidget } from "@/components/ai/AiAssistantWidget";
import { Preloader } from "@/components/brand/Preloader";
import { WelcomeModal } from "@/components/brand/WelcomeModal";
import { HybridWorkflowModal } from "@/components/landing/HybridWorkflowModal";
import { PlatformTelemetry } from "@/components/platform/PlatformTelemetry";
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
  icons: {
    icon: "/assets/platform-icon.svg",
    apple: "/assets/platform-icon.svg",
  },
  openGraph: {
    title: "CommerceForge | من الفكرة إلى متجرك",
    description: "أطلق 70% من متجرك فوراً، ثم أكمل اللمسات النهائية مع المطور خلال 24–48 ساعة.",
    siteName: "CommerceForge",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CommerceForge | من الفكرة إلى متجرك",
    description: "70% إطلاق فوري + 30% مراجعة وتظبيط نهائي من المطور.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} ${englishFont.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <LocaleSync />
        <ThemeProvider>
          <CartProvider>
            <Preloader />
            <WelcomeModal />
            <HybridWorkflowModal />
            <PlatformTelemetry />
            {children}
            <AiAssistantWidget />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
