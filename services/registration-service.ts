// services/registration-service.ts
// Registration and team management service.
// All calls go through BFF proxy (/api/proxy/*) for auth via HttpOnly cookie.

import type {
  MyTeam,
  TeamMember,
  AddMemberPayload,
  RegisterTeamPayload,
  RegisterTeamResponse,
} from "@/types/event";

import { apiGet, apiPost, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { MyTeamSchema, TeamMemberReadSchema } from "@/lib/validation/schemas";
import { z } from "zod";

// ── Registration ─────────────────────────────────────────────────────────────

/**
 * Register a team for an event.
 * POST /api/v1/registration/
 * Requires USER role.
 */
export async function registerTeam(
  payload: RegisterTeamPayload,
): Promise<RegisterTeamResponse> {
  return apiPost<RegisterTeamResponse>("/registration/", payload);
}

/**
 * Upload payment proof for a team registration.
 * POST /api/v1/registration/{team_id}/proof
 * Multipart form data.
 * NOTE: Uses raw fetch for multipart form data (browser sets Content-Type with boundary)
 */
export async function uploadPaymentProof(
  teamId: string,
  file: File,
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/proxy/registration/${teamId}/proof`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets it with boundary
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Failed to upload payment proof.";
    throw new Error(detail);
  }

  return data as { message: string };
}

/**
 * Get all teams registered by the current user for an event.
 * GET /api/v1/registration/my-teams?event_id={event_id}
 */
export async function getMyTeams(eventId?: string): Promise<MyTeam[]> {
  const query = eventId ? `?event_id=${encodeURIComponent(eventId)}` : "";
  const data = await apiGet<unknown>(`/registration/my-teams${query}`);
  // Validate with Zod schema
  const validated = parseApiResponse(z.array(MyTeamSchema), data, 'getMyTeams');
  // Ensure we always return an array, even if API returns null/undefined
  return Array.isArray(validated) ? validated : [];
}

// ── Team Management ──────────────────────────────────────────────────────────

/**
 * Get members of a team.
 * GET /api/v1/registration/{team_id}/members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const data = await apiGet<unknown>(`/registration/${teamId}/members`);
  // Validate with Zod schema
  const validated = parseApiResponse(z.array(TeamMemberReadSchema), data, 'getTeamMembers');
  // Ensure we always return an array, even if API returns null/undefined
  return Array.isArray(validated) ? validated : [];
}

/**
 * Add a member to a team.
 * POST /api/v1/registration/{team_id}/members
 */
export async function addTeamMember(
  teamId: string,
  payload: AddMemberPayload,
): Promise<TeamMember> {
  return apiPost<TeamMember>(`/registration/${teamId}/members`, payload);
}

/**
 * Update team name or institution.
 * PATCH /api/v1/registration/{team_id}/update
 */
export async function updateTeamInfo(
  teamId: string,
  newTeamName?: string,
  newInstitution?: string,
): Promise<{ message: string }> {
  const params = new URLSearchParams();
  if (newTeamName) params.set("new_team_name", newTeamName);
  if (newInstitution) params.set("new_institution", newInstitution);

  return apiPatch<{ message: string }>(
    `/registration/${teamId}/update?${params}`,
    {},
  );
}

// ── Organizer: Verify Registration ───────────────────────────────────────────

/**
 * Approve or reject a registration payment.
 * PATCH /api/v1/registration/verify/{transaction_id}
 * Query params: is_approved, admin_note
 */
export async function verifyRegistration(
  transactionId: string,
  isApproved: boolean,
  adminNote?: string,
): Promise<{ message: string }> {
  const params = new URLSearchParams();
  params.set("is_approved", String(isApproved));
  if (adminNote) params.set("admin_note", adminNote);

  return apiPatch<{ message: string }>(
    `/registration/verify/${transactionId}?${params}`,
    {},
  );
}
