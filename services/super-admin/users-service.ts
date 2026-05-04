import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { UserReadSchema } from "@/lib/validation/schemas/user.schema";

// User list response schema
const UsersListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(UserReadSchema),
});

export type UsersList = z.infer<typeof UsersListSchema>;

/**
 * Get all users with pagination
 * @param params Query parameters (skip, limit, search, role, is_active)
 * @returns Paginated list of users
 */
export async function getUsers(
  params?: { skip?: number; limit?: number; search?: string; role?: string; is_active?: boolean }
): Promise<UsersList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.role) query.set("role", params.role);
  if (params?.is_active !== undefined) query.set("is_active", String(params.is_active));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/users${queryString}`);
  return parseApiResponse(UsersListSchema, data, "getUsers");
}

/**
 * Get a single user by ID
 * @param userId User ID
 * @returns User details
 */
export async function getUser(userId: string): Promise<z.infer<typeof UserReadSchema>> {
  const data = await apiGet<unknown>(`/superadmin/users/${userId}`);
  return parseApiResponse(UserReadSchema, data, "getUser");
}

// Create user request schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string(),
  password: z.string(),
  role: z.enum(["USER", "SUPER_ADMIN"]),
  is_active: z.boolean(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
// Re-export untuk backward compatibility dengan komponen
export type CreateUserPayload = CreateUserRequest;

/**
 * Create a new user
 * @param payload User creation data
 * @returns Created user
 */
export async function createUser(payload: CreateUserRequest): Promise<z.infer<typeof UserReadSchema>> {
  const data = await apiPost<unknown>("/superadmin/users", payload);
  return parseApiResponse(UserReadSchema, data, "createUser");
}

// Update user request schema
const UpdateUserSchema = z.object({
  full_name: z.string().optional(),
  role: z.enum(["USER", "SUPER_ADMIN"]).optional(),
  is_active: z.boolean().optional(),
  point_balance: z.number().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
// Re-export untuk backward compatibility dengan komponen
export type UpdateUserPayload = UpdateUserRequest;

/**
 * Update an existing user
 * @param userId User ID
 * @param payload User update data
 * @returns Updated user
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserRequest
): Promise<z.infer<typeof UserReadSchema>> {
  const data = await apiPatch<unknown>(`/superadmin/users/${userId}`, payload);
  return parseApiResponse(UserReadSchema, data, "updateUser");
}

/**
 * Delete a user
 * @param userId User ID to delete
 * @returns Success message
 */
export async function deleteUser(userId: string): Promise<{ message: string }> {
  const data = await apiDelete<unknown>(`/superadmin/users/${userId}`);
  return parseApiResponse(z.object({ message: z.string() }), data, "deleteUser");
}
