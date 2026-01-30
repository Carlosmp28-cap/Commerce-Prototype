/**
 * Auth related DTOs
 */

export interface LoginRequestDto {
  username: string;
  password: string;
  basketId?: string | null;
}

export interface ShopperSessionDto {
  sessionId: string;
  customerId?: string | null;
  authType: string;
  basketId?: string | null;
  jwtToken?: string | null;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};
