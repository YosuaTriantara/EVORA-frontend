/**
 * Event Management - Voting Service
 * 
 * Handles voting management operations for ORGANIZER role.
 * Includes: vote categories, vote candidates management.
 * 
 * @module services/event-management/voting-service
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import {
  VoteCategoryReadSchema,
  VoteCandidateReadSchema,
} from "@/lib/validation/schemas/voting.schema";
import {
  VoteCategoryRead,
  VoteCandidateRead,
  CreateVoteCategoryPayload,
  UpdateVoteCategoryPayload,
  CreateVoteCandidatePayload,
  UpdateVoteCandidatePayload,
} from "@/types/admin";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// VOTE CATEGORIES
// ═══════════════════════════════════════════════════════════

/**
 * Get all vote categories for an event
 * @param eventId - Event ID
 * @returns Array of vote categories
 */
export async function getVoteCategories(eventId: string): Promise<VoteCategoryRead[]> {
  const data = await apiGet<unknown>(`/events/${eventId}/voting/categories`);
  return parseApiResponse(z.array(VoteCategoryReadSchema), data, "getVoteCategories");
}

/**
 * Create a new vote category for an event
 * @param eventId - Event ID
 * @param payload - Vote category data
 * @returns Created vote category
 */
export async function createVoteCategory(
  eventId: string,
  payload: CreateVoteCategoryPayload
): Promise<VoteCategoryRead> {
  const data = await apiPost<unknown>(`/events/${eventId}/voting/categories`, payload);
  return parseApiResponse(VoteCategoryReadSchema, data, "createVoteCategory");
}

/**
 * Update a vote category
 * @param voteCategoryId - Vote category ID
 * @param payload - Partial update data
 * @returns Updated vote category
 */
export async function updateVoteCategory(
  voteCategoryId: string,
  payload: UpdateVoteCategoryPayload
): Promise<VoteCategoryRead> {
  const data = await apiPatch<unknown>(`/events/voting/categories/${voteCategoryId}`, payload);
  return parseApiResponse(VoteCategoryReadSchema, data, "updateVoteCategory");
}

/**
 * Delete a vote category
 * @param voteCategoryId - Vote category ID
 * @returns Success message
 */
export async function deleteVoteCategory(voteCategoryId: string): Promise<{ message: string; vote_category_id: string }> {
  return apiDelete<{ message: string; vote_category_id: string }>(
    `/events/voting/categories/${voteCategoryId}`
  );
}

// ═══════════════════════════════════════════════════════════
// VOTE CANDIDATES
// ═══════════════════════════════════════════════════════════

/**
 * Get all vote candidates for a category
 * @param voteCategoryId - Vote category ID
 * @returns Array of vote candidates
 */
export async function getVoteCandidates(voteCategoryId: string): Promise<VoteCandidateRead[]> {
  const data = await apiGet<unknown>(`/events/voting/categories/${voteCategoryId}/candidates`);
  return parseApiResponse(z.array(VoteCandidateReadSchema), data, "getVoteCandidates");
}

/**
 * Create a new vote candidate for an event
 * @param eventId - Event ID
 * @param payload - Vote candidate data
 * @returns Created vote candidate
 */
export async function createVoteCandidate(
  eventId: string,
  payload: CreateVoteCandidatePayload
): Promise<VoteCandidateRead> {
  const data = await apiPost<unknown>(`/events/${eventId}/voting/candidates`, payload);
  return parseApiResponse(VoteCandidateReadSchema, data, "createVoteCandidate");
}

/**
 * Update a vote candidate
 * @param candidateId - Candidate ID
 * @param payload - Partial update data
 * @returns Updated vote candidate
 */
export async function updateVoteCandidate(
  candidateId: string,
  payload: UpdateVoteCandidatePayload
): Promise<VoteCandidateRead> {
  const data = await apiPatch<unknown>(`/events/voting/candidates/${candidateId}`, payload);
  return parseApiResponse(VoteCandidateReadSchema, data, "updateVoteCandidate");
}

/**
 * Delete a vote candidate
 * @param candidateId - Candidate ID
 * @returns Success message
 */
export async function deleteVoteCandidate(candidateId: string): Promise<{ message: string; candidate_id: string }> {
  return apiDelete<{ message: string; candidate_id: string }>(
    `/events/voting/candidates/${candidateId}`
  );
}
