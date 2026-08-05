import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * pages/LoginPage.ts
 *
 * Represents the GSC "Log In" popup. Login is reached via the "Sign In"
 * link on the HOMEPAGE (not the booking popup).
 *
 * The form has:
 *   - Mobile Number — id="phoneNo"  (country code +60 auto-prefixed)
 *   - Password       — id="password"
 *   - Login button   — accessible name "Login"
 *
 * The login popup is a SEPARATE window (page.waitForEvent('popup')), so
 * callers should pass the popup page when constructing LoginPage.
 */
export class LoginPage extends BasePage {
  // Exposed (not private) so tests can assert visibility directly.
  readonly mobileInput = this.page.locator('#phoneNo');
  readonly passwordInput = this.page.locator('#password');
  private readonly submitButton = this.page.getByRole('button', { name: /^login$/i });

  // Generic error message locator (SweetAlert modal + inline errors)
  private readonly errorMessage = this.page.locator(
    '.swal2-title, .swal2-html-container, .swal2-popup, [role="alert"], .mat-error, .error, text=/unsuccessful|incorrect|invalid|wrong|failed|not exist/i'
  ).first();

  /**
   * Asserts the login form is visible.
   */
  async assertLoaded(): Promise<void> {
    await expect(this.mobileInput).toBeVisible({ timeout: 15000 });
    console.log('✓ Login form loaded');
  }

  /**
   * Fills mobile + password then clicks Login.
   * @param mobile  digits-only (e.g. "196233031") — +60 is auto-prefixed
   * @param password password
   */
  async login(mobile: string, password: string): Promise<void> {
    await this.mobileInput.fill(mobile);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageReady();
  }

  /**
   * Returns whether an error message is visible (used by Test 2 — negative case).
   * Tries multiple known error indicators so we don't miss any.
   */
  async hasError(): Promise<boolean> {
    const candidates = [
      // Specific GSC error messages (the title and body text shown in the SweetAlert)
      this.page.getByText(/Login Unsuccessfully/i),
      this.page.getByText(/password is incorrect/i),
      this.page.getByText(/unsuccessful/i),
      // Generic error indicators
      this.errorMessage,
      this.page.locator('.swal2-popup'),
      this.page.locator('[role="alert"]'),
    ];
    for (const locator of candidates) {
      const visible = await locator.first().isVisible({ timeout: 1500 }).catch(() => false);
      if (visible) return true;
    }
    return false;
  }
}