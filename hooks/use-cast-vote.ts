// useCastVote Hook - Cast vote with idempotency key to prevent double voting
// Reference: Frontend Implementation Guide Section 9.2

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/admin-api";
import { AdminApiError } from "@/lib/api/error-handler";
import { queryKeys } from "@/hooks/query-keys";

// Generate UUID using native crypto API (no external dependency)
function generateUUID(): string {
  return crypto.randomUUID();
}

// Types
interface CastVotePayload {
  event_id: string;
  vote_category_id: string;
  candidate_id: string;
  points_to_spend: number;
  idempotency_key: string; // UUID unik per aksi vote
}

interface VoteReceiptRead {
  id: string;
  event_id: string;
  vote_category_id: string;
  candidate_id: string;
  points_used: number;
  created_at: string;
  // Add other fields as needed
}

interface UseCastVoteOptions {
  /** Callback on successful vote */
  onSuccess?: () => void;
  /** Callback on error */
  onError?: (error: AdminApiError) => void;
}

/**
 * useCastVote - Hook untuk melakukan voting dengan idempotency key
 *
 * Features:
 * - Auto-generate UUID idempotency key per vote action
 * - Prevents double voting from double-click
 * - Auto-invalidate vote balance cache on success
 * - Handle 409 conflict (vote already recorded)
 *
 * Usage:
 * const { mutate: castVote, isPending, error } = useCastVote({
 *   onSuccess: () => toast.success('Vote berhasil!'),
 *   onError: (err) => toast.error(err.message)
 * });
 *
 * // Cast vote
 * castVote({
 *   event_id: 'event-123',
 *   vote_category_id: 'category-456',
 *   candidate_id: 'candidate-789',
 *   points_to_spend: 10
 * });
 */
export function useCastVote(options: UseCastVoteOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async (
      payload: Omit<CastVotePayload, "idempotency_key">
    ): Promise<VoteReceiptRead> => {
      // Generate new UUID for each vote action (prevents double voting)
      const votePayload: CastVotePayload = {
        ...payload,
        idempotency_key: generateUUID(),
      };

      return apiPost<VoteReceiptRead>("/voting/cast", votePayload);
    },
    onSuccess: (data) => {
      // Invalidate vote balance cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.voting.balance(),
      });

      // Invalidate vote history cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.voting.history({}),
      });

      // Invalidate leaderboard/results for this category
      queryClient.invalidateQueries({
        queryKey: queryKeys.voting.results(data.vote_category_id),
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      if (error instanceof AdminApiError) {
        // Handle 409 conflict - vote already recorded
        if (error.status === 409) {
          // Still invalidate balance as vote was already recorded
          queryClient.invalidateQueries({
            queryKey: queryKeys.voting.balance(),
          });
        }

        onError?.(error);
      }
    },
  });
}
