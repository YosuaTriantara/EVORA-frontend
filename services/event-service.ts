// services/event-service.ts
// Server-side service for public event data (no auth required).
// These functions are called from Server Components.

import {
  EventPreview,
  EventDetail,
} from "@/types/event";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const API_BASE = `${BACKEND_URL}/api/v1`;

async function publicFetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
  });

  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
}

export async function getEvents(): Promise<EventPreview[]> {
  const data = await publicFetcher<EventPreview[]>("/public/events");
  // Ensure we always return an array, even if API returns null/undefined
  return Array.isArray(data) ? data : [];
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return publicFetcher<EventDetail>(`/public/event/${slug}`);
}

// Alias for getEventDetail - used by mobile event detail page
export async function getPublicEvent(slug: string): Promise<EventDetail> {
  return publicFetcher<EventDetail>(`/public/event/${slug}`);
}

// Note: Authenticated event management functions have been moved to
// event-management-service.ts to consolidate all event-scoped role operations
// (ORGANIZER, JUDGE, TABULATOR, OFFICIAL_TEAM) in one place.
