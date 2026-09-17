"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KipkDocument, INITIAL_KIPK_DOCUMENTS } from "@/data/portalData";

export default function BerkasKipkPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [documents, setDocuments] = useState<KipkDocument[]>([]);
  const [categoryWeights, setCategoryWeights] = useState<{ [key: string]: number }>({
    "Keaktifan Ormawa": 25,
    "Kegiatan Webinar Soft Skill": 25,
    "Keikutsertaan Kompetisi": 25,
    "Kegiatan Semadiksi": 25
  });

  // Display Mode: "categorized" | "table"
  const [viewMode, setViewMode] = useState<"categorized" | "table">("categorized");

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KipkDocument | null>(null);
  const [formCategory, setFormCategory] = useState<KipkDocument["category"]>("Keaktifan Ormawa");
  const [formTitle, setFormTitle] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileUrl, setFormFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queue Number State
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [queueTime, setQueueTime] = useState<string | null>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  useEffect(() => {
    // Load current user
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Load category weights from localStorage or fallback
    const storedWeights = localStorage.getItem("semadiksi_category_weights");
    if (storedWeights) {
      try {
        setCategoryWeights(JSON.parse(storedWeights));
      } catch (e) {}
    }

    // Load queue number if available
    const qNum = localStorage.getItem("semadiksi_user_queue_number");
    const qTime = localStorage.getItem("semadiksi_user_queue_time");
    if (qNum) setQueueNumber(qNum);
    if (qTime) setQueueTime(qTime);

    // Load documents from localStorage or fallback
    const storedDocs = localStorage.getItem("semadiksi_kipk_documents");
    if (storedDocs) {
      try {
        setDocuments(JSON.parse(storedDocs));
      } catch (e) {
        setDocuments(INITIAL_KIPK_DOCUMENTS);
        localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(INITIAL_KIPK_DOCUMENTS));
      }
    } else {
      setDocuments(INITIAL_KIPK_DOCUMENTS);
      localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(INITIAL_KIPK_DOCUMENTS));
    }
  }, []);

  const handleTakeQueueNumber = () => {
    if (accumulatedScore < 80) {
      alert(`Gagal mengambil nomor antrean!\n\nSkor kelayakan Anda saat ini (${accumulatedScore}%) berada di bawah batas minimal 80%.\n\nHarap unggah/perbarui berkas portofolio Anda terlebih dahulu.`);
      return;
    }

    if (queueNumber) {
      setShowQueueModal(true);
      return;
    }

    const num = `KIP-${Math.floor(100 + Math.random() * 900)}`;
    const timeStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    setQueueNumber(num);
    setQueueTime(timeStr);
    localStorage.setItem("semadiksi_user_queue_number", num);
    localStorage.setItem("semadiksi_user_queue_time", timeStr);
    setShowQueueModal(true);
  };

  // Calculate Weighted Accumulation Score
  const calculateAccumulatedScore = () => {
    let totalScore = 0;
    const categories = ["Keaktifan Ormawa", "Kegiatan Webinar Soft Skill", "Keikutsertaan Kompetisi", "Kegiatan Semadiksi"];
    
    categories.forEach((cat) => {
      const catDocs = documents.filter(d => d.category === cat && d.status === "Disetujui");
      const bestCatScore = catDocs.length > 0 ? Math.max(...catDocs.map(d => d.score || 0)) : 0;
      const weight = (categoryWeights[cat] || 25) / 100;
      totalScore += bestCatScore * weight;
    });

    return Math.round(totalScore);
  };

  const getBestCategoryScore = (catName: string) => {
    const catDocs = documents.filter(d => d.category === catName && d.status === "Disetujui");
    if (catDocs.length === 0) return 0;
    return Math.max(...catDocs.map(d => d.score || 0));
  };

  const handleOpenUploadForCategory = (cat: KipkDocument["category"]) => {
    setFormCategory(cat);
    setShowUploadModal(true);
  };

  const handleViewDocument = (doc: KipkDocument) => {
    setPreviewDoc(doc);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert("Harap isi Judul Berkas!");
      return;
    }

    if (!formFile && !formFileUrl.trim()) {
      alert("Harap unggah file dokumen atau tempelkan link Google Drive!");
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const nowStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + `, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const fileName = formFile ? formFile.name : `Dokumen_${formTitle.replace(/\s+/g, "_")}.pdf`;
    const fileSize = formFile ? `${(formFile.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB";
    const fileType: "pdf" | "image" | "doc" = fileName.match(/\.(jpg|jpeg|png)$/i) ? "image" : "pdf";
    const finalUrl = formFileUrl.trim() || `https://drive.google.com/file/d/doc_${Date.now()}/view`;

    const newDoc: KipkDocument = {
      id: `doc-${Date.now()}`,
      userId: currentUser?.id || "usr-1",
      userName: currentUser?.name || "Mahasiswa KIP-K",
      userEmail: currentUser?.email || "student@unusa.ac.id",
      userNim: currentUser?.nim || "3230023034",
      userUniversity: currentUser?.university || "Universitas Nahdlatul Ulama Surabaya",
      category: formCategory,
      title: formTitle.trim(),
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      fileUrl: finalUrl,
      uploadedAt: nowStr,
      uploadedBy: "Mahasiswa",
      status: "Menunggu Review",
      score: 85,
      notes: "Menunggu verifikasi dan penilaian oleh Admin Kemahasiswaan."
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      setShowUploadModal(false);
      setFormTitle("");
      setFormFile(null);
      setFormFileUrl("");
      alert("Berkas KIP-K berhasil diunggah! Menunggu pemeriksaan verifikator.");
    }, 600);
  };

  const handleDeleteDocument = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas "${title}"?`)) {
      const updated = documents.filter(d => d.id !== id);
      setDocuments(updated);
      localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updated));
      alert("Berkas berhasil dihapus.");
    }
  };

  const accumulatedScore = calculateAccumulatedScore();

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Keaktifan Ormawa":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Kegiatan Webinar Soft Skill":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "Kegiatan Semadiksi":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "Kartu KIP-K":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "KHS / Transkrip":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "Keikutsertaan Kompetisi":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Main Categories array matching Admin configuration screenshot
  const adminCategories: {
    key: KipkDocument["category"];
    title: string;
    icon: string;
    color: string;
    bgHeader: string;
    border: string;
    weightKey: string;
    desc: string;
  }[] = [
    {
      key: "Keaktifan Ormawa",
      title: "Kategori Keaktifan Ormawa",
      icon: "groups",
      color: "text-emerald-800",
      bgHeader: "bg-emerald-50 border-emerald-200",
      border: "border-emerald-500/30",
      weightKey: "Keaktifan Ormawa",
      desc: "Unggah SK Kepengurusan BEM, DPM, UKM, HIMA, atau Surat Keterangan Aktif Organisasi Kemahasiswaan."
    },
    {
      key: "Kegiatan Webinar Soft Skill",
      title: "Kategori Kegiatan Webinar Soft Skill",
      icon: "video_camera_front",
      color: "text-amber-800",
      bgHeader: "bg-amber-50 border-amber-200",
      border: "border-amber-500/30",
      weightKey: "Kegiatan Webinar Soft Skill",
      desc: "Unggah sertifikat kelulusan atau kepesertaan webinar pengembangan diri, leadership, & public speaking."
    },
    {
      key: "Keikutsertaan Kompetisi",
      title: "Kategori Keikutsertaan Kompetisi",
      icon: "emoji_events",
      color: "text-amber-900",
      bgHeader: "bg-amber-100/50 border-amber-300",
      border: "border-amber-600/30",
      weightKey: "Keikutsertaan Kompetisi",
      desc: "Unggah sertifikat juara, finalis, atau keikutsertaan perlombaan ilmiah, akademik, budaya, & olahraga."
    },
    {
      key: "Kegiatan Semadiksi",
      title: "Kategori Kegiatan Semadiksi",
      icon: "school",
      color: "text-red-800",
      bgHeader: "bg-red-50 border-red-200",
      border: "border-red-500/30",
      weightKey: "Kegiatan Semadiksi",
      desc: "Unggah sertifikat keikutsertaan LKMB, Raker, Bakti Sosial, & Temu Akbar wajib penerima KIP-K UNUSA."
    }
  ];

  if (currentUser && currentUser.kipStatus !== "KIP UNUSA") {
    return (
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center space-y-md flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-amber-600 text-6xl">school</span>
        <h2 className="text-2xl font-bold text-on-surface">Khusus Mahasiswa KIP UNUSA</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
          Halaman Berkas KIP-K dan Portofolio Keaktifan ini khusus diperuntukkan bagi mahasiswa penerima beasiswa KIP UNUSA.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-full text-xs shadow-md active:scale-95 transition-all">
            Kembali ke Beranda
          </Link>
          <Link href="/dashboard/info-beasiswa" className="inline-block px-6 py-3 border border-primary text-primary font-bold rounded-full text-xs hover:bg-primary/5 active:scale-95 transition-all">
            Lihat Info Beasiswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-7xl mx-auto py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900/15 via-surface to-surface-container-low border border-emerald-500/25 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/15 text-emerald-800 rounded-full text-xs font-bold border border-emerald-500/30">
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            <span>Portofolio & Kelengkapan Berkas KIP Kuliah UNUSA</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Berkas KIP-K & Portofolio Keaktifan
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Unggah dan kelola berkas administrasi KIP-K serta sertifikat kegiatan yang telah dikelompokkan sesuai kategori konfigurasi bobot persentase dari Admin Kemahasiswaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          {queueNumber ? (
            <button
              onClick={() => setShowQueueModal(true)}
              className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-full text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>No. Antrean: {queueNumber}</span>
            </button>
          ) : (
            <button
              onClick={handleTakeQueueNumber}
              disabled={accumulatedScore < 80}
              className={`px-5 py-3 font-bold rounded-full text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                accumulatedScore >= 80
                  ? "bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={accumulatedScore >= 80 ? "Klik untuk mengambil nomor antrean wawancara & verifikasi KIP-K" : "Skor kelayakan Anda di bawah 80%. Antrean dikunci."}
            >
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>{accumulatedScore >= 80 ? "Ambil Nomor Antrean KIP-K" : "Antrean Dikunci (<80%)"}</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormCategory("Keaktifan Ormawa");
              setShowUploadModal(true);
            }}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Unggah Berkas KIP-K Baru</span>
          </button>
        </div>
      </div>

      {/* BOBOT PERSENTASE KEGIATAN & SCORE SUMMARY (MATCHING USER SCREENSHOT 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Akumulasi Skor Keaktifan Mahasiswa */}
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Total Akumulasi Skor</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-500/30">
                Bobot Sesuai (100%)
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-black text-emerald-800">{accumulatedScore}%</span>
              <span className="text-xs text-on-surface-variant font-semibold">Skor Kelayakan KIP-K</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {accumulatedScore >= 80 
                ? "Akumulasi skor Anda telah memenuhi standar kelayakan beasiswa KIP-K UNUSA (≥ 80%)."
                : "Lengkapi berkas sertifikat dan SK Ormawa untuk meningkatkan skor akumulasi keaktifan."}
            </p>
          </div>

          <div className="pt-3 border-t border-surface-variant/20">
            {queueNumber ? (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase block">No. Antrean Aktif:</span>
                  <span className="text-base font-black text-purple-950 font-mono">{queueNumber}</span>
                </div>
                <button
                  onClick={() => setShowQueueModal(true)}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Lihat Tiket
                </button>
              </div>
            ) : (
              <button
                onClick={handleTakeQueueNumber}
                disabled={accumulatedScore < 80}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs ${
                  accumulatedScore >= 80
                    ? "bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
                    : "bg-surface-variant text-on-surface-variant/50 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-base">confirmation_number</span>
                <span>{accumulatedScore >= 80 ? "Ambil Nomor Antrean KIP-K" : "Antrean Dikunci (< 80%)"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2 & 3: Konfigurasi Persentase Kategori (Persis Tampilan Admin - User Image 2) */}
        <div className="lg:col-span-2 bg-surface border border-surface-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">tune</span>
              <span>Bobot Persentase Kategori Kegiatan (Ditentukan Admin)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-800">Total: 100%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Keaktifan Ormawa</span>
              <span className="text-lg font-black text-emerald-800 block mt-0.5">{categoryWeights["Keaktifan Ormawa"] || 25}%</span>
              <span className="text-[10px] text-emerald-700 font-bold">Skor: {getBestCategoryScore("Keaktifan Ormawa")}%</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Webinar Soft Skill</span>
              <span className="text-lg font-black text-amber-800 block mt-0.5">{categoryWeights["Kegiatan Webinar Soft Skill"] || 25}%</span>
              <span className="text-[10px] text-amber-700 font-bold">Skor: {getBestCategoryScore("Kegiatan Webinar Soft Skill")}%</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Kompetisi / Lomba</span>
              <span className="text-lg font-black text-amber-900 block mt-0.5">{categoryWeights["Keikutsertaan Kompetisi"] || 25}%</span>
              <span className="text-[10px] text-amber-800 font-bold">Skor: {getBestCategoryScore("Keikutsertaan Kompetisi")}%</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 text-center">
              <span className="text-[10px] font-bold text-outline uppercase block">Kegiatan Semadiksi</span>
              <span className="text-lg font-black text-red-800 block mt-0.5">{categoryWeights["Kegiatan Semadiksi"] || 25}%</span>
              <span className="text-[10px] text-red-700 font-bold">Skor: {getBestCategoryScore("Kegiatan Semadiksi")}%</span>
            </div>
          </div>

          {/* Distribusi Bobot Visual Bar Chart (Image 2 Match) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-on-surface block">Distribusi Bobot Visual</span>
            <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-xs border border-surface-variant/20">
              <div style={{ width: `${categoryWeights["Keaktifan Ormawa"] || 25}%` }} className="bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center truncate px-1">
                Ormawa ({categoryWeights["Keaktifan Ormawa"] || 25}%)
              </div>
              <div style={{ width: `${categoryWeights["Kegiatan Webinar Soft Skill"] || 25}%` }} className="bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center truncate px-1">
                Webinar ({categoryWeights["Kegiatan Webinar Soft Skill"] || 25}%)
              </div>
              <div style={{ width: `${categoryWeights["Keikutsertaan Kompetisi"] || 25}%` }} className="bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center truncate px-1">
                Kompetisi ({categoryWeights["Keikutsertaan Kompetisi"] || 25}%)
              </div>
              <div style={{ width: `${categoryWeights["Kegiatan Semadiksi"] || 25}%` }} className="bg-red-700 text-white text-[10px] font-bold flex items-center justify-center truncate px-1">
                Semadiksi ({categoryWeights["Kegiatan Semadiksi"] || 25}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE TOGGLE BAR */}
      <div className="bg-surface border border-surface-variant/30 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700">grid_view</span>
          <h2 className="font-bold text-on-surface text-sm">Mode Tampilan Berkas KIP-K</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("categorized")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === "categorized"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Per Kategori Kegiatan (Admin)</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            <span>Semua Berkas (1 Tabel)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: PER KATEGORI KEGIATAN (EXACT MATCHING ADMIN CATEGORIES) */}
      {viewMode === "categorized" && (
        <div className="space-y-6">
          {adminCategories.map((catInfo) => {
            const catDocs = documents.filter((d) => d.category === catInfo.key);
            const bestScore = getBestCategoryScore(catInfo.key);
            const weightVal = categoryWeights[catInfo.weightKey] || 25;

            return (
              <div
                key={catInfo.key}
                className={`bg-surface border ${catInfo.border} rounded-3xl p-6 shadow-sm space-y-4 overflow-hidden transition-all`}
              >
                {/* Category Header Card */}
                <div className={`p-4 rounded-2xl border ${catInfo.bgHeader} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-surface-variant/30">
                      <span className={`material-symbols-outlined ${catInfo.color} text-2xl`}>{catInfo.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-extrabold text-sm md:text-base ${catInfo.color}`}>{catInfo.title}</h3>
                        <span className="px-2.5 py-0.5 bg-white/80 text-on-surface rounded-full text-[10px] font-black border border-surface-variant/30">
                          Bobot Persentase: {weightVal}%
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{catInfo.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-outline uppercase block">Skor Tertinggi</span>
                      <span className={`text-base font-black ${catInfo.color}`}>{bestScore}%</span>
                    </div>
                    <button
                      onClick={() => handleOpenUploadForCategory(catInfo.key)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      <span>Unggah {catInfo.key}</span>
                    </button>
                  </div>
                </div>

                {/* Category Documents Table */}
                {catDocs.length > 0 ? (
                  <div className="overflow-x-auto border border-surface-variant/20 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase tracking-wider font-extrabold border-b border-surface-variant/20">
                          <th className="p-3 text-center w-10">NO</th>
                          <th className="p-3 min-w-[200px]">JUDUL BERKAS</th>
                          <th className="p-3 min-w-[220px]">LAMPIRAN FILE</th>
                          <th className="p-3 min-w-[120px]">WAKTU UNGGAH</th>
                          <th className="p-3 text-center w-16">NILAI</th>
                          <th className="p-3 text-center w-28">STATUS</th>
                          <th className="p-3 min-w-[180px]">CATATAN ADMIN</th>
                          <th className="p-3 text-center w-28">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant/20 text-xs">
                        {catDocs.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-surface-container-lowest/70 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-outline">{idx + 1}</td>
                            <td className="p-3 font-extrabold text-on-surface">{item.title}</td>
                            <td className="p-3">
                              <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-2 flex items-center gap-2 max-w-xs">
                                <span className={`material-symbols-outlined ${item.fileType === "image" ? "text-amber-600" : "text-red-600"} text-xl`}>
                                  {item.fileType === "image" ? "image" : "picture_as_pdf"}
                                </span>
                                <div className="overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => handleViewDocument(item)}
                                    className="font-bold text-on-surface text-[11px] block truncate hover:text-purple-700 underline text-left cursor-pointer"
                                    title={item.fileName}
                                  >
                                    {item.fileName}
                                  </button>
                                  <span className="text-[10px] text-outline">{item.fileSize || "1.5 MB"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-on-surface-variant font-medium text-[11px]">{item.uploadedAt}</td>
                            <td className="p-3 text-center font-black text-on-surface text-sm">{item.score}%</td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                  item.status === "Disetujui"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
                                    : item.status === "Perlu Perbaikan"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                                    : "bg-blue-500/10 border-blue-500/30 text-blue-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-on-surface-variant text-[11px]">{item.notes || "-"}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(item)}
                                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                                  title={`Buka & lihat berkas ${item.fileName}`}
                                >
                                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                                  <span>Lihat Berkas</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(item.id, item.title)}
                                  className="p-1.5 text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer"
                                  title="Hapus Berkas"
                                >
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-dashed border-surface-variant/40 text-center space-y-2">
                    <p className="text-xs text-on-surface-variant">Belum ada berkas yang diunggah untuk kategori ini.</p>
                    <button
                      onClick={() => handleOpenUploadForCategory(catInfo.key)}
                      className="px-4 py-1.5 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      <span>Unggah {catInfo.key} Sekarang</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* KATEGORI BERKAS UTAMA KIP-K & AKADEMIK */}
          <div className="bg-surface border border-purple-500/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="p-4 rounded-2xl border bg-purple-50 border-purple-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-purple-200">
                  <span className="material-symbols-outlined text-purple-800 text-2xl">badge</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-purple-950">Kategori Berkas Administrasi Utama (Kartu KIP-K, SKTM & KHS)</h3>
                  <p className="text-xs text-purple-900 mt-0.5">Dokumen persyaratam wajib mahasiswa penerima beasiswa KIP Kuliah di UNUSA.</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenUploadForCategory("Kartu KIP-K")}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Unggah Berkas Utama</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-surface-variant/20 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase tracking-wider font-extrabold border-b border-surface-variant/20">
                    <th className="p-3 text-center w-10">NO</th>
                    <th className="p-3 min-w-[200px]">KATEGORI & JUDUL BERKAS</th>
                    <th className="p-3 min-w-[220px]">LAMPIRAN FILE</th>
                    <th className="p-3 min-w-[120px]">WAKTU UNGGAH</th>
                    <th className="p-3 text-center w-16">NILAI</th>
                    <th className="p-3 text-center w-28">STATUS</th>
                    <th className="p-3 min-w-[180px]">CATATAN ADMIN</th>
                    <th className="p-3 text-center w-28">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/20 text-xs">
                  {documents
                    .filter((d) => ["Kartu KIP-K", "KHS / Transkrip", "SKTM", "Dokumen Tambahan"].includes(d.category))
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-surface-container-lowest/70 transition-colors">
                        <td className="p-3 text-center font-mono font-bold text-outline">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-on-surface space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                          <span className="block">{item.title}</span>
                        </td>
                        <td className="p-3">
                          <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-2 flex items-center gap-2 max-w-xs">
                            <span className="material-symbols-outlined text-red-600 text-xl">picture_as_pdf</span>
                            <div className="overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleViewDocument(item)}
                                className="font-bold text-on-surface text-[11px] block truncate underline text-left cursor-pointer"
                              >
                                {item.fileName}
                              </button>
                              <span className="text-[10px] text-outline">{item.fileSize || "1.5 MB"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-on-surface-variant font-medium text-[11px]">{item.uploadedAt}</td>
                        <td className="p-3 text-center font-black text-on-surface text-sm">{item.score}%</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-emerald-500/10 border-emerald-500/30 text-emerald-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-on-surface-variant text-[11px]">{item.notes || "-"}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewDocument(item)}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                              title={`Buka & lihat berkas ${item.fileName}`}
                            >
                              <span className="material-symbols-outlined text-[13px]">visibility</span>
                              <span>Lihat Berkas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(item.id, item.title)}
                              className="p-1.5 text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer"
                              title="Hapus Berkas"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TABEL SEMUA BERKAS (EXACT MATCH USER IMAGE 1) */}
      {viewMode === "table" && (
        <div className="space-y-4">
          <div className="bg-surface border border-surface-variant/30 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input
                type="text"
                placeholder="Cari judul berkas atau nama file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-surface-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {["Semua", "Kartu KIP-K", "Keaktifan Ormawa", "Kegiatan Webinar Soft Skill", "Kegiatan Semadiksi", "KHS / Transkrip"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-surface-variant/30 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase tracking-wider font-extrabold border-b border-surface-variant/30">
                    <th className="p-4 text-center w-12">NO</th>
                    <th className="p-4 min-w-[240px]">KATEGORI & JUDUL BERKAS</th>
                    <th className="p-4 min-w-[220px]">LAMPIRAN FILE</th>
                    <th className="p-4 min-w-[130px]">WAKTU UNGGAH</th>
                    <th className="p-4 text-center w-20">NILAI</th>
                    <th className="p-4 text-center w-28">STATUS</th>
                    <th className="p-4 min-w-[200px]">CATATAN ADMIN</th>
                    <th className="p-4 text-center w-28">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/20 text-xs">
                  {documents
                    .filter((doc) => {
                      if (categoryFilter !== "Semua" && doc.category !== categoryFilter) return false;
                      if (searchQuery.trim() !== "") {
                        const q = searchQuery.toLowerCase();
                        return (
                          doc.title.toLowerCase().includes(q) ||
                          doc.fileName.toLowerCase().includes(q) ||
                          doc.category.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((item, idx) => {
                      const isApproved = item.status === "Disetujui";
                      return (
                        <tr key={item.id} className="hover:bg-surface-container-lowest/70 transition-colors">
                          <td className="p-4 text-center font-mono font-bold text-outline">{idx + 1}</td>
                          <td className="p-4 space-y-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(item.category)}`}>
                              {item.category}
                            </span>
                            <h4 className="font-extrabold text-on-surface text-xs leading-snug">{item.title}</h4>
                          </td>
                          <td className="p-4">
                            <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-2.5 flex items-center gap-2.5 max-w-xs">
                              <span className={`material-symbols-outlined ${item.fileType === "image" ? "text-amber-600" : "text-red-600"} text-2xl`}>
                                {item.fileType === "image" ? "image" : "picture_as_pdf"}
                              </span>
                              <div className="overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(item)}
                                  className="font-bold text-on-surface text-[11px] block truncate hover:text-purple-700 underline text-left cursor-pointer"
                                  title={item.fileName}
                                >
                                  {item.fileName}
                                </button>
                                <span className="text-[10px] text-outline font-medium">{item.fileSize || "1.5 MB"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-on-surface-variant font-medium text-[11px]">{item.uploadedAt}</td>
                          <td className="p-4 text-center">
                            <span className="text-sm font-black text-on-surface">{item.score}%</span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                isApproved
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
                                  : item.status === "Perlu Perbaikan"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800"
                                  : "bg-blue-500/10 border-blue-500/30 text-blue-800"
                              }`}
                            >
                              <span>{item.status}</span>
                            </span>
                          </td>
                          <td className="p-4 text-on-surface-variant text-[11px]">{item.notes || "-"}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleViewDocument(item)}
                                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                                title={`Buka & lihat berkas ${item.fileName}`}
                              >
                                <span className="material-symbols-outlined text-[13px]">visibility</span>
                                <span>Lihat Berkas</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(item.id, item.title)}
                                className="p-1.5 text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU BERKAS (DOCUMENT PREVIEW MODAL) */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-variant/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">visibility</span>
                <div>
                  <h3 className="font-bold text-on-surface text-base">Pratinjau Berkas Dokumen KIP-K</h3>
                  <p className="text-[11px] text-on-surface-variant">Detail informasi & status verifikasi berkas yang diunggah</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 hover:bg-surface-container-high text-on-surface rounded-full cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Document Metadata Card */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/30 space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(previewDoc.category)}`}>
                    {previewDoc.category}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-500/30">
                    Nilai Evaluasi: {previewDoc.score}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-on-surface">{previewDoc.title}</h4>
                  <p className="text-on-surface-variant text-[11px] mt-0.5">Waktu Unggah: {previewDoc.uploadedAt}</p>
                </div>

                <div className="pt-2 border-t border-surface-variant/20 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-outline text-[10px] block font-bold uppercase">Nama Berkas:</span>
                    <span className="font-mono text-on-surface font-bold text-[11px]">{previewDoc.fileName}</span>
                  </div>
                  <div>
                    <span className="text-outline text-[10px] block font-bold uppercase">Ukuran File:</span>
                    <span className="font-semibold text-on-surface">{previewDoc.fileSize || "1.5 MB"}</span>
                  </div>
                </div>
              </div>

              {/* Admin Notes Section */}
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-1.5">
                <span className="font-bold text-purple-950 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-700 text-sm">assignment_turned_in</span>
                  <span>Status Verifikasi & Catatan Admin Kemahasiswaan:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-900 text-white rounded-full text-[10px] font-black uppercase">
                    {previewDoc.status}
                  </span>
                  <span className="text-purple-950 font-medium text-xs">{previewDoc.notes || "Berkas telah diverifikasi sah."}</span>
                </div>
              </div>

              {/* Simulated Document Viewer Frame */}
              <div className="bg-surface-container-lowest border border-surface-variant/40 rounded-2xl p-6 text-center space-y-4 shadow-inner">
                <div className="flex justify-center items-center gap-3">
                  <span className={`material-symbols-outlined text-5xl ${previewDoc.fileType === "image" ? "text-amber-600" : "text-red-600"}`}>
                    {previewDoc.fileType === "image" ? "image" : "picture_as_pdf"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{previewDoc.fileName}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Dokumen Resmi Penerima Beasiswa KIP Kuliah UNUSA</p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  {previewDoc.fileUrl && previewDoc.fileUrl.startsWith("http") ? (
                    <a
                      href={previewDoc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Buka Dokumen di Google Drive</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`Mengunduh / membuka dokumen: ${previewDoc.fileName}`)}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Unduh File ({previewDoc.fileSize || "1.5 MB"})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNGGAH BERKAS BARU */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-surface-variant/30 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700">upload_file</span>
                <h3 className="font-bold text-on-surface text-lg">Unggah Berkas KIP-K Baru</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-surface-container-high rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Kategori Berkas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Kategori Berkas *</label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-variant/40 rounded-xl text-xs text-on-surface font-bold text-emerald-900"
                >
                  <option value="Keaktifan Ormawa">Keaktifan Ormawa (SK / Surat Aktif)</option>
                  <option value="Kegiatan Webinar Soft Skill">Kegiatan Webinar Soft Skill (Sertifikat)</option>
                  <option value="Keikutsertaan Kompetisi">Keikutsertaan Kompetisi (Sertifikat Lomba)</option>
                  <option value="Kegiatan Semadiksi">Kegiatan Semadiksi (LKMB / Temu Akbar)</option>
                  <option value="Kartu KIP-K">Kartu Resmi KIP-K Kemdikbudristek</option>
                  <option value="KHS / Transkrip">KHS / Transkrip Nilai Akademik</option>
                  <option value="SKTM">Surat Keterangan Tidak Mampu (SKTM)</option>
                  <option value="Dokumen Tambahan">Dokumen Tambahan</option>
                </select>
              </div>

              {/* Judul Berkas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Judul / Nama Berkas *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: SK Kepengurusan BEM & Surat Tanda Aktif"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-variant/40 rounded-xl text-xs text-on-surface font-semibold"
                />
              </div>

              {/* File Upload / Link */}
              <div className="space-y-1.5 bg-surface-container-low p-4 rounded-2xl border border-surface-variant/30">
                <label className="text-xs font-bold text-on-surface">Unggah File (PDF / Gambar) atau Link Google Drive *</label>
                <div className="space-y-2 pt-1">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormFile(file);
                        setFormFileUrl(`https://drive.google.com/open?id=doc_${file.name}`);
                      }
                    }}
                    className="w-full text-xs text-on-surface file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="Atau tempelkan tautan Google Drive..."
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface border border-surface-variant/30 rounded-xl text-[11px] text-on-surface font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/20">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant font-bold rounded-full text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full text-xs shadow-md cursor-pointer disabled:bg-gray-400"
                >
                  {isSubmitting ? "Mengirim Berkas..." : "Unggah Berkas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TIKET NOMOR ANTREAN (DIGITAL QUEUE TICKET MODAL) */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-variant/30 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-surface-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">confirmation_number</span>
                <div>
                  <h3 className="font-bold text-on-surface text-base">Tiket Nomor Antrean KIP-K</h3>
                  <p className="text-[11px] text-on-surface-variant">Biro Kemahasiswaan & Alumni UNUSA</p>
                </div>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 hover:bg-surface-container-high text-on-surface rounded-full cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Ticket Digital Body */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4 text-center">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-purple-200 border-b border-white/10 pb-2">
                <span>Universitas Nahdlatul Ulama Surabaya</span>
                <span>Status: Terverifikasi (≥80%)</span>
              </div>

              <div className="py-2 space-y-1">
                <span className="text-[11px] text-purple-200 font-bold uppercase tracking-wider block">Nomor Antrean Wawancara</span>
                <span className="text-4xl md:text-5xl font-black font-mono tracking-wider text-yellow-300 block drop-shadow-md">
                  {queueNumber}
                </span>
                <span className="text-[10px] text-purple-200 block pt-1">
                  Waktu Ambil: {queueTime || "27 Feb 2026, 08:55"}
                </span>
              </div>

              {/* Student Details in Ticket */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-200 text-[10px]">Mahasiswa:</span>
                  <span className="font-bold">{currentUser?.name || "Ahmad Fauzan"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200 text-[10px]">NIM:</span>
                  <span className="font-mono font-bold">{currentUser?.nim || "3230023034"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200 text-[10px]">Skor Kelayakan:</span>
                  <span className="font-bold text-emerald-300">{accumulatedScore}% (Lolos ≥ 80%)</span>
                </div>
              </div>

              <p className="text-[10px] text-purple-200 leading-tight">
                Tunjukkan tiket digital ini kepada petugas verifikator Biro Kemahasiswaan UNUSA saat wawancara / pencairan beasiswa KIP-K.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Nomor Antrean ${queueNumber} telah tersimpan resmi di sistem.`);
                  setShowQueueModal(false);
                }}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Simpan & Mengerti</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
