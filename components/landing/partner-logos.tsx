export function PartnerLogos() {
  return (
    <section id = "partners" className="py-10 border-y border-slate-100 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          Dipercaya oleh Instansi & Sekolah Terbaik
        </p>
        {/* Logo Placeholder (Gunakan Text atau SVG Dummy agar tidak perlu cari gambar png) */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="text-xl font-bold font-serif">🏛️ PPI KOTA BANDUNG</span>
           <span className="text-xl font-bold font-mono">DWIPARADWISMA</span>
           <span className="text-xl font-bold font-sans">YAYASAN GPMB</span>
           <span className="text-xl font-bold">DISPORA JABAR</span>
           <span className="text-xl font-bold font-serif">UNIVERSITAS X</span>
        </div>
      </div>
    </section>
  );
}