// services/event-management/users-service.ts
// User search for ORGANIZER to find users to add as staff

import { apiGet } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { UserSearchResponse } from "@/types/admin";

const UserSearchResultSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string(),
});

const UserSearchResponseSchema = z.object({
  total: z.number(),
  data: z.array(UserSearchResultSchema),
});

/**
 * Search users by email or full_name
 * ORGANIZER role required
 * Only returns users with USER role (not SUPER_ADMIN)
 */
export async function searchUsers(
  query: string,
  limit: number = 10
): Promise<UserSearchResponse> {
  const data = await apiGet<unknown>(
    `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return parseApiResponse(
    UserSearchResponseSchema,
    data,
    "searchUsers"
  );
}

// Alias for backward compatibility with event-detail-view.tsx
export { searchUsers as getUsers };
