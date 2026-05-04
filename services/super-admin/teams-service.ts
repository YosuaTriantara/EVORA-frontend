import { apiDelete, apiGet, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import {
  TeamReadFullSchema,
  TeamMemberReadSchema,
  UpdateTeamStatusResponseSchema,
  UpdateTeamLotResponseSchema,
  DeleteTeamResponseSchema,
} from "@/lib/validation/schemas/team.schema";

// Team list response schema
const TeamsListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(TeamReadFullSchema),
});

export type TeamsList = z.infer<typeof TeamsListSchema>;

/**
 * Get all teams for an event (admin view)
 * @param eventId Event ID
 * @param params Query parameters (skip, limit, status)
 * @returns Paginated list of teams
 */
export async function getEventTeams(
  eventId: string,
  params?: { skip?: number; limit?: number; status?: string; category_id?: string }
): Promise<TeamsList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.category_id) query.set("category_id", params.category_id);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/teams${queryString}`);
  return parseApiResponse(TeamsListSchema, data, "getEventTeams");
}

/**
 * Get team members for a team
 * @param teamId Team ID
 * @returns List of team members
 */
export async function getTeamMembers(teamId: string): Promise<z.infer<typeof TeamMemberReadSchema>[]> {
  const data = await apiGet<unknown>(`/superadmin/teams/${teamId}/members`);
  return parseApiResponse(z.array(TeamMemberReadSchema), data, "getTeamMembers");
}

// Update team status request schema - aligned with API_SPECIFICATION.md
// Allowed values: PENDING_PAYMENT, PENDING_VERIFICATION, REGISTERED, CANCELLED, DISQUALIFIED
const UpdateTeamStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PENDING_VERIFICATION", "REGISTERED", "CANCELLED", "DISQUALIFIED"]),
  admin_note: z.string().optional(),
});

export type UpdateTeamStatusRequest = z.infer<typeof UpdateTeamStatusSchema>;

/**
 * Update team registration status
 * SUPER_ADMIN endpoint: PATCH /superadmin/teams/{team_id}/status
 * @param teamId Team ID
 * @param payload Status update data
 * @returns Updated team
 */
export async function updateTeamStatus(
  teamId: string,
  payload: UpdateTeamStatusRequest
): Promise<z.infer<typeof UpdateTeamStatusResponseSchema>> {
  const validatedPayload = UpdateTeamStatusSchema.parse(payload);
  const data = await apiPatch<unknown>(`/superadmin/teams/${teamId}/status`, validatedPayload);
  return parseApiResponse(UpdateTeamStatusResponseSchema, data, "updateTeamStatus");
}

// Update team lot number request schema
const UpdateTeamLotSchema = z.object({
  lot_number: z.number().min(1),
});

export type UpdateTeamLotRequest = z.infer<typeof UpdateTeamLotSchema>;

/**
 * Assign lot number to a team
 * @param teamId Team ID
 * @param payload Lot assignment data
 * @returns Updated team
 */
export async function updateTeamLot(
  teamId: string,
  payload: UpdateTeamLotRequest
): Promise<z.infer<typeof UpdateTeamLotResponseSchema>> {
  const validatedPayload = UpdateTeamLotSchema.parse(payload);
  const data = await apiPatch<unknown>(`/superadmin/teams/${teamId}/lot`, validatedPayload);
  return parseApiResponse(UpdateTeamLotResponseSchema, data, "updateTeamLot");
}

/**
 * Delete a team
 * @param teamId Team ID
 * @returns Success message
 */
export async function deleteTeam(teamId: string): Promise<z.infer<typeof DeleteTeamResponseSchema>> {
  const data = await apiDelete<unknown>(`/superadmin/teams/${teamId}`);
  return parseApiResponse(DeleteTeamResponseSchema, data, "deleteTeam");
}
