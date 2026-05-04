import { apiGet, apiPost } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import {
  ScoreSheetSchema,
  RankingEntrySchema,
  AssessmentSchemaResponseSchema,
} from "@/lib/validation/schemas/scoring.schema";

// Score sheets
export type ScoreSheet = z.infer<typeof ScoreSheetSchema>;

const ScoreSheetsListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(ScoreSheetSchema),
});

export type ScoreSheetsList = z.infer<typeof ScoreSheetsListSchema>;

/**
 * Get all score sheets for an event
 * @param eventId Event ID
 * @param params Query parameters (skip, limit, category_id, team_id, judge_id)
 * @returns Paginated list of score sheets
 */
export async function getEventScoresheets(
  eventId: string,
  params?: {
    skip?: number;
    limit?: number;
    category_id?: string;
    team_id?: string;
    judge_id?: string;
  }
): Promise<ScoreSheetsList> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.category_id) query.set("category_id", params.category_id);
  if (params?.team_id) query.set("team_id", params.team_id);
  if (params?.judge_id) query.set("judge_id", params.judge_id);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/scoresheets${queryString}`);
  return parseApiResponse(ScoreSheetsListSchema, data, "getEventScoresheets");
}

// Team scores response schema
const TeamScoresSchema = z.object({
  team_id: z.string(),
  team_name: z.string(),
  category_id: z.string(),
  category_name: z.string(),
  total_score: z.number(),
  rank: z.number(),
  scoresheets: z.array(ScoreSheetSchema),
});

export type TeamScores = z.infer<typeof TeamScoresSchema>;

/**
 * Get detailed scores for a specific team
 * @param eventId Event ID
 * @param teamId Team ID
 * @returns Team scores with all judge scoresheets
 */
export async function getTeamScores(eventId: string, teamId: string): Promise<TeamScores> {
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/teams/${teamId}/scores`);
  return parseApiResponse(TeamScoresSchema, data, "getTeamScores");
}

/**
 * Lock a score sheet (prevent further edits)
 * @param scoresheetId Score sheet ID to lock
 * @returns Updated score sheet
 */
export async function lockScoresheet(scoresheetId: string): Promise<ScoreSheet> {
  const data = await apiPost<unknown>(`/superadmin/scoresheets/${scoresheetId}/lock`, {});
  return parseApiResponse(ScoreSheetSchema, data, "lockScoresheet");
}

/**
 * Unlock a score sheet (allow edits)
 * @param scoresheetId Score sheet ID to unlock
 * @returns Updated score sheet
 */
export async function unlockScoresheet(scoresheetId: string): Promise<ScoreSheet> {
  const { apiPatch } = await import("@/lib/admin-api");
  const data = await apiPatch<unknown>(`/superadmin/scoresheets/${scoresheetId}/unlock`, {});
  return parseApiResponse(ScoreSheetSchema, data, "unlockScoresheet");
}

// Rankings
export type RankingEntry = z.infer<typeof RankingEntrySchema>;

const RankingsListSchema = z.object({
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
  data: z.array(RankingEntrySchema),
});

export type RankingsList = z.infer<typeof RankingsListSchema>;

/**
 * Get rankings for an event/category
 * SUPER_ADMIN endpoint: GET /superadmin/events/{event_id}/categories/{category_id}/rankings
 * @param eventId Event ID
 * @param categoryId Category ID (required)
 * @returns Rankings list with event and category info
 */
export async function getRankings(
  eventId: string,
  categoryId: string
): Promise<{
  event_id: string;
  category_id: string;
  category_name: string;
  rankings: RankingEntry[];
}> {
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/categories/${categoryId}/rankings`);
  return parseApiResponse(
    z.object({
      event_id: z.string(),
      category_id: z.string(),
      category_name: z.string(),
      rankings: z.array(RankingEntrySchema),
    }),
    data,
    "getRankings"
  );
}

// Assessment schema
export type AssessmentSchemaResponse = z.infer<typeof AssessmentSchemaResponseSchema>;

/**
 * Get assessment schema for a category
 * @param categoryId Category ID
 * @returns Assessment schema with sections, groups, and items
 * 
 * NOTE: This endpoint is used by SUPER_ADMIN only.
 * For JUDGE/TABULATOR roles, use the event-scoped endpoint in event-management/scoring-service.ts
 */
export async function getCategorySchema(categoryId: string): Promise<AssessmentSchemaResponse> {
  const data = await apiGet<unknown>(`/superadmin/categories/${categoryId}/schema`);
  return parseApiResponse(AssessmentSchemaResponseSchema, data, "getCategorySchema");
}

/**
 * Get assessment schema for a category (event-scoped version for judges)
 * This uses the non-superadmin endpoint that requires event-scoped permissions
 * @param eventId Event ID
 * @param categoryId Category ID
 * @returns Assessment schema with sections, groups, and items
 */
export async function getCategorySchemaForEvent(
  eventId: string,
  categoryId: string
): Promise<AssessmentSchemaResponse> {
  const data = await apiGet<unknown>(`/events/${eventId}/categories/${categoryId}/schema`);
  return parseApiResponse(AssessmentSchemaResponseSchema, data, "getCategorySchemaForEvent");
}

// Upload schema request schema
const UploadSchemaRequestSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      weight_percentage: z.number(),
      groups: z.array(
        z.object({
          title: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              display_number: z.string(),
              allowed_values: z.array(z.number()),
            })
          ),
        })
      ),
    })
  ),
});

export type UploadSchemaRequest = z.infer<typeof UploadSchemaRequestSchema>;

/**
 * Upload/update assessment schema for a category
 * @param categoryId Category ID
 * @param payload Schema definition
 * @returns Updated category with schema
 */
export async function uploadCategorySchema(
  categoryId: string,
  payload: UploadSchemaRequest
): Promise<z.infer<typeof AssessmentSchemaResponseSchema>> {
  const data = await apiPost<unknown>(`/superadmin/categories/${categoryId}/schema`, payload);
  return parseApiResponse(AssessmentSchemaResponseSchema, data, "uploadCategorySchema");
}
