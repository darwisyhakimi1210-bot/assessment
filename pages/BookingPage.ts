import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserData } from '../test-data/userData';

/**
 * pages/BookingPage.ts
 *
 * Represents the BOOKING POPUP that opens from the homepage.
 * The popup contains:
 *   1. Date selector (pills with format "WED 05 Aug")
 *   2. Showtime selector (format "11:00AM ATMOS GETHA")
 *   3. A "Sign Up now" link that opens the registration form
 *   4. The registration form itself with Angular Material components
 *
 * Selectors below were verified via `npx playwright codegen` against
 * the live GSC website and use both role-based locators (preferred) and
 * Material-specific ID locators (mat-input-N, mat-select-value-N).
 */
export class BookingPage extends BasePage {
  // ── Show selection ────────────────────────────────────────────────
  /**
   * Date pills (e.g., "WED 05 Aug", "THU 06 Aug").
   * Built as a function so tests can call it with a dynamic date label.
   */
  datePill(label: string): Locator {
    // Escape any regex special chars in the label, then match the whole label
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('button', { name: new RegExp(`^${escaped}$`, 'i') });
  }

  /**
   * First date pill whose name looks like "WED 05 Aug" — used by assertLoaded
   * so we don't have to know today's date.
   */
  anyDatePill(): Locator {
    return this.page.getByRole('button', {
      name: /^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+\d{1,2}\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i,
    }).first();
  }

  /**
   * Showtime buttons combine time + experience + cinema, e.g. "11:00AM ATMOS GETHA".
   * Pass the full button label as it appears in the UI.
   */
  showtimeButton(label: string): Locator {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('button', { name: new RegExp(escaped, 'i') });
  }

  /**
   * First showtime button (button text contains a time like "11:00AM" or "7:30PM").
   */
  anyShowtimeButton(): Locator {
    return this.page.getByRole('button', {
      name: /\d{1,2}:\d{2}\s*(AM|PM)/i,
    }).first();
  }

  /**
   * The "Sign Up now" link inside the popup.
   */
  private readonly signUpLink = this.page.getByRole('link', { name: /sign up now/i });

  /**
   * The "Login now" / "Log in now" link inside the popup.
   */
  private readonly loginLink = this.page.getByRole('link', { name: /log\s*in\s*now|login\s*now/i });

  /**
   * "Proceed" advisory popup — appears after date/time selection.
   */
  private readonly proceedButton = this.page.getByRole('button', { name: /^proceed$/i });

  // ── Sign-up form (Angular Material) ───────────────────────────────
  private readonly fullNameInput = this.page.getByRole('textbox').first();
  private readonly mobileInput = this.page.getByRole('textbox').nth(1);
  private readonly emailInput = this.page.getByRole('textbox').nth(2);

  /**
   * Material uses #mat-input-N for password fields:
   *   mat-input-1 → Password
   *   mat-input-2 → Confirm password
   *   mat-input-0 → Date of birth (with calendar)
   * (Verified from the codegen output.)
   */
  private readonly passwordInput = this.page.locator('#mat-input-1');
  private readonly confirmPasswordInput = this.page.locator('#mat-input-2');
  private readonly dobInput = this.page.locator('#mat-input-0');
  private readonly genderMale = this.page.getByRole('radio', { name: /male \(m\)/i });

  /**
   * Material select triggers. Each one opens a dropdown panel.
   *   mat-select-value-3 → Race
   *   mat-select-value-4 → Profession
   *   "Select state"     → Location/State
   */
  private readonly raceSelect = this.page.locator('#mat-select-value-3');
  private readonly professionSelect = this.page.locator('#mat-select-value-4');
  private readonly stateSelect = this.page.getByText('Select state', { exact: true });

  private readonly termsCheckbox = this.page.locator('#mat-mdc-checkbox-1-input');
  private readonly submitButton = this.page.getByRole('button', { name: /^submit$/i });

  // ── Public API ────────────────────────────────────────────────────

