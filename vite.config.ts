import { fileURLToPath } from 'node:url';

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

import { copyTesseractAssets } from './script/copy-tesseract-assets';

const nativeBuild = process.env.VITE_NATIVE === '1';

/** Resolve a repo-relative path for aliases (the config runs as ESM). */
const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

function tesseractAssets(): Plugin {
  return {
    name: 'copy-tesseract-assets',
    configResolved() {
      if (nativeBuild) return;
      copyTesseractAssets();
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), tesseractAssets()],
  base: command === 'build' ? (process.env.VITE_BASE ?? '/Badminton/') : '/',
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@phosphor-icons/react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@image-import': nativeBuild
        ? fromRoot('./src/platform/ImageImportDisabled.tsx')
        : fromRoot('./src/components/modals/ImageUploadModal.tsx'),
    },
  },
  server: {
    watch: {
      ignored: ['**/analysis/**'],
    },
  },
  appType: 'spa',
}));
