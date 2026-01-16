/**
 * Capitalizes the first letter of a string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a price with currency symbol
 */
export const formatPrice = (price: number, currency: string = "€"): string => {
  return `${currency}${price.toFixed(2)}`;
};
