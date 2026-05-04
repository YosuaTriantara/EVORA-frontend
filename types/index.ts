// types/index.ts

/**
 * EventStage: Menggambarkan siklus hidup event sesuai Tech Docs.
 * - DRAFT: Sedang disiapkan admin.
 * - REGISTRATION_OPEN: Fase Phase 2 (Pendaftaran).
 * - REGISTRATION_CLOSED: Kuota penuh atau waktu habis.
 * - TECHNICAL_MEETING: Fase pengundian nomor urut (Lot).
 * - COMPETITION_DAY: Hari H, modul Scoring (Phase 3) aktif.
 * - FINISHED: Event selesai, masuk arsip.
 */
export type EventStage = 
  | "DRAFT" 
  | "REGISTRATION_OPEN" 
  | "REGISTRATION_CLOSED" 
  | "TECHNICAL_MEETING" 
  | "COMPETITION_DAY" 
  | "FINISHED";

export interface Event {
  // --- IDENTITY ---
  id: string;
  slug: string;             // Unik URL (e.g. 'lkbb-jabar-2026'). Sesuai 'reserved_slugs'.
  title: string;
  organizer: string;

  // --- VISUAL ---
  bannerUrl: string;        // Menggantikan 'image' agar lebih spesifik

  // --- STATUS & MODULES ---
  stage: EventStage;        // Status lifecycle utama
  isVotingActive: boolean;  // Toggle khusus modul Voting (Phase 4)

  // --- DETAILS ---
  date: string;             // Format: YYYY-MM-DD
  location: string;
  price: string;            // Display string (e.g. "Rp 350.000" atau "Gratis")

  // --- REGISTRATION STATS (Phase 2) ---
  quota: number;            // Kapasitas maksimal
  registeredCount: number;  // Jumlah yang sudah status APPROVED/PENDING

  // --- INTEGRATION ---
  managementUrl?: string;   // Link ke Dwiparadwisma (Legacy System)
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Menambahkan role 'judge' (Juri) dan 'committee' (Panitia) sesuai modul Event Users
  role: "super_admin" | "organizer" | "committee" | "judge" | "user";
  avatar?: string;
}

export interface VoteCategory {
  id: string;
  eventId: string;
  title: string; // Contoh: "Danton Favorit"
  description: string;
  pricePerVote: string; // Display text (e.g. "1 Poin")
}

export type CompetitionLevel = "SD" | "SMP" | "SMA" | "UMUM";
export interface Candidate {
  id: string;
  eventId: string;
  categoryId: string; // <--- HUBUNGKAN KE KATEGORI
  level: CompetitionLevel;
  lotNumber: number;
  name: string;
  school: string;
  photoUrl: string;
  totalVotes: number;
  rank: number;
}

// VotePackage dari API superadmin (lib/validation/schemas/voting.schema.ts)
export interface VotePackage {
  id: string;
  name: string;
  points_amount: number;
  price_idr: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
