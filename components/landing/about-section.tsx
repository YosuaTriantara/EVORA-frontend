export function AboutSection() {
  return (
    <section id="about" className="py-10 md:py-16 bg-red-950 text-white relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* PERBAIKAN 2: Flex Column di mobile, Row di Desktop. Gap dikurangi. */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-16">
          
         {/* Mission Statement */}
        <div className="lg:w-1/2">
          <div className="inline-block bg-red-900/50 border border-red-800 rounded-full px-4 py-1 text-sm font-medium text-red-200 mb-6">
            Misi Kami
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Membangun Standar Baru Kompetisi.
          </h2>
          
          <p className="text-base md:text-lg text-red-200 leading-relaxed max-w-xl">
            Kami memahami tantangan di balik layar seperti tumpukan berkas fisik dan rumitnya proses 
            administrasi serta rekapitulasi nilai perlombaan. Evora hadir menyederhanakan itu semua menjadi satu sistem digital 
            yang efisien, dan tetap menjaga integritas lomba.
          </p>
          
          <div className="mt-8 pt-8 border-t border-red-900/50 flex flex-col sm:flex-row gap-6 md:gap-8">
            <div>
                <h4 className="text-yellow-500 font-bold text-lg mb-1">Administrasi Digital</h4>
                <p className="text-sm text-red-300">Paperless Registration</p>
            </div>

            <div>
                <h4 className="text-yellow-500 font-bold text-lg mb-1">Kendali Terpusat</h4>
                <p className="text-sm text-red-300">All-in-One Dashboard</p>
            </div>
          </div>
        </div>
          {/* Smart Stats / Key Features */}
        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            
            {/* BOX 1: Tetap 100% karena ini angka yang kuat */}
            <div className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/10">
                <div className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">100%</div>
                <div className="text-red-200 font-medium text-sm md:text-base">Administrasi Digital</div>
            </div>
            
            {/* BOX 2: Gunakan "1-Klik" untuk fitur Broadcast.
                Pesan: "Sangat mudah, cukup satu tombol untuk info ke semua orang" */}
            <div className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/10">
                <div className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">1-Klik</div>
                <div className="text-red-200 font-medium text-sm md:text-base">Kirim Informasi ke Semua Peserta</div>
            </div>
            
            {/* BOX 3: Gunakan "3-in-1" untuk Platform.
                Pesan: "Tiga fungsi besar dalam satu harga/sistem" */}
            <div className="bg-yellow-500 p-6 md:p-8 rounded-2xl border border-yellow-400 text-red-950 col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-4xl md:text-6xl font-extrabold mb-1 tracking-tight">1 Platform</div>
                        <div className="font-bold text-red-900 opacity-80 text-sm md:text-base">
                            Kelola Perlombaan, Voting dan Transaksi
                        </div>
                    </div>
                    {/* Ikon Stack/Tumpukan untuk memvisualisasikan "Banyak jadi satu" */}
                    <div className="text-3xl md:text-4xl opacity-50">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        </div>
      </div>
    </section>
  );
}