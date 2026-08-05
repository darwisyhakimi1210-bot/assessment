import { Page, Locator } from '@playwright/test';

/**
 * pages/BasePage.ts
 *
 * A base class that every page object extends. It contains
 * common actions used across all pages (e.g. waiting for page load,
 * closing popups) so we don't repeat ourselves.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Returns the current URL — handy for assertions.
   */
  get currentUrl(): string {
    return this.page.url();
  }

  /**
   * Returns a Locator by test ID. test IDs are added by developers
   * with data-testid attributes — they're the most stable way to find elements.
   */
  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Waits until the page's main DOM is loaded. Uses 'load' rather than
   * 'networkidle' because real-world sites (GSC, etc.) often have ongoing
   * background requests that prevent networkidle from firing — leading
   * to unnecessary test timeouts.
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('load');
  }
}
