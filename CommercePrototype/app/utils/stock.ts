/**
 * Stock/availability helpers.
 *
 * Centralize stock rules and labels here so screens/components don't duplicate
 * business logic (and changing copy/rules is a one-file change).
 */

/**
 * Returns a user-facing availability label.
 *
 * Rule:
 * - quantityAvailable > 0  => Available
 * - otherwise              => Out of Stock
 */
export function getAvailabilityLabel(quantityAvailable: number): string {
  return quantityAvailable > 0 ? "Available" : "Out of Stock";
}

/**
 * Returns whether a product is purchasable.
 * Useful for disabling buttons (e.g. "Add to cart") in a single, consistent way.
 */
export function isAvailable(quantityAvailable: number): boolean {
  return quantityAvailable > 0;
}
