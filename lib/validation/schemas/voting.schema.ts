import { z } from 'zod';

// ============================================
// BASE SCHEMAS (Internal/SuperAdmin)
// ============================================

// Vote Category Schema
export const VoteCategorySchema = z.object({
  id: z.string(),
  event_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  target_event_category_id: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  candidate_count: z.number().int().nonnegative().optional(),
});

// Vote Category Read Schema (for API responses)
export const VoteCategoryReadSchema = VoteCategorySchema;

// Vote Candidate Schema
export const VoteCandidateSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  vote_category_id: z.string(),
  team_id: z.string(),
  candidate_name: z.string(),
  image_url: z.string().nullable(),
  display_order: z.number(),
  total_votes: z.number(),
  is_active: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

// Vote Candidate Read Schema (for API responses)
export const VoteCandidateReadSchema = VoteCandidateSchema;

// Vote Package Schema
export const VotePackageSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  name: z.string(),
  points_amount: z.number(),
  price_idr: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

// ============================================
// PUBLIC VOTING SCHEMAS (Phase 6)
// ============================================

// Public Vote Category Schema (for public access)
export const PublicVoteCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  target_event_category_id: z.string().uuid().nullable(),
  is_active: z.boolean(),
  candidate_count: z.number().int().nonnegative(),
  total_votes_cast: z.number().int().nonnegative(),
});

// Public Vote Categories Response Schema
export const PublicVoteCategoriesResponseSchema = z.object({
  event_id: z.string().uuid(),
  categories: z.array(PublicVoteCategorySchema),
});

// Public Vote Candidate Schema (for public access)
export const PublicVoteCandidateSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  candidate_name: z.string(),
  image_url: z.string().url().nullable(),
  display_order: z.number().int(),
  total_votes: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  last_vote_at: z.string().datetime().nullable(),
});

// Public Vote Candidates Response Schema
export const PublicVoteCandidatesResponseSchema = z.object({
  category_id: z.string().uuid(),
  candidates: z.array(PublicVoteCandidateSchema),
  total_votes_in_category: z.number().int().nonnegative(),
  last_updated: z.string().datetime(),
});

// ============================================
// USER VOTING SCHEMAS
// ============================================

// User Vote Balance Schema (Basic)
export const UserVoteBalanceSchema = z.object({
  user_id: z.string(),
  event_id: z.string(),
  point_balance: z.number(),
});

// User Vote Balance Detail Schema (Phase 6 - Extended)
export const UserVoteBalanceDetailSchema = z.object({
  user_id: z.string().uuid(),
  event_id: z.string().uuid(),
  point_balance: z.number().int().nonnegative(),
  total_points_purchased: z.number().int().nonnegative(),
  total_points_spent: z.number().int().nonnegative(),
  last_purchase_at: z.string().datetime().nullable(),
  expires_at: z.string().datetime().nullable(),
});

// Vote History Entry Schema
export const VoteHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  candidate_name: z.string(),
  category_name: z.string(),
  points: z.number().int().positive(),
  created_at: z.string().datetime(),
  event_id: z.string().uuid(),
});

// Vote History Response Schema
export const VoteHistoryResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  data: z.array(VoteHistoryEntrySchema),
});

// ============================================
// CAST VOTE SCHEMAS
// ============================================

// Legacy Cast Vote Response Schema (backward compatibility)
export const CastVoteResponseSchema = z.object({
  message: z.string(),
  remaining_points: z.number(),
});

// Detailed Cast Vote Response Schema (Phase 6)
export const CastVoteDetailedResponseSchema = z.object({
  message: z.string(),
  vote_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  points_deducted: z.number().int().positive(),
  remaining_balance: z.number().int().nonnegative(),
  new_total_votes: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});

// Cast Vote Request Schema
export const CastVoteRequestSchema = z.object({
  candidate_id: z.string().uuid(),
  points: z.number().int().positive(),
  event_id: z.string().uuid(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type VoteCategory = z.infer<typeof VoteCategorySchema>;
export type VoteCandidate = z.infer<typeof VoteCandidateSchema>;
export type VotePackage = z.infer<typeof VotePackageSchema>;

// Public Voting Types
export type PublicVoteCategory = z.infer<typeof PublicVoteCategorySchema>;
export type PublicVoteCategoriesResponse = z.infer<typeof PublicVoteCategoriesResponseSchema>;
export type PublicVoteCandidate = z.infer<typeof PublicVoteCandidateSchema>;
export type PublicVoteCandidatesResponse = z.infer<typeof PublicVoteCandidatesResponseSchema>;

// User Voting Types
export type UserVoteBalance = z.infer<typeof UserVoteBalanceSchema>;
export type UserVoteBalanceDetail = z.infer<typeof UserVoteBalanceDetailSchema>;
export type VoteHistoryEntry = z.infer<typeof VoteHistoryEntrySchema>;
export type VoteHistoryResponse = z.infer<typeof VoteHistoryResponseSchema>;

// Cast Vote Types
export type CastVoteResponse = z.infer<typeof CastVoteResponseSchema>;
export type CastVoteDetailedResponse = z.infer<typeof CastVoteDetailedResponseSchema>;
export type CastVoteRequest = z.infer<typeof CastVoteRequestSchema>;
