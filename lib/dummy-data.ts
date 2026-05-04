// lib/dummy-data.ts
import { Event, User } from "@/types";

export const DUMMY_EVENTS: Event[] = [
  {
    id: "evt-001",
    slug: "lkbb-cakra-buana-2026",
    title: "LKBB CAKRA BUANA Series IV 2026",
    organizer: "Purna Paskibraka Indonesia - Kota Bandung",
    bannerUrl: "https://images.unsplash.com/photo-1560252118-86e5872a9df8?q=80&w=800&auto=format&fit=crop",
    
    // SKENARIO 1: Masih tahap pendaftaran (Phase 2 Logic)
    stage: "REGISTRATION_OPEN",
    isVotingActive: false, // Voting belum mulai karena belum TM

    date: "2026-03-12",
    location: "GOR Pajajaran, Bandung",
    price: "Rp 350.000",
    
    quota: 50,
    registeredCount: 45, // Sisa 5 slot, nanti di UI bisa dikasih warning "Hampir Penuh"

    // Integrasi ke Sistem Lama
    managementUrl: "https://dwiparadwisma.com/event/lkbb-cakra-buana"
  },
  {
    id: "evt-002",
    slug: "dwisma-marching-champ-2026",
    title: "Dwisma Marching Band Championship",
    organizer: "SMAN 1 Dwisma",
    bannerUrl: "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=800&auto=format&fit=crop",
    
    // SKENARIO 2: Sedang Lomba Hari H (Phase 3 & 4 Logic)
    stage: "COMPETITION_DAY",
    isVotingActive: true, // Voting Live aktif!

    date: "2026-04-20",
    location: "Istora Senayan, Jakarta",
    price: "Rp 750.000",
    
    quota: 200,
    registeredCount: 120, // Pendaftaran sudah tutup, tapi data ini tetap historis

    managementUrl: "https://dwiparadwisma.com/event/dwisma-gp"
  },
  {
    id: "evt-003",
    slug: "tech-fair-2026",
    title: "National Science & Tech Fair 2026",
    organizer: "Kementerian Pendidikan & Kebudayaan",
    bannerUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    
    // SKENARIO 3: Event Selesai
    stage: "FINISHED",
    isVotingActive: false,

    date: "2026-01-15",
    location: "JCC Plenary Hall, Jakarta",
    price: "Gratis",
    
    quota: 300,
    registeredCount: 300,

    // Tidak ada managementUrl, artinya dikelola internal atau sudah arsip
  }
];

export const CURRENT_USER: User = {
  id: "usr-001",
  name: "Yosua Triantara",
  email: "admin@evora.id",
  role: "user", // Role pemilik event
  avatar: "https://github.com/shadcn.png",
};


// lib/dummy-data.ts
import { VoteCategory, Candidate } from "@/types";

// 1. KATEGORI
export const DUMMY_CATEGORIES: VoteCategory[] = [
  {
    id: "cat-001",
    eventId: "evt-002",
    title: "Juara Favorit Sekolah (Tim)",
    description: "Dukung sekolah kebanggaanmu menjadi juara umum favorit.",
    pricePerVote: "1 Poin",
  },
  {
    id: "cat-002",
    eventId: "evt-002",
    title: "Field Commander Terbaik",
    description: "Siapa pemimpin pasukan yang paling karismatik?",
    pricePerVote: "2 Poin", // Bisa beda harga poin
  }
];

// 2. KANDIDAT (Update dengan categoryId)
export const DUMMY_CANDIDATES: Candidate[] = [
  // KATEGORI 1: TIM
  {
    id: "cand-001",
    eventId: "evt-002",
    categoryId: "cat-001", // Masuk kategori Tim
    level: "SD",
    lotNumber: 1,
    name: "Pasukan Garuda Sakti",
    school: "SMAN 1 Bandung",
    photoUrl: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?q=80&w=800&auto=format&fit=crop",
    totalVotes: 1250,
    rank: 1
  },
  {
    id: "cand-002",
    eventId: "evt-002",
    categoryId: "cat-001",
    level: "SD",
    lotNumber: 2,
    name: "Bhayangkara Muda",
    school: "SMK Taruna Bangsa",
    photoUrl: "https://images.unsplash.com/photo-1542317854-f9596aa56fd9?q=80&w=800&auto=format&fit=crop",
    totalVotes: 980,
    rank: 2
  },
  // KATEGORI 2: DANTON (Orang)
  {
    id: "cand-005",
    eventId: "evt-002",
    categoryId: "cat-002", // Masuk kategori Danton
    level: "SMA",
    lotNumber: 1,
    name: "Andi Pratama (Danton)",
    school: "SMAN 1 Bandung",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    totalVotes: 500,
    rank: 1
  },
  {
    id: "cand-006",
    eventId: "evt-002",
    categoryId: "cat-002",
    level: "SMA",
    lotNumber: 2,
    name: "Siti Aminah (Gitapati)",
    school: "SMK Taruna Bangsa",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    totalVotes: 480,
    rank: 2
  },
];


// Dummy vote packages for UI display - not tied to actual VotePackage type
export const VOTE_PACKAGES = [
  { id: "pkg-1", name: "Starter", vote_count: 10, price: 10000, priceDisplay: "Rp 10.000" },
  { id: "pkg-2", name: "Supporter", vote_count: 50, price: 45000, priceDisplay: "Rp 45.000" },
  { id: "pkg-3", name: "Super Fan", vote_count: 100, price: 85000, priceDisplay: "Rp 85.000" },
] as const;
