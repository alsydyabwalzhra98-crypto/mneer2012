import type { Metadata, Viewport } from "next";
import { Cairo, Amiri } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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

export const viewport: Viewport = {
  themeColor: "#1a5f4a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "مركز الشفاء | تحفيظ القرآن الكريم",
  description: "نظام إدارة مراكز تحفيظ القرآن الكريم - مركز الشفاء لتحفيظ القرآن الكريم",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مركز الشفاء",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "مركز الشفاء لتحفيظ القرآن الكريم",
    description: "نظام إدارة مراكز تحفيظ القرآن الكريم",
    type: "website",
    locale: "ar_SA",
  },
};

function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('SW registered:', registration.scope);
                })
                .catch(function(error) {
                  console.log('SW registration failed:', error);
                });
            });
          }
        `,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <ServiceWorkerRegistration />
      </head>
      <body
        className={`${cairo.variable} ${amiri.variable} antialiased font-[family-name:var(--font-cairo)]`}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
