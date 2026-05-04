import { notFound } from "next/navigation";
import { getPublicEvent } from "@/services/event-service";
import { MobileEventDetail } from "@/components/events/mobile-event-detail";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  
  try {
    const eventData = await getPublicEvent(slug);
    
    if (!eventData) {
      notFound();
    }

    return <MobileEventDetail event={eventData} />;
  } catch (error) {
    notFound();
  }
}
