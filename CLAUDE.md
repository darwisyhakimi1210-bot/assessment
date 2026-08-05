# CLAUDE.md — AI Workflow Instructions

> **Audience:** An AI coding assistant (Claude Code or similar) that is helping to
> extend or debug this GSC Cinema automation project.
> **Read this file first** before suggesting any changes to source code.

---

## 🎯 Project Goal

End-to-end Playwright + TypeScript automation for the **production** GSC Cinema
website, exercising the ticket-booking journey for an **already-registered user**:

1. Click "Sign In" on homepage → login popup opens
2. Log in with mobile number + password
3. Dismiss the post-login reward modal
4. Navigate to "Showtime by Movies"
5. Pick date → cinema → showtime → seat
6. Validate the booking review page (without paying)

The automation runs in **headed mode** by default with `slowMo: 200` so the
browser is clearly visible while the test runs — this is an interview-prep /
learning context.

---

## 🗂️ Folder Map

| Path                                | What you will find                                          |
| ----------------------------------- | ----------------------------------------------------------- |
| `pages/`                            | Page Object classes — Base/Home/Booking/BookingReview/Login |
| `helpers/`                          | Cross-cutting actions — popup dismiss                       |
| `test-data/userData.ts`             | Test fixture (real Malaysian mobile + email + password)     |
| `tests/gsc-booking/01-happy-path.spec.ts`  | Login from homepage → reach "Showtime by Movies"  |
| `tests/gsc-booking/02-empty-form-validation.spec.ts` | Login with WRONG password (negative test) |
| `tests/gsc-booking/03-different-movie.spec.ts` | Login + full booking flow + validate booking details |
| `tests/example.spec.ts`             | Default Playwright sample — leave untouched                  |
| `playwright.config.ts`              | Single Chromium project, headed, HTML reporter              |
| `tsconfig.json`                     | Strict TypeScript — must compile with `tsc --noEmit` cleanly |

---

## 📐 Conventions to Follow

### 1. Page Object Model is mandatory

- Every page must have a class extending `BasePage`.
- Locators are declared as `private readonly` at the top of the class.
- Methods perform actions, never raw locator chains in tests.
- Use **named accessor methods** (`selectMovieByIndex(0)`) instead of inline selectors.

### 2. Use Playwright auto-waiting, NOT arbitrary sleeps

- ❌ `await page.waitForTimeout(3000)`
- ✅ `await expect(locator).toBeVisible()` (auto-retries)
- ✅ `await locator.click()` (auto-waits for actionable)

### 3. Prefer user-facing locators, in this priority order

1. `page.getByRole(...)` (button, link, heading, etc.)
2. `page.getByLabel(...)`
3. `page.getByText(...)` with exact match
4. `page.getByTestId(...)`
5. CSS / XPath only as a last resort.

### 4. Helpers live in `helpers/`

Anything reused across ≥ 2 pages goes in a helper class.

### 5. Test data lives in `test-data/`

Never hardcode email/phone in tests — use `getDefaultUserData()`.

### 6. Popups are first-class

GSC opens EVERYTHING in a popup. The pattern is:
```ts
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Sign In' }).click(),
]);
```
Pass `popup` to the Page Object constructor.

---

## ✅ Adding a New Test (recipe)

1. Create the test file under `tests/gsc-booking/`.
2. Import the relevant Page Object(s) and helpers.
3. Name the test descriptively: `'Test N: <Scenario> — <assertion>'`.
4. Use Playwright assertions (`expect(page).toHaveURL(...)`) — not raw comparisons.
5. After writing, run `npx tsc --noEmit` → must have **zero errors**.
6. Run the test in headed mode once to visually verify before committing.

---

## ❌ What NOT to do

- **Do not** hardcode passwords / real personal data in source code — keep them in `.env` only.
- **Do not** silently increase timeouts to mask flaky tests — fix the root cause.
- **Do not** introduce random sleeps — rely on Playwright auto-waiting.
- **Do not** move selectors into tests — always push them up into Page Objects.
- **Do not** commit `playwright-report/`, `test-results/`, or `node_modules/`.

---

## 🧱 Common Edits

### Add a new page object

```ts
// pages/CheckoutPage.ts
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  // private readonly myLocator = ...
  // async clickPay() { ... }
}
```

### Add a new test scenario

```ts
// tests/gsc-booking/04-new-scenario.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
// ... etc.
```

---

## 🛠️ Verification Checklist

```powershell
npx tsc --noEmit                                 # zero TS errors
npx playwright test --headed --list              # all 3 tests detected
npx playwright test tests/gsc-booking/ --headed   # run all 3
npx playwright show-report                        # open HTML report
```

---

## 📝 Notes for AI assistants

- The author is a **newbie** learning QA automation. Explain decisions.
- **Real test data** (mobile 196233031 + password) is in `test-data/userData.ts`.
- **Sign-up creates a real account on gsc.com.my** — the project now uses LOGIN
  to avoid creating duplicate accounts on every run.
- The site may change anytime; selectors must be resilient (fallback strategies).
- The booking review page IS validated, but the test **never proceeds to payment**.