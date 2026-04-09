import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "مركز الشفاء | لوحة التحكم",
  description: "نظام إدارة مراكز تحفيظ القرآن الكريم - مركز الشفاء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${amiri.variable} antialiased font-[family-name:var(--font-cairo)]`}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
