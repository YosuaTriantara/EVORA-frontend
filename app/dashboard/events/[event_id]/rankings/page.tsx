// CREATED: 2025-04-16 - Event Rankings Page
// Menampilkan ranking tim berdasarkan scoring dan voting

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { canOrganizeEvent } from "@/lib/event-access-server";
import { API_URL } from "@/lib/env";
import { getManagedEvents } from "@/services/event-management-service";

interface PageProps {
  params: Promise<{ event_id: string }>;
}

interface RankingData {
  team_id: string;
  team_name: string;
  category_name: string;
  total_score: number;
  rank: number;
  vote_count?: number;
}

async function fetchEventRankings(eventId: string, token: string): Promise<RankingData[]> {
  const BACKEND_URL = API_URL.replace(/\/+$/, "");
  
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/events/${eventId}/rankings`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function EventRankingsPage({ params }: PageProps) {
  const { event_id } = await params;

  // Check access - only ORGANIZER can access
  const hasAccess = await canOrganizeEvent(event_id);
  if (!hasAccess) notFound();

  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    notFound();
  }

  // Fetch event data and rankings in parallel
  const [managedEvents, rankings] = await Promise.all([
    getManagedEvents(token),
    fetchEventRankings(event_id, token),
  ]);

  // FIX: Use loose equality (==) to handle type mismatch
  const currentEvent = managedEvents.find((me) => me.event.id == event_id);
  const eventTitle = currentEvent?.event.title || "Event";

  // Group by category
  const rankingsByCategory = rankings.reduce<Record<string, RankingData[]>>((acc, ranking) => {
    if (!acc[ranking.category_name]) {
      acc[ranking.category_name] = [];
    }
    acc[ranking.category_name].push(ranking);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/events/${event_id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Rankings</h1>
          <p className="text-muted-foreground">{eventTitle}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tim</p>
                <p className="text-2xl font-bold">{rankings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="text-2xl font-bold">
                  {Object.keys(rankingsByCategory).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skor Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Skor Tertinggi</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0
                    ? Math.max(...rankings.map((r: RankingData) => r.total_score)).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings by Category */}
      {Object.keys(rankingsByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Belum Ada Data Ranking
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Data ranking akan muncul setelah scoring selesai. Pastikan semua
              juri telah menyelesaikan penilaian.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(rankingsByCategory).map(([category, items]: [string, RankingData[]]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items
                    .sort((a: RankingData, b: RankingData) => a.rank - b.rank)
                    .map((item: RankingData, index: number) => (
                      <div
                        key={item.team_id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0
                            ? "bg-yellow-50 border border-yellow-200"
                            : index === 1
                            ? "bg-gray-50 border border-gray-200"
                            : index === 2
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={index < 3 ? "default" : "secondary"}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              index === 0
                                ? "bg-yellow-500 hover:bg-yellow-500"
                                : index === 1
                                ? "bg-gray-500 hover:bg-gray-500"
                                : index === 2
                                ? "bg-orange-500 hover:bg-orange-500"
                                : ""
                            }`}
                          >
                            {item.rank}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.team_name}</p>
                            {item.vote_count !== undefined && (
                              <p className="text-sm text-muted-foreground">
                                {item.vote_count.toLocaleString()} votes
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {item.total_score.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            total skor
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
