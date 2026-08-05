import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * pages/HomePage.ts
 *
 * Represents the GSC Cinema landing page (https://www.gsc.com.my/).
 *
 * IMPORTANT: This site opens the booking flow in a NEW POPUP WINDOW when
 * you click a "Book" button. So HomePage exposes a method that returns
 * the popup Page object after the click.
 */
export class HomePage extends BasePage {
  // ── Locators (based on the codegen output) ─────────────────────────────
  private readonly bookButton = this.page.locator('.link.ms-3 > .btn').first();

  /**
   * Opens the GSC homepage and waits for the page to be ready.
   */
  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.bookButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.waitForPageReady();
  }

  /**
   * Asserts the homepage is loaded (URL contains gsc.com.my and at least
   * one book button is visible).
   */
  async assertHomepageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/gsc\.com\.my/);
    await expect(this.bookButton).toBeVisible({ timeout: 15000 });
  }

  /**
   * Clicks the first "Book" button and waits for the booking popup to open.
   * Returns the Page object of the popup so the caller can interact with it.
   *
   * Playwright pattern for popups:
   *   - Register the listener BEFORE the action that opens the popup.
   *   - Then click. The two promises race so we don't miss the event.
   */
  async openBookingPopup(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup', { timeout: 30000 }),
      this.bookButton.click(),
    ]);
    // Wait for the popup to load its content
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  /**
   * Some flow paths may have additional popups — exposed for symmetry.
   */
  async waitForPopup(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.bookButton.click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  /**
   * Returns the locator for the Nth "Book" button (0-indexed) so tests
   * can pick different movies.
   */
  bookButtonAt(index: number): Locator {
    return this.page.locator('.link.ms-3 > .btn').nth(index);
  }

  /**
   * Clicks the "Sign In" link on the homepage — this opens the login popup.
   * Returns the popup page.
   */
  async clickSignIn(): Promise<Page> {
    const signIn = this.page.getByRole('link', { name: /^sign\s*in$/i });
    await expect(signIn).toBeVisible({ timeout: 10000 });
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup', { timeout: 30000 }),
      signIn.click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  /**
   * Opens the popup for the Nth movie (0 = first, 1 = second, etc.).
   * Used by Test 3 to verify reusability with a different movie.
   */
  async openBookingPopupForMovie(index: number): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup', { timeout: 30000 }),
      this.bookButtonAt(index).click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }
}
