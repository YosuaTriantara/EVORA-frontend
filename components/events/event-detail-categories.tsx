"use client";

import { RegisterButton } from "./event-detail-client";
import type { RegistrationCategory } from "@/types/event";

interface Props {
  categories: RegistrationCategory[];
  eventId: string;
  isRegistrationOpen: boolean;
}

export function EventDetailCategories({ categories, eventId, isRegistrationOpen }: Props) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">
        Belum ada kategori tersedia.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const isClosed = !isRegistrationOpen || cat.is_full;

        return (
          <div
            key={cat.id}
            className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all ${
              isClosed
                ? "border-slate-100 opacity-60"
                : "border-slate-200 hover:border-red-200 hover:shadow-sm"
            }`}
          >
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-bold text-slate-900">{cat.name}</p>

              {/* Fee */}
              <p className="text-xs font-bold text-red-900">
                {cat.fee === 0
                  ? "Gratis"
                  : `Rp ${cat.fee.toLocaleString("id-ID")}`}
              </p>

              {/* Quota info */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-900 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((cat.max_quota - cat.available_slots) / cat.max_quota) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  {cat.available_slots} slot tersisa
                </span>
              </div>
            </div>

            {isClosed ? (
              <button
                disabled
                className="w-full text-xs font-bold py-2.5 rounded-full bg-slate-100 text-slate-400 cursor-not-allowed"
              >
                {cat.is_full ? "Pendaftaran Penuh" : "Pendaftaran Ditutup"}
              </button>
            ) : (
              <RegisterButton
                mode="register-button"
                categoryId={cat.id}
                eventId={eventId}
                categoryName={cat.name}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}