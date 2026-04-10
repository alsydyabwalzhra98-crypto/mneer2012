import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alshifa.quran.center',
  appName: 'مركز الشفاء',
  webDir: 'out',
  server: {
    // For development, use local server
    // url: 'http://localhost:3000',
    // For production, use your deployed URL (Vercel, etc.)
    // url: 'https://your-app.vercel.app',
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