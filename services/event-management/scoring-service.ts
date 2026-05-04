// services/event-management/scoring-service.ts
// Event-scoped scoring operations for ORGANIZER, JUDGE, TABULATOR roles

import { apiGet, apiPost, apiPatch } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import {
  AssessmentSchema,
  LockSheetResponse,
  RankingsResponse,
} from "@/types/admin";

// Assessment Schema Schemas
const AssessmentItemSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  display_number: z.number(),
  allowed_values: z.array(z.number()),
});

const AssessmentGroupSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  sort_order: z.number(),
  items: z.array(AssessmentItemSchema),
});

const AssessmentSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  weight_percentage: z.number(),
  sort_order: z.number(),
  groups: z.array(AssessmentGroupSchema),
});

const AssessmentSchemaResponseSchema = z.object({
  category_id: z.string(),
  sections: z.array(AssessmentSectionSchema),
});

// Score Sheet Schemas
const ScoreItemSchema = z.object({
  id: z.string(),
  sheet_id: z.string(),
  assessment_item_id: z.string(),
  value: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

const ScoreSheetSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  judge_id: z.string(),
  inputter_id: z.string().nullable(),
  total_score: z.number(),
  is_locked: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

const ScoreSheetWithItemsSchema = ScoreSheetSchema.extend({
  items: z.array(ScoreItemSchema),
});

const LockSheetResponseSchema = z.object({
  sheet_id: z.string(),
  is_locked: z.boolean(),
  message: z.string(),
});

// Ranking Schemas
const RankingEntrySchema = z.object({
  rank: z.number(),
  team_id: z.string(),
  team_name: z.string(),
  lot_number: z.number().nullable(),
  total_score: z.number(),
  judge_count: z.number(),
});

const RankingsResponseSchema = z.object({
  event_id: z.string(),
  category_id: z.string(),
  category_name: z.string(),
  rankings: z.array(RankingEntrySchema),
});

// Export types for UI components
export type ScoreItem = z.infer<typeof ScoreItemSchema>;
export type ScoreSheet = z.infer<typeof ScoreSheetSchema>;
export type ScoreSheetWithItems = z.infer<typeof ScoreSheetWithItemsSchema>;
export type AssessmentSchemaSection = z.infer<typeof AssessmentSectionSchema>;
export type AssessmentSchemaGroup = z.infer<typeof AssessmentGroupSchema>;
export type AssessmentSchemaItem = z.infer<typeof AssessmentItemSchema>;

// Submit Score Payload
export interface SubmitScoreItem {
  item_id: string;
  val: number;
}

export interface SubmitScorePayload {
  team_id: string;
  judge_id: string;
  items: SubmitScoreItem[];
}

export interface SubmitScoreResponse {
  status: string;
  total_score: number;
  sheet_id: string;
}

const SubmitScoreResponseSchema = z.object({
  status: z.string(),
  total_score: z.number(),
  sheet_id: z.string(),
});

/**
 * Get assessment schema for a category
 * JUDGE/TABULATOR role required
 * 
 * Uses event-scoped endpoint as per API specification
 * GET /categories/{category_id}/schema
 */
export async function getCategorySchema(
  categoryId: string
): Promise<AssessmentSchema> {
  const data = await apiGet<unknown>(
    `/categories/${categoryId}/schema`
  );
  return parseApiResponse(
    AssessmentSchemaResponseSchema,
    data,
    "getCategorySchema"
  );
}

/**
 * Submit scores for a team
 * JUDGE/TABULATOR role required
 */
export async function submitScore(
  payload: SubmitScorePayload
): Promise<SubmitScoreResponse> {
  const data = await apiPost<unknown>("/scoring/submit", payload);
  return parseApiResponse(
    SubmitScoreResponseSchema,
    data,
    "submitScore"
  );
}

/**
 * Get all score sheets for an event
 * ORGANIZER/TABULATOR role required
 * 
 * Uses event-scoped endpoint as per API specification
 * GET /events/{event_id}/scoresheets
 */
export async function getEventScoresheets(
  eventId: string,
  categoryId?: string
): Promise<ScoreSheet[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append("category_id", categoryId);
  const query = params.toString() ? `?${params.toString()}` : "";
  
  const data = await apiGet<unknown>(
    `/events/${eventId}/scoresheets${query}`
  );
  return parseApiResponse(
    z.array(ScoreSheetSchema),
    data,
    "getEventScoresheets"
  );
}

/**
 * Get all score sheets for a specific team
 * ORGANIZER/TABULATOR role required
 * 
 * Uses event-scoped endpoint as per API specification
 * GET /registration/{team_id}/scores (via team management)
 */
export async function getTeamScores(
  teamId: string
): Promise<ScoreSheetWithItems[]> {
  const data = await apiGet<unknown>(`/registration/${teamId}/scores`);
  return parseApiResponse(
    z.array(ScoreSheetWithItemsSchema),
    data,
    "getTeamScores"
  );
}

/**
 * Lock a score sheet to prevent further modifications
 * TABULATOR role required
 * 
 * Uses non-superadmin endpoint as per API specification
 * PATCH /scoring/sheets/{sheet_id}/lock
 */
export async function lockScoresheet(
  sheetId: string
): Promise<LockSheetResponse> {
  const data = await apiPatch<unknown>(
    `/scoring/sheets/${sheetId}/lock`,
    {}
  );
  return parseApiResponse(
    LockSheetResponseSchema,
    data,
    "lockScoresheet"
  );
}

/**
 * Unlock a score sheet to allow modifications
 * TABULATOR role required
 * 
 * Uses non-superadmin endpoint as per API specification
 * PATCH /scoring/sheets/{sheet_id}/unlock
 */
export async function unlockScoresheet(
  sheetId: string
): Promise<LockSheetResponse> {
  const data = await apiPatch<unknown>(
    `/scoring/sheets/${sheetId}/unlock`,
    {}
  );
  return parseApiResponse(
    LockSheetResponseSchema,
    data,
    "unlockScoresheet"
  );
}

/**
 * Get rankings for a category
 * ORGANIZER/JUDGE/TABULATOR role required
 * 
 * Uses non-superadmin endpoint as per API specification
 * GET /scoring/rankings?event_id={event_id}&category_id={category_id}
 */
export async function getRankings(
  eventId: string,
  categoryId: string
): Promise<RankingsResponse> {
  const data = await apiGet<unknown>(
    `/scoring/rankings?event_id=${eventId}&category_id=${categoryId}`
  );
  return parseApiResponse(
    RankingsResponseSchema,
    data,
    "getRankings"
  );
}
