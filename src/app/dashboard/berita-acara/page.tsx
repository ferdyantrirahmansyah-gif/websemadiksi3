"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BeritaAcaraItem, INITIAL_BERITA_ACARA } from "@/data/portalData";

export default function BeritaAcaraPage() {
  const [beritaAcaraList, setBeritaAcaraList] = useState<BeritaAcaraItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Selesai" | "Akan Datang">("Semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [selectedBA, setSelectedBA] = useState<BeritaAcaraItem | null>(null);

  useEffect(() => {
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

  const selesaiCount = beritaAcaraList.filter(b => b.status === "Selesai").length;
  const upcomingCount = beritaAcaraList.filter(b => b.status === "Akan Datang").length;
  const totalAttendees = beritaAcaraList.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0);

  const categoryColorMap: { [key: string]: string } = {
    "Rapat Kerja": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    "Sosialisasi KIP-K": "bg-primary/10 text-primary border-primary/20",
    "Pelatihan": "bg-amber-500/10 text-amber-700 border-amber-200",
    "Workshop": "bg-sky-500/10 text-sky-700 border-sky-200",
    "Lomba": "bg-purple-500/10 text-purple-700 border-purple-200",
    "Seminar": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    "Pengabdian Masyarakat": "bg-teal-500/10 text-teal-700 border-teal-200",
    "Lainnya": "bg-stone-500/10 text-stone-700 border-stone-200",
  };

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-7xl mx-auto">
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

      {/* Filter & Search Toolbar */}
      <div className="bg-surface border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Search Box */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari judul berita acara, lokasi, topik, atau penyelenggara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Status Tabs & Category */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
            {(["Semua", "Selesai", "Akan Datang"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] ${statusFilter === st
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant/20"
                  }`}
              >
                {st === "Selesai" ? `✅ Selesai (${selesaiCount})` : st === "Akan Datang" ? `📅 Akan Datang (${upcomingCount})` : "Semua"}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
          >
            <option value="Semua">📁 Semua Kategori</option>
            <option value="Rapat Kerja">Rapat Kerja</option>
            <option value="Sosialisasi KIP-K">Sosialisasi KIP-K</option>
            <option value="Pelatihan">Pelatihan</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Lomba">Lomba & Kompetisi</option>
            <option value="Pengabdian Masyarakat">Pengabdian Masyarakat</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Grid of Berita Acara */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => {
            const isSelesai = item.status === "Selesai";

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-surface-variant/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Banner Thumbnail */}
                <div className="h-44 relative overflow-hidden bg-surface-container">
                  <img
                    src={item.bannerImg}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur shadow-sm ${categoryColorMap[item.category] || "bg-surface-container text-on-surface"
                        }`}
                    >
                      {item.category}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-sm flex items-center gap-1 ${isSelesai
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 text-white"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isSelesai ? "check_circle" : "event"}
                      </span>
                      <span>{isSelesai ? "Selesai" : "Akan Datang"}</span>
                    </span>
                  </div>

                  {/* Date on banner bottom */}
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow">
                    <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                    <span>{item.date}</span>
                    {item.time && <span>• {item.time}</span>}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-surface-variant/20 text-[11px] text-on-surface-variant">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-primary text-[14px] shrink-0">location_on</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-outline text-[14px] shrink-0">groups</span>
                        <span>{item.organizer}</span>
                      </div>
                      {item.attendeeCount && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md text-[10px] shrink-0">
                          {item.attendeeCount} Peserta
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedBA(item)}
                      className="flex-1 min-w-[120px] py-2.5 px-3 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">description</span>
                      <span>Berita Acara</span>
                    </button>

                    <Link
                      href={`/absensi?kegiatan=${encodeURIComponent(item.title)}`}
                      className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      title="Isi Presensi Kehadiran Kegiatan"
                    >
                      <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                      <span>Presensi QR</span>
                    </Link>

                    {item.attachmentFileName && (
                      <button
                        onClick={() => alert(`Mengunduh berkas: ${item.attachmentFileName}`)}
                        className="p-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl transition-all cursor-pointer border border-surface-variant/20"
                        title={`Unduh Lampiran: ${item.attachmentFileName}`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-3xl p-12 text-center text-outline">
          <span className="material-symbols-outlined text-5xl block mb-2 text-outline/40">newspaper</span>
          <p className="font-bold text-base text-on-surface">Tidak ada berita acara atau agenda kegiatan yang cocok.</p>
          <p className="text-xs text-outline mt-1">Silakan sesuaikan kata kunci pencarian atau filter status kegiatan Anda.</p>
        </div>
      )}

      {/* MODAL: DETAIL BERITA ACARA & NOTULENSI RESMI */}
      {selectedBA && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">description</span>
                </span>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">
                    {selectedBA.status === "Selesai" ? "Dokumen Berita Acara Resmi" : "Agenda & Informasi Kegiatan"}
                  </h3>
                  <p className="text-xs text-on-surface-variant">ID Publikasi: {selectedBA.id} • Diterbitkan oleh {selectedBA.author}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBA(null)}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Official Letterhead Header */}
            <div className="bg-white border-2 border-stone-300/80 rounded-2xl p-6 md:p-8 shadow-inner space-y-6 text-stone-800 font-sans">
              {/* UNUSA Letterhead */}
              <div className="border-b-2 border-stone-800 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    U
                  </span>
                  <span className="font-extrabold text-sm md:text-base tracking-wide text-primary">
                    UNIVERSITAS NAHDLATUL ULAMA SURABAYA
                  </span>
                </div>
                <p className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                  SERIKAT MAHASISWA BIDIKMISI & KIP KULIAH (SEMADIKSI) UNUSA
                </p>
                <p className="text-[10px] text-stone-500">
                  Sekretariat: Gedung Fastron Lantai 3 Kampus B UNUSA, Jl. Raya Jemursari No. 51-57 Surabaya
                </p>
              </div>

              {/* Title & Category Banner */}
              <div className="text-center space-y-1">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold inline-block uppercase tracking-wider">
                  {selectedBA.category} • {selectedBA.status === "Selesai" ? "Laporan Berita Acara" : "Agenda Kegiatan"}
                </span>
                <h2 className="font-extrabold text-lg md:text-xl text-stone-900 leading-snug pt-1">
                  {selectedBA.title}
                </h2>
                <p className="text-xs text-stone-500 font-mono">Tanggal Pelaksanaan: {selectedBA.date} {selectedBA.time ? `(${selectedBA.time})` : ""}</p>
              </div>

              {/* Event Metadata Grid */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block">Tempat / Lokasi Kegiatan:</span>
                  <strong className="text-stone-800">{selectedBA.location}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Penyelenggara Kegiatan:</span>
                  <strong className="text-stone-800">{selectedBA.organizer}</strong>
                </div>
                {selectedBA.attendeeCount && (
                  <div>
                    <span className="text-stone-500 block">Jumlah Partisipasi / Kehadiran:</span>
                    <strong className="text-primary font-bold">{selectedBA.attendeeCount} Peserta Terdaftar</strong>
                  </div>
                )}
                <div>
                  <span className="text-stone-500 block">Tanggal Terbit Dokumen:</span>
                  <span className="text-stone-700 font-medium">{selectedBA.createdAt}</span>
                </div>
              </div>

              {/* Full Content / Minutes / Report */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-1">
                  Uraian Berita Acara & Rangkuman Kegiatan:
                </h4>
                <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line space-y-2 pt-1">
                  {selectedBA.content}
                </div>
              </div>

              {/* Attachment Download Chip */}
              {selectedBA.attachmentFileName && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
                    <div>
                      <p className="font-bold text-xs text-stone-800">{selectedBA.attachmentFileName}</p>
                      <p className="text-[10px] text-stone-500">Lampiran Resmi Berita Acara • {selectedBA.attachmentFileSize || "2.0 MB"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Mengunduh dokumen: ${selectedBA.attachmentFileName}`)}
                    className="px-4 py-2 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Unduh PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t border-surface-variant/30 mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/absensi?kegiatan=${encodeURIComponent(selectedBA.title)}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  <span>Isi Presensi / Scan QR Kegiatan</span>
                </Link>

                {selectedBA.externalLink && (
                  <a
                    href={selectedBA.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span>Dokumentasi Drive</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedBA(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
