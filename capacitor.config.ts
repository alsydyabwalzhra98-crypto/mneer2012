import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alshifa.quran.center',
  appName: 'مركز الشفاء',
  webDir: 'out',
  server: {
    // ✅ بعد نشر التطبيق على Vercel، ضع الرابط هنا
    // مثال: url: 'https://alshifa-center.vercel.app',
    // حالياً: التطبيق سيعمل كـ WebView للرابط المحدد
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d3d2e',
      showSpinner: true,
      spinnerColor: '#d4af37',
    },
  },
  android: {
    buildOptions: {
      signingType: 'apksigner',
    },
  },
};

export default config;
