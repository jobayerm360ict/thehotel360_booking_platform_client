import { z } from "zod";

export const UserRoleSchema = z.enum(["guest", "host", "admin"]);

export const PayoutMethodSchema = z.object({
  type: z.enum(["bank", "bkash", "nagad", "paypal", "stripe"]),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  routingNumber: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url().or(z.string()),
  role: UserRoleSchema,
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  joinedDate: z.string(),
  hostedListingIds: z.array(z.string()).default([]),
  languages: z.array(z.string()).optional(),
  superhostStatus: z.boolean().optional(),
  responseRate: z.string().optional(),
  responseTime: z.string().optional(),
  identityVerified: z.boolean().optional(),
  payoutMethod: PayoutMethodSchema.optional(),
  taxId: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Please enter an email or phone number").optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: UserRoleSchema.default("guest"),
  phone: z.string().optional(),
});

export const UpdateProfileSchema = UserSchema.partial().omit({ id: true, email: true });

export const GuestUpdateProfileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z
    .string()
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .refine((val) => val === "" || val.length >= 10, {
      message: "Bio must be at least 10 characters long",
    })
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  avatar: z.unknown().optional(),
});

export const HostUpdateProfileSchema = GuestUpdateProfileSchema;

export type UserType = z.infer<typeof UserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type GuestUpdateProfileInput = z.infer<typeof GuestUpdateProfileSchema>;
export type HostUpdateProfileInput = z.infer<typeof HostUpdateProfileSchema>;
