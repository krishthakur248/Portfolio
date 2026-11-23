import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No Vite middleware needed — both DEV and PROD fetch live APIs directly from the browser.
// activity.json is a cold-start cache written by GitHub Actions; never written locally.

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
});
