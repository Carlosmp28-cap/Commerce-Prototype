import type { CategoryNodeDto } from "../../../../services/api.types";

import { isGiftCertificates } from "../../../../utils/categoryVisibility";

export function getVisibleMainCategories(
  mainCategories: CategoryNodeDto[],
): CategoryNodeDto[] {
  const filterTree = (node: CategoryNodeDto): CategoryNodeDto | null => {
    if (isGiftCertificates(node.name)) return null;

    const children = node.children
      ?.map(filterTree)
      .filter((c): c is CategoryNodeDto => c !== null);

    // Keep the node even if it becomes childless; selection rules still apply.
    return { ...node, children };
  };

  return mainCategories
    .map(filterTree)
    .filter((c): c is CategoryNodeDto => c !== null);
}

export function findCategoryLabelById(
  categories: CategoryNodeDto[],
  categoryId: string | undefined,
): string | undefined {
  if (!categoryId) return undefined;

  const stack: CategoryNodeDto[] = [...categories];
  while (stack.length > 0) {
    const node = stack.shift()!;
    if (node.id === categoryId) return node.name;
    if (node.children) stack.push(...node.children);
  }

  return undefined;
}

export function getActiveParentCategory(
  categories: CategoryNodeDto[],
  activeParentId: string | null,
): CategoryNodeDto | undefined {
  if (categories.length === 0) return undefined;

  const byId = new Map(categories.map((c) => [c.id, c] as const));
  if (activeParentId && byId.has(activeParentId))
    return byId.get(activeParentId);

  return categories[0];
}
