"use client";
// Real voting client view — castVote via BFF proxy

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Loader2, Trophy } from "lucide-react";
import Image from "next/image";
import { castVote } from "@/services/voting-service";
import type { EventDetailVoting, VoteCandidate } from "@/types/event";

interface Props {
  votingData: EventDetailVoting;
  initialPointBalance: number;
  isVotingLive: boolean;
}

function VoteModal({
  candidate,
  pointBalance,
  isVotingLive,
  onVoteSuccess,
}: {
  candidate: VoteCandidate;
  pointBalance: number;
  isVotingLive: boolean;
  onVoteSuccess: (remainingPoints: number) => void;
}) {
  const router = useRouter();
  const [points, setPoints] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pointsNum = parseInt(points) || 0;
  const isValid = pointsNum >= 1 && pointsNum <= pointBalance;

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    if (!candidate.team_id) {
      setError("Data kandidat tidak valid.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const result = await castVote(candidate.team_id, pointsNum);
      setSuccess(result.message);
      onVoteSuccess(result.remaining_points);
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        setError("Silakan login untuk memberikan vote.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(err instanceof Error ? err.message : "Vote gagal.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-sm bg-background">
      <DialogHeader>
        <DialogTitle className="text-center font-bold text-xl text-red-950">
          Vote untuk {candidate.candidate_name}
        </DialogTitle>
        <DialogDescription className="text-center text-slate-500">
          {candidate.team_name}
        </DialogDescription>
      </DialogHeader>

      {success ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold text-green-700">{success}</p>
          <p className="text-sm text-slate-500 mt-1">
            Sisa poin:{" "}
            <span className="font-bold">{pointBalance.toLocaleString()}</span>
          </p>
        </div>
      ) : !isVotingLive ? (
        <div className="text-center py-6">
          <p className="text-slate-500">Voting belum/sudah tidak aktif.</p>
        </div>
      ) : (
        <form onSubmit={handleVote} className="space-y-4 mt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-amber-800 text-sm font-bold">
              💎 Saldo Poin: {pointBalance.toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Jumlah Poin (min. 1)
            </label>
            <Input
              type="number"
              min="1"
              max={pointBalance}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="text-center text-xl font-bold h-12"
            />
          </div>

          {pointsNum > pointBalance && (
            <p className="text-red-600 text-xs text-center">
              Poin tidak cukup. Saldo Anda: {pointBalance}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full bg-red-900 hover:bg-red-800 text-white font-bold h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses…
              </>
            ) : (
              `Vote ${pointsNum} Poin`
            )}
          </Button>
        </form>
      )}
    </DialogContent>
  );
}

export function RealVotingClientView({
  votingData,
  initialPointBalance,
  isVotingLive,
}: Props) {
  const [pointBalance, setPointBalance] = useState(initialPointBalance);
  const [selectedCandidate, setSelectedCandidate] =
    useState<VoteCandidate | null>(null);

  return (
    <Card className="p-4 md:p-6 shadow-xl border-none bg-white rounded-2xl">
      <Tabs defaultValue={votingData.data[0]?.category_name} className="w-full">
        <TabsList className="w-full h-auto p-1 bg-slate-100 grid grid-cols-2 md:grid-cols-4 mb-6 rounded-xl">
          {votingData.data.map((cat) => (
            <TabsTrigger
              key={cat.category_name}
              value={cat.category_name}
              className="py-3 text-sm data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-lg"
            >
              {cat.category_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {votingData.data.map((cat) => (
          <TabsContent
            key={cat.category_name}
            value={cat.category_name}
            className="animate-in fade-in-50 duration-300"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {cat.category_name}
              </h2>
              <p className="text-slate-500 text-sm">
                {cat.candidates.length} kandidat
              </p>
            </div>

            {cat.candidates.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400">
                  Belum ada kandidat di kategori ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cat.candidates.map((candidate, i) => (
                  <Card
                    key={i}
                    className="group overflow-hidden hover:shadow-xl transition-all border-slate-200 bg-white rounded-xl"
                  >
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      {candidate.image_url ? (
                        <Image
                          src={candidate.image_url}
                          alt={candidate.candidate_name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl font-bold">
                          {candidate.candidate_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <CardContent className="text-center pt-5 pb-2">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                        {candidate.candidate_name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                        {candidate.team_name}
                      </p>

                      {candidate.current_votes !== undefined && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-2xl font-black text-slate-900 font-serif">
                            {candidate.current_votes.toLocaleString()}
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            Suara Masuk
                          </p>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pb-6 pt-2">
                      <Button
                        onClick={() => setSelectedCandidate(candidate)}
                        disabled={!isVotingLive}
                        className="w-full bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white font-bold h-10 shadow-md"
                      >
                        {isVotingLive ? (
                          <>
                            <Trophy className="w-4 h-4 mr-2" /> VOTE
                          </>
                        ) : (
                          "Voting Tidak Aktif"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Vote Dialog */}
      <Dialog
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      >
        {selectedCandidate && (
          <VoteModal
            candidate={selectedCandidate}
            pointBalance={pointBalance}
            isVotingLive={isVotingLive}
            onVoteSuccess={(remaining) => {
              setPointBalance(remaining);
              setSelectedCandidate(null);
            }}
          />
        )}
      </Dialog>
    </Card>
  );
}
