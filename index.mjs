import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Self-hosted free proxy backend (no API key needed).
// Primary route /bare/ + stealth alias /api/ so filters
// looking for "/bare/" don't trivially block it.
const bare = createBareServer('/bare/');
const bareStealth = createBareServer('/api/');

function routeBare(req, res) {
  if (bare.shouldRoute(req) || bareStealth.shouldRoute(req)) return true;
  return false;
}

function handleBare(req, res) {
  if (bare.shouldRoute(req)) { bare.routeRequest(req, res); return true; }
  if (bareStealth.shouldRoute(req)) { bareStealth.routeRequest(req, res); return true; }
  return false;
}

// Ultraviolet client files served straight from the npm package,
// so the proxy always matches the backend version.
app.use('/uv/', express.static(uvPath));
app.use('/service/', express.static(uvPath));

// Frontend
app.use(express.static(path.join(__dirname, 'Site')));

// Health endpoint used by the frontend status pill
app.get('/health', (req, res) => {
  res.json({ ok: true, bare: ['/bare/', '/api/'], time: Date.now() });
});

const server = http.createServer();

server.on('request', (req, res) => {
  if (handleBare(req, res)) return;
  app(req, res);
});

server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) { bare.routeUpgrade(req, socket, head); return; }
  if (bareStealth.shouldRoute(req)) { bareStealth.routeUpgrade(req, socket, head); return; }
  socket.end();
});

server.on('listening', () => {
  console.log(`\n  Zaluea running on http://localhost:${PORT}`);
  console.log(`  Bare (free proxy backend): /bare/ + /api/ alias`);
  console.log(`  UV client: /uv/\n`);
});

server.listen(PORT);