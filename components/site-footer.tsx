import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-8 border-t-2 border-red-900">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">

        {/* TOP: Brand & Tagline & Socials */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/evora-logo-2026.png"
              alt="Evora Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">EVORA</span>
          </div>

          <p className="text-slate-400 text-sm max-w-sm">
            Kelola kompetisiMu dengan lebih mudah, dan terpusat
          </p>

          <div className="flex gap-4">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* BOTTOM: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-800 text-xs text-slate-500">
          <div>&copy; 2026 Evora Indonesia. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}