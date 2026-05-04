// services/event-management/staff-service.ts
// ORGANIZER role: Staff management for events

import { apiGet, apiPost, apiDelete } from "@/lib/admin-api";
import { serverGet } from "@/lib/api/server-fetch";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { EventStaffReadWithUser, StaffRole } from "@/types/admin";

// Schemas
const EventStaffSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  event_id: z.string(),
  role: z.enum(["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"]),
  meta_data: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
  }),
});

const MessageResponseSchema = z.object({
  message: z.string(),
  event_user_id: z.string(),
});

/**
 * Get all staff members for an event
 * ORGANIZER role required
 * 
 * SERVER-SIDE: Pass token for Server Components (uses absolute URL to backend)
 * CLIENT-SIDE: Call without token for Client Components (uses relative /api/proxy)
 */
export async function getEventStaff(eventId: string, token?: string): Promise<EventStaffReadWithUser[]> {
  // Use serverGet for Server Components (with token), apiGet for Client Components
  const data = token
    ? await serverGet<unknown>(`/events/${eventId}/staff`, { token })
    : await apiGet<unknown>(`/events/${eventId}/staff`);
  return parseApiResponse(z.array(EventStaffSchema), data, "getEventStaff");
}

/**
 * Add a staff member to an event
 * ORGANIZER role required
 * Note: Cannot assign ORGANIZER role (only SUPER_ADMIN can do that)
 */
export async function addEventStaff(
  eventId: string,
  payload: {
    user_id: string;
    role: "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";
    meta_data?: Record<string, unknown>;
  }
): Promise<EventStaffReadWithUser> {
  const data = await apiPost<unknown>(`/events/${eventId}/staff`, payload);
  return parseApiResponse(EventStaffSchema, data, "addEventStaff");
}

/**
 * Remove a staff member from an event
 * ORGANIZER role required
 */
export async function removeEventStaff(
  eventId: string,
  eventUserId: string
): Promise<{ message: string; event_user_id: string }> {
  const data = await apiDelete<unknown>(`/events/${eventId}/staff/${eventUserId}`);
  return parseApiResponse(MessageResponseSchema, data, "removeEventStaff");
}
