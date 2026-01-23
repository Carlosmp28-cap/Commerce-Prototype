import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { CategoryNodeDto } from "../services/api.types";

export {
  flattenCategories,
  getMainCategories,
  getSubcategories,
  findCategoryById,
  findCategoryByName,
  getCategoryPath,
} from "../utils/categoryTree";

interface UseCategoriesResult {
  categories: CategoryNodeDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch category tree from API
 */
export function useCategories(
  rootId: string = "root",
  levels: number = 3,
): UseCategoriesResult {
  const shouldLogErrors =
    typeof process !== "undefined" && process.env?.NODE_ENV !== "test";
  const [categories, setCategories] = useState<CategoryNodeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.categories.getTree({
        rootId,
        levels,
      });

      setCategories(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
      if (shouldLogErrors) {
        console.error("Error fetching categories:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [rootId, levels]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
