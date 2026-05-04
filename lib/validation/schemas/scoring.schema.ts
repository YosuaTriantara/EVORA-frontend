import { z } from 'zod';

// Assessment Item Schema
export const AssessmentSchemaItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  display_number: z.number(),
  allowed_values: z.array(z.number()),
});

// Assessment Group Schema
export const AssessmentSchemaGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  sort_order: z.number(),
  items: z.array(AssessmentSchemaItemSchema),
});

// Assessment Section Schema
export const AssessmentSchemaSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  weight_percentage: z.number(),
  sort_order: z.number(),
  groups: z.array(AssessmentSchemaGroupSchema),
});

// Full Assessment Schema Response
export const AssessmentSchemaResponseSchema = z.object({
  category_id: z.string(),
  sections: z.array(AssessmentSchemaSectionSchema),
});

// Score Item Schema
export const ScoreItemSchema = z.object({
  id: z.string(),
  sheet_id: z.string(),
  assessment_item_id: z.string(),
  value: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

// Score Sheet Schema
export const ScoreSheetSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  judge_id: z.string(),
  inputter_id: z.string().nullable(),
  total_score: z.number(),
  is_locked: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

// Score Sheet with Items
export const ScoreSheetWithItemsSchema = ScoreSheetSchema.extend({
  items: z.array(ScoreItemSchema),
});

// Lock Sheet Response
export const LockSheetResponseSchema = z.object({
  sheet_id: z.string(),
  is_locked: z.boolean(),
  message: z.string(),
});

// Ranking Entry Schema
export const RankingEntrySchema = z.object({
  rank: z.number(),
  team_id: z.string(),
  team_name: z.string(),
  lot_number: z.number().nullable(),
  total_score: z.number(),
  judge_count: z.number(),
});

// Rankings Response Schema
export const RankingsResponseSchema = z.object({
  event_id: z.string(),
  category_id: z.string(),
  category_name: z.string(),
  rankings: z.array(RankingEntrySchema),
});

// Submit Score Payload
export const SubmitScorePayloadSchema = z.object({
  team_id: z.string(),
  judge_id: z.string(),
  items: z.array(
    z.object({
      assessment_item_id: z.string(),
      value: z.number(),
    })
  ),
});

// Submit Score Response
export const SubmitScoreResponseSchema = z.object({
  status: z.string(),
  total_score: z.number(),
  sheet_id: z.string(),
});
