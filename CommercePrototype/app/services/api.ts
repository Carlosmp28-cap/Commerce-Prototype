import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";
import type {
  ProductSearchResultDto,
  ProductDetailDto,
  CategoryNodeDto,
  ApiError,
  BasketDto,
  CreateBasketRequestDto,
  AddBasketItemRequestDto,
  UpdateBasketItemQuantityRequestDto,
  LoginRequestDto,
  ShopperSessionDto,
  CustomerProfileDto,
  CustomerAddressDto,
  CustomerOrderDto,
  RegisterCustomerRequestDto,
  UpdateCustomerProfileRequestDto,
  AddCustomerAddressRequestDto,
} from "../models";

declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: RetryMetadata;
  }
}

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

type RequestOptions = {
  signal?: AbortSignal;
  retry?: number;
  retryDelayMs?: number;
  retryOnAnyMethod?: boolean;
};

type RetryMetadata = {
  retryCount?: number;
  retryLimit?: number;
  retryDelayMs?: number;
  retryOnAnyMethod?: boolean;
  isAuthRetry?: boolean;
};

type RetryConfig = AxiosRequestConfig & {
  metadata?: RetryMetadata;
};

const SHOPPER_SESSION_HEADER = "X-Shopper-Session-Id";
let shopperSessionId: string | null = null;
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshHandler:
  | ((
      token: string | null,
    ) => Promise<{ accessToken: string; refreshToken?: string } | null>)
  | null = null;

export const setShopperSessionId = (sessionId: string | null) => {
  shopperSessionId = sessionId;
};

export const getShopperSessionId = () => shopperSessionId;

