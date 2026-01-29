import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { logger } from "../utils/logger";
import type { Product } from "../models/Product";
import { mapProductSummary, mapProductDetail } from "../utils/productMapper";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseProductsPaginatedResult extends UseProductsResult {
  hasMore: boolean;
  loadMore: () => void;
  goToPage: (pageIndex: number) => void;
  offset: number;
  total: number;
  isLoadingMore: boolean;
}

/**
 * Hook to fetch products by category from API
 * @param categoryId - Required: Category ID to fetch products from
 * @param query - Optional: Search query within the category
 * @param limit - Optional: Max number of results (default: 50, max recommended: 200)
 */
export function useProducts(
  categoryId: string,
  query?: string,
  limit: number = 50,
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (signal?: AbortSignal) => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await api.products.search(
        {
          categoryId,
          q: query,
          limit,
        },
        { signal },
      );

      const mappedProducts = result.items.map(mapProductSummary);
      setProducts(mappedProducts);
    } catch (err) {
      if (err instanceof Error && err.name === "CanceledError") {
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      logger.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [categoryId, query, limit]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}

/**
 * Hook to fetch products with pagination support
 * @param categoryId - Required: Category ID to fetch products from
 * @param query - Optional: Search query within the category
 * @param limit - Optional: Max number of results per page (default: 25 to match SFCC API)
 */
export function useProductsPaginated(
  categoryId: string,
  query?: string,
  limit: number = 25,
): UseProductsPaginatedResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(
    async (
      pageOffset: number = 0,
      append: boolean = false,
      signal?: AbortSignal,
    ) => {
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        if (!append) setLoading(true);
        setIsLoadingMore(append);
        setError(null);

        const result = await api.products.search(
          {
            categoryId,
            q: query,
            limit,
            offset: pageOffset,
          },
          { signal },
        );

        const mappedProducts = result.items.map(mapProductSummary);

        if (append) {
          setProducts((prev) => [...prev, ...mappedProducts]);
        } else {
          setProducts(mappedProducts);
          setOffset(result.offset || 0);
        }

        setTotal(result.total || 0);
      } catch (err) {
        if (err instanceof Error && err.name === "CanceledError") {
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch products";
        setError(errorMessage);
        logger.error("Error fetching products:", err);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [categoryId, query, limit],
  );

  useEffect(() => {
    setOffset(0);
    const controller = new AbortController();
    fetchProducts(0, false, controller.signal);
    return () => controller.abort();
  }, [categoryId, query, limit, fetchProducts]);

  const loadMore = useCallback(() => {
    const nextOffset = offset + limit;
    if (nextOffset < total) {
      setOffset(nextOffset);
      fetchProducts(nextOffset, true);
    }
  }, [offset, limit, total, fetchProducts]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      const targetOffset = Math.max(0, (pageIndex - 1) * limit);
      // Only fetch if different offset
      if (targetOffset !== offset) {
        setOffset(targetOffset);
        fetchProducts(targetOffset, false);
      }
    },
    [limit, offset, fetchProducts],
  );

  const hasMore = offset + limit < total;

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(0, false),
    hasMore,
    loadMore,
    goToPage,
    offset,
    total,
    isLoadingMore,
  };
}

interface UseProductDetailResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch product details from API
 */
export function useProductDetail(productId: string): UseProductDetailResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.products.getById(productId, { signal });
      const mappedProduct = mapProductDetail(result);
      setProduct(mappedProduct);
    } catch (err) {
      if (err instanceof Error && err.name === "CanceledError") {
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch product";
      setError(errorMessage);
      logger.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      const controller = new AbortController();
      fetchProduct(controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [productId]);

  return {
    product,
    loading,
    error,
    refetch: () => fetchProduct(),
  };
}
