import { containsBlockedContent } from "./blocklist";

/**
 * Strip all HTML tags and trim whitespace.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize and validate a text input.
 * Returns the cleaned string or throws if blocked content is detected.
 */
export function sanitize(str: string, maxLength: number): string {
  const cleaned = stripHtml(str).slice(0, maxLength);
  if (containsBlockedContent(cleaned)) {
    throw new Error("Input contains inappropriate content");
  }
  return cleaned;
}