export const setAuthTokens = (
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
  } | null,
) => {
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const setTokenRefreshHandler = (
  handler:
    | ((
        token: string | null,
      ) => Promise<{ accessToken: string; refreshToken?: string } | null>)
    | null,
) => {
  refreshHandler = handler;
};

/**
 * Request interceptor - can be used for auth tokens later
 */
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (shopperSessionId) {
      config.headers = config.headers ?? {};
      config.headers[SHOPPER_SESSION_HEADER] = shopperSessionId;
    }
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
  (response) => {
    const headerKey = SHOPPER_SESSION_HEADER.toLowerCase();
    const headerValue =
      response.headers?.[headerKey] ??
      response.headers?.[SHOPPER_SESSION_HEADER];
    if (typeof headerValue === "string" && headerValue.trim().length > 0) {
      shopperSessionId = headerValue;
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const config = error.config as RetryConfig | undefined;
    const responseStatus = error.response?.status;

    if (
      responseStatus === 401 &&
      config &&
      !config.metadata?.isAuthRetry &&
      refreshHandler
    ) {
      config.metadata = { ...(config.metadata ?? {}), isAuthRetry: true };
      try {
        const refreshed = await refreshHandler(refreshToken);
        if (refreshed?.accessToken) {
          setAuthTokens(refreshed);
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return apiClient.request(config);
        }
      } catch (refreshError) {
        if (SHOULD_LOG_ERRORS) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    }

    if (config && shouldRetryRequest(error, config)) {
      const retryCount = config.metadata?.retryCount ?? 0;
      const retryLimit = config.metadata?.retryLimit ?? 2;
      if (retryCount < retryLimit) {
        const delayMs = config.metadata?.retryDelayMs ?? 300;
        config.metadata = {
          ...(config.metadata ?? {}),
          retryCount: retryCount + 1,
        };
        await delay(delayMs * Math.pow(2, retryCount));
        return apiClient.request(config);
      }
    }

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryRequest = (
  error: AxiosError<ApiError>,
  config: RetryConfig,
) => {
  if (!config) return false;

  const method = (config.method ?? "get").toLowerCase();
  const isIdempotent = ["get", "head", "options"].includes(method);
  const retryOnAnyMethod = config.metadata?.retryOnAnyMethod ?? false;
  if (!isIdempotent && !retryOnAnyMethod) return false;

  if (!error.response) return true;

  const status = error.response.status;
  return status === 429 || (status >= 500 && status < 600);
};

/**
 * API Service Methods
 */
export const api = {
  /**
   * Auth
   */
  auth: {
    guest: async (options?: RequestOptions): Promise<ShopperSessionDto> => {
      const response = await apiClient.post<ShopperSessionDto>(
        "/api/auth/guest",
        {},
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 1,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },
    login: async (
      body: LoginRequestDto,
      options?: RequestOptions,
    ): Promise<ShopperSessionDto> => {
      const response = await apiClient.post<ShopperSessionDto>(
        "/api/auth/login",
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },
    register: async (
      body: RegisterCustomerRequestDto,
      options?: RequestOptions,
    ): Promise<CustomerProfileDto> => {
      const response = await apiClient.post<CustomerProfileDto>(
        "/api/auth/register",
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },
    logout: async (options?: RequestOptions): Promise<void> => {
      await apiClient.post(
        "/api/auth/logout",
        {},
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
    },
  },

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
    search: async (
      params: {
        categoryId: string;
        q?: string;
        limit?: number;
        offset?: number;
      },
      options?: RequestOptions,
    ): Promise<ProductSearchResultDto> => {
      const response = await apiClient.get<ProductSearchResultDto>(
        "/api/products",
        {
          params,
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 2,
            retryDelayMs: options?.retryDelayMs ?? 300,
          },
        },
      );
      return response.data;
    },

    /**
     * Get product details by ID
     */
    getById: async (
      id: string,
      options?: RequestOptions,
    ): Promise<ProductDetailDto> => {
      const response = await apiClient.get<ProductDetailDto>(
        `/api/products/${id}`,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 2,
            retryDelayMs: options?.retryDelayMs ?? 300,
          },
        },
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
    getTree: async (
      params?: {
        rootId?: string;
        levels?: number;
      },
      options?: RequestOptions,
    ): Promise<CategoryNodeDto> => {
      const response = await apiClient.get<CategoryNodeDto>("/api/categories", {
        params,
        signal: options?.signal,
        metadata: {
          retryLimit: options?.retry ?? 2,
          retryDelayMs: options?.retryDelayMs ?? 300,
        },
      });
      return response.data;
    },
  },

  /**
   * Cart / Basket
   */
  cart: {
    create: async (
      body?: CreateBasketRequestDto,
      options?: RequestOptions,
    ): Promise<BasketDto> => {
      const response = await apiClient.post<BasketDto>(
        "/api/cart",
        body ?? {},
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },

    get: async (
      basketId: string,
      options?: RequestOptions,
    ): Promise<BasketDto> => {
      const response = await apiClient.get<BasketDto>(`/api/cart/${basketId}`, {
        signal: options?.signal,
        metadata: {
          retryLimit: options?.retry ?? 2,
          retryDelayMs: options?.retryDelayMs ?? 300,
        },
      });
      return response.data;
    },

    addItem: async (
      basketId: string,
      body: AddBasketItemRequestDto,
      options?: RequestOptions,
    ): Promise<BasketDto> => {
      const response = await apiClient.post<BasketDto>(
        `/api/cart/${basketId}/items`,
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },

    updateItemQuantity: async (
      basketId: string,
      itemId: string,
      body: UpdateBasketItemQuantityRequestDto,
      options?: RequestOptions,
    ): Promise<BasketDto> => {
      const response = await apiClient.patch<BasketDto>(
        `/api/cart/${basketId}/items/${itemId}`,
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },

    removeItem: async (
      basketId: string,
      itemId: string,
      options?: RequestOptions,
    ): Promise<BasketDto> => {
      const response = await apiClient.delete<BasketDto>(
        `/api/cart/${basketId}/items/${itemId}`,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },

    clear: async (
      basketId: string,
      options?: RequestOptions,
    ): Promise<void> => {
      await apiClient.delete(`/api/cart/${basketId}`, {
        signal: options?.signal,
        metadata: {
          retryLimit: options?.retry ?? 0,
          retryDelayMs: options?.retryDelayMs ?? 300,
          retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
        },
      });
    },
  },

  customers: {
    getProfile: async (
      options?: RequestOptions,
    ): Promise<CustomerProfileDto> => {
      const response = await apiClient.get<CustomerProfileDto>(
        "/api/customers/me",
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 2,
            retryDelayMs: options?.retryDelayMs ?? 300,
          },
        },
      );
      return response.data;
    },
    updateProfile: async (
      body: UpdateCustomerProfileRequestDto,
      options?: RequestOptions,
    ): Promise<CustomerProfileDto> => {
      const response = await apiClient.patch<CustomerProfileDto>(
        "/api/customers/me",
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },
    getOrders: async (
      options?: RequestOptions,
    ): Promise<CustomerOrderDto[]> => {
      const response = await apiClient.get<CustomerOrderDto[]>(
        "/api/customers/me/orders",
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 2,
            retryDelayMs: options?.retryDelayMs ?? 300,
          },
        },
      );
      return response.data;
    },
    getAddresses: async (
      options?: RequestOptions,
    ): Promise<CustomerAddressDto[]> => {
      const response = await apiClient.get<CustomerAddressDto[]>(
        "/api/customers/me/addresses",
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 2,
            retryDelayMs: options?.retryDelayMs ?? 300,
          },
        },
      );
      return response.data;
    },
    addAddress: async (
      body: AddCustomerAddressRequestDto,
      options?: RequestOptions,
    ): Promise<CustomerAddressDto> => {
      const response = await apiClient.post<CustomerAddressDto>(
        "/api/customers/me/addresses",
        body,
        {
          signal: options?.signal,
          metadata: {
            retryLimit: options?.retry ?? 0,
            retryDelayMs: options?.retryDelayMs ?? 300,
            retryOnAnyMethod: options?.retryOnAnyMethod ?? true,
          },
        },
      );
      return response.data;
    },
  },
};

export default api;
