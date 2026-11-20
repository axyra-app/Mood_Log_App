import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moodlog.app',
  appName: 'Mood Log',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
