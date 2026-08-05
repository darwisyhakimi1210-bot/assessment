# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gsc-booking\03-different-movie.spec.ts >> Test 3: Login and complete full booking flow, validate booking details
- Location: tests\gsc-booking\03-different-movie.spec.ts:23:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Confirm - 1 ticket(s)').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Confirm - 1 ticket(s)').first()

```

```yaml
- iframe
- link "home":
  - /url: https://www.gsc.com.my/
- button "Showtime by Movies":
  - paragraph: Showtime by Movies
- button "Showtime by Cinemas":
  - paragraph: Showtime by Cinemas
- button "Hall Booking":
  - paragraph: Hall Booking
- button "F&B":
  - paragraph: F&B
- button "FasTicket":
  - paragraph: FasTicket
- text: DS
- paragraph: Darwisy Suhaimi
- 'img "Spider-Man: Brand New Day"'
- text: "SPIDER-MAN: BRAND NEW DAY"
- paragraph: "13"
- paragraph: ENG
- paragraph: 2 h 25 m
- paragraph: 4DX
- paragraph: Kuala Lumpur - LaLaport BBCC
- text: Thu 6 Aug, 10:30AM at 4DX Available Showtimes 10:30 AM
- separator
- paragraph: 4DX
- text: 1:25 PM
- separator
- paragraph: 4DX
- text: 4:20 PM
- separator
- paragraph: 4DX
- text: 7:15 PM
- separator
- paragraph: 4DX
- text: 10:10 PM
- separator
- paragraph: 4DX
- text: 1:05 AM
- separator
- paragraph: 4DX
- img "info_icon"
- text: RESET
- img "zoom_icon"
- text: 0%
- img "screen"
- text: E E01 E02 E03 E04 E05 E06 E07 E08 E09 E10 E11 E12 E13 E14 E15 E16 E D D01 D02 D03
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- text: D12
- img "occupied"
- img "occupied"
- img "occupied"
- text: D16 D C C01
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- text: C B B01
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- text: B A A01
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- img "occupied"
- text: A Unveil the Experience
- img "show ticket type"
- text: Ticket type options Seat Selection Adult x 2 E01, E02 RM 60.00 Confirm - 2 ticket(s)
- contentinfo:
  - link "FAQ":
    - /url: https://www.gsc.com.my/faqs
  - link "Privacy Policy":
    - /url: https://www.gsc.com.my/privacy-policy
  - link "ABAC Policy":
    - /url: https://www.gsc.com.my/abac-policy
  - link "Whistleblowing Policy":
    - /url: https://www.gsc.com.my/whistleblowing-policy
  - list:
    - listitem:
      - paragraph: Golden Screen Cinemas
      - paragraph: 195901000261 (3609-M)
    - listitem:
      - paragraph: 1, Jalan SS 22/19, Damansara Jaya,
      - paragraph: 47400 Petaling Jaya,
      - paragraph: Selangor, Malaysia.
    - listitem:
      - paragraph: Tel
      - paragraph: 03-7713 7888
      - paragraph: Email
      - paragraph: cs@gsc.com.my
  - paragraph: Download Our App
  - link:
    - /url: https://apps.apple.com/my/app/golden-screen-cinemas/id413024972
    - img
  - link:
    - /url: https://play.google.com/store/apps/details?id=com.gscandroid.yk&hl=en&gl=US&pli=1
    - img
  - link:
    - /url: https://appgallery.huawei.com/#/app/C100230541
    - img
  - paragraph: Follow Us
  - link:
    - /url: https://www.facebook.com/GSCinemas/
    - img
  - link:
    - /url: https://www.instagram.com/gscinemas/
    - img
  - link:
    - /url: https://twitter.com/GSCinemas
    - img
  - link:
    - /url: https://www.tiktok.com/@gscinemas
    - img
  - link:
    - /url: https://www.youtube.com/c/gscinemas
    - img
  - text: © Copyright 2026 Golden Screen Cinemas 195901000261 (3609-M). All Rights Reserved.
