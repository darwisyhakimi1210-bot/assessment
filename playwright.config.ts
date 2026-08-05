import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env so Twilio credentials are available
// to the tests at runtime. The .env file is gitignored — never commit it.
dotenv.config();

/**
 * GSC Cinema Automation — Playwright Configuration
 *
 * Key settings explained:
 *  - headless: false   → browser window visibly opens (you can watch it)
 *  - slowMo: 200       → adds a 200ms pause between actions, easier to follow
 *  - reporter: 'html'  → beautiful HTML report generated after the run
 *  - trace: 'on-first-retry' → captures a trace if a test fails (great for debugging)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://www.gsc.com.my',
    headless: false,
    slowMo: 200,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
