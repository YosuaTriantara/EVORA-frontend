"use client";

import { useState } from "react";
import { VoteCategoriesView } from "./vote-categories-view";
import { VoteCandidatesView } from "./vote-candidates-view";
import { VotePackagesView } from "./vote-packages-view";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Folder, Package, Users } from "lucide-react";

interface VotingTabProps {
  eventId: string;
}

type VotingView = "categories" | "candidates" | "packages";

export function VotingTab({ eventId }: VotingTabProps) {
  const [view, setView] = useState<VotingView>("categories");
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // View: Candidates for a specific category
  if (view === "candidates" && selectedCategory) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => {
            setView("categories");
            setSelectedCategory(null);
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Kategori
        </Button>
        <VoteCandidatesView
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
        />
      </div>
    );
  }

  // View: Packages (platform-wide)
  if (view === "packages") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => setView("categories")}
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Kategori
        </Button>
        <VotePackagesView />
      </div>
    );
  }

  // View: Categories (default)
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Manajemen Voting</h3>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setView("packages")}
        >
          <Package className="w-4 h-4" />
          Kelola Paket Vote
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={<Folder className="w-5 h-5 text-blue-600" />}
          title="Kategori Voting"
          description="Buat kategori voting untuk event ini. Setiap kategori dapat memiliki multiple kandidat."
        />
        <InfoCard
          icon={<Users className="w-5 h-5 text-green-600" />}
          title="Kandidat"
          description="Tambahkan kandidat ke setiap kategori. Kandidat terhubung dengan team yang terdaftar."
        />
        <InfoCard
          icon={<Package className="w-5 h-5 text-amber-600" />}
          title="Paket Vote"
          description="Kelola paket voting yang tersedia untuk pembelian points."
        />
      </div>

      {/* Categories View with Candidate Management */}
      <VoteCategoriesView eventId={eventId} />

      {/* Note about candidate management */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Tips Mengelola Kandidat</p>
        <p>
          Untuk mengelola kandidat dalam suatu kategori, klik tombol edit (✏️) pada kategori 
          yang ingin dikelola. Anda akan diarahkan ke halaman manajemen kandidat untuk kategori tersebut.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
