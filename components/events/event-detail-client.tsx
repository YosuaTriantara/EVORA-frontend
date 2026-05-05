"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trophy, ArrowRight } from "lucide-react";
import { registerTeam } from "@/services/registration-service";
import type { EventDetailVoting } from "@/types/event";
import Image from "next/image";

interface RegisterButtonProps {
  mode: "register-button";
  categoryId: string;
  eventId: string;
  categoryName: string;
}

interface VotingPreviewProps {
  mode: "voting-preview";
  votingData: EventDetailVoting;
  eventSlug: string;
}

type EventDetailClientProps = RegisterButtonProps | VotingPreviewProps;

export function EventDetailClient(props: EventDetailClientProps) {
  if (props.mode === "register-button") {
    return <RegisterButton {...props} />;
  }
  return <VotingPreview {...props} />;
}

// ── Register Button + Modal ───────────────────────────────────────────────────

export function RegisterButton({
  categoryId,
  eventId,
  categoryName,
}: RegisterButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await registerTeam({
        event_id: eventId,
        category_id: categoryId,
        team_name: teamName,
        institution,
      });
      setSuccess(result.message);
      setTimeout(() => {
        setOpen(false);
        router.push("/dashboard/official");
      }, 1500);
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        setError("Silakan login terlebih dahulu untuk mendaftar.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-full h-auto"
      >
        Daftar Sekarang
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Daftar: {categoryName}</DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <p className="text-green-700 font-medium">{success}</p>
              <p className="text-slate-500 text-sm mt-1">
                Mengarahkan ke dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nama Tim *
                </label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: SMAN 5 Jakarta"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Institusi / Sekolah *
                </label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: SMA Negeri 5 Jakarta"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !teamName || !institution}
                className="w-full bg-red-900 hover:bg-red-800 text-white font-bold h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mendaftar…
                  </>
                ) : (
                  "Konfirmasi Pendaftaran"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Voting Preview ─────────────────────────────────────────────────────────────

function VotingPreview({ votingData, eventSlug }: VotingPreviewProps) {
  const firstCategory = votingData.data[0];
  if (!firstCategory) return null;

  const previewCandidates = firstCategory.candidates.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-slate-900 text-sm">
            {firstCategory.category_name}
          </span>
        </div>
        <Link
          href={`/voting/${eventSlug}`}
          className="flex items-center gap-1 text-xs font-bold text-red-900 hover:text-red-700"
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {previewCandidates.map((candidate, i) => (
          <div key={i} className="text-center">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
              {candidate.image_url ? (
                <Image
                  src={candidate.image_url}
                  alt={candidate.candidate_name}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                  {candidate.candidate_name.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">
              {candidate.candidate_name}
            </p>
            <p className="text-[10px] text-slate-500 line-clamp-1">
              {candidate.team_name}
            </p>
            {candidate.current_votes !== undefined && (
              <p className="text-[10px] font-bold text-red-900 mt-0.5">
                {candidate.current_votes.toLocaleString()} votes
              </p>
            )}
          </div>
        ))}
      </div>

      <Link href={`/voting/${eventSlug}`}>
        <Button className="w-full mt-4 bg-red-900 hover:bg-red-800 text-white font-bold h-10">
          Vote Sekarang
        </Button>
      </Link>
    </div>
  );
}
