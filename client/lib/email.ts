// Email obfuscation utilities to prevent spam harvesting

// Split email parts to prevent scrapers from finding plain text emails
const EMAIL_USER = 'menitola';
const EMAIL_DOMAIN = 'tolatiles';
const EMAIL_TLD = 'com';

/**
 * Get the obfuscated email address
 * This function constructs the email at runtime to prevent static scraping
 */
export const getEmail = (): string => {
  return `${EMAIL_USER}@${EMAIL_DOMAIN}.${EMAIL_TLD}`;
};

/**
 * Get mailto link
 */
export const getMailtoLink = (): string => {
  return `mailto:${getEmail()}`;
};

/**
 * Create a mailto link with subject and body
 */
export const createMailtoLink = (subject?: string, body?: string): string => {
  const email = getEmail();
  const params = new URLSearchParams();

  if (subject) {
    params.set('subject', subject);
  }
  if (body) {
    params.set('body', body);
  }

  const queryString = params.toString();
  return `mailto:${email}${queryString ? '?' + queryString : ''}`;
};

/**
 * Obfuscated email component data
 * Returns parts that can be assembled client-side
 */
export const EMAIL_PARTS = {
  user: EMAIL_USER,
  domain: EMAIL_DOMAIN,
  tld: EMAIL_TLD,
} as const;
