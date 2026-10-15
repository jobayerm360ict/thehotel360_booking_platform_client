/**
 * Authentication and User Domain Types
 */

export type UserRole = "guest" | "host" | "admin";

export interface PayoutMethod {
  type: "bank" | "bkash" | "nagad" | "paypal" | "stripe";
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  dialCode?: string;
  e164Phone?: string;
  status?: string;
  roleId?: number;
  roleIsActive?: boolean;
  gender?: string;
  dateOfBirth?: string;
  location?: string;
  address?: string;
  bio?: string;
  joinedDate: string;
  hostedListingIds: string[];
  languages?: string[];
  superhostStatus?: boolean;
  responseRate?: string;
  responseTime?: string;
  identityVerified?: boolean;
  payoutMethod?: PayoutMethod;
  taxId?: string;
  welcomeMessage?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

export interface SendOtpDTO {
  email?: string;
  phone?: string;
  type?: string;
}

export interface MatchOtpDTO {
  email?: string;
  phone?: string;
  otp: string;
  type?: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateProfileDTO extends Partial<Omit<User, "id" | "email">> {}

export interface RawApiUser {
  id?: string | number;
  _id?: string | number;
  email?: string | null;
  phone?: string | null;
  dial_code?: string | null;
  dialCode?: string | null;
  e164_phone?: string | null;
  e164Phone?: string | null;
  status?: string | null;
  last_logged_in?: string | null;
  role_id?: number | null;
  roleId?: number | null;
  role?: string | null;
  role_is_active?: boolean | null;
  roleIsActive?: boolean | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  name?: string | null;
  avatar?: string | null;
  date_of_birth?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bio?: string | null;
  address?: string | null;
  location?: string | null;
  joinedDate?: string | null;
  created_at?: string | null;
  hostedListingIds?: string[];
  listings?: (string | { id?: string | number; _id?: string | number })[];
  [key: string]: unknown;
}

export interface AuthApiResponse {
  success?: boolean;
  message?: string;
  data?: RawApiUser | User | null;
  token?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface OtpResponse {
  success?: boolean;
  message?: string;
  data?: RawApiUser | User | Record<string, unknown> | null;
  token?: string;
  [key: string]: unknown;
}

export interface ToggleRoleResponse {
  success?: boolean;
  message?: string;
  data?: RawApiUser | User | null;
  token?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

