// lib/validation/types/inferred.types.ts
// Inferred types dari Zod schemas — gunakan sebagai pengganti interface di types/

import { z } from "zod";
import {
  CategoryReadSchema,
  EventPreviewSchema,
  EventReadFullSchema,
  EventReadFullPartialSchema,
} from "../schemas/event.schema";
import {
  UserRoleSchema,
  UserSchema,
  CurrentUserSchema,
  UserReadSchema,
  UserSearchResultSchema,
} from "../schemas/user.schema";
import {
  PaginationMetaSchema,
  ApiResponseSchema,
  PaginatedResponseSchema,
  LegacyPaginatedResponseSchema,
} from "../schemas/api-response.schema";
import {
  TeamReadFullSchema,
  TeamMemberReadSchema,
  PaginatedTeamsResponseSchema,
} from "../schemas/team.schema";
import {
  AssessmentSchemaItemSchema,
  AssessmentSchemaGroupSchema,
  AssessmentSchemaSectionSchema,
  AssessmentSchemaResponseSchema,
  ScoreItemSchema,
  ScoreSheetSchema,
  ScoreSheetWithItemsSchema,
  LockSheetResponseSchema,
  RankingEntrySchema,
  RankingsResponseSchema,
  SubmitScorePayloadSchema,
  SubmitScoreResponseSchema,
} from "../schemas/scoring.schema";
import {
  VoteCategorySchema,
  VoteCandidateSchema,
  VotePackageSchema,
  CastVoteResponseSchema,
  UserVoteBalanceSchema,
  VoteHistoryEntrySchema,
} from "../schemas/voting.schema";

// ─────────────────────────────────────────────
// EVENT TYPES (inferred from schemas)
// ─────────────────────────────────────────────

// Inferred from CategoryReadSchema — gunakan ini sebagai pengganti
// interface CategoryRead di types/admin.ts
export type CategoryRead = z.infer<typeof CategoryReadSchema>;

// Inferred from EventPreviewSchema — gunakan ini sebagai pengganti
// interface EventPreview di types/event.ts
export type EventPreview = z.infer<typeof EventPreviewSchema>;

// Inferred from EventReadFullSchema — gunakan ini sebagai pengganti
// interface EventReadFull di types/admin.ts
export type EventReadFull = z.infer<typeof EventReadFullSchema>;

// Inferred from EventReadFullPartialSchema — untuk PATCH operations
export type EventReadFullPartial = z.infer<typeof EventReadFullPartialSchema>;

// ─────────────────────────────────────────────
// USER TYPES (inferred from schemas)
// ─────────────────────────────────────────────

// Inferred from UserRoleSchema — gunakan ini sebagai pengganti
// type UserRole di types/admin.ts
export type UserRole = z.infer<typeof UserRoleSchema>;

// Inferred from UserSchema — gunakan ini sebagai pengganti
// interface User di types/index.ts
export type User = z.infer<typeof UserSchema>;

// Inferred from CurrentUserSchema — gunakan ini sebagai pengganti
// interface AuthUser di types/admin.ts
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

// Inferred from UserReadSchema — gunakan ini sebagai pengganti
// interface UserRead di types/admin.ts
export type UserRead = z.infer<typeof UserReadSchema>;

// Inferred from UserSearchResultSchema — gunakan ini sebagai pengganti
// interface UserSearchResult di types/admin.ts
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;

// ─────────────────────────────────────────────
// API RESPONSE TYPES (inferred from schemas)
// ─────────────────────────────────────────────

// Inferred from PaginationMetaSchema
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// Helper type untuk ApiResponseSchema<T>
// Usage: ApiResponse<typeof EventReadFullSchema>
export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof ApiResponseSchema<T>>
>;

// Helper type untuk PaginatedResponseSchema<T>
// Usage: PaginatedResponse<typeof EventReadFullSchema>
export type PaginatedResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<T>>
>;

// Helper type untuk LegacyPaginatedResponseSchema<T>
// Usage: LegacyPaginatedResponse<typeof EventReadFullSchema>
export type LegacyPaginatedResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof LegacyPaginatedResponseSchema<T>>
>;

// ─────────────────────────────────────────────
// TEAM TYPES (inferred from schemas)
// ─────────────────────────────────────────────

export type TeamReadFull = z.infer<typeof TeamReadFullSchema>;
export type TeamMember = z.infer<typeof TeamMemberReadSchema>;
export type PaginatedTeams = z.infer<typeof PaginatedTeamsResponseSchema>;

// ─────────────────────────────────────────────
// SCORING TYPES (inferred from schemas)
// ─────────────────────────────────────────────

export type AssessmentItem = z.infer<typeof AssessmentSchemaItemSchema>;
export type AssessmentGroup = z.infer<typeof AssessmentSchemaGroupSchema>;
export type AssessmentSection = z.infer<typeof AssessmentSchemaSectionSchema>;
export type AssessmentSchemaResponse = z.infer<typeof AssessmentSchemaResponseSchema>;
export type ScoreItem = z.infer<typeof ScoreItemSchema>;
export type ScoreSheet = z.infer<typeof ScoreSheetSchema>;
export type ScoreSheetWithItems = z.infer<typeof ScoreSheetWithItemsSchema>;
export type LockSheetResponse = z.infer<typeof LockSheetResponseSchema>;
export type RankingEntry = z.infer<typeof RankingEntrySchema>;
export type RankingsResponse = z.infer<typeof RankingsResponseSchema>;
export type SubmitScorePayload = z.infer<typeof SubmitScorePayloadSchema>;
export type SubmitScoreResponse = z.infer<typeof SubmitScoreResponseSchema>;

// ─────────────────────────────────────────────
// VOTING TYPES (inferred from schemas)
// ─────────────────────────────────────────────

export type VoteCategory = z.infer<typeof VoteCategorySchema>;
export type VoteCandidate = z.infer<typeof VoteCandidateSchema>;
export type VotePackage = z.infer<typeof VotePackageSchema>;
export type CastVoteResponse = z.infer<typeof CastVoteResponseSchema>;
export type UserVoteBalance = z.infer<typeof UserVoteBalanceSchema>;
export type VoteHistoryEntry = z.infer<typeof VoteHistoryEntrySchema>;