```

# Test source

```ts
  32  |   const popup = await homePage.clickSignIn();
  33  |   console.log('✓ Sign In clicked, popup opened');
  34  | 
  35  |   // Step 3 — Fill the login form and submit
  36  |   const loginPage = new LoginPage(popup);
  37  |   await loginPage.assertLoaded();
  38  |   const user = getDefaultUserData();
  39  |   await loginPage.login(user.mobileNumber, user.password);
  40  |   console.log(`✓ Logged in as +60 ${user.mobileNumber}`);
  41  | 
  42  |   // Step 4 — Dismiss "I Got It" reward modal
  43  |   const gotItButton = popup.getByRole('button', { name: 'I Got It', exact: true });
  44  |   await expect(gotItButton).toBeVisible({ timeout: 15000 });
  45  |   await gotItButton.click();
  46  |   console.log('✓ Dismissed "I Got It" modal');
  47  | 
  48  |   // Step 5 — Click "Showtime by Movies"
  49  |   const showtimeBtn = popup.getByRole('button', { name: 'Showtime by Movies', exact: true });
  50  |   await expect(showtimeBtn).toBeVisible({ timeout: 10000 });
  51  |   await showtimeBtn.click();
  52  |   console.log('✓ Clicked "Showtime by Movies"');
  53  |   await popup.waitForTimeout(1500);
  54  | 
  55  |   // Step 6 — Click date pill "THU 06 Aug" (matches codegen exactly)
  56  |   const datePill = popup.getByRole('button', { name: 'THU 06 Aug', exact: true });
  57  |   await expect(datePill).toBeVisible({ timeout: 10000 });
  58  |   await datePill.click();
  59  |   console.log('✓ Date selected: THU 06 Aug');
  60  | 
  61  |   // Step 7 — Click cinema icon (exact Tailwind class selector from codegen)
  62  |   const cinemaIcon = popup.locator(
  63  |     '.flex.cursor-pointer.flex-shrink-0.flex-grow-0.gsc-icon-0.w-20.h-10.md\\:h-14.md\\:w-28.border.border-white.rounded-md.justify-center.md\\:hover\\:bg-gsc-main-yellow\\/30.bg-gsc-icon-4d'
  64  |   );
  65  |   await expect(cinemaIcon).toBeVisible({ timeout: 10000 });
  66  |   await cinemaIcon.click();
  67  |   console.log('✓ Cinema icon clicked');
  68  | 
  69  |   // Step 8 — Click showtime ":30AM 4DX" inside "Kuala Lumpur - LaLaport BBCC" group
  70  |   const showtimeButton = popup
  71  |     .getByLabel('Kuala Lumpur - LaLaport BBCC')
  72  |     .getByRole('button', { name: ':30AM 4DX' });
  73  |   await expect(showtimeButton).toBeVisible({ timeout: 10000 });
  74  |   await showtimeButton.click();
  75  |   console.log('✓ Showtime selected (:30AM 4DX)');
  76  |   await popup.waitForTimeout(1500);
  77  | 
  78  |   // Step 8b — Click "Unveil the Experience" if it covers the seat map.
  79  |   // GSC shows a curtain overlay until the user clicks this button.
  80  |   const unveil = popup.getByRole('button', { name: /unveil the experience/i });
  81  |   if (await unveil.isVisible({ timeout: 3000 }).catch(() => false)) {
  82  |     await unveil.click();
  83  |     console.log('✓ Clicked "Unveil the Experience"');
  84  |     await popup.waitForTimeout(800);
  85  |   }
  86  | 
  87  |   // Step 9 — Click an AVAILABLE seat. We try a list of seats in priority
  88  |   // order (front-of-theater seats fill up first). For each candidate we
  89  |   // check if it's clickable — D07 might be occupied in this run.
  90  |   const seatCandidates = [
  91  |     'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11',
  92  |     'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11',
  93  |     'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11',
  94  |     'C04', 'C05', 'C06', 'C07', 'B04', 'B05', 'B06', 'A03', 'A04', 'A05', 'A06',
  95  |   ];
  96  | 
  97  |   let seatClicked: string | null = null;
  98  |   for (const seatId of seatCandidates) {
  99  |     const seatLocator = popup.getByText(seatId, { exact: true }).first();
  100 |     const isVisible = await seatLocator.isVisible({ timeout: 300 }).catch(() => false);
  101 |     if (!isVisible) continue;
  102 |     // Check if the seat is enabled (not greyed out)
  103 |     const isDisabled = await seatLocator.evaluate((el: HTMLElement) =>
  104 |       el.classList.contains('disabled') ||
  105 |       el.closest('button')?.disabled === true ||
  106 |       el.closest('button')?.getAttribute('aria-disabled') === 'true',
  107 |     ).catch(() => false);
  108 |     if (isDisabled) continue;
  109 |     // Try to click
  110 |     try {
  111 |       await seatLocator.click({ timeout: 1500 });
  112 |       // Verify success by checking the "Confirm - N ticket(s)" text updated
  113 |       await popup.waitForTimeout(400);
  114 |       const confirmText = await popup
  115 |         .getByText(/Confirm\s*-\s*\d+\s*ticket/i)
  116 |         .first()
  117 |         .textContent()
  118 |         .catch(() => '');
  119 |       if (confirmText && /\d+\s*ticket/i.test(confirmText) && !confirmText.includes('0 ticket')) {
  120 |         seatClicked = seatId;
  121 |         break;
  122 |       }
  123 |     } catch {
  124 |       // try next candidate
  125 |     }
  126 |   }
  127 |   if (!seatClicked) throw new Error('Could not find an available seat');
  128 |   console.log(`✓ Seat ${seatClicked} selected (available)`);
  129 | 
  130 |   // Step 10 — Click "Confirm - 1 ticket(s)"
  131 |   const confirmButton = popup.getByText('Confirm - 1 ticket(s)').first();