  /**
   * Asserts the booking popup loaded correctly. We check that the first
   * date pill is visible — that means the popup rendered the showtime view.
   * The date pill button name looks like "WED 05 Aug" so we look for any
   * "DAY-NUM MONTH" pattern.
   */
  async assertLoaded(): Promise<void> {
    await expect(this.anyDatePill()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Selects a date by its visible label (e.g. "WED 05 Aug").
   * Uses Playwright auto-waiting — no manual sleep needed.
   */
  async selectDate(label: string): Promise<void> {
    const target = this.datePill(label);
    await expect(target).toBeVisible({ timeout: 10000 });
    await target.click();
  }

  /**
   * Selects a showtime by its combined label (e.g. "11:00AM ATMOS GETHA").
   */
  async selectShowtime(label: string): Promise<void> {
    const target = this.showtimeButton(label);
    await expect(target).toBeVisible({ timeout: 10000 });
    await target.click();

    // A "Proceed" advisory may appear — close it if so.
    await this.proceedIfPresent();
  }

  /**
   * Some flows show a "Proceed" advisory popup after time selection.
   * We test for presence and click only if visible.
   */
  async proceedIfPresent(): Promise<void> {
    const visible = await this.proceedButton.isVisible({ timeout: 1500 }).catch(() => false);
    if (visible) {
      await this.proceedButton.click();
      await this.waitForPageReady();
    }
  }

  /**
   * Clicks "Sign Up now" to open the registration form.
   */
  async clickSignUpNow(): Promise<void> {
    await expect(this.signUpLink).toBeVisible({ timeout: 10000 });
    await this.signUpLink.click();
    // Wait for at least one textbox to appear (form rendered)
    await expect(this.fullNameInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks "Login now" to open the login form (for existing members).
   */
  async clickLoginNow(): Promise<void> {
    await expect(this.loginLink).toBeVisible({ timeout: 10000 });
    await this.loginLink.click();
    // Wait for at least one input to appear (login form rendered)
    await this.page.locator('input').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  // ── Form field helpers ────────────────────────────────────────────

  async fillFullName(name: string): Promise<void> {
    await this.fullNameInput.fill(name);
  }

  async fillMobile(mobile: string): Promise<void> {
    await this.mobileInput.fill(mobile);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPasswords(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Selects a date of birth (dd/mm/yyyy) by PICKING the date in the
   * Angular Material calendar — we cannot type because the input is
   * `readonly="true"`. The calendar closes on its own once a day is clicked.
   *
   * Calendar navigation uses these view-cycles (Material 15+):
   *   day view → month view → year view (each click of the period button).
   *
   * We VERIFY each transition before proceeding by counting cells of the
   * expected type — this avoids depending on rapid double-clicks landing
   * correctly across Material's animated transitions.
   */
  async selectDOB(ddmmyyyy: string): Promise<void> {
    const [day, month, year] = ddmmyyyy.split('/');
    const targetYear = parseInt(year, 10);
    const targetDay = parseInt(day, 10);
    const monthShort = new Date(`${year}-${month}-${day}`)
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase();
    const monthLong = new Date(`${year}-${month}-${day}`)
      .toLocaleString('en-US', { month: 'long' });

    // ── 1. Open the calendar by clicking the input ─────────────────────
    await this.dobInput.click();
    await this.page.locator('.mat-calendar').first().waitFor({ state: 'visible', timeout: 5000 });
    // Wait for the calendar animation to complete
    await this.page.waitForTimeout(400);

    // ── 2. Cycle through views until we reach YEAR view ────────────────
    // We detect YEAR view by counting buttons whose accessible name is
    // a 4-digit number. Day and month views don't have such buttons.
    const periodButton = this.page.locator('button.mat-calendar-period-button').first();
    for (let clickCount = 0; clickCount < 5; clickCount++) {
      const yearButtonCount = await this.page
        .getByRole('button', { name: /^\d{4}$/ })
        .count();
      if (yearButtonCount >= 8) break; // 8+ 4-digit numbers = year grid
      await periodButton.click();
      // Wait for the view-change animation (~250-350ms)
      await this.page.waitForTimeout(450);
    }

    // ── 3. Find target year (click "previous" pages until visible) ─────
    let yearFound = false;
    for (let i = 0; i < 8; i++) {
      const yearCell = this.page
        .getByRole('button', { name: String(targetYear), exact: true })
        .first();
      if (await yearCell.isVisible({ timeout: 400 }).catch(() => false)) {
        await yearCell.click();
        yearFound = true;
        break;
      }
      const prev = this.page.locator('button.mat-calendar-previous-button').first();
      if (!(await prev.isVisible({ timeout: 200 }).catch(() => false))) break;
      await prev.click();
      await this.page.waitForTimeout(300);
    }
    if (!yearFound) throw new Error(`Could not find year ${targetYear} in calendar`);

    // Wait for month view to render
    await this.page.waitForTimeout(400);

    // ── 4. Click the target MONTH ──────────────────────────────────────
    // We match Material's month cell by the visible text inside
    // `.mat-calendar-body-cell-content`. `exact: true` would fail due to
    // possible whitespace; we use a tight case-insensitive match on the
    // 3-letter abbreviation.
    const monthCell = this.page
      .locator('.mat-calendar-body-cell-content')
      .filter({ hasText: new RegExp(`^\\s*${monthShort}\\s*$`, 'i') })
      .first();
    await monthCell.waitFor({ state: 'visible', timeout: 5000 });
    await monthCell.click();
    // Wait for the month→day view animation
    await this.page.waitForTimeout(600);

    // ── 5. Click the target DAY ────────────────────────────────────────
    // Material renders day cells with JUST the day number visible ("10"),
    // but the button's accessible name (aria-label) is "December 10,"
    // (or "December 10, 2003"). We match by accessible name (getByRole)
    // rather than by visible text because the visible text is ambiguous
    // — "10" appears in many cells. The accessible name is unique per cell.
    const dayCell = this.page
      .locator('button.mat-calendar-body-cell')
      .filter({
        has: this.page.locator(`.mat-calendar-body-cell-content:text-is("${targetDay}")`),
      })
      .first();
    // Fallback to aria-label match if text-is doesn't work
    if (!(await dayCell.isVisible({ timeout: 1000 }).catch(() => false))) {
      const altCell = this.page
        .getByRole('button', { name: new RegExp(`${monthLong}\\s+${targetDay}\\b`) })
        .first();
      await altCell.waitFor({ state: 'visible', timeout: 5000 });
      await altCell.click();
    } else {
      await dayCell.click();
    }

    // The calendar auto-closes once a day is picked. We just wait for
    // the backdrop to detach — we DON'T click outside or press Escape,
    // because those can disrupt the form field focus.
    await this.page
      .locator('.mat-datepicker-0-backdrop, .cdk-overlay-backdrop.mat-overlay-transparent-backdrop')
      .first()
      .waitFor({ state: 'detached', timeout: 5000 })
      .catch(() => undefined);
    await this.page.waitForTimeout(300);
  }

  async selectGenderMale(): Promise<void> {
    await expect(this.genderMale).toBeVisible({ timeout: 5000 });
    await this.genderMale.check();
  }

  /**
   * Selects an option inside an Angular Material dropdown.
   * The pattern is: click the select trigger → click the option text.
   */
  private async pickFromMaterialDropdown(trigger: Locator, optionText: string): Promise<void> {
    await trigger.click();
    const option = this.page.getByText(optionText, { exact: true }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    // Brief settle so the panel closes
    await this.page.waitForTimeout(200);
  }

  async selectRace(race: string): Promise<void> {
    await this.pickFromMaterialDropdown(this.raceSelect, race);
  }

  async selectProfession(profession: string): Promise<void> {
    await this.pickFromMaterialDropdown(this.professionSelect, profession);
  }

  async selectState(state: string): Promise<void> {
    await this.pickFromMaterialDropdown(this.stateSelect, state);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  /**
   * Fills the entire sign-up form for the given user.
   * Returns the same booking page so tests can chain further actions.
   */
  async fillRegistrationForm(user: UserData): Promise<void> {
    await this.fillFullName(user.fullName);
    await this.fillMobile(user.mobileNumber);
    await this.fillEmail(user.emailAddress);
    await this.fillPasswords(user.password);
    await this.selectDOB(user.dateOfBirth);
    await this.selectGenderMale();
    await this.selectRace(user.race);
    await this.selectProfession(user.profession);
    await this.selectState(user.location);
    await this.acceptTerms();
  }

  /**
   * Clicks the Submit button. After submission, GSC may redirect or
   * show an error/success message — tests should assert on what follows.
   */
  async submitRegistration(): Promise<void> {
    await expect(this.submitButton).toBeVisible({ timeout: 5000 });
    await this.submitButton.click();
    await this.waitForPageReady();
  }
}
