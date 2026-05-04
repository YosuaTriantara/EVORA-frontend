// useCurrentUser Hook - Get current user with React Query
// Reference: Frontend Implementation Guide Section 4.1

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/admin-api";
import { queryKeys } from "@/hooks/query-keys";

// User type from API response
interface UserReadFull {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other fields as needed based on API response
}

/**
 * useCurrentUser - Hook untuk mengambil data user yang sedang login
 *
 * Features:
 * - Stale time 5 menit (user data tidak sering berubah)
 * - No retry on 401 (redirect ke login)
 * - Automatic caching dengan React Query
 *
 * Usage:
 * const { data: user, isLoading, error } = useCurrentUser();
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => apiGet<UserReadFull>("/auth/me"),
    staleTime: 5 * 60 * 1000, // 5 menit — tidak sering berubah
    retry: (failureCount, error) => {
      // Jangan retry jika 401 (unauthorized)
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
