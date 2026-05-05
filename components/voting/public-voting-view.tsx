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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User, AlertCircle, Coins, LogIn } from "lucide-react";
import Image from "next/image";
import {
  getPublicVoteCandidates,
  getUserVoteBalance,
  castVote,
} from "@/services/voting-service";
import type { VotePackage } from "@/lib/validation/schemas/voting.schema";

export interface VotePackageWithData extends VotePackage {
  [key: string]: unknown;
}

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

interface VoteCategoryWithCounts {
  id: string;
  name: string;
  description: string | null;
  target_event_category_id: string | null;
  is_active: boolean;
  candidate_count: number;
  total_votes_cast: number;
  event_id?: string;
  created_at?: string;
  updated_at?: string | null;
}

// --- VOTE MODAL ---
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
    onSuccess: () => {
      queryClient.setQueryData(["vote-balance", eventId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...old, point_balance: userBalance - points };
      });
      queryClient.invalidateQueries({ queryKey: ["vote-candidates", categoryId] });
      setShowConfirm(false);
      onVoteSuccess(userBalance - points);
      alert(`Vote Berhasil! Anda memberikan ${points} poin untuk ${candidate.candidate_name}.`);
    },
    onError: (error) => {
      alert(`Gagal: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`);
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
    <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl">
      <DialogHeader className="border-b border-slate-100 pb-4">
        <DialogTitle className="text-center text-xl font-bold text-slate-900">
          Dukung {candidate.candidate_name}
        </DialogTitle>
        <DialogDescription className="text-center text-slate-500 text-sm">
          Peringkat #{candidate.rank} &bull;{" "}
          {candidate.total_votes.toLocaleString("id-ID")} votes
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Balance Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Saldo poin Anda
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-0.5">
              {userBalance.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Coins className="w-6 h-6 text-red-900" />
          </div>
        </div>

        {/* Points Input */}
        {canVote ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jumlah poin (1–{maxPoints})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPoints((p) => Math.max(1, p - 1))}
                disabled={points <= 1}
                className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 transition-colors"
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
                    Math.min(Math.max(1, parseInt(e.target.value) || 1), maxPoints)
                  )
                }
                className="flex-1 text-center font-bold text-lg border-slate-200 focus-visible:ring-red-900"
              />
              <button
                onClick={() => setPoints((p) => Math.min(maxPoints, p + 1))}
                disabled={points >= maxPoints}
                className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 transition-colors"
              >
                +
              </button>
            </div>

            <Button
              onClick={handleOpenConfirm}
              disabled={points > userBalance}
              className="w-full bg-red-900 hover:bg-red-800 text-white font-bold h-12 rounded-xl"
            >
              Vote ({points} poin)
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-200">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-medium text-sm">
              {userBalance === 0
                ? "Anda tidak memiliki poin voting"
                : "Tidak dapat voting saat ini"}
            </p>
            {userBalance === 0 && (
              <Link
                href={`/voting/purchase?event_id=${eventId}`}
                className="mt-3 inline-block text-red-900 font-semibold text-sm hover:underline"
              >
                Beli poin voting →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Konfirmasi voting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Kandidat</span>
                <span className="font-semibold text-slate-900">{candidate.candidate_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Poin digunakan</span>
                <span className="font-semibold text-red-900">{points} poin</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-500">Sisa saldo</span>
                <span className="font-bold text-slate-900">
                  {(userBalance - points).toLocaleString("id-ID")} poin
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={voteMutation.isPending}
                variant="outline"
                className="flex-1 border-slate-200"
              >
                Batal
              </Button>
              <Button
                onClick={() => voteMutation.mutate()}
                disabled={voteMutation.isPending}
                className="flex-1 bg-red-900 hover:bg-red-800 text-white"
              >
                {voteMutation.isPending ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}

// --- MAIN VIEW ---
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

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["vote-balance", eventId],
    queryFn: () => getUserVoteBalance(eventId),
    retry: false,
    staleTime: 30000,
  });

  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ["vote-candidates", selectedCategory],
    queryFn: () => getPublicVoteCandidates(selectedCategory),
    enabled: !!selectedCategory,
    staleTime: 10000,
  });

  const userBalance = balanceData?.point_balance || 0;
  const isLoggedIn = !!balanceData;
  const activeCategories = categories.filter((c) => c.is_active);

  const handleVoteSuccess = (_newBalance: number) => {};

  return (
    <div className="space-y-6">
      {/* Balance Bar — shown when logged in */}
      {isLoggedIn && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-red-900" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                Sisa poin voting Anda
              </p>
              <p className="text-3xl font-bold text-slate-900 leading-none">
                {userBalance.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Total dibeli: {(balanceData?.total_points_purchased || 0).toLocaleString("id-ID")} poin
              </p>
            </div>
          </div>
          <Link
            href={`/voting/purchase?event_id=${eventId}`}
            className="inline-flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            + Beli poin
          </Link>
        </div>
      )}

      {/* Login CTA — shown when not logged in */}
      {!isLoggedIn && !balanceLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">
                Login untuk mulai voting
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Beli poin dan dukung tim favorit Anda
              </p>
            </div>
          </div>
          <Link
            href={`/login?redirect=/voting/events/${eventId}`}
            className="inline-flex items-center justify-center bg-red-900 hover:bg-red-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            Login sekarang
          </Link>
        </div>
      )}

      {/* Voting Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          {/* Tab List */}
          <TabsList className="w-full h-auto p-1 bg-slate-100 grid grid-cols-2 md:grid-cols-4 mb-8 rounded-xl">
            {activeCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {activeCategories.map((cat) => (
            <TabsContent
              key={cat.id}
              value={cat.id}
              className="animate-in fade-in-50 duration-300 focus-visible:ring-0"
            >
              {/* Category Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-slate-500 text-sm mb-3">{cat.description}</p>
                )}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                    {cat.candidate_count} Kandidat
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                    {cat.total_votes_cast.toLocaleString("id-ID")} Votes
                  </span>
                </div>
              </div>

              {/* Candidates Grid */}
              {candidatesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-slate-100">
                      <div className="aspect-[3/4] bg-slate-100" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-8 bg-slate-100 rounded" />
                        <div className="h-9 bg-slate-100 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidatesData?.candidates.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">
                    Belum ada kandidat di kategori ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {candidatesData?.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                        {candidate.image_url ? (
                          <Image
                            src={candidate.image_url}
                            alt={`Foto ${candidate.candidate_name}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <User className="w-16 h-16 text-slate-300" />
                          </div>
                        )}

                        {/* Rank Badge */}
                        {candidate.rank <= 3 && (
                          <div
                            className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow ${
                              candidate.rank === 1
                                ? "bg-yellow-400 text-yellow-900"
                                : candidate.rank === 2
                                ? "bg-slate-300 text-slate-700"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {candidate.rank}
                          </div>
                        )}

                        {/* Votes Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                          <p className="text-white text-xs font-semibold">
                            {candidate.total_votes.toLocaleString("id-ID")} votes
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-4 gap-3">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-red-900 transition-colors">
                          {candidate.candidate_name}
                        </h3>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
                          <p className="text-xl font-bold text-slate-900">
                            {candidate.total_votes.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            Total votes
                          </p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-red-900 hover:bg-red-800 text-white font-bold text-xs h-9 rounded-xl shadow-sm">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}