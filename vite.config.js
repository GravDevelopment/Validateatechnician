import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 59637,
        // Forward API calls to `func start` (api/) during local dev, e.g. via
        // `swa start --run "npm run dev"` or `func start` run alongside vite.
        proxy: {
            '/api': 'http://localhost:7071',
        },
    }
})