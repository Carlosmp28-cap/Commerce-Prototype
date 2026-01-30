import type { CategoryNodeDto } from "../models";

/**
 * Pure category-tree helpers.
 *
 * Kept separate from hooks so the logic is reusable and easily testable.
 */

/**
 * Flatten category tree to a list (includes ALL nested categories).
 * Skips the synthetic "root" node itself.
 */
export function flattenCategories(
  categoryNode: CategoryNodeDto | null,
): CategoryNodeDto[] {
  if (!categoryNode) return [];

  const result: CategoryNodeDto[] = [];

  function traverse(node: CategoryNodeDto) {
    if (node.id !== "root") {
      result.push(node);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  }

  traverse(categoryNode);
  return result;
}

/**
 * Get only the main (top-level) categories, excluding root.
 */
export function getMainCategories(
  categoryNode: CategoryNodeDto | null,
): CategoryNodeDto[] {
  if (!categoryNode) return [];

  return categoryNode.children || [];
}

/**
 * Get all subcategories for a specific parent category.
 */
export function getSubcategories(
  categoryNode: CategoryNodeDto | null,
  parentCategoryId: string,
): CategoryNodeDto[] {
  const parentCategory = findCategoryById(categoryNode, parentCategoryId);
  if (!parentCategory) return [];

  return parentCategory.children || [];
}

/**
 * Find a category by id in the tree.
 */
export function findCategoryById(
  categoryNode: CategoryNodeDto | null,
  categoryId: string,
): CategoryNodeDto | null {
  if (!categoryNode) return null;

  if (categoryNode.id === categoryId) return categoryNode;

  if (categoryNode.children && categoryNode.children.length > 0) {
    for (const child of categoryNode.children) {
      const found = findCategoryById(child, categoryId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Find category by name (case-insensitive search across all levels).
 */
export function findCategoryByName(
  categoryNode: CategoryNodeDto | null,
  categoryName: string,
): CategoryNodeDto | null {
  if (!categoryNode) return null;

  const normalizedSearch = categoryName.toLowerCase().trim();

  function search(node: CategoryNodeDto): CategoryNodeDto | null {
    if (
      node.id.toLowerCase() === normalizedSearch ||
      node.name.toLowerCase() === normalizedSearch ||
      node.name.toLowerCase().includes(normalizedSearch)
    ) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
    }

    return null;
  }

  return search(categoryNode);
}

/**
 * Get the full category path (breadcrumb trail) for a category.
 */
export function getCategoryPath(
  categoryNode: CategoryNodeDto | null,
  categoryId: string,
): CategoryNodeDto[] {
  if (!categoryNode) return [];

  const path: CategoryNodeDto[] = [];

  function findPath(node: CategoryNodeDto, targetId: string): boolean {
    if (node.id === targetId) {
      if (node.id !== "root") {
        path.push(node);
      }
      return true;
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (findPath(child, targetId)) {
          if (node.id !== "root") {
            path.unshift(node);
          }
          return true;
        }
      }
    }

    return false;
  }

  findPath(categoryNode, categoryId);
  return path;
}
