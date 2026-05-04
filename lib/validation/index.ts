// lib/validation/index.ts
// Centralized exports untuk semua Zod schemas dan inferred types

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

export { parseApiResponse } from "./parse-api-response";
export {
  validateUploadFile,
  type FileValidationOptions,
  type FileValidationResult,
} from "./file-validation";

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

export {
  PaginationMetaSchema,
  ApiResponseSchema,
  PaginatedResponseSchema,
  LegacyPaginatedResponseSchema,
} from "./schemas/api-response.schema";

export {
  CategoryReadSchema,
  EventPreviewSchema,
  EventReadFullSchema,
  EventReadFullPartialSchema,
} from "./schemas/event.schema";

export {
  UserRoleSchema,
  UserSchema,
  CurrentUserSchema,
  UserReadSchema,
  UserSearchResultSchema,
} from "./schemas/user.schema";

export {
  TeamReadFullSchema,
  TeamMemberReadSchema,
  PaginatedTeamsResponseSchema,
} from "./schemas/team.schema";

export {
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
} from "./schemas/scoring.schema";

export {
  VoteCategorySchema,
  VoteCandidateSchema,
  VotePackageSchema,
  CastVoteResponseSchema,
  UserVoteBalanceSchema,
  VoteHistoryEntrySchema,
} from "./schemas/voting.schema";

// ─────────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────────

export type {
  // Event types
  CategoryRead,
  EventPreview,
  EventReadFull,
  EventReadFullPartial,
  // User types
  UserRole,
  User,
  CurrentUser,
  UserRead,
  UserSearchResult,
  // Team types
  TeamReadFull,
  TeamMember,
  PaginatedTeams,
  // Scoring types
  AssessmentItem,
  AssessmentGroup,
  AssessmentSection,
  AssessmentSchemaResponse,
  ScoreItem,
  ScoreSheet,
  ScoreSheetWithItems,
  LockSheetResponse,
  RankingEntry,
  RankingsResponse,
  SubmitScorePayload,
  SubmitScoreResponse,
  // Voting types
  VoteCategory,
  VoteCandidate,
  VotePackage,
  CastVoteResponse,
  UserVoteBalance,
  VoteHistoryEntry,
  // API response types
  PaginationMeta,
  ApiResponse,
  PaginatedResponse,
  LegacyPaginatedResponse,
} from "./types/inferred.types";
