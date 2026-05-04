/**
 * Team Schema Definitions
 *
 * Zod schemas for team-related API responses.
 * Based on types/admin.ts Team interfaces.
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const TeamStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "PENDING_VERIFICATION",
  "REGISTERED",
  "CANCELLED",
  "DISQUALIFIED",
  "REJECTED",
]);

// ─────────────────────────────────────────────
// BASE SCHEMAS
// ─────────────────────────────────────────────

// NOTE: Schema must match types/admin.ts TeamMemberRead exactly
// identity_number and extra_data are nullable (not optional)
// Fields made optional with defaults for backward compatibility with API responses
export const TeamMemberReadSchema = z.object({
  id: z.string().uuid().optional().default(""),
  team_id: z.string().uuid().optional().default(""),
  name: z.string().optional().default(""),
  role: z.string().optional().default(""),
  identity_number: z.string().nullable().optional().default(null),
  extra_data: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      institution: z.string().optional(),
    })
    .nullable()
    .optional()
    .default(null),
  created_at: z.string().optional().default(""),
  updated_at: z.string().nullable().optional().default(null),
});

export const TeamReadFullSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string(),
  status: TeamStatusSchema,
  lot_number: z.number().int().positive().nullable(),
  official_user_id: z.string().uuid(),
  members: z.array(TeamMemberReadSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

// MyTeam schema - simplified team info for "my teams" endpoint
// NOTE: Field-field berikut ditambahkan karena digunakan di OfficialTeamView
// dan sesuai dengan types/event.ts MyTeam interface
// 
// IMPORTANT: Schema harus cocok dengan types/event.ts MyTeam interface
// institution: string | undefined (bukan null)
// admin_note: string | null
//
// NOTE: Semua field dibuat optional dengan default untuk backward compatibility
// dengan API yang mungkin tidak mengembalikan semua field
export const MyTeamSchema = z.object({
  id: z.string().optional().default(""),
  event_id: z.string().optional().default(""),
  event_name: z.string().optional().default(""),
  category_id: z.string().optional().default(""),
  category_name: z.string().optional().default(""),
  name: z.string().optional().default(""),
  status: TeamStatusSchema.optional().default("PENDING_PAYMENT"),
  lot_number: z.number().int().nonnegative().nullable().optional().default(null),
  institution: z.string().optional(),
  admin_note: z.string().nullable().optional(),
});

// ─────────────────────────────────────────────
// PAYLOAD SCHEMAS
// ─────────────────────────────────────────────

export const UpdateTeamStatusPayloadSchema = z.object({
  status: TeamStatusSchema,
});

export const UpdateTeamLotPayloadSchema = z.object({
  lot_number: z.number().int().positive(),
});

export const AddMemberPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  identity_number: z.string().optional(),
  extra_data: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      institution: z.string().optional(),
    })
    .optional(),
});

export const UpdateMemberPayloadSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  identity_number: z.string().optional(),
  extra_data: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      institution: z.string().optional(),
    })
    .optional(),
});

// ─────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────

export const UpdateTeamStatusResponseSchema = z.object({
  message: z.string(),
  team_id: z.string().uuid(),
  new_status: TeamStatusSchema,
});

export const UpdateTeamLotResponseSchema = z.object({
  message: z.string(),
  team_id: z.string().uuid(),
  lot_number: z.number().int().positive(),
});

export const DeleteTeamResponseSchema = z.object({
  message: z.string(),
  team_id: z.string().uuid(),
});

export const DeleteMemberResponseSchema = z.object({
  message: z.string(),
  member_id: z.string().uuid(),
});

// ─────────────────────────────────────────────
// PAGINATION SCHEMAS
// ─────────────────────────────────────────────

export const PaginatedTeamsResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  data: z.array(TeamReadFullSchema),
});

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type TeamStatus = z.infer<typeof TeamStatusSchema>;
export type TeamMemberRead = z.infer<typeof TeamMemberReadSchema>;
export type TeamReadFull = z.infer<typeof TeamReadFullSchema>;
export type MyTeam = z.infer<typeof MyTeamSchema>;
export type UpdateTeamStatusPayload = z.infer<typeof UpdateTeamStatusPayloadSchema>;
export type UpdateTeamLotPayload = z.infer<typeof UpdateTeamLotPayloadSchema>;
export type AddMemberPayload = z.infer<typeof AddMemberPayloadSchema>;
export type UpdateMemberPayload = z.infer<typeof UpdateMemberPayloadSchema>;
