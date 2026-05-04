// hooks/query-keys.ts
// Centralized query keys for React Query cache management
// Follows pattern from Frontend Implementation Guide Section 11.2

/**
 * Query keys centralization untuk konsistensi cache invalidation.
 * Gunakan fungsi ini untuk generate query keys, jangan hardcode string.
 *
 * @example
 * // Invalidate all event data
 * queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId).all() });
 *
 * // Invalidate specific team list
 * queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId).teams() });
 */
export const queryKeys = {
  // ─────────────────────────────────────────────
  // EVENTS (Global)
  // ─────────────────────────────────────────────
  events: {
    all: () => ['events'] as const,
    list: (params: object = {}) => ['events', 'list', params] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    managed: () => ['events', 'managed'] as const,
    public: (slug: string) => ['events', 'public', slug] as const,
  },

  // ─────────────────────────────────────────────
  // EVENT-SCOPED (per eventId)
  // ─────────────────────────────────────────────
  event: (eventId: string) => ({
    all: () => ['event', eventId] as const,
    details: () => ['event', eventId, 'details'] as const,
    staff: () => ['event', eventId, 'staff'] as const,
    categories: () => ['event', eventId, 'categories'] as const,

    // Teams
    teams: (params?: { skip?: number; limit?: number; status?: string }) =>
      ['event', eventId, 'teams', params ?? {}] as const,
    teamDetail: (teamId: string) => ['event', eventId, 'teams', 'detail', teamId] as const,

    // Transactions
    transactions: (params?: { skip?: number; limit?: number; status?: string }) =>
      ['event', eventId, 'transactions', params ?? {}] as const,

    // Voting
    voting: {
      all: () => ['event', eventId, 'voting'] as const,
      categories: () => ['event', eventId, 'voting', 'categories'] as const,
      candidates: (categoryId: string) =>
        ['event', eventId, 'voting', 'candidates', categoryId] as const,
      results: (categoryId: string) =>
        ['event', eventId, 'voting', 'results', categoryId] as const,
    },

    // Scoring
    scoring: {
      all: () => ['event', eventId, 'scoring'] as const,
      sheets: () => ['event', eventId, 'scoring', 'sheets'] as const,
      sheetDetail: (sheetId: string) =>
        ['event', eventId, 'scoring', 'sheets', sheetId] as const,
      rankings: (categoryId?: string) =>
        ['event', eventId, 'scoring', 'rankings', categoryId ?? 'all'] as const,
      assessmentSchema: (categoryId: string) =>
        ['event', eventId, 'scoring', 'schema', categoryId] as const,
    },
  }),

  // ─────────────────────────────────────────────
  // USER
  // ─────────────────────────────────────────────
  user: {
    all: () => ['user'] as const,
    me: () => ['user', 'me'] as const,
    voteBalance: () => ['user', 'voteBalance'] as const,
    voteHistory: (params?: { skip?: number; limit?: number }) =>
      ['user', 'voteHistory', params ?? {}] as const,
  },

  // ─────────────────────────────────────────────
  // REGISTRATIONS (My Teams)
  // ─────────────────────────────────────────────
  registrations: {
    all: () => ['registrations'] as const,
    myTeams: () => ['registrations', 'myTeams'] as const,
    myTeamDetail: (teamId: string) => ['registrations', 'myTeams', teamId] as const,
  },

  // ─────────────────────────────────────────────
  // SUPER ADMIN
  // ─────────────────────────────────────────────
  superAdmin: {
    dashboard: () => ["superAdmin", "dashboard"] as const,
    users: (params?: object) =>
      ["superAdmin", "users", params ?? {}] as const,
    events: (params?: object) =>
      ["superAdmin", "events", params ?? {}] as const,
    transactions: (params?: object) =>
      ["superAdmin", "transactions", params ?? {}] as const,
    teams: (params?: object) =>
      ["superAdmin", "teams", params ?? {}] as const,
    votePackages: () => ["superAdmin", "votePackages"] as const,
  },

  // Voting domain
  voting: {
    all: () => ["voting"] as const,
    balance: () => ["voting", "balance"] as const,
    history: (params?: object) =>
      ["voting", "history", params ?? {}] as const,
    results: (categoryId: string) =>
      ["voting", "results", categoryId] as const,
    categories: (eventId: string) =>
      ["voting", "categories", eventId] as const,
    candidates: (categoryId: string) =>
      ["voting", "candidates", categoryId] as const,
  },
};

/**
 * Helper untuk invalidate semua data terkait event.
 * Gunakan saat ada perubahan besar pada event (misal: update event settings).
 */
export function getEventQueryKeys(eventId: string): readonly (readonly string[])[] {
  return [
    queryKeys.event(eventId).all(),
    queryKeys.events.managed(),
    queryKeys.events.detail(eventId),
  ];
}

/**
 * Helper untuk invalidate semua data voting terkait event.
 * Gunakan saat ada perubahan pada vote categories atau candidates.
 */
export function getVotingQueryKeys(eventId: string): readonly (readonly string[])[] {
  return [
    queryKeys.event(eventId).voting.all(),
    queryKeys.event(eventId).voting.categories(),
  ];
}

/**
 * Helper untuk invalidate semua data scoring terkait event.
 * Gunakan saat ada perubahan pada assessment schema atau scores.
 */
export function getScoringQueryKeys(eventId: string): readonly (readonly string[])[] {
  return [
    queryKeys.event(eventId).scoring.all(),
    queryKeys.event(eventId).scoring.sheets(),
  ];
}
