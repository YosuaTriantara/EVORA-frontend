// lib/validation/schemas/event.schema.ts
// Schemas untuk Event types berdasarkan types/event.ts dan types/admin.ts

import { z } from "zod";

// ─────────────────────────────────────────────
// CATEGORY (nested di EventReadFull)
// ─────────────────────────────────────────────

export const CategoryReadSchema = z.object({
  id: z.string(),
  name: z.string(),
  event_id: z.string(),
  max_quota: z.number().int().nonnegative(),
  registration_fee: z.number().int().nonnegative(),
});

// ─────────────────────────────────────────────
// EVENT PREVIEW (types/event.ts)
// ─────────────────────────────────────────────

export const EventPreviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  organizer: z.string(),
  profil_url: z.string().nullable(),
  event_date_start: z.string(), // YYYY-MM-DD
  event_date_end: z.string(), // YYYY-MM-DD
  banner_url: z.string().nullable(),
  is_registration_open: z.boolean(),
  is_voting_live: z.boolean(),
  location: z.string().nullable(),
});

// ─────────────────────────────────────────────
// EVENT READ (types/admin.ts - lightweight list view)
// ─────────────────────────────────────────────

export const EventReadSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  organizer: z.string(),
  location: z.string().nullable().optional().default(null),
  profil_url: z.string().nullable().optional().default(null),
  event_date_start: z.string(),
  event_date_end: z.string(),
  is_active: z.boolean().nullable().optional().default(null),
  is_pg_enabled: z.boolean().nullable().optional().default(null),
  is_voting_enabled: z.boolean().nullable().optional().default(null),
  categories: z.array(CategoryReadSchema).optional().default([]),
  created_at: z.string().optional().default(""),
  updated_at: z.string().nullable().optional().default(null),
});

// ─────────────────────────────────────────────
// EVENT READ FULL (types/admin.ts)
// ─────────────────────────────────────────────

// REVIEW NEEDED: content_data dan theme_setting di backend bisa berbentuk
// object apapun. Saat ini menggunakan z.record(z.unknown()).nullable()
// untuk fleksibilitas maksimal.
//
// NOTE: Field-field berikut dibuat optional dengan default karena API /events/my-managed
// tidak selalu mengembalikan semua field ini
// 
// IMPORTANT: Schema harus cocok dengan types/admin.ts EventReadFull interface
// yang tidak mengizinkan undefined untuk field-field utama
export const EventReadFullSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  organizer: z.string(),
  location: z.string().nullable().optional().default(null),
  profil_url: z.string().nullable().optional().default(null),
  event_date_start: z.string(),
  event_date_end: z.string(),
  is_active: z.boolean().nullable().optional().default(null),
  is_pg_enabled: z.boolean().nullable().optional().default(null),
  is_voting_enabled: z.boolean().nullable().optional().default(null),
  content_data: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  theme_setting: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  categories: z.array(CategoryReadSchema).optional().default([]),
  created_at: z.string().optional().default(""),
  updated_at: z.string().nullable().optional().default(null),
});

// ─────────────────────────────────────────────
// PARTIAL SCHEMA (untuk PATCH operations)
// ─────────────────────────────────────────────

export const EventReadFullPartialSchema = EventReadFullSchema.partial();
