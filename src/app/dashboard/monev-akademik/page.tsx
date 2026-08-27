"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MonevAkademikSubmission, INITIAL_MONEV_AKADEMIK_SUBMISSIONS } from "@/data/portalData";
import DynamicGoogleForm from "@/components/DynamicGoogleForm";
import { INITIAL_MONEV_QUESTIONS } from "@/app/admin/dashboard/page";

export default function MonevAkademikPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [submissions, setSubmissions] = useState<MonevAkademikSubmission[]>([]);
  const [hasCompletedStep1And2, setHasCompletedStep1And2] = useState(true);

  // Form State - Identitas & Akademik
  const [emailAkademik, setEmailAkademik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("S1 Manajemen");
  const [tahunMasuk, setTahunMasuk] = useState("2023");
  const [semesterSekarang, setSemesterSekarang] = useState("Semester 6");
  const [ipsTerakhir, setIpsTerakhir] = useState<string>("3.75");
  const [ipkKumulatif, setIpkKumulatif] = useState<string>("3.68");
  const [khsFile, setKhsFile] = useState<File | null>(null);
  const [khsTranskripUrl, setKhsTranskripUrl] = useState("");
  const [statusPerkuliahan, setStatusPerkuliahan] = useState<"Aktif Perkuliahan" | "Sedang Menyusun Skripsi / TA" | "Sedang Cuti / Kendala Akademik">("Aktif Perkuliahan");
  const [kendalaAkademikText, setKendalaAkademikText] = useState("");
  const [capaianPrestasiSoftskill, setCapaianPrestasiSoftskill] = useState("");

  // Form State - Kondisi Terkini Ekonomi & Orang Tua / Wali (Matching Screenshot Headers)
  const [berkasPenunjangEkonomi, setBerkasPenunjangEkonomi] = useState("KARTU INDONESIA PINTAR (KIP)");
  const [uploadBerkasEkonomiFile, setUploadBerkasEkonomiFile] = useState<File | null>(null);
  const [uploadBerkasPenunjangEkonomiUrl, setUploadBerkasPenunjangEkonomiUrl] = useState("");
  
  const [slipGajiOrtuFile, setSlipGajiOrtuFile] = useState<File | null>(null);
  const [slipGajiOrtuUrl, setSlipGajiOrtuUrl] = useState("");

  const [pekerjaanOrtu, setPekerjaanOrtu] = useState("");
  const [totalPenghasilanOrtu, setTotalPenghasilanOrtu] = useState("");
  const [jumlahTanggunganOrtu, setJumlahTanggunganOrtu] = useState<string>("3");
  const [kondisiTempatTinggal, setKondisiTempatTinggal] = useState("Kost dekat Kampus");
  const [catatanKondisiTerkini, setCatatanKondisiTerkini] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load Current User
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        setNamaLengkap(u.name || "");
        if (u.email) {
          setEmailAkademik(u.email);
        } else if (u.name) {
          setEmailAkademik(`${u.name.toLowerCase().replace(/\s+/g, "")}@student.unusa.ac.id`);
        }
        if (u.nim) setNim(u.nim);
        if (u.prodi) setProdi(u.prodi);
      } catch (e) {}
    }

    // Check if Tahap 1 and 2 completed
    const storedPencairan = localStorage.getItem("semadiksi_pencairan_kipk_submissions");
    const storedPelaporan = localStorage.getItem("semadiksi_pelaporan_kipk_forms");
    if (!storedPencairan && !storedPelaporan) {
      setHasCompletedStep1And2(true);
    }

    // Load Submissions from localStorage
    try {
      const stored = localStorage.getItem("semadiksi_monev_akademik_submissions");
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        setSubmissions(INITIAL_MONEV_AKADEMIK_SUBMISSIONS);
        localStorage.setItem("semadiksi_monev_akademik_submissions", JSON.stringify(INITIAL_MONEV_AKADEMIK_SUBMISSIONS));
      }
    } catch (e) {
      setSubmissions(INITIAL_MONEV_AKADEMIK_SUBMISSIONS);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAkademik.trim() || !namaLengkap.trim() || !nim.trim()) {
      alert("Harap lengkapi Email Akademik, Nama Lengkap, dan NIM!");
      return;
    }

    if (!khsTranskripUrl.trim() && !khsFile) {
      alert("Harap unggah atau masukkan link KHS / Transkrip Nilai semester terakhir!");
      return;
    }

    if (!uploadBerkasPenunjangEkonomiUrl.trim() && !uploadBerkasEkonomiFile) {
      alert("Harap unggah atau masukkan link Berkas Penunjang Ekonomi!");
      return;
    }

    if (!slipGajiOrtuUrl.trim() && !slipGajiOrtuFile) {
      alert("Harap unggah atau masukkan link Slip Gaji / Surat Keterangan Penghasilan Orang Tua!");
      return;
    }

    if (!pekerjaanOrtu.trim() || !totalPenghasilanOrtu.trim()) {
      alert("Harap lengkapi Pekerjaan Orang Tua/Wali dan Total Penghasilan dalam Satu Bulan!");
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const finalKhsUrl = khsTranskripUrl.trim()
      ? khsTranskripUrl
      : `https://drive.google.com/file/d/khs_${Date.now()}/view`;

    const finalBerkasEkoUrl = uploadBerkasPenunjangEkonomiUrl.trim()
      ? uploadBerkasPenunjangEkonomiUrl
      : `https://drive.google.com/open?id=1${Math.random().toString(36).substring(2, 12)}`;

    const finalSlipGajiUrl = slipGajiOrtuUrl.trim()
      ? slipGajiOrtuUrl
      : `https://drive.google.com/open?id=1${Math.random().toString(36).substring(2, 12)}`;

    const newSubmission: MonevAkademikSubmission = {
      id: `monev-${Date.now()}`,
      timestamp: formattedTimestamp,
      emailAkademik,
      namaLengkap,
      nim,
      prodi,
      tahunMasuk,
      semesterSekarang,
      ipsTerakhir: parseFloat(ipsTerakhir) || 3.50,
      ipkKumulatif: parseFloat(ipkKumulatif) || 3.50,
      khsTranskripUrl: finalKhsUrl,
      statusPerkuliahan,
      kendalaAkademikText: kendalaAkademikText.trim() || "Tidak ada kendala.",
      capaianPrestasiSoftskill: capaianPrestasiSoftskill.trim() || "-",
      
      berkasPenunjangEkonomi,
      uploadBerkasPenunjangEkonomiUrl: finalBerkasEkoUrl,
      slipGajiOrtuUrl: finalSlipGajiUrl,
      pekerjaanOrtu: pekerjaanOrtu.trim(),
      totalPenghasilanOrtu: totalPenghasilanOrtu.trim(),
      jumlahTanggunganOrtu: jumlahTanggunganOrtu || "3",
      kondisiTempatTinggal,
      catatanKondisiTerkini: catatanKondisiTerkini.trim() || "-",

      status: "Menunggu Review",
      catatanAdmin: "Menunggu verifikasi tim evaluasi kemahasiswaan."
    };

    const updated = [newSubmission, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("semadiksi_monev_akademik_submissions", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Formulir Monev Akademik & Kondisi Terkini Mahasiswa KIP-K Anda berhasil terkirim!");
      setActiveTab("history");
    }, 600);
  };

  if (currentUser && currentUser.kipStatus !== "KIP UNUSA") {
    return (
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center space-y-md flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-error text-6xl">warning</span>
        <h2 className="text-2xl font-bold text-on-surface">Akses Terbatas</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
          Halaman Formulir Monev Akademik & Kondisi Terkini Mahasiswa KIP-K ini khusus untuk mahasiswa penerima KIP UNUSA.
        </p>
        <div className="pt-2">
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-full text-xs shadow-md active:scale-95 transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const handleDynamicFormSubmit = (answers: { [qId: string]: any }, answersByTitle: { [title: string]: any }) => {
    setIsSubmitting(true);
    const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

    const ips = answersByTitle["Indeks Prestasi Semester (IPS) Semester Ini"] || ipsTerakhir;
    const ipk = answersByTitle["Indeks Prestasi Kumulatif (IPK) Saat Ini"] || ipkKumulatif;
    const pekerjaan = answersByTitle["Pekerjaan Orang Tua / Wali"] || pekerjaanOrtu;
    const tanggungan = answersByTitle["Jumlah Tanggungan Keluarga (Orang)"] || jumlahTanggunganOrtu;

    const newSub: MonevAkademikSubmission = {
      id: `monev-${Date.now()}`,
      timestamp: nowStr,
      emailAkademik: emailAkademik || "3230023032@student.unusa.ac.id",
      namaLengkap: currentUser?.name || namaLengkap || "AHMAD FAUZAN",
      nim: currentUser?.nim || nim || "3230023032",
      prodi: currentUser?.prodi || prodi || "S1 Manajemen",
      tahunMasuk: tahunMasuk || "2023",
      semesterSekarang: semesterSekarang || "Semester 6",
      ipsTerakhir: parseFloat(String(ips)) || 3.85,
      ipkKumulatif: parseFloat(String(ipk)) || 3.79,
      khsTranskripUrl: answersByTitle["Upload KHS / Transkrip Nilai Akademik Terbaru"] || "https://drive.google.com/file/d/khs.pdf/view",
      statusPerkuliahan: "Aktif Perkuliahan",
      berkasPenunjangEkonomi: answersByTitle["Berkas Penunjang Kondisi Ekonomi Yang Dimiliki"] || berkasPenunjangEkonomi,
      uploadBerkasPenunjangEkonomiUrl: answersByTitle["Upload Berkas Penunjang Ekonomi"] || "https://drive.google.com/file/d/ekonomi.pdf/view",
      slipGajiOrtuUrl: answersByTitle["Slip Gaji / Surat Keterangan Penghasilan Orang Tua/Wali (Jadikan 1 PDF)"] || "https://drive.google.com/file/d/slip_gaji.pdf/view",
      pekerjaanOrtu: String(pekerjaan),
      totalPenghasilanOrtu: answersByTitle["Total Rata-rata Penghasilan Orang Tua / Wali per Bulan"] || "< Rp 1.000.000",
      jumlahTanggunganOrtu: parseInt(String(tanggungan), 10) || 3,
      status: "Menunggu Review",
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("semadiksi_monev_akademik_submissions", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Formulir Monev Akademik & Ekonomi KIP-K Anda telah berhasil terkirim!");
      setActiveTab("history");
    }, 600);
  };

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-5xl mx-auto py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900/15 via-surface to-surface-container-low border border-emerald-500/25 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/15 text-emerald-800 rounded-full text-xs font-bold border border-emerald-500/30">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>Tahap 3: Formulir Monev Akademik & Ekonomi</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Monev Akademik & Kondisi Terkini Mahasiswa KIP-K
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Evaluasi IPK/IPS semesteran, pemutakhiran berkas kondisi ekonomi, slip gaji orang tua, dan tanggungan keluarga.
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>Tahap 2: Pelaporan Keaktifan & Lomba</span>
          </Link>
          <Link
            href="/dashboard/monev-akademik"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-emerald-700 text-white shadow-xs"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Tahap 3: Monev Akademik & Ekonomi</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between bg-surface border border-surface-variant/30 rounded-2xl p-2 shadow-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === "form" ? "bg-emerald-700 text-white shadow-xs" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Isi Form Monev Akademik & Ekonomi</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === "history" ? "bg-emerald-700 text-white shadow-xs" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>Riwayat Monev Terkirim ({submissions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FORM PENGISIAN (DYNAMIC GOOGLE FORM) */}
      {activeTab === "form" && (
        <DynamicGoogleForm
          formKey="monev"
          defaultQuestions={INITIAL_MONEV_QUESTIONS}
          formTitle="Formulir Monev Akademik & Kondisi Terkini Mahasiswa KIP-K"
          formSubtitle="Formulir evaluasi IPK/IPS semesteran, pemutakhiran berkas ekonomi, slip gaji ortu, dan tanggungan keluarga."
          submitButtonText="Kirim Data Monev Akademik KIP-K"
          isSubmitting={isSubmitting}
          initialValues={{
            "q-m1": ipsTerakhir,
            "q-m2": ipkKumulatif,
            "q-m7": pekerjaanOrtu,
            "q-m9": jumlahTanggunganOrtu,
          }}
          onSubmit={handleDynamicFormSubmit}
        />
      )}

      {/* TAB 2: RIWAYAT MONEV TERKIRIM */}
      {activeTab === "history" && (
        <div className="bg-surface border border-surface-variant/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-surface-variant/20 pb-4">
            <h3 className="font-bold text-on-surface text-base md:text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">history</span>
              Daftar Riwayat Monev Akademik & Kondisi Terkini Terkirim
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Catatan hasil verifikasi monev akademik dan pemeriksaan berkas ekonomi oleh tim Biro Kemahasiswaan UNUSA.
            </p>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => {
              const isApproved = sub.status === "Disetujui";
              return (
                <div
                  key={sub.id}
                  className={`bg-surface-container-lowest border rounded-3xl p-6 space-y-4 transition-all hover:shadow-md ${
                    isApproved ? "border-emerald-500/30" : "border-surface-variant/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-outline">{sub.timestamp}</span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          isApproved
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-800">IPS: {sub.ipsTerakhir} | IPK: {sub.ipkKumulatif}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-outline font-bold block">Nama & NIM:</span>
                      <span className="font-bold text-on-surface">{sub.namaLengkap} ({sub.nim})</span>
                      <span className="block text-on-surface-variant">{sub.prodi} - {sub.semesterSekarang}</span>
                    </div>

                    <div>
                      <span className="text-outline font-bold block">Berkas Penunjang Ekonomi:</span>
                      <span className="font-semibold text-on-surface">{sub.berkasPenunjangEkonomi}</span>
                      <a
                        href={sub.uploadBerkasPenunjangEkonomiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 underline text-[11px] block mt-0.5"
                      >
                        Lihat Berkas Ekonomi (Drive)
                      </a>
                    </div>

                    <div>
                      <span className="text-outline font-bold block">Pekerjaan & Penghasilan Ortu:</span>
                      <span className="font-semibold text-on-surface">{sub.pekerjaanOrtu}</span>
                      <span className="block text-emerald-800 font-bold">Total: Rp {sub.totalPenghasilanOrtu} ({sub.jumlahTanggunganOrtu} tanggungan)</span>
                      <a
                        href={sub.slipGajiOrtuUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-800 underline text-[11px] block mt-0.5"
                      >
                        Lihat Slip Gaji Ortu (PDF)
                      </a>
                    </div>
                  </div>

                  {sub.catatanAdmin && (
                    <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 text-xs">
                      <span className="font-bold text-on-surface block">Catatan Verifikator Kemahasiswaan:</span>
                      <p className="text-on-surface-variant">{sub.catatanAdmin}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
