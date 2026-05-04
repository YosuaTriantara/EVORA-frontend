import { 
  Trophy, 
  Users, 
  BarChart3, 
  CreditCard, 
  ShieldCheck, 
  Smartphone,
  FileText,
  Layers
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: "Manajemen Peserta & Tim",
    desc: "Kelola tim, official, dan anggota pasukan dalam satu dashboard. "
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
    title: "Live Voting System",
    desc: "Modul voting terpisah untuk favorit penonton. Terintegrasi payment gateway, anti spam, dan laporan transparan."
  },
  {
    icon: <Smartphone className="h-6 w-6 text-pink-600" />,
    title: "Mobile Friendly",
    desc: "Dashboard ringan dan responsif. "
  },
  {
    icon: <CreditCard className="h-6 w-6 text-green-600" />,
    title: "Payment Gateway Otomatis",
    desc: "Terima pembayaran pendaftaran dan voting via QRIS & Virtual Account dengan verifikasi otomatis."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-orange-600" />,
    title: "Keamanan & Audit Log",
    desc: "Sistem role-based, penguncian nilai, dan audit log memastikan data tidak bisa dimanipulasi."
  },
  {
    icon: <Layers className="h-6 w-6 text-cyan-600" />,
    title: "Multi Event Management",
    desc: "Satu akun bisa mengelola atau mengikuti banyak event. Dashboard otomatis menyesuaikan per lomba."
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Fitur Lengkap untuk Event Organizer Modern
          </h2>
          <p className="text-lg text-gray-600">
            EVORA membantu Anda menjalankan lomba yang profesional, adil, dan efisien — dari registrasi sampai sertifikat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
