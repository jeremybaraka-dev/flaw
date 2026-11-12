import { defineConfig } from 'vite';
import { devApi } from './scripts/dev-api.mjs';

export default defineConfig({
  server: { port: 5173, strictPort: true },
  plugins: [devApi()],
  build: { target: 'es2020' },
});
