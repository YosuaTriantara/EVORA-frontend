import { 
  Trophy, 
  Users, 
  CreditCard, 
  CheckCircle2,
  Megaphone,
  FileText,
  LayoutDashboard,
  QrCode
} from "lucide-react";

export function BentoFeatures() {
  return (
    <section id="features" className="py-10 md:py-16 bg-slate-50">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Kelola Event dengan Satu Platform
          </h2>
          <p className="text-lg text-slate-600">
            Evora terdiri dari 3 fitur utama yang bisa bekerja secara terintegrasi maupun independen sesuai kebutuhan event Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* --- CORE 1: MANAGEMENT --- */}
          <div className="rounded-3xl p-8 border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <LayoutDashboard className="w-7 h-7" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Competition Management</h3>
             <p className="text-slate-500 text-sm mb-8 h-10">
               Sistem tata kelola perlombaan dari pendaftaran hingga penentuan juara.
             </p>
             
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Database Peserta</span>
                      <span className="text-slate-500 text-xs">Kelola data tim, official, dan berkas administrasi secara digital.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Hybrid Scoring System</span>
                      <span className="text-slate-500 text-xs">Input nilai juri secara digital atau Generate Form Penilaian melalui platform yang dapat di scan untuk input nilai.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Broadcast Center</span>
                      <span className="text-slate-500 text-xs">Kirim informasi ke seluruh peserta via Email.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Auto-Generated Web</span>
                      <span className="text-slate-500 text-xs">Landing page khusus untuk publikasi event yang berisi informasi lengkap pelaksanaan event Anda.</span>
                   </div>
                </li>
             </ul>
          </div>

          {/* --- CORE 2: VOTING --- */}
          <div className="rounded-3xl p-8 border border-slate-200 bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
             {/* Background Effect */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-red-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-yellow-400 relative z-10 backdrop-blur-sm">
                <Trophy className="w-7 h-7" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Live Voting System</h3>
             <p className="text-slate-400 text-sm mb-8 h-10 relative z-10">
               Modul monetisasi untuk meningkatkan engagement dan pemasukan event.
             </p>
             
             <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-white text-sm block">Paid Voting (Monetisasi)</span>
                      <span className="text-slate-400 text-xs">Jual poin voting untuk kategori Juara Favorit.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-white text-sm block">Real-time Leaderboard</span>
                      <span className="text-slate-400 text-xs">Grafik perolehan suara yang update otomatis tanpa refresh.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-white text-sm block">Anti-Spam Protection</span>
                      <span className="text-slate-400 text-xs">Sistem keamanan untuk mencegah kecurangan vote.</span>
                   </div>
                </li>
             </ul>
          </div>

          {/* --- CORE 3: PAYMENT --- */}
          <div className="rounded-3xl p-8 border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
             <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <CreditCard className="w-7 h-7" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Integrated Payment</h3>
             <p className="text-slate-500 text-sm mb-8 h-10">
               Gerbang pembayaran otomatis untuk pendaftaran dan voting.
             </p>
             
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">QRIS Otomatis</span>
                      <span className="text-slate-500 text-xs">Terima pembayaran via e-wallet/bank dengan verifikasi otomatis.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Manajemen Tagihan</span>
                      <span className="text-slate-500 text-xs">Kirim invoice biaya pendaftaran ke email peserta.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Laporan Keuangan</span>
                      <span className="text-slate-500 text-xs">Rekap mutasi masuk dan pendapatan event secara transparan.</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                   <div>
                      <span className="font-semibold text-slate-900 text-sm block">Settlement Cepat</span>
                      <span className="text-slate-500 text-xs">Pencairan dana pendapatan voting ke rekening panitia.</span>
                   </div>
                </li>
             </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
