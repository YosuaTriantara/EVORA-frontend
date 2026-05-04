// services/event-management/events-service.ts
// Event management for ORGANIZER role
// Endpoints: GET /events/by-id/{event_id}, PATCH /events/{event_id}/customize

import { apiGet, apiPatch, apiPost } from "@/lib/admin-api";
import { serverGet } from "@/lib/api/server-fetch";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { EventReadFullSchema, EventReadSchema } from "@/lib/validation/schemas";
import type { EventReadFull, EventRead, CreateEventPayload } from "@/types/admin";

/**
 * Get all events where current user is staff (organizer)
 * GET /events/my-events
 */
export async function getMyEvents(): Promise<EventRead[]> {
  const data = await apiGet<EventRead[]>("/events/my-events");
  
  // Validate each event in the array
  if (Array.isArray(data)) {
    return data.map((event) => {
      const result = EventReadSchema.safeParse(event);
      if (!result.success) {
        console.warn("[Zod] EventRead validation failed:", result.error.flatten());
        return event;
      }
      return result.data;
    });
  }
  
  return data;
}

export interface UpdateEventCustomizePayload {
  title?: string;
  is_voting_enabled?: boolean;
  theme_settings?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
  content_data?: {
    hero?: {
      title?: string;
      subtitle?: string;
      banner_url?: string;
    };
    sections?: Record<string, string>;
    payment_config?: {
      methods?: string[];
      manual_instructions?: {
        bank_name?: string;
        account_number?: string;
        account_holder?: string;
      };
    };
  };
}

/**
 * Get event details by ID
 * GET /events/by-id/{event_id}
 * 
 * SERVER-SIDE: Pass token for Server Components (uses absolute URL to backend)
 * CLIENT-SIDE: Call without token for Client Components (uses relative /api/proxy)
 */
export async function getEventDetails(eventId: string, token?: string): Promise<EventReadFull> {
  // Use serverGet for Server Components (with token), apiGet for Client Components
  const data = token
    ? await serverGet<unknown>(`/events/by-id/${eventId}`, { token })
    : await apiGet<unknown>(`/events/by-id/${eventId}`);

  const result = EventReadFullSchema.safeParse(data);
  if (!result.success) {
    console.warn(
      "[Zod] getEventDetails validation failed:",
      result.error.flatten()
    );
    return data as EventReadFull;
  }
  return result.data;
}

export async function customizeEvent(
  eventId: string,
  payload: UpdateEventCustomizePayload
): Promise<EventReadFull> {
  const data = await apiPatch<EventReadFull>(`/events/${eventId}/customize`, payload);
  return data;
}

/**
 * Create a new event
 * POST /events
 */
export async function createEvent(payload: CreateEventPayload): Promise<EventReadFull> {
  const data = await apiPost<EventReadFull>("/events", payload);
  
  const result = EventReadFullSchema.safeParse(data);
  if (!result.success) {
    console.warn(
      "[Zod] createEvent validation failed:",
      result.error.flatten()
    );
    return data;
  }
  return result.data;
}
