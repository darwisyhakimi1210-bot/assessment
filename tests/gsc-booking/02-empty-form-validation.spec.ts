import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Test 2: Negative — Login with WRONG password from homepage
 * ----------------------------------------------------------
 *   1. Open homepage
 *   2. Click "Sign In" → login popup opens
 *   3. Enter VALID mobile + WRONG password → click Login
 *   4. Assert: error message is shown, URL didn't change,
 *      and login form is still visible (no navigation happened)
 */
test('Test 2: Negative - login with wrong password shows error', async ({ page }) => {
  const homePage = new HomePage(page);

  // Step 1 — Open homepage
  await homePage.open();
  await homePage.assertHomepageLoaded();

  // Step 2 — Click "Sign In" link (opens login popup)
  const popup = await homePage.clickSignIn();
  console.log('✓ Login popup opened');

  const loginPage = new LoginPage(popup);
  await loginPage.assertLoaded();

  // Step 3 — Try login with VALID mobile + WRONG password
  const VALID_MOBILE = '196233031';
  const WRONG_PASSWORD = 'DefinitelyNotTheRightPassword999!';

  const urlBefore = popup.url();
  await loginPage.login(VALID_MOBILE, WRONG_PASSWORD);
  await popup.waitForTimeout(3000); // Wait for SweetAlert to appear

  // Assertion 1: URL didn't change (login blocked)
  expect(popup.url()).toBe(urlBefore);
  console.log('✓ Login blocked (URL unchanged after wrong password)');

  // Assertion 2: The "Login Unsuccessfully" SweetAlert is visible
  const errorAlert = popup.getByText(/Login Unsuccessfully|password is incorrect/i).first();
  await expect(errorAlert).toBeVisible({ timeout: 5000 });
  console.log('✓ Error popup "Login Unsuccessfully" is visible');

  // Assertion 3: Login form is still on screen (we didn't navigate away)
  await expect(loginPage.mobileInput).toBeVisible();
  console.log('✓ Login form still visible (login was rejected)');
});