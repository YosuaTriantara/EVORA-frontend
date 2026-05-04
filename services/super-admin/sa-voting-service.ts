import { apiGet, apiPost, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { VotePackageSchema, VoteCategorySchema, VoteCandidateSchema } from "@/lib/validation/schemas/voting.schema";

// Vote packages
export type VotePackage = z.infer<typeof VotePackageSchema>;

const VotePackagesListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(VotePackageSchema),
});

/**
 * Get all vote packages (platform-wide)
 * @param params Query parameters (skip, limit)
 * @returns Paginated list of vote packages
 */
export async function getVotePackages(
  params?: { skip?: number; limit?: number }
): Promise<z.infer<typeof VotePackagesListSchema>> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/vote-packages${queryString}`);
  return parseApiResponse(VotePackagesListSchema, data, "getVotePackages");
}

// Create vote package request schema
const CreateVotePackageSchema = z.object({
  name: z.string(),
  points_amount: z.number().min(1),
  price_idr: z.number().min(0),
  is_active: z.boolean().optional(),
});

export type CreateVotePackageRequest = z.infer<typeof CreateVotePackageSchema>;

/**
 * Create a new vote package
 * @param payload Package creation data
 * @returns Created vote package
 */
export async function createVotePackage(payload: CreateVotePackageRequest): Promise<VotePackage> {
  const data = await apiPost<unknown>("/superadmin/vote-packages", payload);
  return parseApiResponse(VotePackageSchema, data, "createVotePackage");
}

// Update vote package request schema
const UpdateVotePackageSchema = z.object({
  name: z.string().optional(),
  points_amount: z.number().min(1).optional(),
  price_idr: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateVotePackageRequest = z.infer<typeof UpdateVotePackageSchema>;

/**
 * Update an existing vote package
 * @param packageId Package ID
 * @param payload Package update data
 * @returns Updated vote package
 */
export async function updateVotePackage(
  packageId: string,
  payload: UpdateVotePackageRequest
): Promise<VotePackage> {
  const data = await apiPatch<unknown>(`/superadmin/vote-packages/${packageId}`, payload);
  return parseApiResponse(VotePackageSchema, data, "updateVotePackage");
}

/**
 * Delete a vote package
 * @param packageId Package ID to delete
 * @returns Success message
 */
export async function deleteVotePackage(packageId: string): Promise<{ message: string }> {
  const { apiDelete } = await import("@/lib/admin-api");
  const data = await apiDelete<unknown>(`/superadmin/vote-packages/${packageId}`);
  return parseApiResponse(z.object({ message: z.string() }), data, "deleteVotePackage");
}

// Vote categories
export type VoteCategory = z.infer<typeof VoteCategorySchema>;

const VoteCategoriesListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(VoteCategorySchema),
});

/**
 * Get vote categories for an event
 * @param eventId Event ID
 * @param params Query parameters (skip, limit)
 * @returns Paginated list of vote categories
 */
export async function getVoteCategories(
  eventId: string,
  params?: { skip?: number; limit?: number }
): Promise<z.infer<typeof VoteCategoriesListSchema>> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/vote-categories${queryString}`);
  return parseApiResponse(VoteCategoriesListSchema, data, "getVoteCategories");
}

// Create vote category request schema
const CreateVoteCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type CreateVoteCategoryRequest = z.infer<typeof CreateVoteCategorySchema>;

/**
 * Create a new vote category for an event
 * @param eventId Event ID
 * @param payload Category creation data
 * @returns Created vote category
 */
export async function createVoteCategory(
  eventId: string,
  payload: CreateVoteCategoryRequest
): Promise<VoteCategory> {
  const data = await apiPost<unknown>(`/superadmin/events/${eventId}/vote-categories`, payload);
  return parseApiResponse(VoteCategorySchema, data, "createVoteCategory");
}

// Update vote category request schema
const UpdateVoteCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateVoteCategoryRequest = z.infer<typeof UpdateVoteCategorySchema>;

/**
 * Update an existing vote category
 * @param categoryId Category ID
 * @param payload Category update data
 * @returns Updated vote category
 */
export async function updateVoteCategory(
  categoryId: string,
  payload: UpdateVoteCategoryRequest
): Promise<VoteCategory> {
  const data = await apiPatch<unknown>(`/superadmin/vote-categories/${categoryId}`, payload);
  return parseApiResponse(VoteCategorySchema, data, "updateVoteCategory");
}

/**
 * Delete a vote category
 * @param categoryId Category ID to delete
 * @returns Success message
 */
export async function deleteVoteCategory(categoryId: string): Promise<{ message: string }> {
  const { apiDelete } = await import("@/lib/admin-api");
  const data = await apiDelete<unknown>(`/superadmin/vote-categories/${categoryId}`);
  return parseApiResponse(z.object({ message: z.string() }), data, "deleteVoteCategory");
}

// Vote candidates
export type VoteCandidate = z.infer<typeof VoteCandidateSchema>;

const VoteCandidatesListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(VoteCandidateSchema),
});

/**
 * Get vote candidates for a category
 * @param categoryId Vote category ID
 * @param params Query parameters (skip, limit)
 * @returns Paginated list of vote candidates
 */
export async function getVoteCandidates(
  categoryId: string,
  params?: { skip?: number; limit?: number }
): Promise<z.infer<typeof VoteCandidatesListSchema>> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/vote-categories/${categoryId}/candidates${queryString}`);
  return parseApiResponse(VoteCandidatesListSchema, data, "getVoteCandidates");
}

// Create vote candidate request schema
const CreateVoteCandidateSchema = z.object({
  team_id: z.string(),
  candidate_name: z.string(),
  image_url: z.string().optional(),
  display_order: z.number().optional(),
});

export type CreateVoteCandidateRequest = z.infer<typeof CreateVoteCandidateSchema>;

/**
 * Create a new vote candidate in a category
 * @param categoryId Vote category ID
 * @param payload Candidate creation data
 * @returns Created vote candidate
 */
export async function createVoteCandidate(
  categoryId: string,
  payload: CreateVoteCandidateRequest
): Promise<VoteCandidate> {
  const data = await apiPost<unknown>(`/superadmin/vote-categories/${categoryId}/candidates`, payload);
  return parseApiResponse(VoteCandidateSchema, data, "createVoteCandidate");
}

// Update vote candidate request schema
const UpdateVoteCandidateSchema = z.object({
  candidate_name: z.string().optional(),
  image_url: z.string().optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateVoteCandidateRequest = z.infer<typeof UpdateVoteCandidateSchema>;

/**
 * Update an existing vote candidate
 * @param candidateId Candidate ID
 * @param payload Candidate update data
 * @returns Updated vote candidate
 */
export async function updateVoteCandidate(
  candidateId: string,
  payload: UpdateVoteCandidateRequest
): Promise<VoteCandidate> {
  const data = await apiPatch<unknown>(`/superadmin/vote-candidates/${candidateId}`, payload);
  return parseApiResponse(VoteCandidateSchema, data, "updateVoteCandidate");
}

/**
 * Delete a vote candidate
 * @param candidateId Candidate ID to delete
 * @returns Success message
 */
export async function deleteVoteCandidate(candidateId: string): Promise<{ message: string }> {
  const { apiDelete } = await import("@/lib/admin-api");
  const data = await apiDelete<unknown>(`/superadmin/vote-candidates/${candidateId}`);
  return parseApiResponse(z.object({ message: z.string() }), data, "deleteVoteCandidate");
}
