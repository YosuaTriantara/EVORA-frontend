import { EventDetailView } from "@/components/super-admin/event-detail-view";

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function SuperAdminEventDetailPage({ params }: Props) {
  const { event_id } = await params;
  return <EventDetailView eventId={event_id} />;
}
