"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { InfoKipItem, INITIAL_INFO_KIP_ITEMS } from "@/data/portalData";

export default function InfoKipUnusaPage() {
  const [activeTab, setActiveTab] = useState<"pengumuman" | "regulasi" | "pencairan" | "evaluasi" | "unduhan" | "faq">("pengumuman");
  const [searchFaq, setSearchFaq] = useState("");
  const [infoItems, setInfoItems] = useState<InfoKipItem[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam === "unduhan" || tabParam === "berkas") {
          setActiveTab("unduhan");
        }
      }

      const stored = localStorage.getItem("semadiksi_info_kip_items");
      if (stored) {
        setInfoItems(JSON.parse(stored));
      } else {
        setInfoItems(INITIAL_INFO_KIP_ITEMS);
        localStorage.setItem("semadiksi_info_kip_items", JSON.stringify(INITIAL_INFO_KIP_ITEMS));
      }
    } catch (e) {
      setInfoItems(INITIAL_INFO_KIP_ITEMS);
    }
  }, []);

  const faqs = [
    {
      q: "Berapa standar IPK minimal yang harus dipertahankan mahasiswa penerima KIP-K UNUSA?",
      a: "Mahasiswa penerima KIP-K UNUSA wajib mempertahankan Indeks Prestasi Kumulatif (IPK) minimal 3.00 pada setiap semester. Jika IPK di bawah 3.00, mahasiswa akan menerima surat peringatan dan pendampingan khusus dari divisi pendidikan SEMADIKSI."
    },
    {
      q: "Bagaimana alur pencairan bantuan biaya hidup KIP-K dari Puslapdik Kemdikbudristek?",
      a: "Bantuan biaya hidup ditransfer langsung oleh Puslapdik ke rekening BTN / Bank Mandiri pribadi mahasiswa secara berkala setiap semester (biasanya per 6 bulan). Pihak kampus UNUSA maupun pengurus SEMADIKSI tidak memotong dana biaya hidup sedikit pun."
    },
    {
      q: "Apakah mahasiswa penerima KIP-K diperbolehkan bekerja paruh waktu atau wirausaha?",
      a: "Boleh dan sangat didukung, selama kegiatan bekerja atau wirausaha tidak mengganggu jadwal perkuliahan, IPK tetap memenuhi kriteria minimal (≥ 3.00), serta mampu memenuhi kewajiban hadir kegiatan SEMADIKSI."
    },
    {
      q: "Bagaimana jika terjadi kendala pada rekening pencairan (rekening pasif / terblokir)?",
      a: "Mahasiswa dapat segera melapor ke Layanan Helpdesk Kemahasiswaan UNUSA atau menghubungi Divisi Advokasi KIP UNUSA melalui menu pengaduan resmi agar dapat diberikan surat pengantar pembukaan rekening ke bank mitra."
    },
    {
      q: "Apakah penerima KIP-K UNUSA boleh mendaftar beasiswa lain?",
      a: "Penerima KIP-K tidak diperbolehkan menerima beasiswa lain yang bersumber dari APBN/APBD atau beasiswa yang menanggung komponen biaya hidup/UKT secara ganda. Namun diperbolehkan mengikuti bantuan kompetisi, insentif prestasi, atau perlombaan ilmiah."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchFaq.toLowerCase()) || 
    f.a.toLowerCase().includes(searchFaq.toLowerCase())
  );

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-7xl mx-auto py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary/15 via-surface to-surface-container-low border border-primary/25 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/15 text-primary rounded-full text-xs font-bold border border-primary/30">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Pusat Layanan & Informasi Resmi KIP Kuliah UNUSA</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Informasi Terkait KIP UNUSA
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Panduan lengkap, tata tertib, hak & kewajiban, alur pencairan dana, evaluasi kelayakan semester, serta kanal advokasi resmi bagi seluruh mahasiswa penerima beasiswa KIP Kuliah di Universitas Nahdlatul Ulama Surabaya.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/pengajuan-pencairan"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              <span>Form Pengajuan Pencairan KIP-K</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-surface-variant/30 relative z-10">
          <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Penerima KIP-K</p>
            <p className="text-lg md:text-xl font-black text-primary mt-0.5">1.335+ Mahasiswa</p>
          </div>
          <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Syarat Minimal IPK</p>
            <p className="text-lg md:text-xl font-black text-emerald-700 mt-0.5">3.00 / 4.00</p>
          </div>
          <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Pembebasan SPP/UKT</p>
            <p className="text-lg md:text-xl font-black text-amber-600 mt-0.5">100% Ditanggung</p>
          </div>
          <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Layanan Advokasi</p>
            <p className="text-lg md:text-xl font-black text-indigo-600 mt-0.5">Responsif 24/7</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-surface border border-surface-variant/30 rounded-2xl p-2 flex overflow-x-auto gap-2 scrollbar-none shadow-xs">
        <button
          onClick={() => setActiveTab("pengumuman")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "pengumuman"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">campaign</span>
          <span>Pengumuman & Info Terbaru</span>
        </button>

        <button
          onClick={() => setActiveTab("regulasi")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "regulasi"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">gavel</span>
          <span>Hak & Kewajiban</span>
        </button>

        <button
          onClick={() => setActiveTab("pencairan")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "pencairan"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">payments</span>
          <span>Alur Pencairan Dana</span>
        </button>

        <button
          onClick={() => setActiveTab("evaluasi")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "evaluasi"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">analytics</span>
          <span>Evaluasi IPK Semester</span>
        </button>

        <button
          onClick={() => setActiveTab("unduhan")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "unduhan"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">folder_open</span>
          <span>Berkas & Unduhan</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === "faq"
              ? "bg-primary text-white shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">help</span>
          <span>FAQ & Pengaduan</span>
        </button>
      </div>

      {/* Tab 0: Pengumuman & Info Terbaru dari Admin */}
      {activeTab === "pengumuman" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">campaign</span>
              Pengumuman & Informasi Terbaru KIP UNUSA
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">
              Diunggah oleh Administrator Kemahasiswaan
            </span>
          </div>

          {infoItems.length === 0 ? (
            <div className="bg-surface border border-surface-variant/30 rounded-3xl p-8 text-center text-on-surface-variant text-xs space-y-2">
              <span className="material-symbols-outlined text-4xl text-outline">info</span>
              <p className="font-bold text-sm text-on-surface">Belum ada pengumuman KIP-K</p>
              <p>Pengumuman terbaru dari admin akan ditampilkan di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {infoItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-surface border rounded-3xl p-6 space-y-3 shadow-xs transition-all hover:shadow-md ${
                    item.priority === "Tinggi"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-surface-variant/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.category}
                      </span>
                      {item.priority === "Tinggi" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">priority_high</span>
                          Penting
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {item.dateUploaded} • {item.author}
                    </span>
                  </div>

                  <h4 className="font-bold text-base md:text-lg text-on-surface leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  {item.attachmentFileName && (
                    <div className="pt-2 border-t border-surface-variant/15 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-primary font-bold">
                        <span className="material-symbols-outlined text-base">attachment</span>
                        <span>Lampiran: {item.attachmentFileName}</span>
                      </div>
                      {item.attachmentUrl && item.attachmentUrl !== "#" && (
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          Buka Link Lampiran
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Hak & Kewajiban */}
      {activeTab === "regulasi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Hak */}
          <div className="bg-surface border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">verified</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base md:text-lg">Hak Mahasiswa KIP-K UNUSA</h3>
                <p className="text-xs text-on-surface-variant">Fasilitas dan jaminan studi resmi</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs md:text-sm text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-base flex-shrink-0 mt-0.5">check_circle</span>
                <span><strong>Bebas Biaya Pendidikan (UKT):</strong> Pembebasan 100% biaya SPP/UKT per semester sampai lulus sesuai kuota skema KIP.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-base flex-shrink-0 mt-0.5">check_circle</span>
                <span><strong>Bantuan Biaya Hidup:</strong> Penerimaan uang saku langsung dari Kemdikbudristek melalui rekening per 6 bulan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-base flex-shrink-0 mt-0.5">check_circle</span>
                <span><strong>Program Pembinaan Soft-Skill:</strong> Hak gratis mengikuti pelatihan leadership, karya tulis ilmiah, dan mentoring akademik SEMADIKSI.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-base flex-shrink-0 mt-0.5">check_circle</span>
                <span><strong>Perlindungan & Advokasi Hak:</strong> Bimbingan khusus jika mengalami hambatan perkuliahan atau kendala perbankan.</span>
              </li>
            </ul>
          </div>

          {/* Card Kewajiban */}
          <div className="bg-surface border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">assignment_late</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base md:text-lg">Kewajiban Penerima KIP-K</h3>
                <p className="text-xs text-on-surface-variant">Komitmen dan aturan kedisiplinan</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs md:text-sm text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">priority_high</span>
                <span><strong>IPK Minimal 3.00:</strong> Wajib menjaga capaian prestasi akademik IPK ≥ 3.00 di setiap akhir semester.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">priority_high</span>
                <span><strong>Keaktifan Ormawa & SEMADIKSI:</strong> Mengikuti minimal 80% agenda wajib SEMADIKSI UNUSA serta presensi rapat/kegiatan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">priority_high</span>
                <span><strong>Laporan Portofolio KIP:</strong> Mengirimkan laporan kinerja prestasi dan kegiatan kemahasiswaan tepat waktu.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">priority_high</span>
                <span><strong>Larangan Cuti & Menikah:</strong> Tidak diperbolehkan mengambil cuti akademik atau menikah selama masa studi KIP-K.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Alur Pencairan */}
      {activeTab === "pencairan" && (
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-surface-variant/20 pb-4">
            <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              Alur & Mekanisme Pencairan Dana KIP-K UNUSA
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Tahapan penyaluran bantuan dari Puslapdik Kemdikbudristek hingga masuk ke rekening mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-on-surface text-xs md:text-sm">Verifikasi Akademik Campus</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Biro Kemahasiswaan UNUSA mengunggah SK Rektor penetapan keaktifan mahasiswa ke sistem SIM KIP-K nasional.
              </p>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-on-surface text-xs md:text-sm">Penerbitan SPP / SPM Puslapdik</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Puslapdik menerbitkan Surat Perintah Membayar (SPM) dan mengajukan permohonan ke KPPN Kementerian Keuangan.
              </p>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-on-surface text-xs md:text-sm">Transfer Bank Penyalur</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                KPPN menyalurkan dana ke Bank Penyalur (BTN / Bank Mandiri) untuk ditransfer ke rekening pribadi mahasiswa.
              </p>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-on-surface text-xs md:text-sm">Notifikasi & Pencairan</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Dana saku masuk utuh tanpa potongan. Mahasiswa dapat mengecek mutasi lewat mobile banking BTN / Mandiri.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-on-surface">
            <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">info</span>
            <div>
              <p className="font-bold text-primary mb-0.5">Catatan Penting Penyaluran Dana:</p>
              <p className="text-on-surface-variant">
                Setiap penerima KIP-K UNUSA berhak mendapatkan dana secara utuh. Jika menemukan pihak yang meminta bagian atau pungutan liar, segera laporkan ke tim advokasi SEMADIKSI UNUSA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Evaluasi IPK Semester */}
      {activeTab === "evaluasi" && (
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-surface-variant/20 pb-4">
            <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">bar_chart</span>
              Mekanisme Evaluasi Prestasi Academic & IPK Semester
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Standar kelayakan penerima beasiswa KIP-K di Universitas Nahdlatul Ulama Surabaya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold">Kategori Aman</span>
              <h4 className="font-bold text-emerald-800 text-sm">IPK ≥ 3.00</h4>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Memenuhi kriteria minimal. Hak beasiswa (UKT + Biaya Hidup) berlanjut secara otomatis untuk semester berikutnya.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
              <span className="px-2.5 py-1 bg-amber-600 text-white rounded-md text-[10px] font-bold">Peringatan 1</span>
              <h4 className="font-bold text-amber-800 text-sm">2.75 ≤ IPK &lt; 3.00</h4>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Mendapatkan surat teguran pertama dari Biro Kemahasiswaan dan wajib mengikuti bimbingan belajar/tutor sebaya SEMADIKSI.
              </p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-2">
              <span className="px-2.5 py-1 bg-rose-600 text-white rounded-md text-[10px] font-bold">Rekomendasi Sanksi</span>
              <h4 className="font-bold text-rose-800 text-sm">IPK &lt; 2.75 (2x Berturut)</h4>
              <p className="text-xs text-rose-900/80 leading-relaxed">
                Peringatan keras & evaluasi mendalam. Jika tidak mengalami perbaikan, diusulkan penggantian / penghentian KIP-K sesuai ketentuan Kemdikbud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Unduhan & Berkas */}
      {activeTab === "unduhan" && (
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">download_for_offline</span>
            Berkas Dokumen & Formulir Resmi KIP-K UNUSA
          </h3>
          <p className="text-xs text-on-surface-variant">Unduh berkas kelengkapan administrasi dan panduan resmi penerima KIP-K UNUSA.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 text-3xl">picture_as_pdf</span>
                <div>
                  <h4 className="font-bold text-on-surface text-xs md:text-sm">Buku Pedoman KIP-K UNUSA 2025</h4>
                  <p className="text-[11px] text-on-surface-variant">File PDF • 2.4 MB</p>
                </div>
              </div>
              <button
                onClick={() => alert("Mengunduh: Buku Pedoman KIP-K UNUSA 2025.pdf")}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span> Unduh
              </button>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 text-3xl">description</span>
                <div>
                  <h4 className="font-bold text-on-surface text-xs md:text-sm">Formulir Laporan Portofolio KIP</h4>
                  <p className="text-[11px] text-on-surface-variant">Template Word • 1.1 MB</p>
                </div>
              </div>
              <button
                onClick={() => alert("Mengunduh: Template Laporan Portofolio KIP.docx")}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span> Unduh
              </button>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-3xl">task_alt</span>
                <div>
                  <h4 className="font-bold text-on-surface text-xs md:text-sm">Surat Statement Komitmen KIP-K</h4>
                  <p className="text-[11px] text-on-surface-variant">Template PDF • 450 KB</p>
                </div>
              </div>
              <button
                onClick={() => alert("Mengunduh: Surat Statement Komitmen KIP-K.pdf")}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span> Unduh
              </button>
            </div>

            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">contact_support</span>
                <div>
                  <h4 className="font-bold text-on-surface text-xs md:text-sm">Form Pengaduan & Advokasi KIP</h4>
                  <p className="text-[11px] text-on-surface-variant">Formulir Online SEMADIKSI</p>
                </div>
              </div>
              <button
                onClick={() => alert("Membuka Formulir Pengaduan Advokasi KIP-K UNUSA...")}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span> Buka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: FAQ & Helpdesk */}
      {activeTab === "faq" && (
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-variant/20 pb-4">
            <div>
              <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">live_help</span>
                Tanya Jawab & Helpdesk KIP-K UNUSA
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Jawaban atas pertanyaan umum seputar KIP Kuliah di UNUSA.</p>
            </div>

            {/* Search FAQ */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
              <input
                type="text"
                placeholder="Cari FAQ..."
                value={searchFaq}
                onChange={(e) => setSearchFaq(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-low border border-surface-variant/30 rounded-xl text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-surface-container-low border border-surface-variant/20 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-bold text-on-surface text-xs md:text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">help_outline</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Box */}
          <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-bold text-on-surface text-sm">Butuh bantuan lebih lanjut?</h4>
              <p className="text-xs text-on-surface-variant">Hubungi tim Divisi Advokasi KIP SEMADIKSI UNUSA via WhatsApp resmi.</p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Menghubungi Hotline Advokasi KIP-K UNUSA via WhatsApp: 0812-3456-7890");
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-xs inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>Hubungi Advokasi SEMADIKSI</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
