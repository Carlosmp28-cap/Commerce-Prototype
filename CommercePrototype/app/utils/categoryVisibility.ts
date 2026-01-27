/**
 * Small business-rule helpers for category naming/visibility.
 *
 * Keep these helpers pure and UI-agnostic so they can be reused across
 * navigation menus, pickers, and any future category-related components.
 */

export function isGiftCertificates(name: string | undefined) {
  const normalized = (name ?? "").trim().toLowerCase();
  return (
    normalized === "gift certificates" || normalized === "gift certificate"
  );
}
