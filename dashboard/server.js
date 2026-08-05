/**
 * dashboard/server.js
 *
 * A tiny Express server that:
 *   1. Serves a React dashboard (single HTML + app.js in /public)
 *   2. Provides a /api/tests endpoint listing all 3 GSC test scenarios
 *   3. Provides /api/run/:id endpoints to trigger individual tests
 *   4. Streams status updates via Server-Sent Events (SSE) so the
 *      dashboard shows live progress.
 *
 * Run with:  node dashboard/server.js
 * Visit:     http://localhost:3001
 */
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// ── Static frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory state ────────────────────────────────────────────────────
const tests = [
  {
    id: 'happy-path',
    title: 'Test 1: Happy Path',
    description: 'Login from homepage → reach "Showtime by Movies"',
    spec: 'tests/gsc-booking/01-happy-path.spec.ts',
    status: 'idle', // idle | running | passed | failed
    lastRun: null,
    duration: null,
    output: [],
  },
  {
    id: 'wrong-password',
    title: 'Test 2: Negative Login',
    description: 'Login with WRONG password → verify "Login Unsuccessfully" alert',
    spec: 'tests/gsc-booking/02-empty-form-validation.spec.ts',
    status: 'idle',
    lastRun: null,
    duration: null,
    output: [],
  },
  {
    id: 'full-booking',
    title: 'Test 3: Full Booking Flow',
    description: 'Login → date → cinema → showtime → seat → validate booking details',
    spec: 'tests/gsc-booking/03-different-movie.spec.ts',
    status: 'idle',
    lastRun: null,
    duration: null,
    output: [],
  },
];

const sseClients = new Set();
function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) res.write(payload);
}

// ── API: list tests ────────────────────────────────────────────────────
app.get('/api/tests', (_req, res) => {
  res.json(tests.map(({ id, title, description, status, lastRun, duration }) => ({
    id, title, description, status, lastRun, duration,
  })));
});

// ── API: SSE stream ────────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// ── API: run a single test ────────────────────────────────────────────
app.post('/api/run/:id', (req, res) => {
  const test = tests.find((t) => t.id === req.params.id);
  if (!test) return res.status(404).json({ error: 'Unknown test id' });
  if (test.status === 'running') return res.status(409).json({ error: 'Already running' });

  test.status = 'running';
  test.output = [];
  test.lastRun = new Date().toISOString();
  const start = Date.now();
  broadcast('update', { id: test.id, status: test.status, lastRun: test.lastRun });
  res.json({ ok: true, id: test.id });

  // Spawn the test process
  // --timeout=180000 gives each test 3 minutes (default is 30s — too short for GSC)
  // --workers=1 ensures tests run sequentially
  // We intentionally do NOT pass --headed (the dashboard runs the test headless)
  const args = [
    'playwright', 'test', test.spec,
    '--reporter=list',
    '--workers=1',
    '--timeout=180000',
  ];
  const child = spawn('npx', args, {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    test.output.push(text);
    broadcast('output', { id: test.id, text });
  });
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    test.output.push(text);
    broadcast('output', { id: test.id, text });
  });

  child.on('close', (code) => {
    test.status = code === 0 ? 'passed' : 'failed';
    test.duration = Date.now() - start;
    broadcast('update', {
      id: test.id, status: test.status, duration: test.duration,
    });
  });
});

// ── API: run all tests ─────────────────────────────────────────────────
app.post('/api/run-all', (_req, res) => {
  res.json({ ok: true, message: 'Triggered all tests' });
  for (const test of tests) {
    if (test.status !== 'running') {
      // Reuse the per-test endpoint logic by calling fetch
      const url = `http://localhost:${PORT}/api/run/${test.id}`;
      fetch(url, { method: 'POST' }).catch(() => undefined);
    }
  }
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎬  GSC Test Dashboard running at http://localhost:${PORT}\n`);
});