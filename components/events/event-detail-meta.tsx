import { CalendarDays, MapPin, Building2 } from "lucide-react";
import type { EventDetailInfo } from "@/types/event";

export function EventDetailMeta({ event }: { event: EventDetailInfo }) {
  const items = [
    {
      label: "Tanggal mulai",
      icon: CalendarDays,
      value: event.event_date_start,
    },
    {
      label: "Tanggal selesai",
      icon: CalendarDays,
      value: event.event_date_end,
    },
    {
      label: "Lokasi",
      icon: MapPin,
      value: event.location ?? "—",
    },
    {
      label: "Penyelenggara",
      icon: Building2,
      value: event.organizer,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white mt-4">
      {items.map(({ label, icon: Icon, value }) => (
        <div key={label} className="flex flex-col gap-1 px-5 py-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {label}
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Icon className="w-3.5 h-3.5 text-red-900 shrink-0" />
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}