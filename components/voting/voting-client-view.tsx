"use client";

import { useState } from "react";
import {
  Candidate,
  VoteCategory,
  VotePackage,
  CompetitionLevel,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Filter, Calculator, Package } from "lucide-react";
import Image from "next/image";

// --- KOMPONEN MODAL VOTE ---
function VoteModal({
  candidate,
  packages,
}: {
  candidate: Candidate;
  packages: VotePackage[];
}) {
  const [customPoints, setCustomPoints] = useState<string>("");
  const pointsNum = parseInt(customPoints) || 0;
  const pricePerPoint = 1000;
  const minPoints = 10;

  const customPrice = pointsNum * pricePerPoint;
  const isValid = pointsNum >= minPoints;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <DialogContent className="sm:max-w-md bg-background border border-slate-200 shadow-2xl">
      <DialogHeader className="border-b pb-4">
        <DialogTitle className="text-center font-serif text-2xl text-red-950">
          Dukung {candidate.name}
        </DialogTitle>
        <DialogDescription className="text-center text-slate-500">
          {candidate.school} • Tingkat {candidate.level}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="packages" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger
            value="packages"
            className="data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:shadow-sm"
          >
            <Package className="w-4 h-4 mr-2" /> Paket Hemat
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:shadow-sm"
          >
            <Calculator className="w-4 h-4 mr-2" /> Custom
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PAKET */}
        <TabsContent
          value="packages"
          className="space-y-3 mt-4 h-70 overflow-y-auto pr-1"
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                  {pkg.points_amount}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {pkg.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    +{pkg.points_amount} Poin Vote
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-white border-slate-300 text-slate-700"
              >
                Rp {pkg.price_idr.toLocaleString("id-ID")}
              </Badge>
            </div>
          ))}
        </TabsContent>

        {/* TAB 2: CUSTOM */}
        <TabsContent value="custom" className="space-y-4 mt-4 h-70">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-blue-800 font-bold text-sm">
              Rate: Rp 1.000 / Poin
            </p>
            <p className="text-blue-600 text-xs">Min. {minPoints} Poin</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Jumlah Poin
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="25"
                className="pl-4 pr-12 text-lg font-bold h-12 border-slate-300 focus-visible:ring-red-900"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
              />
              <div className="absolute right-4 top-3 text-slate-400 text-sm font-bold">
                PTS
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-4 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 text-sm">Total Bayar:</span>
              <span className="text-2xl font-black text-red-900">
                {formatRupiah(customPrice)}
              </span>
            </div>

            {!isValid && pointsNum > 0 && (
              <p className="text-red-600 text-xs text-right font-medium">
                Min. {minPoints} poin.
              </p>
            )}
          </div>

          <Button
            className="w-full bg-yellow-500 text-black font-bold h-12 hover:bg-yellow-400 mt-2"
            disabled={!isValid}
          >
            Lanjut Pembayaran
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

// --- CLIENT VIEW UTAMA ---
interface VotingClientViewProps {
  categories: VoteCategory[];
  allCandidates: Candidate[];
  packages: VotePackage[];
}

export function VotingClientView({
  categories,
  allCandidates,
  packages,
}: VotingClientViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<CompetitionLevel | "ALL">(
    "ALL",
  );

  const filterCandidates = (categoryId: string) => {
    return allCandidates.filter((c) => {
      const isCategoryMatch = c.categoryId === categoryId;
      const isLevelMatch = selectedLevel === "ALL" || c.level === selectedLevel;
      return isCategoryMatch && isLevelMatch;
    });
  };

  return (
    <Card className="p-4 md:p-6 shadow-xl border-none min-h-125 bg-white rounded-2xl">
      <Tabs defaultValue={categories[0]?.id} className="w-full">
        {/* TAB CATEGORIES - Responsive Grid */}
        <TabsList className="w-full h-auto p-1 bg-slate-100 grid grid-cols-2 md:grid-cols-4 mb-6 rounded-xl">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="py-3 text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-red-900 data-[state=active]:font-bold data-[state=active]:shadow-sm rounded-lg"
            >
              {cat.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* FILTER LEVEL BUTTONS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm overflow-x-auto max-w-full">
            <div className="flex items-center px-3 text-slate-400 border-r border-slate-100 mr-1">
              <Filter className="w-4 h-4" />
            </div>
            {(["ALL", "SD", "SMP", "SMA"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedLevel === level
                    ? "bg-red-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {level === "ALL" ? "SEMUA" : level}
              </button>
            ))}
          </div>
        </div>

        {/* KONTEN KANDIDAT */}
        {categories.map((cat) => {
          const displayedCandidates = filterCandidates(cat.id);

          return (
            <TabsContent
              key={cat.id}
              value={cat.id}
              className="animate-in fade-in-50 duration-500 focus-visible:ring-0"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  {cat.title}
                </h2>
                <p className="text-slate-500 mb-4">{cat.description}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    Biaya: {cat.pricePerVote}
                  </Badge>
                  {selectedLevel !== "ALL" && (
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-900 bg-red-50"
                    >
                      Tingkat: {selectedLevel}
                    </Badge>
                  )}
                </div>
              </div>

              {displayedCandidates.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400">
                    Belum ada kandidat tingkat {selectedLevel} di kategori ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedCandidates.map((cand) => (
                    <Card
                      key={cand.id}
                      className="group overflow-hidden hover:shadow-xl transition-all border-slate-200 bg-white rounded-xl"
                    >
                      <div className="relative h-64 overflow-hidden bg-slate-100">
                        <Image
                          src={cand.photoUrl}
                          alt={`Foto kandidat ${cand.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />

                        {/* Rank Badge
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-900 border border-slate-100 flex items-center gap-1">
                           <Trophy className="w-3 h-3 text-yellow-500" /> #{cand.rank}
                        </div> */}

                        {/* Level Badge */}
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-sm">
                          {cand.level}
                        </div>
                      </div>

                      <CardContent className="text-center pt-5 pb-2">
                        <div className="inline-block bg-red-50 text-red-900 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 mb-2 uppercase tracking-wide">
                          No. Undian {cand.lotNumber}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                          {cand.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                          {cand.school}
                        </p>

                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-2xl font-black text-slate-900 font-serif">
                            {cand.totalVotes.toLocaleString()}
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            Suara Masuk
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
                          <VoteModal candidate={cand} packages={packages} />
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
