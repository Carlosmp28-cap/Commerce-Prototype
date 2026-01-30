/**
 * Customer related DTOs
 */

export type CustomerProfileDto = {
  customerId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isRegistered?: boolean | null;
};

export type CustomerAddressDto = {
  addressId: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  phone?: string | null;
};

export type CustomerOrderDto = {
  orderNo: string;
  orderId?: string | null;
  status?: string | null;
  orderTotal?: number | null;
  createdAt?: string | null;
};

export type RegisterCustomerRequestDto = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateCustomerProfileRequestDto = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type AddCustomerAddressRequestDto = {
  addressId: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
};
