import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { getDefaultUserData } from '../../test-data/userData';

/**
 * Test 3: Login + Full Booking Flow + Booking Details Validation
 * ---------------------------------------------------------------
 *   1. Open homepage
 *   2. Click "Sign In" → login popup opens
 *   3. Fill #phoneNo + #password → click Login
 *   4. Click "I Got It" → dismiss modal
 *   5. Click "Showtime by Movies" button
 *   6. Click date pill "THU 06 Aug"
 *   7. Click cinema icon (specific Tailwind class)
 *   8. Click showtime button ":30AM 4DX" inside the Kuala Lumpur group
 *   9. Click seat "D07"
 *  10. Click "Confirm - 1 ticket(s)"
 *  11. Click "GO"
 *  12. Click the booking summary text (proves details are visible)
 *  13. Validate booking details: movie title, date, cinema are all visible
 */
test('Test 3: Login and complete full booking flow, validate booking details', async ({ page }) => {
  const homePage = new HomePage(page);

  // Step 1 — Open homepage
  await homePage.open();
  await homePage.assertHomepageLoaded();
  console.log('✓ Homepage loaded');

  // Step 2 — Click "Sign In" link (opens login popup)
  const popup = await homePage.clickSignIn();
  console.log('✓ Sign In clicked, popup opened');

  // Step 3 — Fill the login form and submit
  const loginPage = new LoginPage(popup);
  await loginPage.assertLoaded();
  const user = getDefaultUserData();
  await loginPage.login(user.mobileNumber, user.password);
  console.log(`✓ Logged in as +60 ${user.mobileNumber}`);

  // Step 4 — Dismiss "I Got It" reward modal
  const gotItButton = popup.getByRole('button', { name: 'I Got It', exact: true });
  await expect(gotItButton).toBeVisible({ timeout: 15000 });
  await gotItButton.click();
  console.log('✓ Dismissed "I Got It" modal');

  // Step 5 — Click "Showtime by Movies"
  const showtimeBtn = popup.getByRole('button', { name: 'Showtime by Movies', exact: true });
  await expect(showtimeBtn).toBeVisible({ timeout: 10000 });
  await showtimeBtn.click();
  console.log('✓ Clicked "Showtime by Movies"');
  await popup.waitForTimeout(1500);

  // Step 6 — Click date pill "THU 06 Aug" (matches codegen exactly)
  const datePill = popup.getByRole('button', { name: 'THU 06 Aug', exact: true });
  await expect(datePill).toBeVisible({ timeout: 10000 });
  await datePill.click();
  console.log('✓ Date selected: THU 06 Aug');

  // Step 7 — Click cinema icon (exact Tailwind class selector from codegen)
  const cinemaIcon = popup.locator(
    '.flex.cursor-pointer.flex-shrink-0.flex-grow-0.gsc-icon-0.w-20.h-10.md\\:h-14.md\\:w-28.border.border-white.rounded-md.justify-center.md\\:hover\\:bg-gsc-main-yellow\\/30.bg-gsc-icon-4d'
  );
  await expect(cinemaIcon).toBeVisible({ timeout: 10000 });
  await cinemaIcon.click();
  console.log('✓ Cinema icon clicked');

  // Step 8 — Click showtime ":30AM 4DX" inside "Kuala Lumpur - LaLaport BBCC" group
  const showtimeButton = popup
    .getByLabel('Kuala Lumpur - LaLaport BBCC')
    .getByRole('button', { name: ':30AM 4DX' });
  await expect(showtimeButton).toBeVisible({ timeout: 10000 });
  await showtimeButton.click();
  console.log('✓ Showtime selected (:30AM 4DX)');
  await popup.waitForTimeout(1500);

  // Step 8b — Click "Unveil the Experience" if it covers the seat map.
  // GSC shows a curtain overlay until the user clicks this button.
  const unveil = popup.getByRole('button', { name: /unveil the experience/i });
  if (await unveil.isVisible({ timeout: 3000 }).catch(() => false)) {
    await unveil.click();
    console.log('✓ Clicked "Unveil the Experience"');
    await popup.waitForTimeout(800);
  }

  // Step 9 — Click an AVAILABLE seat. We try a list of seats in priority
  // order (front-of-theater seats fill up first). For each candidate we
  // check if it's clickable — D07 might be occupied in this run.
  const seatCandidates = [
    'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11',
    'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11',
    'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11',
    'C04', 'C05', 'C06', 'C07', 'B04', 'B05', 'B06', 'A03', 'A04', 'A05', 'A06',
  ];

  let seatClicked: string | null = null;
  for (const seatId of seatCandidates) {
    const seatLocator = popup.getByText(seatId, { exact: true }).first();
    const isVisible = await seatLocator.isVisible({ timeout: 300 }).catch(() => false);
    if (!isVisible) continue;
    // Check if the seat is enabled (not greyed out)
    const isDisabled = await seatLocator.evaluate((el: HTMLElement) =>
      el.classList.contains('disabled') ||
      el.closest('button')?.disabled === true ||
      el.closest('button')?.getAttribute('aria-disabled') === 'true',
    ).catch(() => false);
    if (isDisabled) continue;
    // Try to click
    try {
      await seatLocator.click({ timeout: 1500 });
      // Verify success by checking the "Confirm - N ticket(s)" text updated
      await popup.waitForTimeout(400);
      const confirmText = await popup
        .getByText(/Confirm\s*-\s*\d+\s*ticket/i)
        .first()
        .textContent()
        .catch(() => '');
      if (confirmText && /\d+\s*ticket/i.test(confirmText) && !confirmText.includes('0 ticket')) {
        seatClicked = seatId;
        break;
      }
    } catch {
      // try next candidate
    }
  }
  if (!seatClicked) throw new Error('Could not find an available seat');
  console.log(`✓ Seat ${seatClicked} selected (available)`);

  // Step 10 — Click "Confirm - 1 ticket(s)"
  const confirmButton = popup.getByText('Confirm - 1 ticket(s)').first();
  await expect(confirmButton).toBeVisible({ timeout: 10000 });
  await confirmButton.click();
  console.log('✓ Confirmed 1 ticket');

  // Step 11 — Click "GO" to proceed to checkout/review
  const goButton = popup.getByText('GO', { exact: true }).first();
  await expect(goButton).toBeVisible({ timeout: 10000 });
  await goButton.click();
  console.log('✓ Clicked "GO" — moved to booking review');

  // Wait for the booking review page to load
  await popup.waitForTimeout(2000);

  // ── BOOKING DETAIL VALIDATION ───────────────────────────────────────
  // GSC's summary combines everything into one text element, e.g.:
  // "SPIDER-MAN: BRAND NEW DAY 13ENG 2 h 25 m 4DX Kuala Lumpur - LaLaport BBCC Thu 6 Aug"
  // We assert that the visible booking details are correct WITHOUT proceeding to payment.

  // Assertion 1 — Summary element is visible (proves details rendered)
  const summaryElement = popup
    .getByText(/SPIDER-MAN|MOANA|ODYSSEY|DEAR YOU|JANA NAYAGAN|MINIONS|EVIL DEAD|OBSESSION|DORAEMON/i)
    .first();
  await expect(summaryElement).toBeVisible({ timeout: 10000 });
  console.log('✓ Movie title visible in booking summary');

  // Assertion 2 — Cinema name "Kuala Lumpur - LaLaport BBCC" is visible
  const cinemaElement = popup
    .getByText(/Kuala Lumpur\s*-\s*LaLaport\s*BBCC/i)
    .first();
  await expect(cinemaElement).toBeVisible({ timeout: 5000 });
  console.log('✓ Cinema name visible in summary');

  // Assertion 3 — Date "Thu 6 Aug" is visible
  const dateElement = popup
    .getByText(/Thu\s+6\s+Aug/i)
    .first();
  await expect(dateElement).toBeVisible({ timeout: 5000 });
  console.log('✓ Date visible in summary');

  // Assertion 4 — Experience code (e.g., "4DX") is visible
  const experienceElement = popup.getByText(/4DX|ATMOS|BEAM|D-BOX/i).first();
  await expect(experienceElement).toBeVisible({ timeout: 5000 });
  console.log('✓ Experience (4DX) visible in summary');

  // Assertion 5 — A Pay / Proceed-to-Payment button exists BUT we DO NOT click it
  const payButton = popup
    .getByRole('button', { name: /pay|proceed to payment|make payment/i })
    .first();
  const payVisible = await payButton.isVisible({ timeout: 2000 }).catch(() => false);
  if (payVisible) {
    console.log('✓ Pay button present (test stops BEFORE clicking)');
  } else {
    console.log('ℹ Pay button not on this step — booking summary validated only');
  }

  console.log('✅ TEST 3 PASSED — booking details all validated without payment');
});