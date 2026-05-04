// lib/validation/schemas/user.schema.ts
// Schemas untuk User types berdasarkan types/admin.ts

import { z } from "zod";

// ─────────────────────────────────────────────
// USER ROLE ENUM (dari types/admin.ts)
// ─────────────────────────────────────────────

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "USER",
  "ORGANIZER",
  "JUDGE",
  "TABULATOR",
  "OFFICIAL_TEAM",
]);

// ─────────────────────────────────────────────
// BASE USER SCHEMA
// ─────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
});

// ─────────────────────────────────────────────
// CURRENT USER / AUTH USER (dari types/admin.ts: AuthUser)
// ─────────────────────────────────────────────

export const CurrentUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  role: UserRoleSchema,
  point_balance: z.number().int().nonnegative(),
  is_active: z.boolean(),
});

// ─────────────────────────────────────────────
// USER READ (dari types/admin.ts: UserRead)
// ─────────────────────────────────────────────

export const UserReadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  role: UserRoleSchema,
  point_balance: z.number().int().nonnegative(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// ─────────────────────────────────────────────
// USER SEARCH RESULT (dari types/admin.ts: UserSearchResult)
// ─────────────────────────────────────────────

export const UserSearchResultSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
});
