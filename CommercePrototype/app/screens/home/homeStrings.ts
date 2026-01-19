/**
 * Centralized copy for the Home screen.
 *
 * Keeps UI text and accessibility labels consistent across components and
 * makes future localization/refactors easier.
 */
export const HOME_STRINGS = {
  documentTitle: "Home — CommercePrototype",
  metaDescription:
    "Browse featured products, shop by category, and discover new season essentials.",

  heroKicker: "Welcome",
  heroHeadline: "New season essentials",
  heroBody: "Shop curated picks across New, Men, Women and Sale.",
  heroAlt: "New season essentials",
  heroOpenPlpA11y: "Open product listing",
  shopAllA11y: "Shop all products",
  shopSaleA11y: "Shop sale",
  shopAllLabel: "Shop all",
  shopSaleLabel: "Shop sale",

  searchPlaceholder: "Search products",
  searchA11y: "Search products",
  categoryChipA11yPrefix: "Open category",

  shopByCategoryTitle: "Shop by Category",
  featuredTitle: "Featured",
  valuePropsTitle: "Why shop with us",
} as const;
