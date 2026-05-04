// services/event-management/categories-service.ts
// ORGANIZER role: Category management for events
// API endpoints aligned with API_SPECIFICATION.md

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/admin-api";
import { serverGet } from "@/lib/api/server-fetch";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { CategoryRead } from "@/types/admin";

// Schemas
const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  event_id: z.string(),
  max_quota: z.number(),
  registration_fee: z.number(),
});

const MessageResponseSchema = z.object({
  message: z.string(),
  category_id: z.string(),
});

// Event detail schema for extracting categories
// Based on EventReadFull from API_SPECIFICATION.md
const EventWithCategoriesSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  organizer: z.string(),
  location: z.string().nullable().optional(),
  profil_url: z.string().nullable().optional(),
  event_date_start: z.string(),
  event_date_end: z.string(),
  is_active: z.boolean(),
  is_pg_enabled: z.boolean(),
  is_voting_enabled: z.boolean(),
  content_data: z.any().optional(),
  theme_setting: z.any().optional(),
  categories: z.array(CategorySchema),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});

/**
 * Get all categories for an event
 * ORGANIZER role required
 * Uses GET /events/by-id/{event_id} which includes categories array
 * API_SPECIFICATION.md reference: Events Endpoints - Get full event details
 * 
 * SERVER-SIDE: Pass token for Server Components (uses absolute URL to backend)
 * CLIENT-SIDE: Call without token for Client Components (uses relative /api/proxy)
 */
export async function getEventCategories(eventId: string, token?: string): Promise<CategoryRead[]> {
  // Endpoint /events/by-id/{event_id} returns event with categories included
  // Use serverGet for Server Components (with token), apiGet for Client Components
  const data = token
    ? await serverGet<unknown>(`/events/by-id/${eventId}`, { token })
    : await apiGet<unknown>(`/events/by-id/${eventId}`);
  const event = parseApiResponse(EventWithCategoriesSchema, data, "getEventCategories");
  return event.categories;
}

/**
 * Create a new category for an event
 * ORGANIZER role required
 */
export async function createEventCategory(
  eventId: string,
  payload: {
    name: string;
    max_quota: number;
    registration_fee: number;
  }
): Promise<CategoryRead> {
  const data = await apiPost<unknown>(`/events/${eventId}/categories`, payload);
  return parseApiResponse(CategorySchema, data, "createEventCategory");
}

/**
 * Update a category
 * ORGANIZER role required
 */
export async function updateEventCategory(
  categoryId: string,
  payload: {
    name?: string;
    max_quota?: number;
    registration_fee?: number;
  }
): Promise<CategoryRead> {
  const data = await apiPatch<unknown>(`/events/categories/${categoryId}`, payload);
  return parseApiResponse(CategorySchema, data, "updateEventCategory");
}

/**
 * Delete a category
 * ORGANIZER role required
 */
export async function deleteEventCategory(categoryId: string): Promise<{ message: string; category_id: string }> {
  const data = await apiDelete<unknown>(`/events/categories/${categoryId}`);
  return parseApiResponse(MessageResponseSchema, data, "deleteEventCategory");
}
