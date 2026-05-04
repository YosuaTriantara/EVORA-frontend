import { apiGet } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";

// EventStats schema for the events array
const EventStatsSchema = z.object({
  event_id: z.string(),
  event_title: z.string(),
  slug: z.string(),
  total_teams: z.number(),
  registered_teams: z.number(),
  pending_payment_teams: z.number(),
  pending_verification_teams: z.number(),
  cancelled_teams: z.number(),
  total_revenue_idr: z.number(),
  is_active: z.boolean(),
});

// Dashboard statistics schema - matches types/admin.ts DashboardStats
const DashboardStatsSchema = z.object({
  total_users: z.number(),
  total_active_users: z.number(),
  total_events: z.number(),
  total_active_events: z.number(),
  total_teams: z.number(),
  total_registered_teams: z.number(),
  total_revenue_idr: z.number(),
  total_pending_transactions: z.number(),
  total_vote_packages_sold: z.number(),
  events: z.array(EventStatsSchema),
});

// Type derived from schema
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * Get dashboard statistics for SUPER_ADMIN
 * @returns Dashboard statistics including event, team, and user counts
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await apiGet<unknown>("/superadmin/dashboard");
  return parseApiResponse(DashboardStatsSchema, data, "getDashboardStats");
}
