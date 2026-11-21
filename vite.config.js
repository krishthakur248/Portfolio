import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFile } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin: adds POST /api/refresh-activity in dev mode.
 * The browser refresh button calls this → it runs fetch-activity.mjs
 * → writes fresh activity.json → browser re-fetches it.
 */
function refreshActivityPlugin() {
  return {
    name: 'refresh-activity',
    configureServer(server) {
      server.middlewares.use('/api/refresh-activity', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const script = resolve(__dir, 'scripts', 'fetch-activity.mjs');
        console.log('\n[refresh-activity] Running fetch-activity.mjs...');

        execFile('node', [script], { cwd: __dir, timeout: 60000 }, (err, stdout, stderr) => {
          if (err) {
            console.error('[refresh-activity] Script failed:', stderr || err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: stderr || err.message }));
          } else {
            console.log('[refresh-activity] Done.\n' + stdout);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), refreshActivityPlugin()],
  publicDir: 'public',
});
