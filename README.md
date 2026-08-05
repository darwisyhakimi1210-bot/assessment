# 🎬 GSC Cinema — Movie Ticket Booking Automation

End-to-end Playwright + TypeScript automation for the GSC Cinema (Malaysia) ticket booking journey — log in, pick a movie, choose date / cinema / showtime / seat, and validate the booking review page (without paying).

> **Author:** QA Team · **Stack:** Playwright 1.62 + TypeScript 5.x · **Pattern:** Page Object Model

---

## ✨ What's Inside

| Folder / File                          | Purpose                                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `pages/`                               | Page Object Model — Base / Home / Booking / BookingReview / Login      |
| `helpers/`                             | Reusable actions shared across pages (popup dismiss)                   |
| `test-data/userData.ts`                | Test fixture — real Malaysian mobile + email + password                |
| `tests/gsc-booking/*.spec.ts`          | 3 executed scenarios (login, negative login, full booking + review)    |
| `playwright.config.ts`                 | Playwright config — headed mode, HTML reporter, slowMo 200ms           |
| `tsconfig.json`                        | Strict TypeScript settings                                             |

---

## 🔧 Prerequisites

| Tool        | Version  | Why                              |
| ----------- | -------- | -------------------------------- |
| Node.js     | ≥ 18.x   | Runtime for Playwright + npm     |
| npm         | ≥ 9.x    | Package manager                  |
| Chromium    | latest   | Browser under test               |
| Git         | optional | Version control (recommended)    |

```powershell
node --version
npm --version
```

---

## 📦 Installation

```powershell
cd C:\Users\darwi\Desktop\QA
npm install
npx playwright install chromium
```

Verify TypeScript compiles cleanly:

```powershell
npx tsc --noEmit
```

---

## ▶️ Execution

### Run all 3 tests in headed mode (browser visibly opens)

```powershell
npx playwright test --headed
```

or use the npm script:

```powershell
npm run test:headed
```

### Run a single test

```powershell
npx playwright test tests/gsc-booking/01-happy-path.spec.ts --headed
npx playwright test tests/gsc-booking/02-empty-form-validation.spec.ts --headed
npx playwright test tests/gsc-booking/03-different-movie.spec.ts --headed
```

### Run by test name (substring match)

```powershell
npx playwright test --headed -g "Happy path"
```

---

## 📊 Reports

After each run, Playwright generates a beautiful HTML report.

```powershell
npx playwright show-report
```

The report (`playwright-report/`) contains:

- ✅ Pass / fail status per test
- 📸 Screenshots of failed steps
- 🎥 Video recordings (retained on failure)
- 🔍 Network traces (on retry)

---

## 🧪 The 3 Test Scenarios

| #   | File                                         | Flow                                                                                   |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | `01-happy-path.spec.ts`                      | Sign In → Login → "I Got It" modal → **Showtime by Movies** page                       |
| 2   | `02-empty-form-validation.spec.ts`           | Sign In → Login with WRONG password → verify **"Login Unsuccessfully"** SweetAlert      |
| 3   | `03-different-movie.spec.ts`                 | Sign In → Login → Showtime by Movies → date → cinema → showtime → seat → **validate booking review without paying** |

### Common pre-login steps (all 3 tests)

1. Open `https://www.gsc.com.my/`
2. Click **Sign In** link on homepage → login popup opens
3. Fill `#phoneNo` with `196233031` (mobile, +60 auto-prefixed)
4. Fill `#password` with the password from `test-data/userData.ts`
5. Click the **Login** button

### Test 3 post-login flow

After clicking "Showtime by Movies":
1. Click **"THU 06 Aug"** date pill
2. Click the **cinema icon** (specific Tailwind class)
3. Click showtime **":30AM 4DX"** inside the **Kuala Lumpur - LaLaport BBCC** group
4. Click **"Unveil the Experience"** to reveal the seat map
5. Click an **available seat** (smart fallback list — D07 may be occupied)
6. Click **"Confirm - 1 ticket(s)"**
7. Click **"GO"** to reach the booking review page
8. Validate: movie title, cinema, date, experience are all visible
9. **Stop BEFORE payment**

---

## 🗂️ Project Structure

```
QA/
├── pages/
│   ├── BasePage.ts              ← shared parent class
│   ├── HomePage.ts              ← landing page actions (Sign In link)
│   ├── BookingPage.ts           ← Showtime by Movies + date/cinema/showtime/seat
│   ├── BookingReviewPage.ts     ← checkout summary validation
│   └── LoginPage.ts             ← login form (mobile + password)
├── helpers/
│   └── PopupHelper.ts           ← dismiss popups/cookies
├── test-data/
│   └── userData.ts              ← real test user credentials
├── tests/
│   ├── example.spec.ts          ← Playwright sample (untouched)
│   └── gsc-booking/
│       ├── 01-happy-path.spec.ts
│       ├── 02-empty-form-validation.spec.ts
│       └── 03-different-movie.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🧠 Design Principles

1. **Page Object Model** — selectors live with the page they describe.
2. **Auto-waiting** — Playwright retries clicks/assertions until ready; never sleeps arbitrarily.
3. **Helpers** — cross-cutting concerns (popups) live in `helpers/`.
4. **Real test data** — login uses a real account to avoid creating new ones on every run.
5. **No payment** — the booking review is validated, but the test stops before paying.

---

## ❓ Troubleshooting

| Symptom                                  | Fix                                                          |
| ---------------------------------------- | ------------------------------------------------------------ |
| `Browser not found`                      | Run `npx playwright install chromium`                        |
| `tsc` not found                          | Run `npm install` to install TypeScript                      |
| HTML report not opening                  | Run `npx playwright show-report` manually                    |
| Seat D07 occupied                        | Test 3 has a smart seat-fallback list — it picks any open seat |
| Login popup doesn't appear               | GSC may show a cookie banner first — the test dismisses it   |
| "Login Unsuccessfully" alert missing     | GSC's modal is a SweetAlert — Test 2 looks for that exact text |

---

## ⚠️ Disclaimer

This automation targets the **production** GSC website (`https://www.gsc.com.my`).
The credentials in `test-data/userData.ts` are **real test credentials** for a personal
account — please replace them with your own before sharing this repository publicly.
The test validates the booking review but does **not** proceed to payment.