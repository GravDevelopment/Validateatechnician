import fs from 'node:fs';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const validate = require('./api/validate/handler.js');

// Reuse the same secrets file `func start` would use, so there's one place
// to put CERT_VALIDATE_URL/KEY instead of two.
function loadLocalSettings() {
    try {
        const { Values } = JSON.parse(fs.readFileSync('api/local.settings.json', 'utf8'));
        return Values ?? {};
    } catch {
        return {};
    }
}

// Handles /api/validate directly during `npm run dev`, so local dev doesn't
// need a separate `func start` process. The api/ Azure Function is still
// what actually runs once this is deployed.
function localValidateApi() {
    return {
        name: 'local-validate-api',
        configureServer(server) {
            server.middlewares.use('/api/validate', async (req, res) => {
                const idNumber = new URL(req.url, 'http://localhost').searchParams.get('idNumber');
                if (!idNumber) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'idNumber is required' }));
                    return;
                }
                const { status, body } = await validate(idNumber);
                res.statusCode = status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(body));
            });
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(() => {
    Object.assign(process.env, loadLocalSettings());

    return {
        plugins: [plugin(), localValidateApi()],
        server: {
            port: 59637,
        },
    };
});
