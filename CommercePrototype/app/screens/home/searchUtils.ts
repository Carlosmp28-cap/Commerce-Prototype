/**
 * Normalizes user input before navigating to PLP search.
 * @param raw - Raw user-entered query
 * @returns Trimmed query with collapsed whitespace
 */
export function normalizeHomeSearchQuery(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}
