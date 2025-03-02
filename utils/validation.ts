/**
 * Validation utility functions
 */

/**
 * Checks if a string is a valid email format
 * @param email - Email string to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if a string is empty or only whitespace
 * @param text - String to check
 * @returns Boolean indicating if the string is empty
 */
export function isEmpty(text: string | null | undefined): boolean {
  return text === null || text === undefined || text.trim() === '';
}

/**
 * Checks if a value is a valid date
 * @param value - Value to check
 * @returns Boolean indicating if the value is a valid date
 */
export function isValidDate(value: any): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validates a URL string
 * @param url - URL string to validate
 * @returns Boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}