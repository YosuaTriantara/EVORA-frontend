"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

// Tipe data untuk FAQ Item
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  // State untuk melacak item mana yang sedang terbuka (null = tertutup semua)
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Data FAQ (Disesuaikan dengan konteks "Kelola Kompetisi" dari Hero Section Anda)
  const faqData: FaqItem[] = [
    {
      question: "Apakah saya bisa mencoba fitur premium secara gratis?",
      answer: "Tentu saja. Kami menyediakan paket 'Mulai Gratis' yang mencakup fitur dasar manajemen peserta dan publikasi event. Anda bisa upgrade kapan saja jika membutuhkan fitur Live Voting atau data export."
    },
    {
      question: "Bagaimana sistem keamanan data peserta?",
      answer: "Kami memprioritaskan privasi. Data peserta disimpan dalam server terenkripsi (AES-256) dan kami tidak akan pernah menjual data tersebut ke pihak ketiga. Platform kami juga sudah mendukung 2FA untuk admin."
    },
    {
      question: "Apakah mendukung sistem Live Voting real-time?",
      answer: "Ya, ini adalah fitur unggulan kami. Penonton atau juri bisa memberikan suara melalui smartphone, dan hasilnya akan muncul di layar dashboard admin secara real-time tanpa delay (low latency)."
    },
    {
      question: "Bisakah saya mengunduh data rekapitulasi nilai?",
      answer: "Sangat bisa. Anda dapat mengunduh seluruh data peserta, status pembayaran, dan rekapitulasi nilai juri dalam format Excel (.xlsx) atau PDF siap cetak hanya dengan satu klik."
    },
    {
      question: "Apakah platform ini cocok untuk lomba tingkat sekolah?",
      answer: "Platform kami didesain fleksibel. Mulai dari Classmeeting sekolah, Porseni tingkat kota, hingga kejuaraan Nasional bisa dikelola di sini. Tersedia template kategori lomba yang bisa disesuaikan."
    }
  ];

  // Handler untuk toggle accordion
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 mb-6">
             <span className="text-xs font-bold text-red-900 tracking-wide uppercase">Dukungan & Bantuan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-slate-600">
            Pahami bagaimana platform kami membantu mengelola kompetisi Anda menjadi lebih efisien dan profesional.
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-slate-100 last:border-0"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none group hover:bg-slate-50 transition-colors duration-200"
                onClick={() => handleToggle(index)}
                aria-expanded={openIndex === index}
              >
                <span className={`text-lg font-medium transition-colors duration-200 ${
                  openIndex === index ? 'text-red-900' : 'text-slate-800 group-hover:text-red-900'
                }`}>
                  {item.question}
                </span>
                
                {/* Icon Wrapper */}
                <span className={`ml-6 flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                    openIndex === index ? 'bg-red-100 text-red-900' : 'bg-slate-100 text-slate-500'
                }`}>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </span>
              </button>

              {/* Accordion Content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-slate-600 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            Masih punya pertanyaan lain?{" "}
            <a href="#contact" className="text-red-900 font-bold hover:underline hover:text-red-800">
              Hubungi Tim Support
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}