import { getEventDetail } from "@/services/event-service";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { notFound } from "next/navigation";
import { RealVotingClientView } from "@/components/voting/real-voting-client-view";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventVotingPage({ params }: PageProps) {
  const { slug } = await params;

  let eventData;
  try {
    eventData = await getEventDetail(slug);
  } catch {
    notFound();
  }

  const { event, voting } = eventData;

  // Try to get user's point balance (optional — page works without it)
  let pointBalance = 0;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("evora_session")?.value;
    if (token) {
      const BACKEND_URL = (
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      ).replace(/\/+$/, "");
      const meRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (meRes.ok) {
        const me = await meRes.json();
        pointBalance = me.point_balance ?? 0;
      }
    }
  } catch {
    // Not logged in — voting page is still viewable
  }

  const isVotingLive = voting.status === "LIVE" || voting.status === "live";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1">
        {/* EVENT HEADER */}
        <div className="bg-red-950 text-white pt-32 pb-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="container mx-auto relative z-10 text-center">
            <Link
              href={`/events/${slug}`}
              className="inline-flex items-center text-red-200 hover:text-white text-sm mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Detail Event
            </Link>

            <h1 className="text-3xl md:text-5xl font-extrabold font-serif mb-4 leading-tight">
              {event.title}
            </h1>
            <p className="text-red-100/80 max-w-2xl mx-auto text-lg">
              Dukung peserta favoritmu. Setiap suara berkontribusi untuk
              kemenangan mereka.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-red-900/50 px-4 py-2 rounded-full border border-red-800">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {voting.data.length} Kategori Voting
                </span>
              </div>

              {isVotingLive && (
                <div className="flex items-center gap-2 bg-green-900/50 px-4 py-2 rounded-full border border-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-300">
                    Voting Sedang Berlangsung
                  </span>
                </div>
              )}

              {pointBalance > 0 && (
                <div className="flex items-center gap-2 bg-yellow-900/50 px-4 py-2 rounded-full border border-yellow-800">
                  <span className="text-sm font-medium text-yellow-300">
                    💎 {pointBalance.toLocaleString()} Poin Tersisa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-12 mb-20 relative z-20">
          {voting.data.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">
                Voting Belum Tersedia
              </h2>
              <p className="text-slate-500">
                {isVotingLive
                  ? "Belum ada kandidat yang terdaftar."
                  : "Voting untuk event ini belum dimulai."}
              </p>
            </div>
          ) : (
            <RealVotingClientView
              votingData={voting}
              initialPointBalance={pointBalance}
              isVotingLive={isVotingLive}
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
