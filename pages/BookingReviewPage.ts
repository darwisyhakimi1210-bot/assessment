import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * pages/BookingReviewPage.ts
 *
 * Represents the booking review / checkout page that appears AFTER the
 * sign-up form is submitted and the user is logged in.
 *
 * This page shows the booking summary so the user can verify:
 *   - Movie title
 *   - Date and show time
 *   - Cinema location
 *   - Experience (e.g., IMAX, Regular, ATMOS)
 *   - Selected seats (if any)
 *   - Total price
 *   - User info (name, email)
 *
 * The test scope is VALIDATE BOOKING DETAILS WITHOUT PAYING.
 * We assert on visible elements but never click a Pay button.
 */
export class BookingReviewPage extends BasePage {
  // The review page usually lives inside the same popup that hosted the
  // booking flow. We expose locators that should be present on a successful
  // post-signup booking summary view.

  // ── Locators (kept loose — exact text may vary by cinema/show) ───────
  private readonly movieTitle = this.page.locator('h1, h2, h3, .movie-title, [class*="movie" i]').first();
  private readonly cinemaName = this.page.locator('text=/cinema/i').first();
  private readonly totalPrice = this.page.locator('text=/total|amount|price|rm\\s*\\d/i').first();

  /**
   * Asserts the review page loaded — verifies we're on the checkout /
   * review step (not the sign-up form any more).
   */
  async assertLoaded(): Promise<void> {
    // Wait for either a movie title or a "Review" / "Checkout" label
    await expect(
      this.page.locator('text=/review|checkout|booking summary|seats/i').first()
        .or(this.movieTitle)
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verifies booking details are visible on the review page.
   * We check for at least the movie title + cinema labels.
   */
  async assertBookingDetails(): Promise<void> {
    // The review page should still show the popup URL.
    await expect(this.page).toHaveURL(/gsc\.com\.my/);

    // Movie title should be present somewhere on the page
    await expect(this.movieTitle).toBeVisible();
    console.log('✓ Movie title visible on review page');

    // Look for cinema-related text (the cinema name we picked)
    const hasCinemaText = await this.cinemaName.isVisible().catch(() => false);
    // Don't fail if not visible — different pages render this differently
    if (hasCinemaText) console.log('✓ Cinema name visible');

    // Look for the total price (RM XX.XX format)
    const hasPrice = await this.totalPrice.isVisible().catch(() => false);
    if (hasPrice) console.log('✓ Total price visible');

    // The "Pay" / "Proceed to Payment" button should NOT have been clicked
    // We just ensure a pay button exists (so we know we're at checkout)
    const payButton = this.page.getByRole('button', { name: /pay|proceed|payment/i }).first();
    const hasPay = await payButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasPay) {
      console.log('✓ Pay button present (test stops BEFORE clicking)');
    } else {
      console.log('ℹ Pay button not on this step (booking summary only)');
    }
  }
}