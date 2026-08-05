# 🎬 GSC Test Dashboard

A simple React dashboard that lists the 3 GSC Cinema booking test scenarios
and lets you trigger them individually.

## How to run

```powershell
# from the QA/ project root
node dashboard/server.js
```

Then open: **http://localhost:3001**

## What it does

- Lists the 3 test scenarios
- Each card has a **"▶ Run"** button — click to trigger that single test
- A **"▶ Run All Tests"** button runs all three sequentially
- Live status updates via SSE (Server-Sent Events) — no refresh needed
- Stdout/stderr from Playwright streams into a terminal-like output box
- Color-coded status: **idle / running / passed / failed**

## Files

| File                       | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `server.js`                | Express backend that spawns `npx playwright test`|
| `public/index.html`        | HTML shell (React via CDN, no build step)        |
| `public/app.js`            | React app — uses Babel-standalone via CDN        |

## Architecture

```
Browser (React app)
   │
   ├── GET /api/tests         → list all tests
   ├── GET /api/events        → SSE stream of status/output updates
   ├── POST /api/run/:id      → spawn Playwright for one test
   └── POST /api/run-all      → spawn Playwright for all tests

Backend (server.js)
   │
   └── spawn('npx playwright test <spec>')
```