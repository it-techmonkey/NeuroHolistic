/**
 * Email normalization utilities
 * Can be used in both server and client contexts
 */

/**
 * Normalize email for consistent lookups
 * @param email - Raw email
 * @returns Lowercased, trimmed email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
