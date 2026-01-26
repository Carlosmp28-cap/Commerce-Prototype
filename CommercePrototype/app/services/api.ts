import axios, { type AxiosInstance, type AxiosError } from "axios";
import type {
  ProductSearchResultDto,
  ProductDetailDto,
  CategoryNodeDto,
  ApiError,
} from "./api.types";

/**
 * API Configuration
 */
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "http://localhost:5035";
const API_TIMEOUT = 30000; // 30 seconds

const SHOULD_LOG_ERRORS =
  typeof process !== "undefined" && process.env?.NODE_ENV !== "test";

/**
 * Axios instance with configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - can be used for auth tokens later
 */
apiClient.interceptors.request.use(
  (config) => {
    // In the future, attach auth token here:
    // const token = await getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - standardized error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;
      if (SHOULD_LOG_ERRORS) {
        console.error("API Error:", apiError);
      }
      return Promise.reject(new Error(apiError.error || "An error occurred"));
    } else if (error.request) {
      // Request made but no response
      if (SHOULD_LOG_ERRORS) {
        console.error("Network Error:", error.message);
      }
      return Promise.reject(
        new Error("Network error. Please check your connection."),
      );
    } else {
      // Something else happened
      if (SHOULD_LOG_ERRORS) {
        console.error("Request Error:", error.message);
      }
      return Promise.reject(new Error(error.message));
    }
  },
);

/**
 * API Service Methods
 */
export const api = {
  /**
   * Products
   */
  products: {
    /**
     * Search products by category with optional search query
     * @param categoryId - Required: Category ID to fetch products from
     * @param q - Optional: Search query within the category
     * @param limit - Optional: Max number of results
     * @param offset - Optional: Pagination offset
     */
    search: async (params: {
      categoryId: string;
      q?: string;
      limit?: number;
      offset?: number;
    }): Promise<ProductSearchResultDto> => {
      const response = await apiClient.get<ProductSearchResultDto>(
        "/api/products",
        {
          params,
        },
      );
      return response.data;
    },

    /**
     * Get product details by ID
     */
    getById: async (id: string): Promise<ProductDetailDto> => {
      const response = await apiClient.get<ProductDetailDto>(
        `/api/products/${id}`,
      );
      return response.data;
    },
  },

  /**
   * Categories
   */
  categories: {
    /**
     * Get category tree
     */
    getTree: async (params?: {
      rootId?: string;
      levels?: number;
    }): Promise<CategoryNodeDto> => {
      const response = await apiClient.get<CategoryNodeDto>("/api/categories", {
        params,
      });
      return response.data;
    },
  },
};

export default api;
