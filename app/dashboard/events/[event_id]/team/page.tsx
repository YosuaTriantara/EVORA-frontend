// OFFICIAL_TEAM Role - My Team Page
// Official team bisa lihat team mereka, upload payment proof, manage members

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyTeamsServer } from "@/services/event-management/official-team-service";
import { getRankings } from "@/services/event-management/scoring-service";
import { getEvents } from "@/services/event-service";

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function OfficialTeamPage({ params }: Props) {
  const { event_id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    redirect("/login");
  }

  // Verify user has OFFICIAL_TEAM role for this event (via my-teams)
  let myTeams: Awaited<ReturnType<typeof getMyTeamsServer>> = [];
  try {
    myTeams = await getMyTeamsServer(token, event_id);
  } catch {
    // If API call fails, redirect to dashboard
    redirect("/dashboard");
  }

  if (myTeams.length === 0) {
    redirect("/dashboard");
  }

  // Get event details
  const allEvents = await getEvents();
  const event = allEvents.find((e) => e.id === event_id);

  if (!event) {
    redirect("/dashboard");
  }

  // Fetch rankings for this event (if available)
  let rankings = null;
  try {
    // Try to get rankings for the first team's category
    if (myTeams[0]?.category_id) {
      rankings = await getRankings(event_id, myTeams[0].category_id);
    }
  } catch {
    // Rankings might not be available yet (event not started)
    rankings = null;
  }

  // Redirect to team detail page with event_id param for back button consistency
  // Official team view akan menampilkan team management UI
  redirect(`/dashboard/teams/${myTeams[0].id}?event_id=${event_id}`);
}
