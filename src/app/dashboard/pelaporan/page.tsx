"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KipkDocument, INITIAL_KIPK_DOCUMENTS } from "@/data/portalData";
import DynamicGoogleForm from "@/components/DynamicGoogleForm";
import { INITIAL_PELAPORAN_QUESTIONS } from "@/app/admin/dashboard/page";

interface PelaporanFormData {
  id: string;
  timestamp: string;
  // Ormawa Section
  isOrmawaActive: "Ya, Aktif" | "Tidak Aktif";
  ormawaActivitiesText: string;
  ormawaProofUrl: string;
  ormawaInactiveReason?: string;

  // Additional Group & Scholarship Reports (Spreadsheet Columns 16 & 17)
  whatsappGroupProofUrl?: string;
  scholarshipReportUrl?: string;

  // Competition Summary Section
  competitionCount: "0" | "1" | "2" | "3+";
  noCompetitionReason?: string;
  noCompetitionStatementUrl?: string;

  // Detail Competition 1 (Exact Spreadsheet Columns)
  comp1Rank?: "Peserta" | "Juara 1" | "Juara 2" | "Juara 3" | "Juara Harapan" | "Top 10" | "Apresiasi Kejuaraan";
  comp1Level?: "Internasional" | "Nasional" | "Provinsi" | "Perguruan Tinggi / Lokal";
  comp1Category?: "Minat Khusus" | "Riset dan Inovasi : SSH" | "Riset dan Inovasi : STEM" | "Seni dan Budaya" | "Olahraga" | "Agama / Keagamaan" | "Lainnya";
  comp1Title?: string;
  comp1Organizer?: string;
  comp1UniversitiesCount?: string;
  comp1ParticipantsCount?: string;
  comp1ParticipationType?: "Individu" | "Kelompok / Tim";
  comp1EventType?: "Daring / Hibrida" | "Luring / Offline";
  comp1Url?: string;
  comp1CertDate?: string;
  comp1CertDocUrl?: string;
  comp1DocumentationUrl?: string;
  comp1InvitationDocUrl?: string;

  // Confirmation Declaration (Spreadsheet Column 18)
  isDataValidConfirmed?: boolean;

  status: "Disetujui" | "Perlu Perbaikan" | "Menunggu Review";
  score: number;
  notes?: string;
}

