import { Check, CalendarDays, Zap, Trophy } from "lucide-react";
import type { EventDetailInfo } from "@/types/event";

type TimelineStatus = "done" | "open" | "upcoming";

const statusStyles: Record<TimelineStatus, string> = {
  done: "bg-slate-100 text-slate-400",
  open: "bg-green-100 text-green-700",
  upcoming: "bg-sky-100 text-sky-700",
};

const statusLabel: Record<TimelineStatus, string> = {
  done: "Selesai",
  open: "Buka sekarang",
  upcoming: "Segera",
};

interface Props {
  event: EventDetailInfo;
  isRegistrationOpen: boolean;
}

export function EventDetailTimeline({ event, isRegistrationOpen }: Props) {
  const items = [
    {
      title: "Pendaftaran tim",
      date: event.event_date_start, // fallback — ganti jika ada field registration_open_date
      status: (isRegistrationOpen ? "open" : "done") as TimelineStatus,
      icon: CalendarDays,
    },
    {
      title: "Hari pelaksanaan lomba",
      date: `${event.event_date_start} – ${event.event_date_end}`,
      status: "upcoming" as TimelineStatus,
      icon: Zap,
    },
    {
      title: "Pengumuman pemenang & awarding",
      date: event.event_date_end,
      status: "upcoming" as TimelineStatus,
      icon: Trophy,
    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
      {items.map(({ title, date, status, icon: Icon }) => (
        <div key={title} className="flex items-start gap-4 px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-red-900" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{date}</p>
            <span
              className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}
            >
              {statusLabel[status]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}