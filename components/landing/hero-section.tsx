export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-16 overflow-hidden bg-slate-50">

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-red-50 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

          <div className="flex flex-col items-center gap-3 mb-8">
            <img
              src="/evora-logo-2026.png"
              alt="Evora Logo"
              className="w-55 h-55 object-contain"
            />
            <span className="text-2xl font-extrabold text-slate-900 tracking-widest">
              EVORA
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-2 leading-[1.15]">
            Kelola KompetisiMu,{" "}
            <br />
            <span className="text-red-900">Tanpa Drama.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 pb-12 mt-2 leading-relaxed max-w-lg">
            Satu platform untuk mengelola seluruh kebutuhan perlombaanmu.
            Informasi, data, dan komunikasi peserta jadi lebih mudah dan terpusat.
          </p>

        </div>
      </div>
    </section>
  );
}