import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { EventReadFullSchema } from "@/lib/validation/schemas/event.schema";

// Event list response schema
const EventsListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(EventReadFullSchema),
});

export type EventsList = z.infer<typeof EventsListSchema>;

const ToggleStatusMessageSchema = z.object({
  message: z.string(),
  event_id: z.string(),
  is_pg_enabled: z.boolean().optional(),
  is_voting_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// Toggle response schema - backend may return a full event or a compact status payload
const ToggleResponseSchema = z.union([
  EventReadFullSchema,
  ToggleStatusMessageSchema,
]);

export type ToggleResponse = z.infer<typeof ToggleResponseSchema>;

/**
 * Get all events for admin with pagination
 * @param params Query parameters (skip, limit, search, is_active)
 * @returns Paginated list of events
 */
export async function getAdminEvents(
  params?: { skip?: number; limit?: number; search?: string; is_active?: boolean }
): Promise<EventsList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.is_active !== undefined) query.set("is_active", String(params.is_active));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/events${queryString}`);
  return parseApiResponse(EventsListSchema, data, "getAdminEvents");
}

/**
 * Get a single event by ID (admin view)
 * @param eventId Event ID
 * @returns Full event details
 */
export async function getAdminEvent(eventId: string): Promise<z.infer<typeof EventReadFullSchema>> {
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}`);
  return parseApiResponse(EventReadFullSchema, data, "getAdminEvent");
}

// Create event request schema - aligned with CreateEventPayload from types/admin.ts
const CreateEventSchema = z.object({
  title: z.string(),
  slug: z.string(),
  organizer: z.string(),
  location: z.string(),
  profil_url: z.string().optional(),
  event_date_start: z.string(),
  event_date_end: z.string(),
  is_voting_enabled: z.boolean(),
  content_data: z.record(z.string(), z.unknown()).optional(),
  theme_setting: z.record(z.string(), z.unknown()).optional(),
});

export type CreateEventRequest = z.infer<typeof CreateEventSchema>;

/**
 * Create a new event
 * @param payload Event creation data
 * @returns Created event
 */
export async function createEvent(payload: CreateEventRequest): Promise<z.infer<typeof EventReadFullSchema>> {
  const validatedPayload = CreateEventSchema.parse(payload);
  const data = await apiPost<unknown>("/superadmin/events", validatedPayload);
  return parseApiResponse(EventReadFullSchema, data, "createEvent");
}

// Update event request schema - aligned with UpdateEventPayload from types/admin.ts
const UpdateEventSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  organizer: z.string().optional(),
  location: z.string().optional(),
  profil_url: z.string().optional(),
  event_date_start: z.string().optional(),
  event_date_end: z.string().optional(),
  is_active: z.boolean().optional(),
  is_pg_enabled: z.boolean().optional(),
  is_voting_enabled: z.boolean().optional(),
  theme_setting: z.record(z.string(), z.unknown()).optional(),
  content_data: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateEventRequest = z.infer<typeof UpdateEventSchema>;

/**
 * Update an existing event
 * @param eventId Event ID
 * @param payload Event update data
 * @returns Updated event
 */
export async function updateEvent(
  eventId: string,
  payload: UpdateEventRequest
): Promise<z.infer<typeof EventReadFullSchema>> {
  const validatedPayload = UpdateEventSchema.parse(payload);
  const data = await apiPatch<unknown>(`/superadmin/events/${eventId}`, validatedPayload);
  return parseApiResponse(EventReadFullSchema, data, "updateEvent");
}

/**
 * Delete an event
 * @param eventId Event ID to delete
 * @returns Success message
 */
export async function deleteEvent(eventId: string): Promise<{ message: string }> {
  const data = await apiDelete<unknown>(`/superadmin/events/${eventId}`);
  return parseApiResponse(z.object({ message: z.string() }), data, "deleteEvent");
}

/**
 * Toggle event payment gateway status
 * @param eventId Event ID
 * @param isEnabled New status
 * @returns Updated event or success message
 */
export async function toggleEventPg(eventId: string, isEnabled: boolean): Promise<ToggleResponse> {
  const data = await apiPatch<unknown>(`/superadmin/events/${eventId}/toggle-pg`, { is_pg_enabled: isEnabled });
  return parseApiResponse(ToggleResponseSchema, data, "toggleEventPg");
}

/**
 * Toggle event voting status
 * @param eventId Event ID
 * @param isEnabled New status
 * @returns Updated event or success message
 */
export async function toggleEventVoting(eventId: string, isEnabled: boolean): Promise<ToggleResponse> {
  const data = await apiPatch<unknown>(`/superadmin/events/${eventId}/toggle-voting`, { is_voting_enabled: isEnabled });
  return parseApiResponse(ToggleResponseSchema, data, "toggleEventVoting");
}

/**
 * Toggle event active status
 * @param eventId Event ID
 * @param isActive New status
 * @returns Updated event or success message
 */
export async function toggleEventActive(eventId: string, isActive: boolean): Promise<ToggleResponse> {
  const data = await apiPatch<unknown>(`/superadmin/events/${eventId}/toggle-active`, { is_active: isActive });
  return parseApiResponse(ToggleResponseSchema, data, "toggleEventActive");
}