> 132 |   await expect(confirmButton).toBeVisible({ timeout: 10000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  133 |   await confirmButton.click();
  134 |   console.log('✓ Confirmed 1 ticket');
  135 | 
  136 |   // Step 11 — Click "GO" to proceed to checkout/review
  137 |   const goButton = popup.getByText('GO', { exact: true }).first();
  138 |   await expect(goButton).toBeVisible({ timeout: 10000 });
  139 |   await goButton.click();
  140 |   console.log('✓ Clicked "GO" — moved to booking review');
  141 | 
  142 |   // Wait for the booking review page to load
  143 |   await popup.waitForTimeout(2000);
  144 | 
  145 |   // ── BOOKING DETAIL VALIDATION ───────────────────────────────────────
  146 |   // GSC's summary combines everything into one text element, e.g.:
  147 |   // "SPIDER-MAN: BRAND NEW DAY 13ENG 2 h 25 m 4DX Kuala Lumpur - LaLaport BBCC Thu 6 Aug"
  148 |   // We assert that the visible booking details are correct WITHOUT proceeding to payment.
  149 | 
  150 |   // Assertion 1 — Summary element is visible (proves details rendered)
  151 |   const summaryElement = popup
  152 |     .getByText(/SPIDER-MAN|MOANA|ODYSSEY|DEAR YOU|JANA NAYAGAN|MINIONS|EVIL DEAD|OBSESSION|DORAEMON/i)
  153 |     .first();
  154 |   await expect(summaryElement).toBeVisible({ timeout: 10000 });
  155 |   console.log('✓ Movie title visible in booking summary');
  156 | 
  157 |   // Assertion 2 — Cinema name "Kuala Lumpur - LaLaport BBCC" is visible
  158 |   const cinemaElement = popup
  159 |     .getByText(/Kuala Lumpur\s*-\s*LaLaport\s*BBCC/i)
  160 |     .first();
  161 |   await expect(cinemaElement).toBeVisible({ timeout: 5000 });
  162 |   console.log('✓ Cinema name visible in summary');
  163 | 
  164 |   // Assertion 3 — Date "Thu 6 Aug" is visible
  165 |   const dateElement = popup
  166 |     .getByText(/Thu\s+6\s+Aug/i)
  167 |     .first();
  168 |   await expect(dateElement).toBeVisible({ timeout: 5000 });
  169 |   console.log('✓ Date visible in summary');
  170 | 
  171 |   // Assertion 4 — Experience code (e.g., "4DX") is visible
  172 |   const experienceElement = popup.getByText(/4DX|ATMOS|BEAM|D-BOX/i).first();
  173 |   await expect(experienceElement).toBeVisible({ timeout: 5000 });
  174 |   console.log('✓ Experience (4DX) visible in summary');
  175 | 
  176 |   // Assertion 5 — A Pay / Proceed-to-Payment button exists BUT we DO NOT click it
  177 |   const payButton = popup
  178 |     .getByRole('button', { name: /pay|proceed to payment|make payment/i })
  179 |     .first();
  180 |   const payVisible = await payButton.isVisible({ timeout: 2000 }).catch(() => false);
  181 |   if (payVisible) {
  182 |     console.log('✓ Pay button present (test stops BEFORE clicking)');
  183 |   } else {
  184 |     console.log('ℹ Pay button not on this step — booking summary validated only');
  185 |   }
  186 | 
  187 |   console.log('✅ TEST 3 PASSED — booking details all validated without payment');
  188 | });
```