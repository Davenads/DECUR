/**
 * Formatting utility functions
 */

/**
 * Formats a date string to a more readable format
 * @param dateString - Date string in ISO format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formats a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Capitalize the first letter of each word in a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  if (!text) return text;
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a video/audio timestamp string (HH:MM:SS.ms) to a display format
 * Drops milliseconds, drops the hours component if 0
 * e.g. "00:51:43.017" → "51:43",  "01:02:30.000" → "1:02:30"
 * @param ts - Timestamp string in HH:MM:SS.ms format
 * @returns Formatted timestamp string
 */
export function formatTimestamp(ts: string): string {
  const [hms] = ts.split('.');
  const parts = hms.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const s = parts[2];
  return h > 0 ? `${h}:${m}:${s}` : `${parseInt(m, 10)}:${s}`;
}