/**
 * test-data/userData.ts
 *
 * Test data for the GSC sign-up form.
 * Note: Date of birth, name, gender, race, profession, and location are
 * fixed as those were specified by the test scenario. Email and mobile
 * are randomized to avoid creating duplicate accounts on the real site.
 */

export interface UserData {
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  password: string;
  dateOfBirth: string; // dd/mm/yyyy
  gender: 'Male' | 'Female';
  race: string;
  profession: string;
  location: string;
}

/**
 * Generates a random Malaysian mobile number in the format 01X-XXXXXXXX.
 * Malaysian mobile numbers start with 011/012/013/014/015/016/017/018/019.
 */
function randomMalaysianMobile(): string {
  const prefixes = ['011', '012', '013', '014', '015', '016', '017', '018', '019'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += Math.floor(Math.random() * 10);
  }
  return `${prefix}${suffix}`;
}

/**
 * Generates a unique-looking email using the current timestamp.
 * Format: gsc.test+<timestamp>@example.com
 */
function randomEmail(): string {
  const timestamp = Date.now();
  return `gsc.test+${timestamp}@example.com`;
}

/**
 * Returns the standard user data with REAL credentials so GSC accepts them.
 * DOB and personal details are static because they're part of the test scenario.
 *
 * NOTE: GSC validates Malaysian mobile numbers strictly AND uses Mobile Number
 * (not email) for login. The country code +60 is auto-prefixed on the login form.
 */
export function getDefaultUserData(): UserData {
  return {
    fullName: 'Darwisy Suhaimi',
    mobileNumber: '196233031',
    emailAddress: 'darwisyhakimi1210@gmail.com',
    password: 'Wa5115aa!',
    dateOfBirth: '10/12/2003',
    gender: 'Male',
    race: 'Malay',
    profession: 'Student',
    location: 'Selangor',
  };
}
