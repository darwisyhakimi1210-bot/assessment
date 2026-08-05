import { Page } from '@playwright/test';

/**
 * helpers/PopupHelper.ts
 *
 * Common patterns for closing popups, cookie banners, modals, or
 * advisories that frequently appear on e-commerce sites.
 *
 * Why helpers? Because "click Proceed if present" might be needed on
 * the HomePage, MovieDetailPage, and SignUpPage. We write it ONCE.
 */
export class PopupHelper {
  constructor(private readonly page: Page) {}

  /**
   * Dismisses any "Proceed" or "Continue" advisory popup if present.
   * Safe to call — does nothing if no popup exists.
   */
  async proceedIfPresent(): Promise<boolean> {
    const proceed = this.page.getByRole('button', { name: /proceed/i });
    const visible = await proceed.isVisible({ timeout: 1000 }).catch(() => false);
    if (visible) {
      await proceed.click();
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      return true;
    }
    return false;
  }

  /**
   * Closes a cookie consent banner if present.
   */
  async dismissCookieBanner(): Promise<boolean> {
    const accept = this.page.getByRole('button', { name: /accept all|i agree|allow all|got it/i });
    const visible = await accept.isVisible({ timeout: 1000 }).catch(() => false);
    if (visible) {
      await accept.click();
      return true;
    }
    return false;
  }
}
