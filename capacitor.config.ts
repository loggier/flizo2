
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flizo.copilot',
  appName: 'Flizo Copilot',
  webDir: 'out',
  server: {
    hostname: 'app.flizo.com',
    androidScheme: 'https',
  }, 
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  }, 
}; 

export default config;
