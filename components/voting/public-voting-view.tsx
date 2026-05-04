"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Filter, Trophy, User, AlertCircle } from "lucide-react";
import Image from "next/image";
import {
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getPublicVoteCandidates,
  getUserVoteBalance,
  castVote,
} from "@/services/voting-service";
import type {
  VotePackage,
} from "@/lib/validation/schemas/voting.schema";

// Extended package type for API response
export interface VotePackageWithData extends VotePackage {
  // Allow additional fields from API
  [key: string]: unknown;
}

// Extended candidate type with rank from API
interface VoteCandidateWithRank {
  id: string;
  team_id: string;
  candidate_name: string;
  image_url: string | null;
  display_order: number;
  total_votes: number;
  rank: number;
  last_vote_at: string | null;
}

// Extended category type with counts from API (partial type for API response)
interface VoteCategoryWithCounts {
  id: string;
  name: string;
  description: string | null;
  target_event_category_id: string | null;
  is_active: boolean;
  candidate_count: number;
  total_votes_cast: number;
  // Optional fields from base VoteCategory
  event_id?: string;
  created_at?: string;
  updated_at?: string | null;
}

// --- KOMPONEN MODAL VOTE ---
function VoteModal({
  candidate,
  packages,
  userBalance,
  eventId,
  categoryId,
  onVoteSuccess,
}: {
  candidate: VoteCandidateWithRank;
  packages: VotePackageWithData[];
  userBalance: number;
  eventId: string;
  categoryId: string;
  onVoteSuccess: (newBalance: number) => void;
}) {
  const [points, setPoints] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: () => castVote(candidate.id, points),
    onSuccess: (data) => {
      // Update balance cache
      queryClient.setQueryData(["vote-balance", eventId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return {
          ...old,
          point_balance: userBalance - points,
        };
      });

      // Invalidate candidates to refresh vote counts
      queryClient.invalidateQueries({
        queryKey: ["vote-candidates", categoryId],
      });

      setShowConfirm(false);
      onVoteSuccess(userBalance - points);

      // Show success alert
      alert(`Vote Berhasil! Anda memberikan ${points} poin untuk ${candidate.candidate_name}.`);
    },
    onError: (error) => {
      alert(`Gagal Mengirim Vote: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`);
    },
  });

  const maxPoints = Math.min(userBalance, 100);
  const canVote = userBalance > 0 && maxPoints >= 1;

  const handleOpenConfirm = () => {
    if (points > userBalance) {
      alert(`Saldo Tidak Mencukupi: Anda hanya memiliki ${userBalance} poin`);
      return;
    }
    setShowConfirm(true);
  };

  return (
    <DialogContent className="sm:max-w-md bg-background border border-slate-200 shadow-2xl">
      <DialogHeader className="border-b pb-4">
        <DialogTitle className="text-center font-serif text-2xl text-red-950">
          Dukung {candidate.candidate_name}
        </DialogTitle>
        <DialogDescription className="text-center text-slate-500">
          Peringkat #{candidate.rank} • {candidate.total_votes.toLocaleString()} votes
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Balance Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
          <p className="text-blue-800 font-bold text-sm">Saldo Poin Anda</p>
          <p className="text-blue-600 text-2xl font-black">{userBalance}</p>
        </div>

        {/* Points Input */}
        {canVote ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Jumlah Poin (1-{maxPoints})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPoints((p) => Math.max(1, p - 1))}
                disabled={points <= 1}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 font-bold"
              >
                −
              </button>
              <Input
                type="number"
                min={1}
                max={maxPoints}
                value={points}
                onChange={(e) =>
                  setPoints(
                    Math.min(
                      Math.max(1, parseInt(e.target.value) || 1),
                      maxPoints
                    )
                  )
                }
                className="flex-1 text-center font-bold text-lg"
              />
              <button
                onClick={() => setPoints((p) => Math.min(maxPoints, p + 1))}
                disabled={points >= maxPoints}
                className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 font-bold"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleOpenConfirm}
              disabled={points > userBalance}
              className="w-full bg-red-900 hover:bg-red-800 text-white font-bold h-12"
            >
              Vote ({points} poin)
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-lg text-center border border-amber-200">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-medium">
              {userBalance === 0
                ? "Anda tidak memiliki poin voting"
                : "Tidak dapat voting saat ini"}
            </p>
            {userBalance === 0 && (
              <Link
                href={`/voting/purchase?event_id=${eventId}`}
                className="mt-3 inline-block text-amber-700 font-medium text-sm hover:underline"
              >
                Beli Poin Voting →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Voting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Kandidat</span>
                <span className="font-semibold text-slate-900">
                  {candidate.candidate_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Poin digunakan</span>
                <span className="font-semibold text-blue-600">{points} poin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa saldo</span>
                <span className="font-semibold text-slate-900">
                  {userBalance - points} poin
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={voteMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={() => voteMutation.mutate()}
                disabled={voteMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {voteMutation.isPending ? "Memproses..." : "✓ Konfirmasi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}

// --- CLIENT VIEW UTAMA ---
interface PublicVotingViewProps {
  eventId: string;
  categories: VoteCategoryWithCounts[];
  packages: VotePackageWithData[];
}

export function PublicVotingView({
  eventId,
  categories,
  packages,
}: PublicVotingViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || ""
  );
  const queryClient = useQueryClient();

  // Get user balance (will fail silently if not logged in)
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["vote-balance", eventId],
    queryFn: () => getUserVoteBalance(eventId),
    retry: false,
    staleTime: 30000,
  });

  // Get candidates for selected category
  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ["vote-candidates", selectedCategory],
    queryFn: () => getPublicVoteCandidates(selectedCategory),
    enabled: !!selectedCategory,
    staleTime: 10000,
  });

  const userBalance = balanceData?.point_balance || 0;
  const isLoggedIn = !!balanceData;

  const handleVoteSuccess = (newBalance: number) => {
    // Additional success handling if needed
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <Card className="p-4 md:p-6 shadow-xl border-none min-h-125 bg-white rounded-2xl">
      {/* Balance Card (if logged in) */}
      {isLoggedIn && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Sisa Poin Voting Anda</p>
              <p className="text-5xl font-bold mt-1">{userBalance}</p>
              <p className="text-blue-200 text-sm mt-2">
                Total dibeli: {balanceData?.total_points_purchased || 0} poin
              </p>
            </div>
            <Link
              href={`/voting/purchase?event_id=${eventId}`}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              + Beli Poin
            </Link>
          </div>
        </div>
      )}

      {/* Login CTA (if not logged in) */}
      {!isLoggedIn && !balanceLoading && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">Login untuk mulai voting</p>
            <p className="text-sm text-amber-700">
              Beli poin dan dukung tim favorit Anda
            </p>
          </div>
          <Link
            href={`/login?redirect=/voting/events/${eventId}`}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700"
          >
            Login
          </Link>
        </div>
      )}

      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        {/* TAB CATEGORIES */}
        <TabsList className="w-full h-auto p-1 bg-slate-100 grid grid-cols-2 md:grid-cols-4 mb-6 rounded-xl">
          {activeCategories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="py-3 text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-lg"
            >
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* KONTEN KANDIDAT */}
        {activeCategories.map((cat) => (
          <TabsContent
            key={cat.id}
            value={cat.id}
            className="animate-in fade-in-50 duration-500 focus-visible:ring-0"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{cat.name}</h2>
              {cat.description && (
                <p className="text-slate-500 mb-4">{cat.description}</p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                  {cat.candidate_count} Kandidat
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {cat.total_votes_cast.toLocaleString()} Votes
                </Badge>
              </div>
            </div>

            {candidatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-64 bg-slate-200 rounded-t-xl" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : candidatesData?.candidates.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400">Belum ada kandidat di kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {candidatesData?.candidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="group overflow-hidden hover:shadow-xl transition-all border-slate-200 bg-white rounded-xl"
                  >
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      {candidate.image_url ? (
                        <Image
                          src={candidate.image_url}
                          alt={`Foto ${candidate.candidate_name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <User className="w-20 h-20 text-slate-300" />
                        </div>
                      )}

                      {/* Rank Badge */}
                      {candidate.rank <= 3 && (
                        <div
                          className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${
                            candidate.rank === 1
                              ? "bg-yellow-400 text-yellow-900"
                              : candidate.rank === 2
                              ? "bg-slate-300 text-slate-700"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          #{candidate.rank}
                        </div>
                      )}

                      {/* Vote Count Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-bold text-lg">
                          {candidate.total_votes.toLocaleString()} votes
                        </p>
                      </div>
                    </div>

                    <CardContent className="text-center pt-5 pb-2">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                        {candidate.candidate_name}
                      </h3>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-3">
                        <div className="text-2xl font-black text-slate-900 font-serif">
                          {candidate.total_votes.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                          Total Votes
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="pb-6 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-red-900 hover:bg-red-800 text-white font-bold h-10 shadow-md">
                            VOTE
                          </Button>
                        </DialogTrigger>
                        <VoteModal
                          candidate={candidate}
                          packages={packages}
                          userBalance={userBalance}
                          eventId={eventId}
                          categoryId={cat.id}
                          onVoteSuccess={handleVoteSuccess}
                        />
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
