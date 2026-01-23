import { useMemo } from "react";

import type { CategoryNodeDto } from "../../../services/api.types";
import {
  findCategoryById,
  findCategoryByName,
  flattenCategories,
  getMainCategories,
} from "../../../hooks/useCategories";

type Result = {
  categoryId: string | null;
  selectedCategory: CategoryNodeDto | null;
  subcategories: CategoryNodeDto[];
  showSubcategories: boolean;
};

/**
 * Pure category selection logic for PLP.
 * - `q` is treated as a category selector, NOT as a keyword search.
 */
export function usePlpCategorySelection(
  categoryTree: CategoryNodeDto | null,
  q: string | undefined,
): Result {
  const mainCategories = useMemo(
    () => getMainCategories(categoryTree),
    [categoryTree],
  );

  const categoryId = useMemo(() => {
    if (!categoryTree) return null;

    if (q) {
      let matchingCategory = findCategoryById(categoryTree, q);

      if (!matchingCategory) {
        matchingCategory = findCategoryByName(categoryTree, q);
      }

      if (matchingCategory) {
        return matchingCategory.id;
      }
    }

    return mainCategories.length > 0 ? mainCategories[0].id : null;
  }, [categoryTree, q, mainCategories]);

  const flatCategories = useMemo(
    () => flattenCategories(categoryTree),
    [categoryTree],
  );

  const selectedCategory = useMemo(() => {
    if (!categoryId) return null;
    return flatCategories.find((cat) => cat.id === categoryId) ?? null;
  }, [flatCategories, categoryId]);

  const subcategories = useMemo(() => {
    return selectedCategory?.children ?? [];
  }, [selectedCategory]);

  return {
    categoryId,
    selectedCategory,
    subcategories,
    showSubcategories: subcategories.length > 0,
  };
}
