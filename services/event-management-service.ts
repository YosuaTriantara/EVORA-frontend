// Barrel export for event-management services
// Re-exports all functions from domain-specific modules

import { apiGet } from "@/lib/admin-api";
import { serverGet } from "@/lib/api/server-fetch";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { EventReadFullSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import type { EventReadFull, StaffRole } from "@/types/admin";

// ═══════════════════════════════════════════════════════════
// MANAGED EVENTS (for dashboard sidebar)
// ═══════════════════════════════════════════════════════════

export interface ManagedEvent {
  event: EventReadFull;
  role: StaffRole;
  meta_data: {
    speciality?: string;
    judge_code?: string;
  } | null;
}

const ManagedEventSchema = z.object({
  event: EventReadFullSchema,
  role: z.enum(["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"]),
  meta_data: z.object({
    speciality: z.string().optional(),
    judge_code: z.string().optional(),
  }).nullable().optional().default(null),
});

/**
 * Get all events managed by current user (with their roles)
 * Used for dashboard sidebar navigation
 * 
 * SERVER-SIDE ONLY: Uses serverFetch for Server Components
 */
export async function getManagedEvents(token?: string): Promise<ManagedEvent[]> {
  // Use serverGet for Server Components (with token), apiGet for Client Components
  const data = token 
    ? await serverGet<unknown>("/events/my-managed", { token })
    : await apiGet<unknown>("/events/my-managed");
  return parseApiResponse(z.array(ManagedEventSchema), data, "getManagedEvents");
}

// Re-exports from domain-specific modules
export * from './event-management/event-settings-service';
export * from './event-management/categories-service';
export * from './event-management/staff-service';
export * from './event-management/teams-service';
export * from './event-management/voting-service';
export * from './event-management/scoring-service';
export * from './event-management/users-service';
export * from './event-management/official-team-service';
