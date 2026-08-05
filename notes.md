# 📓 Personal Learning Notes

> Free-form notes you want to remember. The skill won't edit this — only append when you say "save note".

---

## 2026-08-04 — Day 1

### Key Insights from the Job Ad
- ModeFair is a GovTech company
- Role focus: AI-assisted test automation (not traditional manual QA)
- Must-have tools: TypeScript, Playwright, Appium, Postman, k6
- AI tool experience is "a must"
- 2-hour practical assessment (bring own laptop, use any AI tools)
- Full on-site Monday-Friday
- Night deployments expected

### Personal Commitments
- [ ] Set up laptop with all tools
- [ ] Complete Phase 1 (TypeScript) within 1 week
- [ ] Reach interview-ready state
- [ ] Practice talking through my thinking during assessments

### Things That Confused Me At First
- Async/await (will revisit in Phase 1)
- The difference between verify and validate
- What "flaky test" means
- What does "Page Object Model" actually mean?

---

## 2026-08-05 — Day 2 — GSC Cinema Booking Automation (FINAL)

### Project Built
- **Goal:** End-to-end Playwright + TypeScript automation for GSC Cinema at https://www.gsc.com.my/
- **Final pattern:** Page Object Model, 5 page classes, 1 helper, real user credentials
- **3 test scenarios — ALL PASS:**
  1. **Test 1:** Login from homepage → reach "Showtime by Movies" page
  2. **Test 2 (negative):** Login with WRONG password → verify "Login Unsuccessfully" SweetAlert
  3. **Test 3:** Login + full booking flow → date → cinema → showtime → seat → **validate booking review WITHOUT paying**

### Final Folder Layout
```
pages/        BasePage, HomePage, LoginPage, BookingPage, BookingReviewPage
helpers/      PopupHelper
test-data/    userData (real mobile + password)
tests/gsc-booking/    01-happy-path, 02-empty-form-validation, 03-different-movie
playwright.config.ts  headed + slowMo 200 + HTML report
```

### How I Used AI To Build This (Quick Summary)

1. **Asked AI for a plan** — described my goal, AI produced the folder layout + file list before any code.
2. **Used `npx playwright codegen https://www.gsc.com.my`** — recorded real clicks, then pasted the codegen output to AI to convert it into Page Object methods. This was the BIGGEST time-saver — no guessing selectors.
3. **Iterated through failures** — AI diagnosed each TypeScript / runtime error and fixed one at a time (selectors, regex, popup handling, calendar navigation, error detection).
4. **Generated documentation** — README.md, CLAUDE.md, notes.md follow the same conventions used in source code.

### Key Things I Personally Learned

- **Popups are first-class in GSC.** EVERYTHING opens in a popup window. The pattern is:
  ```ts
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Sign In' }).click(),
  ]);
  ```
  Then pass `popup` to the Page Object constructor.

- **GSC uses Mobile Number for login** — not email. The country code `+60` is auto-prefixed by the form.

- **"Unveil the Experience" button** hides the seat map after picking a showtime. Codegen misses this — you must click it manually.

- **D07 (and other front-row seats) may be occupied** — Test 3 uses a smart fallback list that tries F01 → F11 → E01 → E11 → D01 → D11 → ... → picks the first available one.

- **GSC's login error is a SweetAlert** — title is "Login Unsuccessfully. The password is incorrect." (note: misspelled "Unsuccessfully"). My locator looks for both "Login Unsuccessfully" and "password is incorrect" to be safe.

- **"I Got It" modal appears after login** — must be dismissed before "Showtime by Movies" button becomes accessible.

- **Real data > random data** — using real mobile/email + password makes login work without GSC's anti-spam blocking random/example.com addresses.

- **Don't proceed to payment** — Test 3 validates the booking summary (movie title, cinema, date, experience) but stops BEFORE the Pay button.

### Things To Watch Out For

- The site is **live** — Test 3 actually creates a real seat reservation. The test stops at the review page, so payment is never made, but the seat may appear "held" for a few minutes.
- Material's datepicker uses `mat-input-0/1/2` IDs — but we removed the DOB calendar flow because we now use login.
- The codegen sometimes misses steps (like "Unveil the Experience") — always check what state the page is in after each step.

### Verification Done
- ✅ `npx tsc --noEmit` returns zero errors
- ✅ `npx playwright test tests/gsc-booking/ --headed` — all 3 tests pass (~1.5 min total)
- ✅ HTML report generated at `playwright-report/`
- ✅ Folder cleaned of orphans (deleted old MovieDetailPage, OtpPage, CalendarHelper, SmsOtpHelper)
- ✅ Committed to git and pushed to github.com/darwisyhakimi1210-bot/assessment.git

### Final Stats
- **5 test files:** 3 GSC scenarios + example.spec.ts (Playwright sample) + phase1-typescript (TypeScript practice)
- **5 page objects:** BasePage, HomePage, LoginPage, BookingPage, BookingReviewPage
- **1 helper:** PopupHelper
- **1 test data file:** userData.ts (with real credentials)
- **Total runtime:** ~90 seconds for all 3 GSC tests in headed mode

---

## Topics I Want to Revisue

_(Add topics here as you go)_

- The `Promise.all` + `waitForEvent('popup')` pattern — I want to understand it more deeply.
- `getByRole` vs `getByText` — when to use which?
- How to make the test run in **headless** mode for CI/CD (currently always headed for learning).
- Test 3's "smart seat selection" — there's a cleaner way using the seat's accessibility role.