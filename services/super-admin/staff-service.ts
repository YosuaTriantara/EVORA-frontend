import { apiGet, apiPost, apiDelete } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";

// Event staff member schema - aligned with EventStaffRead in types/admin.ts
const EventStaffSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  event_id: z.string(),
  role: z.enum(["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"]),
  meta_data: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  created_at: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string().nullable().optional().default(null),
  }).optional(),
});

export type EventStaff = z.infer<typeof EventStaffSchema>;

/**
 * Get all staff members for an event
 * @param eventId Event ID
 * @returns List of event staff members
 */
export async function getEventStaff(eventId: string): Promise<EventStaff[]> {
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/staff`);
  return parseApiResponse(z.array(EventStaffSchema), data, "getEventStaff");
}

// Add staff request schema
const AddEventStaffSchema = z.object({
  user_id: z.string(),
  role: z.enum(["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"]),
  meta_data: z.record(z.string(), z.unknown()).optional(),
});

export type AddEventStaffRequest = z.infer<typeof AddEventStaffSchema>;

/**
 * Add a staff member to an event
 * @param eventId Event ID
 * @param payload Staff assignment data
 * @returns Created staff assignment
 */
export async function addEventStaff(
  eventId: string,
  payload: AddEventStaffRequest
): Promise<EventStaff> {
  const validatedPayload = AddEventStaffSchema.parse(payload);
  const data = await apiPost<unknown>(`/superadmin/events/${eventId}/staff`, validatedPayload);
  return parseApiResponse(EventStaffSchema, data, "addEventStaff");
}

/**
 * Remove a staff member from an event
 * @param eventId Event ID
 * @param userId User ID to remove
 * @returns Success message
 */
export async function removeEventStaff(
  eventId: string,
  eventUserId: string
): Promise<{ message: string; event_user_id: string }> {
  const data = await apiDelete<unknown>(`/superadmin/events/${eventId}/staff/${eventUserId}`);
  return parseApiResponse(
    z.object({ message: z.string(), event_user_id: z.string() }),
    data,
    "removeEventStaff"
  );
}
