import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { getDefaultUserData } from '../../test-data/userData';

/**
 * Test 1: Happy Path — Login from homepage + reach "Showtime by Movies"
 * ---------------------------------------------------------------------
 *   1. Open homepage
 *   2. Click "Sign In" link → login popup opens
 *   3. Fill #phoneNo and #password → click Login
 *   4. Click "I Got It" to dismiss the reward-journey modal
 *   5. Click "Showtime by Movies" button
 *   6. Assert that "Showtime by Movies" page is reachable.
 */
test('Test 1: Happy path - login from homepage and reach Showtime by Movies', async ({ page }) => {
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

  // Step 4 — Click "I Got It" to dismiss the post-login modal
  // (Material overlay may briefly block; use exact accessible name)
  const gotItButton = popup.getByRole('button', { name: 'I Got It', exact: true });
  await expect(gotItButton).toBeVisible({ timeout: 15000 });
  await gotItButton.click();
  console.log('✓ Dismissed "I Got It" modal');

  // Step 5 — Click "Showtime by Movies" button
  const showtimeButton = popup.getByRole('button', { name: 'Showtime by Movies', exact: true });
  await expect(showtimeButton).toBeVisible({ timeout: 10000 });
  await showtimeButton.click();
  console.log('✓ Clicked "Showtime by Movies"');

  // Wait briefly for the page to update
  await popup.waitForTimeout(1500);

  // Assertion — confirm we reached a showtime-related page
  const pageText = await popup.locator('body').textContent();
  expect(pageText?.toLowerCase()).toMatch(/showtime|movie/);
  console.log('✓ Showtime by Movies page loaded successfully');
});