"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BeritaAcaraItem, INITIAL_BERITA_ACARA } from "@/data/portalData";

export default function PublicBeritaAcaraPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [beritaAcaraList, setBeritaAcaraList] = useState<BeritaAcaraItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Selesai" | "Akan Datang">("Semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [selectedBA, setSelectedBA] = useState<BeritaAcaraItem | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Load Berita Acara list from localStorage or fallback to initial data
    try {
      const stored = localStorage.getItem("semadiksi_berita_acara");
      if (stored) {
        setBeritaAcaraList(JSON.parse(stored));
      } else {
        setBeritaAcaraList(INITIAL_BERITA_ACARA);
        localStorage.setItem("semadiksi_berita_acara", JSON.stringify(INITIAL_BERITA_ACARA));
      }
    } catch (e) {
      setBeritaAcaraList(INITIAL_BERITA_ACARA);
    }
  }, []);

  const filteredList = beritaAcaraList.filter((item) => {
    if (statusFilter !== "Semua" && item.status !== statusFilter) {
      return false;
    }
    if (categoryFilter !== "Semua" && item.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.organizer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selesaiCount = beritaAcaraList.filter((b) => b.status === "Selesai").length;
  const upcomingCount = beritaAcaraList.filter((b) => b.status === "Akan Datang").length;
  const totalAttendees = beritaAcaraList.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0);

  const categoryColorMap: { [key: string]: string } = {
    "Rapat Kerja": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    "Sosialisasi KIP-K": "bg-primary/10 text-primary border-primary/20",
    Pelatihan: "bg-amber-500/10 text-amber-700 border-amber-200",
    Workshop: "bg-sky-500/10 text-sky-700 border-sky-200",
    Lomba: "bg-purple-500/10 text-purple-700 border-purple-200",
    Seminar: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    "Pengabdian Masyarakat": "bg-teal-500/10 text-teal-700 border-teal-200",
    Lainnya: "bg-stone-500/10 text-stone-700 border-stone-200",
  };

  const categories = [
    "Semua",
    "Rapat Kerja",
    "Sosialisasi KIP-K",
    "Pelatihan",
    "Workshop",
    "Lomba",
    "Seminar",
    "Pengabdian Masyarakat",
  ];

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col font-body">
      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky z-40 bg-surface/90 backdrop-blur-md shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant/10 transition-colors rounded-full lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "close" : "menu"}
          </button>
          <Link href="/" className="font-display text-headline-md font-extrabold text-primary">
            SEMADIKSI
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            href="/"
          >
            Beranda
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            href="/profil-semadiksi"
          >
            Profil SEMADIKSI
          </Link>
          <Link
            className="text-primary font-bold font-label-md text-label-md border-b-2 border-primary py-1"
            href="/berita-acara"
          >
            Berita Acara
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/masuk"
            className="hidden sm:inline-block font-label-md text-label-md text-primary hover:underline font-semibold"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="bg-primary text-on-primary px-5 sm:px-6 py-2.5 rounded-full font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all shadow-sm font-semibold"
          >
            Daftar
          </Link>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 w-full bg-surface shadow-lg border-b border-surface-variant/20 z-30 p-md flex flex-col gap-sm">
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            Beranda
          </Link>
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/profil-semadiksi"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profil SEMADIKSI
          </Link>
          <Link
            className="text-primary font-bold py-2 border-b border-surface-variant/10"
            href="/berita-acara"
            onClick={() => setMobileMenuOpen(false)}
          >
            Berita Acara
          </Link>
          <div className="flex gap-md pt-sm">
            <Link
              href="/masuk"
              className="flex-1 text-center py-3 text-primary border border-primary rounded-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="flex-1 text-center py-3 bg-primary text-on-primary rounded-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-margin-mobile md:p-margin-desktop space-y-6 max-w-7xl mx-auto w-full py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-primary/10 via-surface to-surface-container-low border border-primary/20 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary rounded-full text-xs font-bold border border-primary/25">
              <span className="material-symbols-outlined text-[15px]">newspaper</span>
              <span>Arsip & Agenda Resmi KIP-K UNUSA</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
              Berita Acara & Informasi Kegiatan
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Dokumentasi resmi, notulensi, dan laporan kegiatan mahasiswa KIP-K yang telah selesai dilaksanakan, serta pengumuman agenda dan acara yang akan datang di lingkungan SEMADIKSI UNUSA.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-surface-variant/30 relative z-10">
            <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Publikasi</p>
              <p className="text-lg md:text-xl font-black text-on-surface mt-0.5">{beritaAcaraList.length} Kegiatan</p>
            </div>
            <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Kegiatan Selesai</p>
              <p className="text-lg md:text-xl font-black text-primary mt-0.5">{selesaiCount} Berita Acara</p>
            </div>
            <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Akan Datang</p>
              <p className="text-lg md:text-xl font-black text-amber-600 mt-0.5">{upcomingCount} Agenda</p>
            </div>
            <div className="bg-surface/80 backdrop-blur rounded-2xl p-3.5 border border-surface-variant/20">
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Peserta Terlibat</p>
              <p className="text-lg md:text-xl font-black text-indigo-600 mt-0.5">{totalAttendees}+ Orang</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-surface border border-surface-variant/30 rounded-2xl p-4 md:p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Cari berita acara, judul, lokasi, penyelenggara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-surface-variant/40 rounded-xl text-xs md:text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-surface-variant/30 self-start sm:self-auto">
              {(["Semua", "Selesai", "Akan Datang"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? "bg-primary text-white shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-outline text-[11px] font-bold uppercase tracking-wider mr-1 flex-shrink-0">
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border font-medium ${
                  categoryFilter === cat
                    ? "bg-primary-container text-on-primary-container border-primary/30 font-bold"
                    : "bg-surface-container-lowest text-on-surface-variant border-surface-variant/30 hover:border-surface-variant"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Berita Acara Grid */}
        {filteredList.length === 0 ? (
          <div className="bg-surface border border-surface-variant/30 rounded-3xl p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline">description</span>
            <h3 className="font-bold text-on-surface text-base">Tidak ada Berita Acara ditemukan</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ganti filter status dan kategori untuk melihat dokumen publikasi lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("Semua");
                setCategoryFilter("Semua");
              }}
              className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span> Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => {
              const catClass =
                categoryColorMap[item.category] || "bg-primary/10 text-primary border-primary/20";
              const isSelesai = item.status === "Selesai";

              return (
                <div
                  key={item.id}
                  className="bg-surface border border-surface-variant/30 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
                  onClick={() => setSelectedBA(item)}
                >
                  {/* Banner Image Header */}
                  <div className="h-44 relative overflow-hidden bg-surface-container-high">
                    <img
                      src={item.bannerImg}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur shadow-xs border ${
                          isSelesai
                            ? "bg-emerald-500/90 text-white border-emerald-400/30"
                            : "bg-amber-500/90 text-white border-amber-400/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Date overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {item.date}
                      </span>
                      {item.attendeeCount && (
                        <span className="flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full text-[10px]">
                          <span className="material-symbols-outlined text-[12px]">groups</span>
                          {item.attendeeCount} Peserta
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catClass}`}>
                        {item.category}
                      </span>

                      <h3 className="font-bold text-on-surface text-sm md:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Card Footer Info */}
                    <div className="pt-3 border-t border-surface-variant/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-outline font-medium truncate max-w-[180px]">
                          {item.organizer}
                        </span>
                        <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Detail <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Detail Berita Acara */}
      {selectedBA && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-surface-variant/30 shadow-2xl space-y-6 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-surface-variant/30 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      categoryColorMap[selectedBA.category] || "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    {selectedBA.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedBA.status === "Selesai"
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                        : "bg-amber-500/10 text-amber-700 border-amber-200"
                    }`}
                  >
                    {selectedBA.status}
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-lg md:text-xl text-on-surface">
                  {selectedBA.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBA(null)}
                className="p-1 rounded-full hover:bg-surface-variant/20 text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Banner Image */}
            <div className="h-56 rounded-2xl overflow-hidden relative border border-surface-variant/20">
              <img src={selectedBA.bannerImg} alt={selectedBA.title} className="w-full h-full object-cover" />
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-container-low p-4 rounded-2xl border border-surface-variant/20 text-xs">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Waktu & Tanggal</p>
                  <p className="font-medium">{selectedBA.date} {selectedBA.time ? `(${selectedBA.time})` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Lokasi Pelaksanaan</p>
                  <p className="font-medium">{selectedBA.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">groups</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Penyelenggara & Peserta</p>
                  <p className="font-medium">{selectedBA.organizer} ({selectedBA.attendeeCount || 0} Hadir)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">person</span>
                <div>
                  <p className="text-[10px] text-outline uppercase font-bold">Penulis / Publikator</p>
                  <p className="font-medium">{selectedBA.author} ({selectedBA.createdAt})</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3 text-xs md:text-sm text-on-surface-variant leading-relaxed">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">description</span>
                Ringkasan & Notulensi Resul
              </h4>
              <div className="whitespace-pre-line bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/20 font-sans">
                {selectedBA.content}
              </div>
            </div>

            {/* Attachment & Links */}
            {(selectedBA.attachmentFileName || selectedBA.externalLink) && (
              <div className="pt-2 border-t border-surface-variant/30 space-y-2">
                <h4 className="font-bold text-on-surface text-xs">Dokumen & Tautan Terkait:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBA.attachmentFileName && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Mengunduh file: ${selectedBA.attachmentFileName}`);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>{selectedBA.attachmentFileName} ({selectedBA.attachmentFileSize})</span>
                    </a>
                  )}

                  {selectedBA.externalLink && (
                    <a
                      href={selectedBA.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-surface-container text-on-surface border border-surface-variant/30 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Link Berita Resmi UNUSA</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBA(null)}
                className="px-5 py-2.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-surface-variant/30 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-xl mt-xl bg-surface-container-lowest border-t border-surface-container shadow-sm">
        <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="text-center md:text-left">
            <span className="font-display text-headline-md text-primary font-bold">
              SEMADIKSI
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-2">
              © 2024 SEMADIKSI. Seduluran Selawase.
            </p>
          </div>
          <div className="flex gap-md">
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md"
              href="/profil-semadiksi"
            >
              Tentang Kami
            </Link>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md cursor-pointer"
              onClick={() => alert("Hubungi kami di: admin@semadiksi.org")}
            >
              Hubungi Kami
            </a>
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md"
              href="/"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
