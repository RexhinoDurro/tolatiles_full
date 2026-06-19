/**
 * Extracts only digits from input, capped at 10 for US numbers.
 */
export function extractPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  // Strip leading country code 1 if user typed it
  if (digits.startsWith('1') && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/**
 * Formats raw digits (max 10) into (XXX) XXX-XXXX for display in the input.
 * Does NOT include the +1 prefix — that is rendered separately.
 */
export function formatPhoneNumber(digits: string): string {
  const len = digits.length;
  if (len === 0) return '';
  if (len <= 3) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Formats a stored phone number for display.
 * Handles both raw digits (e.g. "9041234567") and pre-formatted strings.
 */
export function displayPhoneNumber(phone: string): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  // Handle 11-digit numbers starting with 1
  const normalized = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits;

  if (normalized.length === 10) {
    return `+1 (${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  // If not a standard 10-digit US number, return as-is
  return phone;
}
