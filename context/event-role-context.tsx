// context/event-role-context.tsx
// Event-scoped role context untuk role-based UI rendering
// Follows pattern from Frontend Implementation Guide Section 4.2

'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { StaffRole } from '@/types/admin';

/**
 * Context value untuk event role.
 * Menyediakan informasi role user pada event tertentu dan helper flags.
 */
interface EventRoleContextValue {
  /** Event ID yang sedang aktif */
  eventId: string;
  /** Role user pada event ini (null jika tidak punya akses) */
  role: StaffRole | null;
  /** Apakah user adalah SUPER_ADMIN */
  isSuperAdmin: boolean;
  /** Apakah user adalah ORGANIZER pada event ini */
  isOrganizer: boolean;
  /** Apakah user adalah JUDGE pada event ini */
  isJudge: boolean;
  /** Apakah user adalah TABULATOR pada event ini */
  isTabulator: boolean;
  /** Apakah user adalah OFFICIAL_TEAM pada event ini */
  isOfficialTeam: boolean;
  /** Apakah user bisa manage event (ORGANIZER atau SUPER_ADMIN) */
  canManageEvent: boolean;
  /** Apakah user bisa input score (JUDGE atau SUPER_ADMIN) */
  canScore: boolean;
  /** Apakah user bisa tabulate (TABULATOR atau SUPER_ADMIN) */
  canTabulate: boolean;
  /** Apakah user bisa melihat semua data (SUPER_ADMIN) */
  canViewAll: boolean;
}

const EventRoleContext = createContext<EventRoleContextValue | null>(null);

interface EventRoleProviderProps {
  children: ReactNode;
  eventId: string;
  role: StaffRole | null;
  isSuperAdmin: boolean;
}

/**
 * Provider untuk event-scoped role context.
 * Harus digunakan di layout event-scoped (app/dashboard/events/[event_id]/layout.tsx)
 *
 * @example
 * <EventRoleProvider
 *   eventId={params.event_id}
 *   role={eventRole}
 *   isSuperAdmin={user.role === 'SUPER_ADMIN'}
 * >
 *   {children}
 * </EventRoleProvider>
 */
export function EventRoleProvider({
  children,
  eventId,
  role,
  isSuperAdmin,
}: EventRoleProviderProps) {
  const value: EventRoleContextValue = {
    eventId,
    role,
    isSuperAdmin,
    isOrganizer: role === 'ORGANIZER',
    isJudge: role === 'JUDGE',
    isTabulator: role === 'TABULATOR',
    isOfficialTeam: role === 'OFFICIAL_TEAM',
    canManageEvent: role === 'ORGANIZER' || isSuperAdmin,
    canScore: role === 'JUDGE' || isSuperAdmin,
    canTabulate: role === 'TABULATOR' || isSuperAdmin,
    canViewAll: isSuperAdmin,
  };

  return (
    <EventRoleContext.Provider value={value}>
      {children}
    </EventRoleContext.Provider>
  );
}

/**
 * Hook untuk mengakses event role context.
 * Hanya boleh digunakan di dalam EventRoleProvider.
 *
 * @throws Error jika digunakan di luar EventRoleProvider
 *
 * @example
 * const { canManageEvent, isOrganizer } = useEventRole();
 *
 * if (canManageEvent) {
 *   return <ManageEventButton />;
 * }
 */
export function useEventRole(): EventRoleContextValue {
  const context = useContext(EventRoleContext);

  if (!context) {
    throw new Error(
      'useEventRole must be used within an EventRoleProvider. ' +
        'Make sure you are inside an event-scoped page/layout.'
    );
  }

  return context;
}

/**
 * Hook untuk check role tanpa throw error.
 * Berguna untuk komponen yang mungkin digunakan di dalam dan luar event context.
 *
 * @returns EventRoleContextValue atau null jika di luar provider
 *
 * @example
 * const eventRole = useEventRoleSafe();
 *
 * if (eventRole?.canManageEvent) {
 *   return <ManageEventButton />;
 * }
 */
export function useEventRoleSafe(): EventRoleContextValue | null {
  return useContext(EventRoleContext);
}
