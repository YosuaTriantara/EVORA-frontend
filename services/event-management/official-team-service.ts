// OFFICIAL-TEAM-SERVICE - SERVER-ONLY FUNCTIONS
// This file contains server-side only functions that require direct backend access
// Client-side functions are re-exported from registration-service.ts for unified API

import { z } from "zod";
import { serverGet, serverPost, serverPatch } from "@/lib/api/server-fetch";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import {
  MyTeamSchema,
  TeamMemberReadSchema,
  TeamReadFullSchema,
  type MyTeam,
  type TeamMemberRead,
} from "@/lib/validation/schemas/team.schema";
import { TeamReadFull } from "@/types/admin";

// Re-export client-side functions from registration-service.ts for unified API
// These functions have Zod validation and consistent error handling
// Note: getTeamMembers is NOT re-exported here because it's already exported from teams-service.ts
export {
  getMyTeams,
  addTeamMember,
  updateTeamInfo as updateMyTeam,
  uploadPaymentProof,
  verifyRegistration,
} from "@/services/registration-service";

// Re-export types for convenience
export type { MyTeam, TeamMemberRead } from "@/lib/validation/schemas/team.schema";

const MyTeamArraySchema = z.array(MyTeamSchema);
const TeamMemberArraySchema = z.array(TeamMemberReadSchema);

// Simple message response schema
const MessageResponseSchema = z.object({
  message: z.string(),
});

/**
 * Get teams managed by current user (SERVER-SIDE ONLY)
 * This function accepts a token parameter for server-side authentication
 * Uses Zod validation for runtime type safety
 * 
 * @param token - JWT token for authentication
 * @param eventId - Optional event ID filter
 * @returns Array of teams managed by the user
 */
export async function getMyTeamsServer(
  token: string,
  eventId?: string
): Promise<MyTeam[]> {
  const query = eventId ? `?event_id=${eventId}` : "";
  const data = await serverGet<unknown>(`/registration/my-teams${query}`, { token });
  return parseApiResponse(MyTeamArraySchema, data, "getMyTeamsServer");
}

/**
 * Get full team details (SERVER-SIDE ONLY)
 * OFFICIAL_TEAM role required for own team
 * 
 * @param teamId - Team ID
 * @param token - JWT token for authentication
 * @returns Full team details
 */
export async function getMyTeamDetailsServer(
  teamId: string,
  token: string
): Promise<TeamReadFull> {
  const data = await serverGet<unknown>(`/registration/${teamId}`, { token });
  return parseApiResponse(TeamReadFullSchema, data, "getMyTeamDetailsServer");
}

/**
 * Get team members (SERVER-SIDE ONLY)
 * OFFICIAL_TEAM role required for own team
 * 
 * @param teamId - Team ID
 * @param token - JWT token for authentication
 * @returns Array of team members
 */
export async function getMyTeamMembersServer(
  teamId: string,
  token: string
): Promise<TeamMemberRead[]> {
  const data = await serverGet<unknown>(`/registration/${teamId}/members`, { token });
  return parseApiResponse(TeamMemberArraySchema, data, "getMyTeamMembersServer");
}

/**
 * Add member to own team (SERVER-SIDE ONLY)
 * OFFICIAL_TEAM role required
 * 
 * @param teamId - Team ID
 * @param payload - Member data
 * @param token - JWT token for authentication
 * @returns Created team member
 */
export async function addMyTeamMemberServer(
  teamId: string,
  payload: { name: string; role: string; identity_number?: string; extra_data?: Record<string, unknown> },
  token: string
): Promise<TeamMemberRead> {
  const data = await serverPost<unknown>(`/registration/${teamId}/members`, payload, { token });
  return parseApiResponse(TeamMemberReadSchema, data, "addMyTeamMemberServer");
}

/**
 * Upload payment proof for own team (SERVER-SIDE ONLY)
 * OFFICIAL_TEAM role required
 * 
 * @param teamId - Team ID
 * @param file - File to upload
 * @param token - JWT token for authentication
 * @returns Success message
 */
export async function uploadMyPaymentProofServer(
  teamId: string,
  file: File,
  token: string
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/proxy/registration/${teamId}/proof`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to upload payment proof");
  }

  const data = await response.json();
  return parseApiResponse(MessageResponseSchema, data, "uploadMyPaymentProofServer");
}
