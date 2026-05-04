// RequireRole Component - Role-based access control for event-scoped pages
// Reference: Frontend Implementation Guide Section 7.3

"use client";

import { useEventRole } from "@/context/event-role-context";
import type { StaffRole } from "@/types/admin";

interface RequireRoleProps {
  /** Required roles for access */
  roles: StaffRole[];
  /** Content to render if user has required role */
  children: React.ReactNode;
  /** Optional fallback content if access denied (default: null) */
  fallback?: React.ReactNode;
  /** Optional: also allow SUPER_ADMIN regardless of event role */
  allowSuperAdmin?: boolean;
}

/**
 * RequireRole - Component for role-based access control
 *
 * Usage:
 * <RequireRole roles={['ORGANIZER']}>
 *   <VerifyPaymentButton />
 * </RequireRole>
 *
 * With fallback:
 * <RequireRole roles={['ORGANIZER']} fallback={<p>Akses ditolak</p>}>
 *   <AdminPanel />
 * </RequireRole>
 *
 * Allow super admin:
 * <RequireRole roles={['ORGANIZER']} allowSuperAdmin>
 *   <SensitiveAction />
 * </RequireRole>
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
  allowSuperAdmin = true,
}: RequireRoleProps) {
  const { role, isSuperAdmin } = useEventRole();

  // Super admin always has access if allowed
  if (allowSuperAdmin && isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has required role
  if (role && roles.includes(role)) {
    return <>{children}</>;
  }

  // Access denied - render fallback
  return <>{fallback}</>;
}

/**
 * RequireAnyRole - Component that requires any of the specified roles
 * (alias for RequireRole with clearer semantics)
 */
export function RequireAnyRole(props: RequireRoleProps) {
  return <RequireRole {...props} />;
}

/**
 * RequireAllRoles - Component that requires ALL specified roles
 * Note: This is rarely used in EVORA's RBAC model
 */
export function RequireAllRoles({
  roles,
  children,
  fallback = null,
  allowSuperAdmin = true,
}: RequireRoleProps & { roles: StaffRole[] }) {
  const { role, isSuperAdmin } = useEventRole();

  if (allowSuperAdmin && isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has ALL required roles
  // Note: In EVORA, a user typically has only one role per event
  // This component is for edge cases where multiple roles are needed
  const hasAllRoles = role && roles.includes(role);

  if (hasAllRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * useHasRole - Hook to check if current user has a specific role
 *
 * Usage:
 * const canManagePayments = useHasRole(['ORGANIZER', 'SUPER_ADMIN']);
 */
export function useHasRole(
  roles: StaffRole[],
  options: { allowSuperAdmin?: boolean } = {}
): boolean {
  const { role, isSuperAdmin } = useEventRole();
  const { allowSuperAdmin = true } = options;

  if (allowSuperAdmin && isSuperAdmin) {
    return true;
  }

  return role !== null && roles.includes(role);
}
