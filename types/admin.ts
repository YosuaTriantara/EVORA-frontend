// types/admin.ts
// All TypeScript types for the Super Admin API integration

// ─────────────────────────────────────────────
// COMMON
// ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  point_balance: number;
  is_active: boolean;
}

export interface LoginPayload {
  username: string; // actually email per OAuth2 spec
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

// ─────────────────────────────────────────────
// USER SEARCH (for ORGANIZER)
// ─────────────────────────────────────────────

export interface UserSearchResult {
  id: string;
  email: string;
  full_name: string;
}

export interface UserSearchResponse {
  total: number;
  data: UserSearchResult[];
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export type UserRole =
  | "SUPER_ADMIN"
  | "USER"
  | "ORGANIZER"
  | "JUDGE"
  | "TABULATOR"
  | "OFFICIAL_TEAM";

export interface UserRead {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  point_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export type SuperAdminUserRole = "SUPER_ADMIN" | "USER";

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: SuperAdminUserRole;
  is_active: boolean;
}

export interface UpdateUserPayload {
  full_name?: string;
  role?: SuperAdminUserRole;
  is_active?: boolean;
  point_balance?: number;
}

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────

export interface CategoryRead {
  id: string;
  name: string;
  event_id: string;
  max_quota: number;
  registration_fee: number;
}

// Lightweight event type for list views (from GET /events/my-events)
export interface EventRead {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  location: string | null;
  profil_url: string | null;
  event_date_start: string;
  event_date_end: string;
  is_active: boolean | null;
  is_pg_enabled: boolean | null;
  is_voting_enabled: boolean | null;
  categories: CategoryRead[];
  created_at: string;
  updated_at: string | null;
}

export interface EventReadFull {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  location: string | null;
  profil_url: string | null;
  event_date_start: string;
  event_date_end: string;
  is_active: boolean | null;
  is_pg_enabled: boolean | null;
  is_voting_enabled: boolean | null;
  content_data: Record<string, unknown> | null;
  theme_setting: Record<string, unknown> | null;
  categories: CategoryRead[];
  created_at: string;
  updated_at: string | null;
}

export interface CreateEventPayload {
  title: string;
  slug: string;
  organizer: string;
  location: string;
  profil_url?: string;
  event_date_start: string;
  event_date_end: string;
  is_voting_enabled: boolean;
  content_data?: Record<string, unknown>;
  theme_setting?: Record<string, unknown>;
}

export interface UpdateEventPayload {
  title?: string;
  slug?: string;
  organizer?: string;
  location?: string;
  profil_url?: string;
  event_date_start?: string;
  event_date_end?: string;
  is_active?: boolean;
  is_pg_enabled?: boolean;
  is_voting_enabled?: boolean;
  theme_setting?: Record<string, unknown>;
  content_data?: Record<string, unknown>;
}

export interface ToggleResponse {
  message: string;
  event_id: string;
  is_pg_enabled?: boolean;
  is_voting_enabled?: boolean;
  is_active?: boolean;
}

// ─────────────────────────────────────────────
// CATEGORIES (Competition)
// ─────────────────────────────────────────────

export interface CreateCategoryPayload {
  name: string;
  event_id: string;
  max_quota: number;
  registration_fee: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  max_quota?: number;
  registration_fee?: number;
}

// ─────────────────────────────────────────────
// EVENT STAFF
// ─────────────────────────────────────────────

export type StaffRole = "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";

export interface EventStaffRead {
  id: string;
  user_id: string;
  event_id: string;
  role: StaffRole;
  meta_data: Record<string, unknown> | null;
  created_at: string;
}

export interface EventStaffReadWithUser extends EventStaffRead {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface AddStaffPayload {
  user_id: string;
  role: StaffRole;
  meta_data?: {
    speciality?: string;
    judge_code?: string;
  };
}

// ─────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────

export type TeamStatus =
  | "PENDING_PAYMENT"
  | "PENDING_VERIFICATION"
  | "REGISTERED"
  | "CANCELLED"
  | "DISQUALIFIED"
  | "REJECTED";

export interface TeamMemberRead {
  id: string;
  team_id: string;
  name: string;
  role: string;
  identity_number: string | null;
  extra_data: {
    email?: string;
    phone?: string;
    institution?: string;
  } | null;
  created_at: string;
  updated_at: string | null;
}

export interface TeamReadFull {
  id: string;
  event_id: string;
  category_id: string;
  name: string;
  status: TeamStatus;
  lot_number: number | null;
  official_user_id: string;
  members: TeamMemberRead[];
  created_at: string;
  updated_at: string | null;
  // P0-06: Payment proof fields for ORGANIZER view
  admin_note?: string | null;
  payment_proof_url?: string | null;
  last_transaction?: {
    id: string;
    proof_url?: string | null;
    status: string;
  } | null;
}

export interface UpdateTeamStatusPayload {
  status: TeamStatus;
}

export interface UpdateTeamLotPayload {
  lot_number: number;
}

export interface AddMemberPayload {
  name: string;
  role: string;
  identity_number?: string;
  extra_data?: {
    email?: string;
    phone?: string;
    institution?: string;
  };
}

export interface UpdateMemberPayload {
  name?: string;
  role?: string;
  identity_number?: string;
  extra_data?: {
    email?: string;
    phone?: string;
    institution?: string;
  };
}

// ─────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────

export type TransactionStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type TransactionType = "REGISTRATION" | "VOTE_PURCHASE" | "REFUND";

export interface TransactionRead {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  status: TransactionStatus;
  payment_provider: string | null;
  external_ref_id: string | null;
  meta_data: {
    team_id?: string;
    event_id?: string;
    category_id?: string;
  } | null;
  created_at: string;
  updated_at: string | null;
}

export interface VerifyTransactionPayload {
  is_approved: boolean;
  admin_note?: string | null;
}

export interface VerifyTransactionResponse {
  message: string;
  transaction_id: string;
  new_status: TransactionStatus;
  team_id: string;
}

// ─────────────────────────────────────────────
// VOTE PACKAGES
// ─────────────────────────────────────────────

export interface VotePackageRead {
  id: string;
  name: string;
  price_idr: number;
  points_amount: number;
  created_at: string;
  updated_at: string | null;
}

export interface CreateVotePackagePayload {
  name: string;
  price_idr: number;
  points_amount: number;
}

export interface UpdateVotePackagePayload {
  name?: string;
  price_idr?: number;
  points_amount?: number;
}

// ─────────────────────────────────────────────
// VOTE CATEGORIES
// ─────────────────────────────────────────────

export interface VoteCategoryRead {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  target_event_category_id: string | null;
  is_active: boolean;
}

export interface CreateVoteCategoryPayload {
  name: string;
  description?: string | null;
  target_event_category_id?: string | null;
  is_active: boolean;
}

export interface UpdateVoteCategoryPayload {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

// ─────────────────────────────────────────────
// VOTE CANDIDATES
// ─────────────────────────────────────────────

export interface VoteCandidateRead {
  id: string;
  vote_category_id: string;
  team_id: string;
  candidate_name: string | null;
  image_url: string | null;
  total_votes: number;
}

export interface CreateVoteCandidatePayload {
  team_id: string;
  candidate_name?: string;
  image_url?: string;
}

export interface UpdateVoteCandidatePayload {
  candidate_name?: string;
  image_url?: string;
}

// ─────────────────────────────────────────────
// ASSESSMENT SCHEMA
// ─────────────────────────────────────────────

export interface AssessmentItem {
  id?: string;
  label: string;
  display_number: number;
  allowed_values: number[];
}

export interface AssessmentGroup {
  id?: string;
  title: string;
  sort_order: number;
  items: AssessmentItem[];
}

export interface AssessmentSection {
  id?: string;
  title: string;
  weight_percentage: number;
  sort_order: number;
  groups: AssessmentGroup[];
}

export interface AssessmentSchema {
  category_id: string;
  sections: AssessmentSection[];
}

export interface UploadSchemaPayload {
  category_id: string;
  sections: Omit<AssessmentSection, "id">[];
}

// ─────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────

export interface ScoreItem {
  id: string;
  sheet_id: string;
  assessment_item_id: string;
  value: number;
  created_at: string;
  updated_at: string | null;
}

export interface ScoreSheet {
  id: string;
  team_id: string;
  judge_id: string;
  inputter_id: string | null;
  total_score: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ScoreSheetWithItems extends ScoreSheet {
  items: ScoreItem[];
}

export interface LockSheetResponse {
  sheet_id: string;
  is_locked: boolean;
  message: string;
}

// ─────────────────────────────────────────────
// RANKINGS
// ─────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  team_id: string;
  team_name: string;
  lot_number: number | null;
  total_score: number;
  judge_count: number;
}

export interface RankingsResponse {
  event_id: string;
  category_id: string;
  category_name: string;
  rankings: RankingEntry[];
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export interface EventStats {
  event_id: string;
  event_title: string;
  slug: string;
  total_teams: number;
  registered_teams: number;
  pending_payment_teams: number;
  pending_verification_teams: number;
  cancelled_teams: number;
  total_revenue_idr: number;
  is_active: boolean;
}

export interface DashboardStats {
  total_users: number;
  total_active_users: number;
  total_events: number;
  total_active_events: number;
  total_teams: number;
  total_registered_teams: number;
  total_revenue_idr: number;
  total_pending_transactions: number;
  total_vote_packages_sold: number;
  events: EventStats[];
}
