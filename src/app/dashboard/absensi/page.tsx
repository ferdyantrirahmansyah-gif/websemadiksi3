"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AttendanceRecord, INITIAL_ATTENDANCES } from "@/data/portalData";

function DashboardAbsensiContent() {
  const searchParams = useSearchParams();
  const preselectedActivity = searchParams.get("kegiatan") || searchParams.get("id") || "";

  const [activeSubTab, setActiveSubTab] = useState<"form" | "history">("form");

  // Form states
  const [studentName, setStudentName] = useState("Ahmad Fauzan");
  const [studentNim, setStudentNim] = useState("2240021001");
  const [university, setUniversity] = useState("Universitas Nahdlatul Ulama Surabaya");
  const [studentEmail, setStudentEmail] = useState("ahmad.fauzan@unusa.ac.id");
  const [studentPhone, setStudentPhone] = useState("081234567890");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [proofImage, setProofImage] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [notes, setNotes] = useState("");

  // UI & History states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);
  const [activitiesList, setActivitiesList] = useState<{ id: string; title: string; category?: string; date?: string; location?: string }[]>([]);
  const [myAttendanceHistory, setMyAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [gpsLocation, setGpsLocation] = useState("Kampus B UNUSA, Jl. Raya Jemursari Surabaya (GPS Valid)");
  const [selectedHistoryForModal, setSelectedHistoryForModal] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    // 1. Auto-fill from student session
    try {
      const storedUser = localStorage.getItem("semadiksi_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setStudentName(u.name);
        if (u.nim) setStudentNim(u.nim);
        if (u.university) setUniversity(u.university);
        if (u.email) setStudentEmail(u.email);
        if (u.phone) setStudentPhone(u.phone);
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

    // 4. Load attendance history
    loadAttendanceHistory();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "semadiksi_attendances") {
        loadAttendanceHistory();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [preselectedActivity]);

  const loadAttendanceHistory = () => {
    try {
      let list: AttendanceRecord[] = INITIAL_ATTENDANCES;
      const stored = localStorage.getItem("semadiksi_attendances");
      if (stored) {
        list = JSON.parse(stored);
      } else {
        localStorage.setItem("semadiksi_attendances", JSON.stringify(INITIAL_ATTENDANCES));
      }
      setMyAttendanceHistory(list);
    } catch (e) {}
  };

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
        notes: "Absensi mandiri via sistem portal presensi digital.",
        deviceInfo: navigator.userAgent.includes("Mobile") ? "Mobile Web" : "Desktop Web",
        locationName: gpsLocation
      };

      try {
        let existingList: AttendanceRecord[] = INITIAL_ATTENDANCES;
        const stored = localStorage.getItem("semadiksi_attendances");
        if (stored) {
          existingList = JSON.parse(stored);
        }
        const updatedList = [newRecord, ...existingList];
        localStorage.setItem("semadiksi_attendances", JSON.stringify(updatedList));
        setMyAttendanceHistory(updatedList);
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}

      setIsSubmitting(false);
      setSubmittedRecord(newRecord);
    }, 500);
  };

  const handleSimulateScanQR = () => {
    setShowQrScanner(true);
    setTimeout(() => {
      setShowQrScanner(false);
      if (activitiesList.length > 0) {
        const randomAct = activitiesList[Math.floor(Math.random() * activitiesList.length)];
        setSelectedActivity(randomAct.title);
        alert(`QR Code Terdeteksi! Terhubung ke kegiatan: ${randomAct.title}`);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary-container/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
            <span>E-Presensi & Validasi Kehadiran</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface">Presensi Kegiatan Mahasiswa</h1>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Lakukan pengisian absensi kegiatan resmi SEMADIKSI & UNUSA dengan memindai QR Code atau memilih kegiatan serta mengunggah bukti keikutsertaan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setActiveSubTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "form" ? "bg-primary text-white shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-variant/30"
            }`}
          >
            Form Absensi
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "history" ? "bg-primary text-white shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-variant/30"
            }`}
          >
            <span>Riwayat Presensi</span>
            <span className="px-1.5 py-0.2 bg-primary/20 text-primary rounded-full text-[10px] font-black">
              {myAttendanceHistory.length}
            </span>
          </button>
        </div>
      </div>

      {activeSubTab === "history" ? (
        /* HISTORY TAB */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              <span>Daftar Riwayat Kehadiran Saya</span>
            </h3>
            <p className="text-xs text-on-surface-variant">Total: <strong>{myAttendanceHistory.length}</strong> kegiatan tercatat</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAttendanceHistory.length > 0 ? (
              myAttendanceHistory.map((rec) => {
                const isHadir = rec.status === "Hadir";
                const isPending = rec.status === "Menunggu Verifikasi";

                return (
                  <div
                    key={rec.id}
                    className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold">
                          {rec.activityCategory || "Kegiatan KIP-K"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isHadir
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            : isPending
                              ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              : "bg-error/10 text-error border-error/20"
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {isHadir ? "check_circle" : isPending ? "schedule" : "cancel"}
                          </span>
                          <span>{rec.status}</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-on-surface leading-snug">{rec.activityTitle}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                          <span>{rec.timestamp}</span>
                        </p>
                        <p className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                          <span>{rec.locationName || "Kampus UNUSA"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-variant/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-surface-variant/30 bg-surface-container shrink-0">
                          <img src={rec.proofImageUrl} alt="Bukti" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-on-surface truncate">{rec.proofFileName || "Bukti_Kehadiran.jpg"}</p>
                          <p className="text-[9px] text-outline">{rec.id}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedHistoryForModal(rec)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Detail E-Presensi
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-variant/30 text-outline">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">how_to_reg</span>
                <p className="font-bold text-sm text-on-surface">Belum ada riwayat absensi kegiatan.</p>
                <p className="text-xs mt-0.5">Gunakan formulir absensi untuk mencatat kehadiran Anda.</p>
              </div>
            )}
          </div>
        </div>
      ) : submittedRecord ? (
        /* SUCCESS CONFIRMATION IN DASHBOARD */
        <div className="bg-surface-container-lowest rounded-3xl border border-emerald-500/30 p-6 md:p-8 shadow-md space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-2xl text-on-surface">Presensi Anda Berhasil Dicatat!</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Kehadiran pada kegiatan <strong>{submittedRecord.activityTitle}</strong> telah terdata dan tersambung langsung di sistem Admin Kemahasiswaan.
            </p>
          </div>

          <div className="bg-surface-container-low border border-surface-variant/20 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-outline">Kode Tiket:</span>
              <strong className="font-mono text-primary">{submittedRecord.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Nama Mahasiswa:</span>
              <strong className="text-on-surface">{submittedRecord.studentName} ({submittedRecord.studentNim})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Waktu Presensi:</span>
              <span className="text-on-surface font-medium">{submittedRecord.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Status:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                {submittedRecord.status} (Terverifikasi)
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedRecord(null);
                setProofImage("");
                setProofFileName("");
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:brightness-110 cursor-pointer"
            >
              Absen Kegiatan Lain
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("history")}
              className="px-5 py-2.5 bg-surface-container text-on-surface-variant hover:bg-surface-variant/30 rounded-xl font-bold text-xs cursor-pointer"
            >
              Lihat Riwayat Saya
            </button>
          </div>
        </div>
      ) : (
        /* FORM ABSENSI */
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant/30 p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-surface-variant/20">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Formulir Pengisian Presensi Kegiatan</h3>
              <p className="text-xs text-on-surface-variant">Lengkapi data kehadiran Anda di bawah ini secara akurat.</p>
            </div>

            <button
              type="button"
              onClick={handleSimulateScanQR}
              disabled={showQrScanner}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              <span>{showQrScanner ? "Memindai QR..." : "Pindai QR Panitia"}</span>
            </button>
          </div>

          {showQrScanner && (
            <div className="bg-stone-900 text-white p-5 rounded-2xl text-center space-y-2 animate-in fade-in border-2 border-emerald-500">
              <span className="material-symbols-outlined text-3xl text-emerald-400 animate-bounce">
                qr_code_2
              </span>
              <p className="font-bold text-xs">Membuka Kamera QR Scanner Panitia...</p>
            </div>
          )}

          <form onSubmit={handleSubmitAttendance} className="space-y-5">
            {/* Activity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">1. Pilih Kegiatan Yang Diikuti *</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                required
                className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
              >
                {activitiesList.map((act) => (
                  <option key={act.id} value={act.title}>
                    {act.title} {act.date ? `(${act.date})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Nama Mahasiswa *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Nomor Induk Mahasiswa (NIM) *</label>
                <input
                  type="text"
                  required
                  value={studentNim}
                  onChange={(e) => setStudentNim(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono font-bold text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Asal Universitas *</label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                />
              </div>
            </div>

            {/* Proof Upload */}
            <div className="space-y-3 pt-2 border-t border-surface-variant/20">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant block">
                  2. Upload Foto Bukti Mengikuti Kegiatan *
                </label>
                <span className="text-[10px] text-outline">Selfie / Foto Kegiatan / Screenshot Zoom</span>
              </div>

              {/* Preset buttons */}
              <div className="p-3 bg-surface-container-low rounded-xl space-y-1.5">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">⚡ Demo Preset Cepat:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetProof("selfie")}
                    className="px-2.5 py-1 bg-surface-container hover:bg-primary/10 hover:text-primary rounded-lg text-[11px] font-bold text-on-surface-variant transition-colors cursor-pointer"
                  >
                    📸 Selfie di Acara
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetProof("auditorium")}
                    className="px-2.5 py-1 bg-surface-container hover:bg-primary/10 hover:text-primary rounded-lg text-[11px] font-bold text-on-surface-variant transition-colors cursor-pointer"
                  >
                    🏛️ Suasana Auditorium
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetProof("zoom")}
                    className="px-2.5 py-1 bg-surface-container hover:bg-primary/10 hover:text-primary rounded-lg text-[11px] font-bold text-on-surface-variant transition-colors cursor-pointer"
                  >
                    💻 Screenshot Zoom
                  </button>
                </div>
              </div>

              {/* Upload Input */}
              <div className="relative border-2 border-dashed border-surface-variant/40 hover:border-primary rounded-2xl p-5 text-center transition-colors bg-surface-container/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {proofImage ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary shadow-sm shrink-0">
                      <img src={proofImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xs text-on-surface">{proofFileName || "Foto Terpilih"}</p>
                      <p className="text-[10px] text-primary font-bold">✓ Bukti siap dikirim (Klik untuk ganti)</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="material-symbols-outlined text-3xl text-primary">add_a_photo</span>
                    <p className="text-xs font-bold text-on-surface">Pilih file foto bukti kehadiran</p>
                    <p className="text-[10px] text-outline">Format JPG, PNG atau WEBP</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Mengikuti sesi pagi hingga sore hari."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
              />
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-surface-variant/20 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>{isSubmitting ? "Menyimpan..." : "Kirim Absensi Kehadiran"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL HISTORY MODAL */}
      {selectedHistoryForModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-surface-variant/20">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span>Detail E-Presensi Kegiatan</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedHistoryForModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="w-full h-44 rounded-xl overflow-hidden border border-surface-variant/30 bg-surface-container">
                <img src={selectedHistoryForModal.proofImageUrl} alt="Bukti" className="w-full h-full object-cover" />
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
                <div>
                  <span className="text-[10px] text-outline uppercase block">Nama Kegiatan:</span>
                  <strong className="text-on-surface text-sm">{selectedHistoryForModal.activityTitle}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-variant/20">
                  <div>
                    <span className="text-[10px] text-outline block">Nama Mahasiswa:</span>
                    <strong className="text-on-surface">{selectedHistoryForModal.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline block">NIM:</span>
                    <span className="font-mono font-bold text-primary">{selectedHistoryForModal.studentNim}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-surface-variant/20">
                  <span className="text-[10px] text-outline block">Waktu Presensi:</span>
                  <span className="text-on-surface font-medium">{selectedHistoryForModal.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">Status Kehadiran:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                    {selectedHistoryForModal.status} (Tervalidasi Admin)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedHistoryForModal(null)}
                className="px-5 py-2 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
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

export default function DashboardAbsensiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-primary font-bold">Memuat Presensi...</div>}>
      <DashboardAbsensiContent />
    </Suspense>
  );
}
