import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

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
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
