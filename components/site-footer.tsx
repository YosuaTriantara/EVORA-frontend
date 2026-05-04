import Link from "next/link";
import { Instagram, Linkedin, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-10 border-t border-slate-800">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">

        {/* TOP: Brand & Short Info */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/evora-logo-2026.png"
              alt="Evora Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">EVORA</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Kelola kompetisimu dengan lebih mudah, terpusat, dan profesional.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* MID: Navigation */}
        <div className="flex flex-wrap gap-6 justify-center mb-8 text-sm">
          <Link href="/voting" className="hover:text-red-400 transition-colors">Live Voting</Link>
          <Link href="/events" className="hover:text-red-400 transition-colors">Cari Event</Link>
          <Link href="/login" className="hover:text-red-400 transition-colors">Masuk</Link>
        </div>

        {/* BOTTOM: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>&copy; 2026 PT Evora Digital Indonesia. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
