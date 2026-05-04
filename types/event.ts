// types/event.ts
// Types matching GET /api/v1/public/events and GET /api/v1/public/event/{slug}

export interface EventPreview {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  profil_url?: string | null;
  event_date_start: string; // YYYY-MM-DD
  event_date_end: string; // YYYY-MM-DD
  banner_url?: string | null;
  is_registration_open: boolean;
  is_voting_live: boolean;
  location?: string | null;
}

export interface RegistrationCategory {
  id: string;
  name: string;
  fee: number;
  max_quota: number;
  available_slots: number;
  is_full: boolean;
}

export interface VoteCandidate {
  team_name: string;
  candidate_name: string;
  image_url?: string | null;
  current_votes?: number;
  team_id?: string; // needed for POST /voting/cast
}

export interface VotingCategory {
  category_name: string;
  candidates: VoteCandidate[];
}

export interface EventDetailVoting {
  status: string; // e.g., "LIVE", "ENDED", "NOT_STARTED"
  start_at?: string | null;
  data: VotingCategory[];
}

export interface EventDetailRegistration {
  is_open: boolean;
  categories: RegistrationCategory[];
}

export interface EventDetailInfo {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  profil_url?: string | null;
  banner_url?: string | null;
  event_date_start: string;
  event_date_end: string;
  location?: string;
  is_active: boolean;
  is_pg_enabled: boolean;
  is_voting_enabled: boolean;
  content_data?: {
    hero?: {
      title?: string;
      subtitle?: string;
      banner_url?: string;
    };
    sections?: {
      about?: string;
    };
    payment_config?: {
      methods?: string[];
      manual_instructions?: Array<{
        bank_name: string;
        account_number: string;
        account_holder: string;
      }>;
    };
  };
  theme_setting?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
}

export interface EventDetail {
  event: EventDetailInfo;
  registration: EventDetailRegistration;
  voting: EventDetailVoting;
}

// Registration types (for the registration flow)
export interface RegisterTeamPayload {
  event_id: string;
  category_id: string;
  team_name: string;
  institution: string;
}

export interface RegisterTeamResponse {
  message: string;
  team_id: string;
}

// My teams (for OFFICIAL_TEAM role)
export interface MyTeam {
  id: string;
  event_id: string;
  event_name: string;
  category_id: string;
  category_name: string;
  name: string;
  institution?: string;
  status:
    | "PENDING_PAYMENT"
    | "PENDING_VERIFICATION"
    | "REGISTERED"
    | "CANCELLED"
    | "DISQUALIFIED"
    | "REJECTED";
  lot_number: number | null;
  admin_note?: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  name: string;
  role: string;
  identity_number: string | null;
  extra_data?: {
    email?: string;
    phone?: string;
  } | null;
}

export interface AddMemberPayload {
  name: string;
  role: string;
  identity_number?: string;
  extra_data?: {
    email?: string;
    phone?: string;
  };
}

export interface ManagedEventItem {
  role: "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";
  meta_data?: {
    speciality?: string;
    judge_code?: string;
    [key: string]: unknown;
  } | null;
  event: EventPreview;
}

// Event list item for public events (used in registration wizard)
export interface EventListItem {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  start_date?: string;
  end_date?: string;
  location?: string;
  banner_url?: string | null;
}

// Category read type for public API
export interface CategoryRead {
  id: string;
  name: string;
  description?: string;
  team_size_min?: number;
  team_size_max?: number;
  registration_fee: number;
  max_teams?: number;
  current_teams?: number;
}
