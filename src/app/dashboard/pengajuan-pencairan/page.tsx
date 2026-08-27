"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencairanKipkSubmission, INITIAL_PENCAIRAN_KIPK } from "@/data/portalData";
import DynamicGoogleForm from "@/components/DynamicGoogleForm";
import { INITIAL_PENCAIRAN_QUESTIONS } from "@/app/admin/dashboard/page";

export default function PengajuanPencairanPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PencairanKipkSubmission[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [emailAkademik, setEmailAkademik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("S1 Manajemen");
  const [tahunMasuk, setTahunMasuk] = useState("2023");
  const [suratRekomendasiFile, setSuratRekomendasiFile] = useState<File | null>(null);
  const [suratRekomendasiUrl, setSuratRekomendasiUrl] = useState("");
  const [suratPernyataanFile, setSuratPernyataanFile] = useState<File | null>(null);
  const [suratPernyataanUrl, setSuratPernyataanUrl] = useState("");
  const [jenisBeasiswa, setJenisBeasiswa] = useState<"KIPK" | "Beasiswa Prestasi" | "Beasiswa Kemitraan" | "Lainnya">("KIPK");
  const [jalurPenerimaKip, setJalurPenerimaKip] = useState<"REGULER" | "SKRIPSI" | "INKLUSI" | "ASPIRASI">("REGULER");
  const [namaFraksiPengusul, setNamaFraksiPengusul] = useState("");
  const [uploadRaporFile, setUploadRaporFile] = useState<File | null>(null);
  const [uploadRaporUrl, setUploadRaporUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load current user
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

    // Load submissions from localStorage or fallback
    try {
      const stored = localStorage.getItem("semadiksi_pencairan_kipk_submissions");
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        setSubmissions(INITIAL_PENCAIRAN_KIPK);
        localStorage.setItem("semadiksi_pencairan_kipk_submissions", JSON.stringify(INITIAL_PENCAIRAN_KIPK));
      }
    } catch (e) {
      setSubmissions(INITIAL_PENCAIRAN_KIPK);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAkademik.trim() || !namaLengkap.trim() || !nim.trim()) {
      alert("Harap lengkapi Email Akademik, Nama Lengkap, dan NIM!");
      return;
    }

    if (!suratRekomendasiFile && !suratRekomendasiUrl.trim()) {
      alert("Harap unggah Surat Rekomendasi Prodi atau masukkan tautan dokumen!");
      return;
    }

    if (!suratPernyataanFile && !suratPernyataanUrl.trim()) {
      alert("Harap unggah Surat Pernyataan Mahasiswa Penerima Beasiswa atau masukkan tautan dokumen!");
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const recoUrl = suratRekomendasiUrl.trim() 
      ? suratRekomendasiUrl 
      : `https://drive.google.com/file/d/1${Math.random().toString(36).substring(2, 12)}/view`;

    const stateUrl = suratPernyataanUrl.trim() 
      ? suratPernyataanUrl 
      : `https://drive.google.com/open?id=1-${Math.random().toString(36).substring(2, 12)}`;

    const raporUrl = uploadRaporUrl.trim()
      ? uploadRaporUrl
      : uploadRaporFile
      ? `https://drive.google.com/file/d/rapor_${Math.random().toString(36).substring(2, 10)}`
      : "-";

    const newSubmission: PencairanKipkSubmission = {
      id: `pencairan-${Date.now()}`,
      timestamp: formattedTimestamp,
      emailAkademik,
      namaLengkap,
      nim,
      prodi,
      tahunMasuk,
      suratRekomendasiProdi: recoUrl,
      suratPernyataanMahasiswa: stateUrl,
      jenisBeasiswa,
      jalurPenerimaKip,
      namaFraksiPengusul: namaFraksiPengusul.trim() || "-",
      uploadRaporPengusulPartai: raporUrl,
      keterangan: "LENGKAP"
    };

    const updated = [newSubmission, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("semadiksi_pencairan_kipk_submissions", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Pengajuan pencairan beasiswa KIP-K Anda berhasil terkirim! Selanjutnya silakan melengkapi Formulir Pelaporan Beasiswa KIP-K.");
      router.push("/dashboard/pelaporan");
    }, 600);
  };

  const handleDynamicFormSubmit = (answers: { [qId: string]: any }, answersByTitle: { [title: string]: any }) => {
    setIsSubmitting(true);
    const now = new Date();
    const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newSubmission: PencairanKipkSubmission = {
      id: `pencairan-${Date.now()}`,
      timestamp: formattedTimestamp,
      emailAkademik: answersByTitle["Email Akademik / Student Email"] || emailAkademik,
      namaLengkap: answersByTitle["Nama Lengkap Mahasiswa"] || namaLengkap,
      nim: answersByTitle["NIM (Nomor Induk Mahasiswa)"] || nim,
      prodi: answersByTitle["Program Studi"] || prodi,
      tahunMasuk: answersByTitle["Tahun Angkatan"] || tahunMasuk,
      suratRekomendasiProdi: answersByTitle["Unggah Surat Rekomendasi Prodi"] || "https://drive.google.com/file/d/rekomendasi.pdf/view",
      suratPernyataanMahasiswa: answersByTitle["Unggah Surat Pernyataan Mahasiswa Penerima KIP-K"] || "https://drive.google.com/file/d/pernyataan.pdf/view",
      jenisBeasiswa: "KIPK",
      jalurPenerimaKip: "REGULER",
      namaFraksiPengusul: "-",
      uploadRaporPengusulPartai: answersByTitle["Unggah Berkas Pengusul (KIP / KKS / DTKS / SKTM)"] || "-",
      keterangan: "LENGKAP"
    };

    const updated = [newSubmission, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("semadiksi_pencairan_kipk_submissions", JSON.stringify(updated));

    setTimeout(() => {
      setIsSubmitting(false);
      alert("Pengajuan pencairan beasiswa KIP-K Anda berhasil terkirim! Selanjutnya silakan melengkapi Formulir Pelaporan Beasiswa KIP-K.");
      router.push("/dashboard/pelaporan");
    }, 600);
  };

  if (currentUser && currentUser.kipStatus !== "KIP UNUSA") {
    return (
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center space-y-md flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-error text-6xl">warning</span>
        <h2 className="text-2xl font-bold text-on-surface">Akses Terbatas</h2>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
          Halaman formulir pengajuan pencairan beasiswa KIP-K ini khusus untuk mahasiswa penerima KIP UNUSA.
        </p>
        <div className="pt-2">
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-full text-xs shadow-md active:scale-95 transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop space-y-6 max-w-5xl mx-auto py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-900/15 via-surface to-surface-container-low border border-purple-500/25 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-500/15 text-purple-700 rounded-full text-xs font-bold border border-purple-500/30">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>Tahap 1: Formulir Pengajuan Pencairan Beasiswa</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Pengajuan Pencairan Beasiswa KIP-K
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Silakan melengkapi data serta berkas rekomendasi prodi dan surat pernyataan untuk proses pencairan beasiswa KIP-K semester ini.
          </p>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex items-center justify-between bg-surface border border-surface-variant/30 rounded-2xl p-2 shadow-xs overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Link
            href="/dashboard/pengajuan-pencairan"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-purple-700 text-white shadow-xs"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Tahap 3: Monev Akademik & Ekonomi</span>
          </Link>
        </div>
      </div>

      {/* DYNAMIC GOOGLE FORM COMPONENT */}
      <DynamicGoogleForm
        formKey="pencairan"
        defaultQuestions={INITIAL_PENCAIRAN_QUESTIONS}
        formTitle="Formulir Pengajuan Pencairan Beasiswa KIP-K UNUSA"
        formSubtitle="Formulir pengajuan berkas rekomendasi prodi, surat pernyataan, dan berkas pengusul KIP-K semesteran."
        submitButtonText="Kirim Pengajuan Pencairan KIP-K"
        isSubmitting={isSubmitting}
        initialValues={{
          "q-p1": emailAkademik,
          "q-p2": namaLengkap,
          "q-p3": nim,
          "q-p4": prodi,
          "q-p5": tahunMasuk,
        }}
        onSubmit={handleDynamicFormSubmit}
      />
    </div>
  );
}
