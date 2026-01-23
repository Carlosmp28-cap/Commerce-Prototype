import type { CategoryNodeDto } from "../../services/api.types";

import { isGiftCertificates } from "../../utils/categoryVisibility";

export { isGiftCertificates };

export function getVisibleTopCategories(categories: CategoryNodeDto[]) {
  return categories.filter((c) => !isGiftCertificates(c.name));
}

export function getVisibleChildren(category: CategoryNodeDto | undefined) {
  return (category?.children ?? []).filter((c) => !isGiftCertificates(c.name));
}
