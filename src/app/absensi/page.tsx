"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AttendanceRecord, INITIAL_ATTENDANCES } from "@/data/portalData";

function AbsensiFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedActivity = searchParams.get("kegiatan") || searchParams.get("id") || "";

  // Form states
  const [studentName, setStudentName] = useState("");
  const [studentNim, setStudentNim] = useState("");
  const [university, setUniversity] = useState("Universitas Nahdlatul Ulama Surabaya");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [proofImage, setProofImage] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [notes, setNotes] = useState("");

  // UI & Success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [activitiesList, setActivitiesList] = useState<{ id: string; title: string; category?: string; date?: string; location?: string }[]>([]);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("Kampus B UNUSA, Jl. Raya Jemursari Surabaya (GPS Akurat)");

  useEffect(() => {
    // 1. Auto-fill from student session if logged in
    try {
      const storedUser = localStorage.getItem("semadiksi_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setStudentName(u.name);
        if (u.nim) setStudentNim(u.nim);
        if (u.university) setUniversity(u.university);
        if (u.email) setStudentEmail(u.email);
        if (u.phone) setStudentPhone(u.phone);
      } else {
        // Fallback default
        setStudentName("Ahmad Fauzan");
        setStudentNim("2240021001");
        setStudentEmail("ahmad.fauzan@unusa.ac.id");
        setStudentPhone("081234567890");
      }
    } catch (e) {}

    // 2. Load available activities
    const acts: { id: string; title: string; category?: string; date?: string; location?: string }[] = [
      { id: "act-b", title: "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)", category: "Seminar", date: "16 November 2026", location: "Auditorium Tower UNUSA Lantai 9" },
      { id: "act-a", title: "SEMADIKSI Peduli: Bakti Sosial Akhir Tahun", category: "Sosial", date: "20 Desember 2026", location: "Panti Asuhan Al-Ikhlas Jemursari" },
      { id: "act-c", title: "SEMADIKSI Cultural Night & Reunion", category: "Workshop", date: "18 Januari 2027", location: "Hall Kampus A UNUSA Wonokromo" },
      { id: "act-d", title: "Lomba Poster Digital SEMADIKSI 2025", category: "Kompetisi", date: "15 Februari 2026", location: "Daring (Zoom Meeting)" },
      { id: "ba-001", title: "Pelantikan Pengurus & Rapat Kerja SEMADIKSI UNUSA", category: "Rapat Kerja", date: "10 Agustus 2026", location: "Kampus B UNUSA" },
      { id: "ba-002", title: "Sosialisasi Evaluasi Portofolio Berkas KIP-K Semester Genap", category: "Sosialisasi KIP-K", date: "24 Juli 2026", location: "Auditorium Lantai 9" },
      { id: "ba-003", title: "Workshop Penulisan Karya Tulis Ilmiah & PKM Mahasiswa", category: "Pelatihan", date: "28 Agustus 2026", location: "Lab Komputer Kampus B UNUSA" }
    ];

    try {
      const storedActivities = localStorage.getItem("semadiksi_activities");
      if (storedActivities) {
        const parsed = JSON.parse(storedActivities);
        parsed.forEach((pa: any) => {
          if (!acts.some(a => a.id === pa.id || a.title === pa.title)) {
            acts.unshift({ id: pa.id, title: pa.title, category: pa.category, date: pa.date, location: pa.location });
          }
        });
      }
    } catch (e) {}

    setActivitiesList(acts);

    // 3. Set preselected activity
    if (preselectedActivity) {
      const matched = acts.find(a => a.id === preselectedActivity || a.title.toLowerCase().includes(preselectedActivity.toLowerCase()));
      if (matched) {
        setSelectedActivity(matched.title);
      } else {
        setSelectedActivity(preselectedActivity);
      }
    } else if (acts.length > 0) {
      setSelectedActivity(acts[0].title);
    }
  }, [preselectedActivity]);

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProofImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset sample proofs for demonstration
  const setPresetProof = (presetType: "selfie" | "auditorium" | "zoom" | "ticket") => {
    if (presetType === "selfie") {
      setProofImage("https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80");
      setProofFileName(`Foto_Selfie_Kehadiran_${studentName.replace(/\s+/g, "_")}.jpg`);
    } else if (presetType === "auditorium") {
      setProofImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80");
      setProofFileName(`Foto_Lokasi_Auditorium_${studentName.replace(/\s+/g, "_")}.jpg`);
    } else if (presetType === "zoom") {
      setProofImage("https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80");
      setProofFileName(`Screenshot_Zoom_Presensi_${studentName.replace(/\s+/g, "_")}.png`);
    } else if (presetType === "ticket") {
      setProofImage("https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80");
      setProofFileName(`Foto_ID_Peserta_${studentName.replace(/\s+/g, "_")}.jpg`);
    }
  };

  // Submit attendance
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !studentNim || !university || !selectedActivity) {
      alert("Harap lengkapi semua kolom biodata dan pilih kegiatan!");
      return;
    }

    if (!proofImage) {
      alert("Harap unggah atau pilih bukti mengikuti kegiatan (foto selfie / sertifikat / screenshot kehadiran)!");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedActObj = activitiesList.find(a => a.title === selectedActivity);

      const now = new Date();
      const timestampFormatted = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        activityId: selectedActObj ? selectedActObj.id : "act-custom",
        activityTitle: selectedActivity,
        activityCategory: selectedActObj ? selectedActObj.category : "Kegiatan KIP-K",
        activityDate: selectedActObj?.date || timestampFormatted.split(",")[0],
        studentName,
        studentNim,
        university,
        studentEmail: studentEmail || `${studentNim}@student.unusa.ac.id`,
        studentPhone: studentPhone || "081234567890",
        proofImageUrl: proofImage,
        proofFileName: proofFileName || "Bukti_Kehadiran_Mahasiswa.jpg",
        timestamp: timestampFormatted,
        status: "Hadir",
        notes: "Absensi mandiri via pemindaian QR Code sistem.",
        deviceInfo: navigator.userAgent.includes("Mobile") ? "Mobile Web (Smartphone Browser)" : "Desktop Web (Laptop/PC)",
        locationName: gpsLocation
      };

      // Save to localStorage
      try {
        let existingList: AttendanceRecord[] = INITIAL_ATTENDANCES;
        const stored = localStorage.getItem("semadiksi_attendances");
        if (stored) {
          existingList = JSON.parse(stored);
        }
        const updatedList = [newRecord, ...existingList];
        localStorage.setItem("semadiksi_attendances", JSON.stringify(updatedList));

        // Dispatch storage event for real-time update in open tabs
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}

      setIsSubmitting(false);
      setSubmittedRecord(newRecord);
    }, 600);
  };

  const handleSimulateScanQR = () => {
    setShowQrScanner(true);
    setTimeout(() => {
      setShowQrScanner(false);
      if (activitiesList.length > 0) {
        const randomAct = activitiesList[Math.floor(Math.random() * activitiesList.length)];
        setSelectedActivity(randomAct.title);
        alert(`QR Code Terverifikasi! Terhubung ke kegiatan: ${randomAct.title}`);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-stone-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-emerald-800">SEMADIKSI UNUSA</span>
              <span className="block text-[10px] text-stone-500 font-semibold tracking-wider uppercase">Portal Presensi Digital</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {submittedRecord ? (
          /* SUCCESS E-PRESENCE CARD */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden">
              {/* Header Success Ribbon */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-8 text-white text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-white">verified</span>
                </div>
                <h2 className="font-extrabold text-2xl md:text-3xl tracking-tight">Presensi Berhasil Dicatat!</h2>
                <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-lg mx-auto">
                  Data kehadiran Anda telah tersinkronisasi dan tercatat langsung di sistem database Admin Kemahasiswaan & SEMADIKSI UNUSA.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/60 rounded-full text-xs font-mono font-bold tracking-wider">
                  <span>KODE PRESENSI:</span>
                  <span className="text-emerald-300">{submittedRecord.id}</span>
                </div>
              </div>

              {/* Digital E-Presence Ticket Body */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Student & Event Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Data Mahasiswa</p>
                    <div>
                      <h4 className="font-extrabold text-base text-stone-900">{submittedRecord.studentName}</h4>
                      <p className="text-xs font-mono text-stone-600">NIM: {submittedRecord.studentNim}</p>
                      <p className="text-xs text-stone-600 font-semibold">{submittedRecord.university}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Kegiatan Yang Diikuti</p>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 leading-snug">{submittedRecord.activityTitle}</h4>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>{submittedRecord.timestamp}</span>
                      </p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{submittedRecord.locationName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Proof Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-700 text-[18px]">photo_camera</span>
                    <span>Bukti Kehadiran Terverifikasi:</span>
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50 border border-stone-200 rounded-2xl p-4">
                    <div className="w-28 h-28 rounded-xl overflow-hidden shadow-inner border border-stone-300 shrink-0 bg-stone-200">
                      <img
                        src={submittedRecord.proofImageUrl}
                        alt="Bukti Kehadiran"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="font-bold text-xs text-stone-900">{submittedRecord.proofFileName}</p>
                      <p className="text-[11px] text-stone-500">Tipe Perangkat: {submittedRecord.deviceInfo}</p>
                      <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>Status: {submittedRecord.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Mengunduh Bukti E-Presensi "${submittedRecord.studentName} - ${submittedRecord.activityTitle}"...`);
                    }}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Unduh Bukti E-Presensi (PDF/Gambar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRecord(null);
                      setProofImage("");
                      setProofFileName("");
                    }}
                    className="px-5 py-3 bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Absen Kegiatan Lain
                  </button>

                  <Link
                    href="/dashboard"
                    className="px-5 py-3 bg-stone-900 hover:bg-black active:scale-98 text-white rounded-xl font-bold text-xs transition-all text-center"
                  >
                    Ke Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ATTENDANCE SUBMISSION FORM */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/30 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-emerald-200 border border-emerald-400/30">
                  <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                  <span>Formulir Presensi Kehadiran Resmi</span>
                </div>
                <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight">Sistem Absensi Kegiatan Mahasiswa</h1>
                <p className="text-emerald-100 text-xs md:text-sm max-w-2xl leading-relaxed">
                  Lakukan absensi mandiri dengan memverifikasi data diri dan mengunggah foto bukti keikutsertaan kegiatan. Data akan langsung terverifikasi oleh Admin Kemahasiswaan UNUSA.
                </p>
              </div>

              {/* Quick QR Scanner button for attendees in the room */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSimulateScanQR}
                  disabled={showQrScanner}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 active:scale-95 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  <span>{showQrScanner ? "Memindai QR Panitia..." : "Pindai QR Code Panitia"}</span>
                </button>
              </div>
            </div>

            {/* QR Scanner Simulation Banner */}
            {showQrScanner && (
              <div className="bg-stone-900 text-white p-6 rounded-2xl text-center space-y-3 animate-in fade-in duration-150 border-2 border-emerald-500">
                <span className="material-symbols-outlined text-4xl text-emerald-400 animate-bounce">
                  qr_code_scanner
                </span>
                <p className="font-bold text-sm">Membuka Lensa Kamera Pemindai QR Code Panitia...</p>
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center relative overflow-hidden bg-black/40">
                  <div className="w-full h-1 bg-emerald-400 absolute top-0 animate-[pulse_1.5s_infinite]"></div>
                  <span className="text-[11px] text-stone-400">Arahkan kamera ke layar QR Code</span>
                </div>
              </div>
            )}

            {/* Form Container */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 md:p-8">
              <form onSubmit={handleSubmitAttendance} className="space-y-6">
                {/* 1. Pilih Kegiatan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    1. Pilih Kegiatan Yang Diikuti *
                  </label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    required
                    className="w-full p-3.5 bg-stone-50 border border-stone-300 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-bold text-stone-900 cursor-pointer shadow-2xs"
                  >
                    {activitiesList.map((act) => (
                      <option key={act.id} value={act.title}>
                        {act.title} {act.date ? `(${act.date})` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedActivity && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">event_available</span>
                      <span>Kegiatan terpilih: <strong>{selectedActivity}</strong></span>
                    </div>
                  )}
                </div>

                {/* 2. Biodata Mahasiswa */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    2. Biodata & Identitas Mahasiswa
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600">Nama Lengkap Mahasiswa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ahmad Fauzan"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-semibold text-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600">Nomor Induk Mahasiswa (NIM) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 2240021001"
                        value={studentNim}
                        onChange={(e) => setStudentNim(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600">Asal Universitas / Perguruan Tinggi *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Universitas Nahdlatul Ulama Surabaya"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-semibold text-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600">Nomor HP / WhatsApp Aktif</label>
                      <input
                        type="text"
                        placeholder="Contoh: 081234567890"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-semibold text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600">Alamat Email Mahasiswa</label>
                    <input
                      type="email"
                      placeholder="Contoh: ahmad.fauzan@unusa.ac.id"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-stone-900"
                    />
                  </div>
                </div>

                {/* 3. Upload Bukti Mengikuti Kegiatan */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      3. Upload Bukti Mengikuti Kegiatan *
                    </label>
                    <span className="text-[11px] text-stone-500">Format: JPG, PNG, WEBP (Maks. 5 MB)</span>
                  </div>

                  {/* Preset Buttons for Demo */}
                  <div className="p-3 bg-stone-100 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">
                      ⚡ Demo Cepat: Pilih Contoh Bukti Kehadiran
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPresetProof("selfie")}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">face</span>
                        <span>Selfie di Lokasi Acara</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPresetProof("auditorium")}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        <span>Foto Suasana Auditorium</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPresetProof("zoom")}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">laptop</span>
                        <span>Screenshot Live Zoom</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPresetProof("ticket")}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        <span>ID Card / Co-Card Peserta</span>
                      </button>
                    </div>
                  </div>

                  {/* File Upload Box */}
                  <div className="relative border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 text-center transition-colors bg-stone-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {proofImage ? (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-emerald-500 shadow-md bg-white shrink-0">
                          <img src={proofImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                          <p className="font-bold text-xs text-stone-900">{proofFileName || "Foto Terpilih"}</p>
                          <p className="text-[11px] text-emerald-700 font-bold flex items-center justify-center sm:justify-start gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Bukti berhasil dimuat</span>
                          </p>
                          <p className="text-[10px] text-stone-400">Klik area ini untuk mengganti foto</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-stone-800">Pilih / Seret Foto Bukti Kehadiran ke sini</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">Bisa berupa foto selfie di auditorium, ID peserta, atau tangkapan layar Zoom</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Lokasi & Catatan Tambahan */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">pin_drop</span>
                      <span>Lokasi Presensi: <strong>{gpsLocation}</strong></span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 text-[10px] font-bold rounded-md">GPS Valid</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600">Catatan / Ulasan Tambahan (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Mengikuti sesi materi LKMB hingga penutupan di Hall B."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 text-xs text-stone-900"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-stone-500 text-center sm:text-left">
                    Dengan mengirim form ini, Anda menyatakan telah hadir dan mengikuti kegiatan secara sah.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    <span>{isSubmitting ? "Menyimpan Presensi..." : "Kirim Absensi Kehadiran"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-bold text-stone-700">Sistem Presensi & Kehadiran Mahasiswa KIP-K UNUSA</p>
          <p className="text-[11px]">Biro Kemahasiswaan & Serikat Mahasiswa Bidikmisi / KIP Kuliah (SEMADIKSI) UNUSA Surabaya</p>
        </div>
      </footer>
    </div>
  );
}

export default function AbsensiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-emerald-800 font-bold text-sm">Memuat Sistem Absensi Kegiatan...</p>
      </div>
    }>
      <AbsensiFormContent />
    </Suspense>
  );
}
