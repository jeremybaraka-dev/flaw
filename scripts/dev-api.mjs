// Runs the serverless functions in /api during `npm run dev`, so M-Pesa can be tested locally.
// In production the same files deploy as-is on Vercel (or any host that supports /api functions).
import path from 'node:path';
import { existsSync } from 'node:fs';
import { loadEnv } from 'vite';

export function devApi() {
  return {
    name: 'fe-dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''));

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const name = url.pathname.slice(5).replace(/\/$/, '');
        const file = path.join(server.config.root, 'api', `${name}.js`);
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (obj) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
        if (!/^[\w/-]+$/.test(name) || name.split('/').some((s) => s.startsWith('_')) || !existsSync(file)) {
          return res.status(404).json({ error: 'Not found' });
        }
        try {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          req.body = raw ? JSON.parse(raw) : {};
          req.query = Object.fromEntries(url.searchParams);
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (err) {
          console.error('[api]', err);
          if (!res.writableEnded) res.status(500).json({ error: 'Server error' });
        }
      });
    },
  };
}
