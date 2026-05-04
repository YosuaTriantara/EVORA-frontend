// services/voting-service.ts
// Voting service — uses real API.
// GET data comes from public event endpoint (server-side).
// POST /voting/cast is client-side via BFF proxy.

import { apiGet } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import {
  PublicVoteCategoriesResponseSchema,
  PublicVoteCandidatesResponseSchema,
  UserVoteBalanceDetailSchema,
  VoteHistoryResponseSchema,
  CastVoteDetailedResponseSchema,
  type PublicVoteCategory,
  type PublicVoteCandidate,
  type UserVoteBalanceDetail,
  type VoteHistoryEntry,
  type CastVoteDetailedResponse,
} from "@/lib/validation/schemas/voting.schema";

export interface CastVotePayload {
  team_id: string;
  points: number;
}

export interface CastVoteResponse {
  message: string;
  remaining_points: number;
}

// ============================================
// PUBLIC VOTING ENDPOINTS (Phase 6)
// ============================================

/**
 * Get public vote categories for an event
 * GET /api/v1/events/{event_id}/vote-categories
 * 
 * Backend: Endpoint #2 (CRITICAL)
 * Auth: Optional (public access)
 */
export async function getPublicVoteCategories(eventId: string): Promise<{
  event_id: string;
  categories: PublicVoteCategory[];
}> {
  const data = await apiGet<unknown>(`/events/${eventId}/vote-categories`);
  return parseApiResponse(PublicVoteCategoriesResponseSchema, data, "getPublicVoteCategories");
}

/**
 * Get public candidates for a category
 * GET /api/v1/vote-categories/{category_id}/candidates
 * 
 * Backend: Endpoint #3 (CRITICAL)
 * Auth: Optional (public access)
 */
export async function getPublicVoteCandidates(categoryId: string): Promise<{
  category_id: string;
  candidates: PublicVoteCandidate[];
  total_votes_in_category: number;
  last_updated: string;
}> {
  const data = await apiGet<unknown>(`/vote-categories/${categoryId}/candidates`);
  return parseApiResponse(PublicVoteCandidatesResponseSchema, data, "getPublicVoteCandidates");
}

/**
 * Get user's vote balance for an event
 * GET /api/v1/users/me/vote-balance?event_id={event_id}
 * 
 * Backend: Endpoint #5 (CRITICAL)
 * Auth: Required
 */
export async function getUserVoteBalance(eventId: string): Promise<UserVoteBalanceDetail> {
  const data = await apiGet<unknown>(`/users/me/vote-balance?event_id=${eventId}`);
  return parseApiResponse(UserVoteBalanceDetailSchema, data, "getUserVoteBalance");
}

/**
 * Get user's vote history
 * GET /api/v1/users/me/vote-history?event_id={event_id}
 * 
 * Backend: Endpoint #6 (CRITICAL)
 * Auth: Required
 */
export async function getUserVoteHistory(
  eventId: string,
  skip = 0,
  limit = 20
): Promise<{
  total: number;
  skip: number;
  limit: number;
  data: VoteHistoryEntry[];
}> {
  const data = await apiGet<unknown>(
    `/users/me/vote-history?event_id=${eventId}&skip=${skip}&limit=${limit}`
  );
  return parseApiResponse(VoteHistoryResponseSchema, data, "getUserVoteHistory");
}

// ============================================
// CAST VOTE (Legacy & New)
// ============================================

/**
 * Cast votes for a team (Legacy - backward compatible)
 * Called from client components — uses BFF proxy (reads HttpOnly cookie).
 * Query params: team_id, points
 */
export async function castVote(
  teamId: string,
  points: number,
): Promise<CastVoteResponse> {
  const res = await fetch(
    `/api/proxy/voting/cast?team_id=${encodeURIComponent(teamId)}&points=${points}`,
    {
      method: "POST",
    },
  );

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Voting gagal. Silakan coba lagi.";
    throw new Error(detail);
  }

  return data as CastVoteResponse;
}

/**
 * Cast a vote with detailed response (Phase 6)
 * POST /api/vote/cast (BFF) → POST /api/v1/votes/cast (Backend)
 * 
 * Backend: Endpoint #4 (CRITICAL)
 * Security: Idempotency key di-generate server-side, rate limiting 5/min
 * 
 * NOTE: Tidak menggunakan "use server" karena perlu custom header.
 * Gunakan API Route BFF untuk generate idempotency key server-side.
 */
export async function castVoteDetailed(
  candidateId: string,
  points: number,
  eventId: string,
  idempotencyKey: string
): Promise<CastVoteDetailedResponse> {
  const response = await fetch("/api/vote/cast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      points,
      event_id: eventId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Gagal mengirim vote");
  }

  const data = await response.json();
  return parseApiResponse(CastVoteDetailedResponseSchema, data, "castVoteDetailed");
}