export default function PelaporanPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [queueTime, setQueueTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "submitted">("form");
  const [hasCompletedStep1, setHasCompletedStep1] = useState(false);

  // Ormawa Form State
  const [isOrmawaActive, setIsOrmawaActive] = useState<"Ya, Aktif" | "Tidak Aktif">("Ya, Aktif");
  const [ormawaActivitiesText, setOrmawaActivitiesText] = useState("Ketua BEM UNUSA, Panitia Bakti Sosial KIP-K 2026");
  const [ormawaProofFile, setOrmawaProofFile] = useState<File | null>(null);
  const [ormawaProofUrl, setOrmawaProofUrl] = useState("https://drive.google.com/file/d/SK_BEM_2026.pdf/view");
  const [ormawaInactiveReason, setOrmawaInactiveReason] = useState("");

  // Additional Group & Scholarship Proofs
  const [whatsappGroupProofUrl, setWhatsappGroupProofUrl] = useState("https://drive.google.com/file/d/1_WA_Group_KIPK/view");
  const [scholarshipReportUrl, setScholarshipReportUrl] = useState("https://drive.google.com/file/d/1_Laporan_Beasiswa/view");

  // Competition Summary State
  const [competitionCount, setCompetitionCount] = useState<"0" | "1" | "2" | "3+">("1");
  const [noCompetitionReason, setNoCompetitionReason] = useState("");
  const [noCompetitionStatementUrl, setNoCompetitionStatementUrl] = useState("");

  // Competition 1 State (Exact Match to User Spreadsheet Columns)
  const [comp1Rank, setComp1Rank] = useState<PelaporanFormData["comp1Rank"]>("Peserta");
  const [comp1Level, setComp1Level] = useState<PelaporanFormData["comp1Level"]>("Nasional");
  const [comp1Category, setComp1Category] = useState<PelaporanFormData["comp1Category"]>("Minat Khusus");
  const [comp1Title, setComp1Title] = useState("Olimpiade Akademik KIP-K Nasional 2026");
  const [comp1Organizer, setComp1Organizer] = useState("PRESMANSIA");
  const [comp1UniversitiesCount, setComp1UniversitiesCount] = useState("185 Perguruan Tinggi");
  const [comp1ParticipantsCount, setComp1ParticipantsCount] = useState("Lebih dari 5.000 Peserta");
  const [comp1ParticipationType, setComp1ParticipationType] = useState<"Individu" | "Kelompok / Tim">("Individu");
  const [comp1EventType, setComp1EventType] = useState<"Daring / Hibrida" | "Luring / Offline">("Daring / Hibrida");
  const [comp1Url, setComp1Url] = useState("https://www.instagram.com/p/DYTuLD0xJ1");
  const [comp1CertDate, setComp1CertDate] = useState("2026-05-17");
  const [comp1CertDocUrl, setComp1CertDocUrl] = useState("https://drive.google.com/file/d/1_Sertifikat/view");
  const [comp1DocumentationUrl, setComp1DocumentationUrl] = useState("https://drive.google.com/file/d/1_Dokumentasi/view");
  const [comp1InvitationDocUrl, setComp1InvitationDocUrl] = useState("https://drive.google.com/file/d/1_Undangan/view");

  // Confirmation Checkbox
  const [isDataValidConfirmed, setIsDataValidConfirmed] = useState(true);

  // Submissions State
  const [savedReports, setSavedReports] = useState<PelaporanFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load current user
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Load queue number
    const qNum = localStorage.getItem("semadiksi_user_queue_number");
    const qTime = localStorage.getItem("semadiksi_user_queue_time");
    if (qNum) setQueueNumber(qNum);
    if (qTime) setQueueTime(qTime);

    // Check Step 1 completion
    const step1Data = localStorage.getItem("semadiksi_pencairan_kipk_submissions");
    if (step1Data) {
      try {
        const parsed = JSON.parse(step1Data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHasCompletedStep1(true);
        }
      } catch (e) {}
    }

    // Load existing reports
    const storedReports = localStorage.getItem("semadiksi_pelaporan_kipk_forms");
    if (storedReports) {
      try {
        setSavedReports(JSON.parse(storedReports));
      } catch (e) {
        setSavedReports([]);
      }
    } else {
      const defaultSample: PelaporanFormData = {
        id: "rep-1",
        timestamp: "17 Mei 2026, 10:00",
        isOrmawaActive: "Ya, Aktif",
        ormawaActivitiesText: "Ketua BEM UNUSA, Panitia Bakti Sosial KIP-K 2026",
        ormawaProofUrl: "https://drive.google.com/file/d/SK_BEM_2026.pdf/view",
        whatsappGroupProofUrl: "https://drive.google.com/file/d/1_WA_Group_KIPK/view",
        scholarshipReportUrl: "https://drive.google.com/file/d/1_Laporan_Beasiswa/view",
        competitionCount: "1",
        comp1Rank: "Peserta",
        comp1Level: "Nasional",
        comp1Category: "Minat Khusus",
        comp1Title: "Olimpiade Akademik KIP-K Nasional 2026",
        comp1Organizer: "PRESMANSIA",
        comp1UniversitiesCount: "185 Perguruan Tinggi",
        comp1ParticipantsCount: "Lebih dari 5.000 Peserta",
        comp1ParticipationType: "Individu",
        comp1EventType: "Daring / Hibrida",
        comp1Url: "https://www.instagram.com/p/DYTuLD0xJ1",
        comp1CertDate: "2026-05-17",
        comp1CertDocUrl: "https://drive.google.com/file/d/1_Sertifikat/view",
        comp1DocumentationUrl: "https://drive.google.com/file/d/1_Dokumentasi/view",
        comp1InvitationDocUrl: "https://drive.google.com/file/d/1_Undangan/view",
        isDataValidConfirmed: true,
        status: "Disetujui",
        score: 95,
        notes: "Laporan keaktifan dan dokumen prestasi terverifikasi lengkap sesuai spreadsheet admin."
      };
      setSavedReports([defaultSample]);
      localStorage.setItem("semadiksi_pelaporan_kipk_forms", JSON.stringify([defaultSample]));
    }
  }, []);

  const calculateTotalScore = () => {
    let score = 0;
    if (isOrmawaActive === "Ya, Aktif") score += 50;
    if (competitionCount !== "0") {
      if (comp1Rank === "Juara 1" || comp1Rank === "Juara 2" || comp1Rank === "Juara 3") score += 50;
      else score += 45;
    } else {
      score += 20;
    }
    return Math.min(100, score);
  };

  const getWeightedBerkasScore = () => {
    try {
      const storedDocs = localStorage.getItem("semadiksi_kipk_documents");
      const storedWeights = localStorage.getItem("semadiksi_category_weights");
      const docs = storedDocs ? JSON.parse(storedDocs) : INITIAL_KIPK_DOCUMENTS;
      const weights = storedWeights ? JSON.parse(storedWeights) : {
        "Keaktifan Ormawa": 25,
        "Kegiatan Webinar Soft Skill": 25,
        "Keikutsertaan Kompetisi": 25,
        "Kegiatan Semadiksi": 25
      };

      const categories = ["Keaktifan Ormawa", "Kegiatan Webinar Soft Skill", "Keikutsertaan Kompetisi", "Kegiatan Semadiksi"];
      let total = 0;
      categories.forEach((cat) => {
        const catDocs = docs.filter((d: any) => d.category === cat && d.status === "Disetujui");
        const bestCatScore = catDocs.length > 0 ? Math.max(...catDocs.map((d: any) => d.score || 0)) : 0;
        const weight = (weights[cat] || 25) / 100;
        total += bestCatScore * weight;
      });

      return Math.round(total);
    } catch (e) {
      return 0;
    }
  };

  const handleGetQueueNumber = () => {
    const currentScore = getWeightedBerkasScore() || (savedReports.length > 0 ? savedReports[0].score : calculateTotalScore());
    if (currentScore < 80) {
      alert(`Gagal mengambil nomor antrean!\n\nSkor rata-rata akumulasi kelayakan keaktifan Anda saat ini adalah ${currentScore}%, yang mana berada di bawah batas minimal 80%.\n\nHarap lengkapi & tingkatkan berkas portofolio Anda pada menu 'Berkas KIP-K' agar mencapai minimal 80%.`);
      return;
    }

    const num = `KIP-${Math.floor(100 + Math.random() * 900)}`;
    const timeStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    setQueueNumber(num);
    setQueueTime(timeStr);
    localStorage.setItem("semadiksi_user_queue_number", num);
    localStorage.setItem("semadiksi_user_queue_time", timeStr);

    alert(`Sukses mengambil nomor antrean: ${num}`);
  };

  const handleDynamicFormSubmit = (answers: { [qId: string]: any }, answersByTitle: { [title: string]: any }) => {
    setIsSubmitting(true);
    const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    const isOrmawa = answersByTitle["Apakah Saudara aktif dalam kegiatan Ormawa/UKM semester ini?"] || "Ya, Aktif";
    const activities = answersByTitle["Sebutkan Kegiatan Ormawa yang Diikuti"] || "Ketua BEM UNUSA, Panitia Bakti Sosial KIP-K 2026";
    const compTitle = answersByTitle["4. Nama Kompetisi / Lomba"] || "Olimpiade Akademik KIP-K Nasional 2026";

    const newReport: PelaporanFormData = {
      id: `rep-${Date.now()}`,
      timestamp: nowStr,
      isOrmawaActive: String(isOrmawa).includes("Ya") ? "Ya, Aktif" : "Tidak Aktif",
      ormawaActivitiesText: String(activities),
      ormawaProofUrl: answersByTitle["Bukti Keaktifan (SK Pengurus / Surat Tanda Aktif)"] || "https://drive.google.com/file/d/SK_BEM_2026.pdf/view",
      whatsappGroupProofUrl: answersByTitle["Screenshot Bukti Anda Masih Bergabung di Grup WA Beasiswa KIPK"] || "https://drive.google.com/file/d/1_WA_Group_KIPK/view",
      scholarshipReportUrl: answersByTitle["Upload File Laporan Beasiswa KIP-K"] || "https://drive.google.com/file/d/1_Laporan_Beasiswa/view",

      competitionCount: "1",
      comp1Rank: answersByTitle["1. Peringkat / Capaian Lomba"] || "Peserta",
      comp1Level: answersByTitle["2. Tingkat Kompetisi"] || "Nasional",
      comp1Category: answersByTitle["3. Pilih Kategori Kompetisi"] || "Minat Khusus",
      comp1Title: String(compTitle),
      comp1Organizer: answersByTitle["5. Nama Penyelenggara"] || "PRESMANSIA",
      comp1UniversitiesCount: answersByTitle["6. Jml Perguruan Tinggi / Negara Mengikuti"] || "185 Perguruan Tinggi",
      comp1ParticipantsCount: answersByTitle["7. Jml Peserta Yang Mengikuti"] || "Lebih dari 5.000 Peserta",
      comp1ParticipationType: answersByTitle["8. Kepesertaan"] || "Individu",
      comp1EventType: answersByTitle["9. Bentuk Kegiatan"] || "Daring / Hibrida",
      comp1Url: answersByTitle["10. Link / URL Publikasi Lomba"] || "https://www.instagram.com/p/DYTuLD0xJ1",
      comp1CertDate: answersByTitle["11. Tanggal Sertifikat"] || "2026-05-17",
      comp1CertDocUrl: answersByTitle["12. Dokumen Sertifikat (Drive Link)"] || "https://drive.google.com/file/d/1_Sertifikat/view",
      comp1DocumentationUrl: answersByTitle["13. Dokumentasi Penyerahan / Pemenang"] || "https://drive.google.com/file/d/1_Dokumentasi/view",
      comp1InvitationDocUrl: answersByTitle["14. Dokumen Undangan / Surat Tugas"] || "https://drive.google.com/file/d/1_Undangan/view",
      isDataValidConfirmed: true,

      status: "Menunggu Review",
      score: 85,
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("semadiksi_pelaporan_kipk_forms", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Laporan Keaktifan & Lomba KIP-K Anda telah berhasil terkirim!");
      setActiveTab("submitted");
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDataValidConfirmed) {
      alert("Harap centang konfirmasi pernyataan kebenaran data!");
      return;
    }

    if (isOrmawaActive === "Ya, Aktif" && !ormawaProofUrl.trim() && !ormawaProofFile) {
      alert("Harap unggah Bukti Keaktifan Ormawa/UKM!");
      return;
    }

    if (competitionCount !== "0" && !comp1Title.trim()) {
      alert("Harap isi Nama Kompetisi / Lomba yang Anda ikuti!");
      return;
    }

    setIsSubmitting(true);
    const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    const newReport: PelaporanFormData = {
      id: `rep-${Date.now()}`,
      timestamp: nowStr,
      isOrmawaActive,
      ormawaActivitiesText,
      ormawaProofUrl: ormawaProofUrl.trim() || "https://drive.google.com/file/d/bukti_ormawa.pdf",
      ormawaInactiveReason: isOrmawaActive === "Tidak Aktif" ? ormawaInactiveReason : undefined,
      whatsappGroupProofUrl: whatsappGroupProofUrl.trim() || undefined,
      scholarshipReportUrl: scholarshipReportUrl.trim() || undefined,

      competitionCount,
      noCompetitionReason: competitionCount === "0" ? noCompetitionReason : undefined,
      noCompetitionStatementUrl: competitionCount === "0" ? noCompetitionStatementUrl : undefined,

      comp1Rank: competitionCount !== "0" ? comp1Rank : undefined,
      comp1Level: competitionCount !== "0" ? comp1Level : undefined,
      comp1Category: competitionCount !== "0" ? comp1Category : undefined,
      comp1Title: competitionCount !== "0" ? comp1Title : undefined,
      comp1Organizer: competitionCount !== "0" ? comp1Organizer : undefined,
      comp1UniversitiesCount: competitionCount !== "0" ? comp1UniversitiesCount : undefined,
      comp1ParticipantsCount: competitionCount !== "0" ? comp1ParticipantsCount : undefined,
      comp1ParticipationType: competitionCount !== "0" ? comp1ParticipationType : undefined,
      comp1EventType: competitionCount !== "0" ? comp1EventType : undefined,
      comp1Url: competitionCount !== "0" ? comp1Url : undefined,
      comp1CertDate: competitionCount !== "0" ? comp1CertDate : undefined,
      comp1CertDocUrl: competitionCount !== "0" ? comp1CertDocUrl : undefined,
      comp1DocumentationUrl: competitionCount !== "0" ? comp1DocumentationUrl : undefined,
      comp1InvitationDocUrl: competitionCount !== "0" ? comp1InvitationDocUrl : undefined,

      isDataValidConfirmed: true,
      status: "Menunggu Review",
      score: calculateTotalScore(),
      notes: "Menunggu review dan validasi data laporan oleh Admin Kemahasiswaan."
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("semadiksi_pelaporan_kipk_forms", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Formulir Pelaporan Beasiswa KIP-K Anda berhasil terkirim!");
      setActiveTab("submitted");
    }, 600);
  };

  if (currentUser && currentUser.kipStatus !== "KIP UNUSA") {
    return (
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center space-y-md flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-error text-6xl">warning</span>
        <h2 className="text-2xl font-bold text-on-surface">Akses Terbatas</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
          Halaman unggah pelaporan keaktifan beasiswa KIP-K ini khusus bagi mahasiswa penerima KIP UNUSA.
        </p>
        <div className="pt-2">
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-full text-xs shadow-md active:scale-95 transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const berkasScore = getWeightedBerkasScore();
  const latestReportScore = berkasScore > 0 ? berkasScore : (savedReports.length > 0 ? savedReports[0].score : calculateTotalScore());
  const canGetQueue = latestReportScore >= 80;

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-6xl mx-auto py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary/15 via-surface to-surface-container-low border border-primary/25 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/15 text-primary rounded-full text-xs font-bold border border-primary/30">
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Formulir Pelaporan Beasiswa KIP Kuliah UNUSA</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Form Pelaporan Beasiswa KIPK
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Isikan data keikutsertaan perlombaan dan bukti keaktifan Anda sesuai dengan kolom formulir resmi spreadsheet Biro Kemahasiswaan UNUSA.
          </p>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex items-center justify-between bg-surface border border-surface-variant/30 rounded-2xl p-2 shadow-xs overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Link
            href="/dashboard/pengajuan-pencairan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Tahap 1: Pengajuan Pencairan Beasiswa</span>
          </Link>
          <Link
            href="/dashboard/pelaporan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-primary text-white shadow-xs"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>Tahap 2: Pelaporan Keaktifan & Lomba</span>
          </Link>
          <Link
            href="/dashboard/monev-akademik"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Tahap 3: Monev Akademik & Ekonomi</span>
          </Link>
        </div>
      </div>

      {/* STEP 2 RESTRICTION LOCK SCREEN */}
      {!hasCompletedStep1 ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-8 md:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-md my-8 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Akses Terkunci
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-on-surface">
              Anda Belum Mengisi Tahap 1: Pengajuan Pencairan
            </h3>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-lg mx-auto">
              Mahasiswa KIP-K diwajibkan menyelesaikan dan mengirim <strong>Formulir Pengajuan Pencairan Beasiswa KIP-K (Tahap 1)</strong> terlebih dahulu sebelum dapat mengakses dan mengisikan Formulir Pelaporan Keaktifan & Lomba (Tahap 2).
            </p>
          </div>
          <div className="pt-3">
            <Link
              href="/dashboard/pengajuan-pencairan"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-full text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              <span>Lanjut Mengisi Tahap 1: Pengajuan Pencairan</span>
            </Link>
          </div>
        </div>
      ) : (
        <>


          {/* Tabs Bar */}
          <div className="flex items-center justify-between bg-surface border border-surface-variant/30 rounded-2xl p-2 shadow-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === "form" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>Isi Formulir Pelaporan Baru</span>
              </button>

              <button
                onClick={() => setActiveTab("submitted")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeTab === "submitted" ? "bg-primary text-white shadow-xs" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-base">history</span>
                <span>Riwayat Pelaporan Terkirim ({savedReports.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FORMULIR PELAPORAN (DYNAMIC GOOGLE FORM) */}
          {activeTab === "form" && (
            <DynamicGoogleForm
              formKey="pelaporan"
              defaultQuestions={INITIAL_PELAPORAN_QUESTIONS}
              formTitle="Formulir Pelaporan Keaktifan & Lomba KIP-K UNUSA"
              formSubtitle="Silakan lengkapi status keaktifan organisasi Ormawa/UKM serta rincian karya dan prestasi perlombaan semester ini."
              submitButtonText="Kirimkan Laporan Keaktifan KIP-K"
              isSubmitting={isSubmitting}
              onSubmit={handleDynamicFormSubmit}
            />
          )}

          {/* TAB 2: RIWAYAT LAPORAN TERKIRIM */}
          {activeTab === "submitted" && (
            <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="border-b border-surface-variant/20 pb-4">
                <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Daftar Riwayat Pelaporan KIP-K Terkirim
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Seluruh berkas laporan yang dikirimkan telah terarsip sesuai struktur kolom spreadsheet admin.
                </p>
              </div>

              <div className="space-y-4">
                {savedReports.map((rep) => {
                  const isApproved = rep.status === "Disetujui";
                  return (
                    <div
                      key={rep.id}
                      className={`bg-surface-container-lowest border rounded-3xl p-6 space-y-4 transition-all hover:shadow-md ${
                        isApproved ? "border-primary/30" : "border-surface-variant/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-outline">{rep.timestamp}</span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isApproved
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-on-surface">Skor: {rep.score}%</span>
                          {isApproved ? (
                            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs shadow-2xs">
                              <span className="material-symbols-outlined text-[16px]">lock</span>
                              <span>Terkunci & Validated</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs">
                              Dalam Proses Review
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/20">
                          <p className="text-outline font-bold uppercase text-[10px]">1. Laporan Keaktifan Ormawa & Group</p>
                          <p className="font-bold text-on-surface">{rep.isOrmawaActive}</p>
                          <p className="text-on-surface-variant italic">{rep.ormawaActivitiesText}</p>
                          <div className="pt-2 border-t border-surface-variant/20 space-y-1">
                            {rep.ormawaProofUrl && (
                              <a href={rep.ormawaProofUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline block">
                                📎 Bukti SK Ormawa (Drive)
                              </a>
                            )}
                            {rep.whatsappGroupProofUrl && (
                              <a href={rep.whatsappGroupProofUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold hover:underline block">
                                📱 Screenshot Grup WA KIP-K (Drive)
                              </a>
                            )}
                            {rep.scholarshipReportUrl && (
                              <a href={rep.scholarshipReportUrl} target="_blank" rel="noopener noreferrer" className="text-purple-800 font-bold hover:underline block">
                                📄 File Laporan Beasiswa (Drive)
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/20">
                          <p className="text-outline font-bold uppercase text-[10px]">2. Laporan Keikutsertaan Kompetisi (Spreadsheet Data)</p>
                          {rep.competitionCount === "0" ? (
                            <p className="text-on-surface-variant italic">Tidak mengikuti kompetisi semester ini.</p>
                          ) : (
                            <>
                              <p className="font-bold text-on-surface text-sm">{rep.comp1Title}</p>
                              <p className="text-on-surface-variant">
                                {rep.comp1Organizer} • <strong className="text-primary">{rep.comp1Rank}</strong> ({rep.comp1Level} - {rep.comp1Category})
                              </p>
                              <p className="text-[11px] text-outline">
                                Peserta: {rep.comp1ParticipantsCount} • PT/Negara: {rep.comp1UniversitiesCount}
                              </p>

                              <div className="pt-2 border-t border-surface-variant/20 space-y-1">
                                {rep.comp1CertDocUrl && (
                                  <a href={rep.comp1CertDocUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline block">
                                    📜 Dokumen Sertifikat (Drive)
                                  </a>
                                )}
                                {rep.comp1DocumentationUrl && (
                                  <a href={rep.comp1DocumentationUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline block">
                                    📷 Dokumentasi Pemenang / Penyerahan (Drive)
                                  </a>
                                )}
                                {rep.comp1InvitationDocUrl && (
                                  <a href={rep.comp1InvitationDocUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline block">
                                    ✉️ Dokumen Undangan (Drive)
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {rep.notes && (
                        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs flex items-start gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-primary">comment</span>
                          <div>
                            <strong className="block font-bold text-on-surface">Catatan Verifikator Admin:</strong>
                            <p className="mt-0.5">{rep.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
