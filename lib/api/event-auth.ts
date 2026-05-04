/**
 * Event Authentication Helper for Middleware
 *
 * Server-side only function to verify if user has access to a specific event.
 * Used by middleware to enforce event-scoped RBAC.
 *
 * FAIL SECURE: Any error returns false (deny access)
 */

interface ManagedEvent {
  event: {
    id: string;
    title: string;
    slug: string;
  };
  role: string;
}

interface MyManagedResponse {
  data: ManagedEvent[];
}

interface MyTeam {
  id: string;
  name: string;
}

interface MyTeamsResponse {
  data: MyTeam[];
}

/**
 * Verify if user has access to a specific event
 * Checks both managed events (ORGANIZER, JUDGE, TABULATOR) and my-teams (OFFICIAL_TEAM)
 *
 * @param eventId - The event UUID to check access for
 * @param sessionToken - The evora_session cookie value (used as Bearer token)
 * @returns Promise<boolean> - true if user has access, false otherwise
 *
 * FAIL SECURE: Returns false on any error (network, parse, unauthorized, etc.)
 */
export async function verifyEventAccess(
  eventId: string,
  sessionToken: string
): Promise<boolean> {
  if (!eventId || !sessionToken) {
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    console.error("[event-auth] NEXT_PUBLIC_API_URL not configured");
    return false;
  }

  try {
    // Check 1: Managed events (ORGANIZER, JUDGE, TABULATOR)
    const managedResponse = await fetch(`${baseUrl}/api/v1/events/my-managed`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (managedResponse.ok) {
      const managedData: MyManagedResponse | ManagedEvent[] = await managedResponse.json();
      // Handle both array directly and { data: [...] } format
      const eventsArray = Array.isArray(managedData) ? managedData : managedData.data || [];
      // FIX: Use loose equality (==) to handle type mismatch between string (URL param) and number (API response)
      const hasManagedAccess = eventsArray.some(
        (managedEvent) => managedEvent.event.id == eventId
      );
      if (hasManagedAccess) {
        return true;
      }
    }

    // Check 2: My teams (OFFICIAL_TEAM role)
    // If user has any team in this event, they have access
    const teamsResponse = await fetch(
      `${baseUrl}/api/v1/registration/my-teams?event_id=${eventId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (teamsResponse.ok) {
      const teamsData: MyTeamsResponse = await teamsResponse.json();
      // Handle different response structures
      const teamsArray = Array.isArray(teamsData.data) ? teamsData.data :
                        Array.isArray(teamsData) ? teamsData :
                        teamsData.data ? [teamsData.data] : [];

      if (teamsArray.length > 0) {
        return true;
      }
    }

    // No access found through either method
    return false;
  } catch (error) {
    // FAIL SECURE: Any error (network, parse, etc.) denies access
    console.error("[event-auth] Error verifying event access:", error);
    return false;
  }
}
