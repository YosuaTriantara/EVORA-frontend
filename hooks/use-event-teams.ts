// useEventTeams Hook - React Query hook for event teams management
// Reference: Frontend Implementation Guide Section 3.3, 12.5

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import {
  getEventTeams,
  verifyTeamPayment,
} from "@/services/event-management/teams-service";
import type { TeamReadFull, TeamStatus } from "@/lib/validation/schemas/team.schema";
import type { PaginatedResponse } from "@/types/pagination";

interface UseEventTeamsParams {
  eventId: string;
  skip?: number;
  limit?: number;
  status?: TeamStatus;
}

/**
 * useEventTeams - React Query hook for fetching event teams with pagination
 *
 * Usage:
 * const { data, isLoading, error } = useEventTeams({
 *   eventId: 'abc-123',
 *   skip: 0,
 *   limit: 20,
 *   status: 'PENDING'
 * });
 */
export function useEventTeams({
  eventId,
  skip = 0,
  limit = 20,
  status,
}: UseEventTeamsParams) {
  return useQuery<PaginatedResponse<TeamReadFull>>({
    queryKey: queryKeys.event(eventId).teams({ skip, limit, status }),
    queryFn: () => getEventTeams(eventId, { skip, limit, status }),
    staleTime: 30_000, // 30 seconds
    placeholderData: (previousData) => previousData, // Keep old data while loading
  });
}

/**
 * useVerifyPayment - React Query mutation for verifying team payment
 *
 * Usage:
 * const { mutate, isPending } = useVerifyPayment(eventId);
 * mutate(teamId);
 */
export function useVerifyPayment(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => verifyTeamPayment(teamId),
    onSuccess: () => {
      // Invalidate teams list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.event(eventId).teams(),
      });
    },
  });
}
