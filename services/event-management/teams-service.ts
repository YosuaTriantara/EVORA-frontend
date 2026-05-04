// services/event-management/teams-service.ts
// Team management for ORGANIZER role
// API: /events/{event_id}/teams/*, /registration/*

import { apiGet, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import {
  TeamReadFullSchema,
  TeamMemberReadSchema,
  TeamStatusSchema,
  PaginatedTeamsResponseSchema,
  UpdateTeamStatusResponseSchema,
  UpdateTeamLotResponseSchema,
} from "@/lib/validation/schemas/team.schema";
import type { TeamReadFull, TeamStatus, TeamMemberRead } from "@/lib/validation/schemas/team.schema";

// Re-export for compatibility with React Query hooks
export type { TeamReadFull };

/**
 * Get all teams for an event (alias for getEventTeamsOrganizer)
 * GET /events/{event_id}/teams
 * 
 * @param eventId Event ID
 * @param params Query parameters for pagination and filtering
 * @returns Paginated list of teams
 */
export async function getEventTeams(
  eventId: string,
  params: GetEventTeamsParams = {}
): Promise<{ total: number; skip: number; limit: number; data: TeamReadFull[] }> {
  return getEventTeamsOrganizer(eventId, params);
}

/**
 * Verify team payment (alias for updating status to REGISTERED)
 * PATCH /registration/{team_id}/status
 * 
 * @param teamId Team ID
 * @returns Update confirmation
 */
export async function verifyTeamPayment(
  teamId: string
): Promise<{ message: string; team_id: string; new_status: TeamStatus }> {
  return updateTeamStatus(teamId, { status: "REGISTERED" });
}

export interface GetEventTeamsParams {
  skip?: number;
  limit?: number;
  status?: TeamStatus;
  category_id?: string;
}

export interface UpdateTeamStatusPayload {
  status: TeamStatus;
}

export interface UpdateTeamLotPayload {
  lot_number: number;
}

/**
 * Get all teams for an event (ORGANIZER only)
 * GET /events/{event_id}/teams
 * 
 * Uses non-superadmin endpoint as per API specification.
 * This endpoint requires ORGANIZER role for the specified event.
 * 
 * @param eventId Event ID
 * @param params Query parameters for pagination and filtering
 * @returns Paginated list of teams
 */
export async function getEventTeamsOrganizer(
  eventId: string,
  params: GetEventTeamsParams = {}
): Promise<{ total: number; skip: number; limit: number; data: TeamReadFull[] }> {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.category_id) query.set("category_id", params.category_id);

  const queryString = query.toString();
  const path = queryString
    ? `/events/${eventId}/teams?${queryString}`
    : `/events/${eventId}/teams`;

  const data = await apiGet<unknown>(path);
  return parseApiResponse(PaginatedTeamsResponseSchema, data, "getEventTeamsOrganizer");
}

/**
 * Update team registration status
 * PATCH /registration/{team_id}/status
 * 
 * Requires ORGANIZER role for the event containing this team.
 * 
 * @param teamId Team ID
 * @param payload New status value
 * @returns Update confirmation with new status
 */
export async function updateTeamStatus(
  teamId: string,
  payload: UpdateTeamStatusPayload
): Promise<{ message: string; team_id: string; new_status: TeamStatus }> {
  const data = await apiPatch<unknown>(`/registration/${teamId}/status`, payload);
  return parseApiResponse(UpdateTeamStatusResponseSchema, data, "updateTeamStatus");
}

/**
 * Update team lot number
 * PATCH /registration/{team_id}/lot
 * 
 * Requires ORGANIZER role for the event containing this team.
 * Lot number must be unique within the category.
 * 
 * @param teamId Team ID
 * @param payload Lot number (must be >= 1)
 * @returns Update confirmation with new lot number
 */
export async function updateTeamLot(
  teamId: string,
  payload: UpdateTeamLotPayload
): Promise<{ message: string; team_id: string; lot_number: number }> {
  const data = await apiPatch<unknown>(`/registration/${teamId}/lot`, payload);
  return parseApiResponse(UpdateTeamLotResponseSchema, data, "updateTeamLot");
}

/**
 * Get team members
 * GET /registration/{team_id}/members
 * 
 * Accessible by ORGANIZER (event-scoped) or OFFICIAL_TEAM (own team only).
 * 
 * @param teamId Team ID
 * @returns Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMemberRead[]> {
  const data = await apiGet<unknown>(`/registration/${teamId}/members`);
  return parseApiResponse(z.array(TeamMemberReadSchema), data, "getTeamMembers");
}
