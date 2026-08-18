"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface JoinedActivity {
  id: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  duration: string;
  status: "Selesai" | "Terdaftar" | "Berlangsung";
  code: string;
  img: string;
  description: string;
  location: string;
  rundown: string;
  speaker: string;
  materials?: string[];
  requireFileUpload?: boolean;
  fileUploadInstruction?: string;
  uploadedFile?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    groupName?: string;
  };
  bookedSeat?: string;
  xpPoints?: number;
}

function KegiatanSayaContent() {
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<JoinedActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<JoinedActivity | null>(null);
  const [showTicketReceipt, setShowTicketReceipt] = useState<JoinedActivity | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"info" | "rundown" | "speaker" | "materi" | "upload">("info");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const defaultActivities: JoinedActivity[] = [
    {
      id: "act-1",
      title: "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
      category: "Kepemimpinan",
      organizer: "SEMADIKSI Divisi Keorganisasian",
      date: "15 November 2024",
      duration: "16 JP (Jam Pelajaran)",
      status: "Selesai",
      code: "CERT-LKMB-2024-0891",
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      description: "Program intensif dua hari yang dirancang untuk mengasah keterampilan kepemimpinan, manajemen organisasi, komunikasi publik, serta etika bagi penerima beasiswa KIP-K.",
      location: "Gedung Auditorium GPH Haryo Mataram, Kampus Utama",
      rundown: "08.00 - 08.30 : Registrasi Peserta & Check-in\n08.30 - 09.00 : Pembukaan oleh Pembina Beasiswa\n09.00 - 12.00 : Sesi I: Kepemimpinan Berkarakter & Integritas\n12.00 - 13.00 : Ishoma (Istirahat, Sholat, Makan)\n13.00 - 15.00 : Sesi II: Public Speaking & Teknik Persidangan\n15.00 - 16.00 : Diskusi Kelompok & Post-Test",
      speaker: "Dr. Hendrawan, M.Si. (Konsultan Kepemimpinan Nasional) & Ahmad Subarjo (Ketua Alumni)",
      materials: ["Slide Presentasi Kepemimpinan.pdf", "Modul Teknik Sidang.pdf"]
    },
    {
      id: "act-2",
      title: "SEMADIKSI Berbagi: Volunteer Mengajar Pesisir",
      category: "Sosial",
      organizer: "SEMADIKSI Divisi Pengabdian Masyarakat",
      date: "12 Oktober 2024",
      duration: "20 Jam Sosial",
      status: "Selesai",
      code: "CERT-VOL-2024-1102",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
      description: "Kegiatan pengabdian masyarakat mengajar anak-anak nelayan di pesisir Semarang Utara guna meningkatkan literasi baca-tulis, matematika dasar, dan motivasi belajar.",
      location: "SD Negeri Tambak Lorok 02, Pesisir Semarang Utara",
      rundown: "07.00 - 07.30 : Kumpul di Meeting Point (Rektorat) & Briefing\n07.30 - 08.15 : Perjalanan Menuju Lokasi Pesisir\n08.30 - 11.30 : Pembagian Kelas Mengajar & Sesi Belajar Ceria\n11.30 - 12.30 : Makan Siang Bersama Anak-Anak & Guru Pamong\n12.30 - 14.00 : Pembagian Alat Tulis & Games Kreatif\n14.00 - 14.30 : Evaluasi & Foto Bersama",
      speaker: "Relawan Pengajar SEMADIKSI & Kak Seto Mulyadi (Guest Star Sesi Motivasi)",
      materials: ["Pedoman Volunteer Mengajar.pdf", "Lembar Kerja Siswa SD.pdf"]
    },
    {
      id: "act-3",
      title: "Workshop Web Development Modern dengan Next.js",
      category: "Workshop",
      organizer: "SEMADIKSI Divisi IPTEK & Humas",
      date: "05 September 2024",
      duration: "8 JP",
      status: "Selesai",
      code: "CERT-WD-2024-0345",
      img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
      description: "Workshop praktis pembuatan web aplikasi modern menggunakan Next.js App Router, Tailwind CSS, TypeScript, dan proses deployment ke Vercel.",
      location: "Lab Komputer Terpadu Gedung C, Lantai 3",
      rundown: "08.30 - 09.00 : Registrasi & Set-up Lingkungan Pemrograman (Node.js & VS Code)\n09.00 - 10.30 : Teori: Pengenalan Next.js, React Server Components, & Routing\n10.30 - 12.00 : Praktik I: Membuat UI Layout dengan Tailwind CSS\n12.00 - 13.00 : Ishoma\n13.00 - 15.00 : Praktik II: Integrasi API, State Management, & Vercel Deployment\n15.00 - 15.30 : Sesi Tanya Jawab & Sertifikasi Kompetensi",
      speaker: "Ferdian W. (Senior Frontend Engineer) & Tim Developer SEMADIKSI",
      materials: ["Slide Workshop Next.js.pdf", "Repository Source Code Starter.zip"]
    }
  ];

  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadActivities = () => {
    const stored = localStorage.getItem("semadiksi_registered_activities");
    const storedGlobalActs = localStorage.getItem("semadiksi_activities");

    let globalActs: any[] = [];
    if (storedGlobalActs) {
      try {
        globalActs = JSON.parse(storedGlobalActs);
      } catch (e) {}
    }

    // Map of activity title -> xpPoints
    const xpMap: { [key: string]: number } = {
      "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)": 300,
      "Latihan Kepemimpinan Mahasiswa Berprestasi": 300,
      "SEMADIKSI Berbagi: Volunteer Mengajar Pesisir": 450,
      "SEMADIKSI Peduli: Bakti Sosial Akhir Tahun": 200,
      "Workshop Web Development Modern dengan Next.js": 250,
      "SEMADIKSI Cultural Night & Reunion": 150,
      "Lomba Poster Digital SEMADIKSI 2025": 500
    };

    globalActs.forEach((act: any) => {
      if (act.title && act.xpPoints !== undefined) {
        xpMap[act.title] = act.xpPoints;
      }
    });

    if (stored) {
      try {
        const registered = JSON.parse(stored);
        // Combine defaults and custom-paid activities (deduplicated by title)
        const combined = [...defaultActivities];
        registered.forEach((act: JoinedActivity) => {
          if (!combined.some(c => c.title === act.title)) {
            combined.push(act);
          }
        });

        // Attach xpPoints from our xpMap dynamically to activities
        const combinedWithXp = combined.map(act => ({
          ...act,
          xpPoints: xpMap[act.title] || 250
        }));

        setActivities(combinedWithXp);
      } catch (e) {
        setActivities(defaultActivities.map(act => ({ ...act, xpPoints: xpMap[act.title] || 250 })));
      }
    } else {
      setActivities(defaultActivities.map(act => ({ ...act, xpPoints: xpMap[act.title] || 250 })));
    }
  };

  useEffect(() => {
    loadActivities();

    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "semadiksi_submissions" || e.key === "semadiksi_registered_activities") {
        loadActivities();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Check query params for payment success simulation
    const paymentSuccess = searchParams.get("payment_success");
    const activityTitle = searchParams.get("title");
    
    if (paymentSuccess === "true" && activityTitle) {
      setToastMessage(activityTitle);
      setShowToast(true);
      
      // Auto-hide toast after 8 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleUploadKarya = (e: React.FormEvent<HTMLFormElement>, activity: JoinedActivity) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const groupName = formData.get("groupName") as string;
    
    // Get file from file input
    const fileElement = e.currentTarget.elements.namedItem("fileInput") as HTMLInputElement;
    const file = fileElement?.files?.[0];

    if (!file) {
      alert("Harap pilih file terlebih dahulu!");
      return;
    }

    const leaderName = currentUser?.name || "Ahmad Fauzan";
    const fileName = file.name;
    const uploadDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const submissionId = `sub-${Date.now()}`;

    // 1. Update the joined activity details in localStorage
    const updatedFile = {
      id: submissionId,
      name: fileName,
      url: "#", // mock URL
      uploadedAt: uploadDate,
      groupName: groupName
    };

    const storedReg = localStorage.getItem("semadiksi_registered_activities");
    if (storedReg) {
      try {
        const list = JSON.parse(storedReg);
        const updatedList = list.map((act: any) => {
          if (act.id === activity.id || act.title === activity.title) {
            return {
              ...act,
              uploadedFile: updatedFile
            };
          }
          return act;
        });
        localStorage.setItem("semadiksi_registered_activities", JSON.stringify(updatedList));
        
        // Also update selectedActivity and activities list state
        setSelectedActivity((prev) => prev ? { ...prev, uploadedFile: updatedFile } : null);
        setActivities((prevList) => prevList.map((a) => (a.id === activity.id || a.title === activity.title) ? { ...a, uploadedFile: updatedFile } : a));
      } catch(err) {}
    }

    // 2. Create a submission in semadiksi_submissions in localStorage so admin can judge it!
    try {
      const storedSubs = localStorage.getItem("semadiksi_submissions");
      const subsList = storedSubs ? JSON.parse(storedSubs) : [];
      
      const newSubmission = {
        id: submissionId,
        activityId: activity.id,
        activityTitle: activity.title,
        groupName: groupName,
        leaderName: leaderName,
        category: activity.category || "Lomba",
        documentName: fileName,
        documentUrl: "#",
        score: "Belum Dinilai",
        uploadedAt: uploadDate
      };

      subsList.push(newSubmission);
      localStorage.setItem("semadiksi_submissions", JSON.stringify(subsList));
    } catch(err) {}

    alert("Karya berhasil diunggah! Hubungi panitia jika ada perubahan.");
  };

  const handleRemoveUpload = (activityId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karya yang telah diunggah?")) return;

    // 1. Remove file info from the joined activity in localStorage
    const storedReg = localStorage.getItem("semadiksi_registered_activities");
    let submissionIdToRemove = "";
    if (storedReg) {
      try {
        const list = JSON.parse(storedReg);
        const updatedList = list.map((act: any) => {
          if (act.id === activityId) {
            if (act.uploadedFile) {
              submissionIdToRemove = act.uploadedFile.id;
            }
            const { uploadedFile, ...rest } = act;
            return rest;
          }
          return act;
        });
        localStorage.setItem("semadiksi_registered_activities", JSON.stringify(updatedList));

        // Update state
        setSelectedActivity((prev) => {
          if (!prev) return null;
          const { uploadedFile, ...rest } = prev;
          return rest as JoinedActivity;
        });
        setActivities((prevList) => prevList.map((a) => {
          if (a.id === activityId) {
            const { uploadedFile, ...rest } = a;
            return rest as JoinedActivity;
          }
          return a;
        }));
      } catch(err) {}
    }

    // 2. Remove from semadiksi_submissions in localStorage
    if (submissionIdToRemove) {
      try {
        const storedSubs = localStorage.getItem("semadiksi_submissions");
        if (storedSubs) {
          const subsList = JSON.parse(storedSubs);
          const updatedSubs = subsList.filter((s: any) => s.id !== submissionIdToRemove);
          localStorage.setItem("semadiksi_submissions", JSON.stringify(updatedSubs));
        }
      } catch(err) {}
    }
  };

  const getSubmissionGrade = (activityId: string) => {
    try {
      const storedSubs = localStorage.getItem("semadiksi_submissions");
      if (storedSubs) {
        const subsList = JSON.parse(storedSubs);
        const submission = subsList.find((s: any) => s.activityId === activityId || (selectedActivity?.uploadedFile && s.id === selectedActivity.uploadedFile.id));
        if (submission && submission.score !== "Belum Dinilai") {
          return submission.score;
        }
      }
    } catch(err) {}
    return undefined;
  };

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-lg relative">
      {/* Toast Notification Simulation */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#1e293b] text-white p-4 rounded-xl shadow-2xl border border-slate-700 w-[350px] max-w-[90vw] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl shrink-0">
              <span className="material-symbols-outlined text-primary font-bold">mail</span>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Email Baru: SEMADIKSI</p>
                <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <p className="text-sm font-bold text-white">Pembayaran &amp; Tiket Terbit! 🎟️</p>
              <p className="text-xs text-slate-300 leading-normal">
                Notifikasi pembayaran berhasil untuk <strong>&ldquo;{toastMessage}&rdquo;</strong> telah dikirim. E-Tiket Anda aktif dan dapat diakses di menu ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <section className="space-y-sm">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
          Kegiatan Saya
        </h2>
        <p className="text-on-surface-variant font-body-md text-base">
          Daftar seluruh program kegiatan dan agenda SEMADIKSI yang Anda ikuti. Masuk ke halaman kegiatan untuk melihat detail lokasi, agenda, narasumber, materi, dan unduhan tiket.
        </p>
      </section>

      {/* Grid List */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((act) => (
          <div
            key={act.id}
            className="bg-surface-container-lowest rounded-2xl border border-surface-variant/30 shadow-[0px_4px_25px_0px_rgba(27,109,36,0.04)] overflow-hidden flex flex-col justify-between hover:shadow-[0px_10px_35px_0px_rgba(27,109,36,0.08)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image Banner */}
            <div className="h-44 relative overflow-hidden">
              <img className="w-full h-full object-cover" alt={act.title} src={act.img} />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                {act.category}
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-md border ${
                    act.status === "Selesai"
                      ? "bg-primary-container/20 text-primary border-primary"
                      : "bg-secondary-container/20 text-on-secondary-container border-secondary-container"
                  }`}
                >
                  {act.status}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-outline font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                    <span>{act.date}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-tertiary-container text-on-tertiary-container border border-tertiary/10 rounded font-black text-[10px]">
                    <span className="material-symbols-outlined text-[12px]">volunteer_activism</span>
                    <span>+{act.xpPoints || 250} XP</span>
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface leading-tight line-clamp-2">
                  {act.title}
                </h3>
                <p className="text-on-surface-variant text-xs line-clamp-2">
                  {act.description}
                </p>
              </div>

              {/* Action Button: Masuk Kegiatan */}
              <div className="mt-5 pt-3 border-t border-surface-variant/30">
                <button
                  onClick={() => {
                    setSelectedActivity(act);
                    setActiveDetailTab("info");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-sm cursor-pointer shadow-md active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Masuk Kegiatan
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* EVENT DASHBOARD MODAL (Tampilan Selanjutnya / Event Detail Portal) */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Banner */}
            <div className="h-48 relative shrink-0">
              <img className="w-full h-full object-cover" alt={selectedActivity.title} src={selectedActivity.img} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                  {selectedActivity.category}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{selectedActivity.title}</h3>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="bg-surface-container-low px-6 border-b border-surface-variant/30 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: "info", label: "Detail Info", icon: "info" },
                { id: "rundown", label: "Agenda Acara", icon: "list_alt" },
                { id: "speaker", label: "Narasumber", icon: "record_voice_over" },
                { id: "materi", label: "Materi & Lampiran", icon: "folder_open" },
                ...(selectedActivity.requireFileUpload ? [{ id: "upload", label: "Unggah Karya", icon: "upload_file" }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-4 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeDetailTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              {/* TAB 1: Detail Info */}
              {activeDetailTab === "info" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl font-semibold shrink-0">location_on</span>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Lokasi / Tempat Pelaksanaan</h4>
                      <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
                        {selectedActivity.location}
                      </p>
                      <button 
                        onClick={() => alert("Membuka Google Maps...")} 
                        className="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">map</span> Lihat Rute Peta
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container rounded-xl p-3">
                      <p className="text-[10px] text-outline uppercase font-semibold tracking-wider">Tanggal &amp; Waktu</p>
                      <p className="font-bold text-sm text-on-surface mt-1">{selectedActivity.date}</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-3">
                      <p className="text-[10px] text-outline uppercase font-semibold tracking-wider">Bobot JP / Kredit</p>
                      <p className="font-bold text-sm text-primary mt-1">{selectedActivity.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-outline-variant uppercase tracking-wider">Tentang Kegiatan</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      {selectedActivity.description}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-outline font-semibold uppercase tracking-wider">No E-Tiket:</span>
                      <span className="px-3 py-1 bg-surface-container-high rounded text-xs font-mono font-bold text-on-surface">
                        {selectedActivity.code}
                      </span>
                    </div>
                    {selectedActivity.bookedSeat && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-outline font-semibold uppercase tracking-wider">Nomor Kursi:</span>
                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-bold">
                          {selectedActivity.bookedSeat}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Agenda Acara */}
              {activeDetailTab === "rundown" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-outline-variant uppercase tracking-wider">Jadwal Rundown Acara</h4>
                  <div className="relative border-l-2 border-primary/20 ml-2.5 pl-6 space-y-5">
                    {selectedActivity.rundown.split("\n").map((line, idx) => {
                      const parts = line.split(" : ");
                      const time = parts[0] || "";
                      const agenda = parts[1] || "";
                      return (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest"></span>
                          <p className="text-xs font-bold text-primary">{time}</p>
                          <p className="text-sm font-semibold text-on-surface mt-0.5">{agenda}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Narasumber */}
              {activeDetailTab === "speaker" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-outline-variant uppercase tracking-wider">Narasumber &amp; Instruktur</h4>
                  <div className="bg-surface-container rounded-xl p-4 flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-xl shrink-0 font-bold">
                      {selectedActivity.speaker.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-base text-on-surface">{selectedActivity.speaker}</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-normal">
                        Narasumber ahli yang dipilih oleh panitia pelaksana SEMADIKSI untuk mengisi pemaparan materi serta membimbing jalannya kegiatan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Materi & Lampiran */}
              {activeDetailTab === "materi" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-outline-variant uppercase tracking-wider">Berkas &amp; Materi Pendukung</h4>
                  <div className="space-y-2">
                    {selectedActivity.materials && selectedActivity.materials.length > 0 ? (
                      selectedActivity.materials.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-surface-variant/20 hover:bg-surface-container transition-all">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            <span className="text-sm font-semibold text-on-surface">{m}</span>
                          </div>
                          <button
                            onClick={() => alert(`Mengunduh file: ${m}`)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span> Unduh
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-outline italic">Berkas materi belum diunggah oleh panitia.</p>
                    )}
                  </div>

                  {selectedActivity.status === "Selesai" && (
                    <div className="pt-4 border-t border-surface-variant/30 space-y-3">
                      <h4 className="font-bold text-sm text-[#C5A059] uppercase tracking-wider">Sertifikat Kelulusan</h4>
                      <div className="bg-[#FDFBF7] border border-[#C5A059]/30 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <span className="material-symbols-outlined text-[#C5A059] text-3xl font-bold">workspace_premium</span>
                          <div>
                            <p className="font-bold text-sm text-stone-800">Sertifikat Resmi Tersedia</p>
                            <p className="text-xs text-stone-500 mt-0.5">No Seri: {selectedActivity.code}</p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/sertifikat"
                          className="px-5 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer text-center"
                        >
                          Lihat di Menu Sertifikat
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Unggah Karya */}
              {activeDetailTab === "upload" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h4 className="font-bold text-sm text-outline-variant uppercase tracking-wider">Unggah File / Karya Kegiatan</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Lengkapi berkas karya Anda untuk kegiatan ini.</p>
                  </div>

                  {/* Instruksi dari Admin */}
                  {selectedActivity.fileUploadInstruction && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1">
                      <h5 className="font-bold text-xs text-primary uppercase">Instruksi Unggah</h5>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {selectedActivity.fileUploadInstruction}
                      </p>
                    </div>
                  )}

                  {/* Upload State / Form */}
                  {selectedActivity.uploadedFile ? (
                    // File Already Uploaded
                    <div className="space-y-4">
                      <div className="bg-success-container/10 border border-success/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-3 items-center">
                          <span className="material-symbols-outlined text-success text-3xl font-bold">check_circle</span>
                          <div>
                            <p className="font-bold text-sm text-on-surface">Karya Berhasil Diunggah</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              Nama File: <span className="font-mono font-bold text-primary">{selectedActivity.uploadedFile.name}</span>
                            </p>
                            <p className="text-xs text-outline mt-0.5">Diunggah pada: {selectedActivity.uploadedFile.uploadedAt}</p>
                            {selectedActivity.uploadedFile.groupName && (
                              <p className="text-xs text-on-surface-variant mt-0.5">Nama Kelompok: <strong>{selectedActivity.uploadedFile.groupName}</strong></p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUpload(selectedActivity.id)}
                          className="px-4 py-2 border border-error text-error hover:bg-error/10 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                        >
                          Hapus &amp; Ganti File
                        </button>
                      </div>
                      
                      {/* Check if already graded */}
                      {getSubmissionGrade(selectedActivity.id) !== undefined && (
                        <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-xl p-4 flex gap-3 items-center">
                          <span className="material-symbols-outlined text-secondary text-2xl font-bold">stars</span>
                          <div>
                            <p className="font-bold text-sm text-on-surface">Penilaian dari Juri</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              Karya Anda telah dinilai oleh juri.
                            </p>
                            <p className="text-base font-extrabold text-primary mt-1">
                              Nilai: {getSubmissionGrade(selectedActivity.id)} / 100
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Upload Form
                    <form onSubmit={(e) => handleUploadKarya(e, selectedActivity)} className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Nama Kelompok / Peserta</label>
                        <input
                          type="text"
                          placeholder="Masukkan nama kelompok (contoh: Tim Barokah) atau nama Anda"
                          required
                          name="groupName"
                          defaultValue={currentUser?.name || "Ahmad Fauzan"}
                          className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Pilih File Karya</label>
                        <input
                          type="file"
                          required
                          name="fileInput"
                          className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-sm cursor-pointer shadow-md active:scale-98 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                        Unggah Karya Sekarang
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-surface-container-low border-t border-surface-variant/30 flex gap-3 justify-end shrink-0">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-6 py-2.5 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-full font-bold text-sm cursor-pointer transition-all"
              >
                Tutup Portal
              </button>
               {selectedActivity.status !== "Selesai" && (
                <button
                  onClick={() => setShowTicketReceipt(selectedActivity)}
                  className="px-8 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-full font-bold text-sm cursor-pointer shadow-md active:scale-98 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  Unduh E-Tiket Kegiatan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STRUK E-TIKET (TICKET RECEIPT) */}
      {showTicketReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print transition-opacity duration-300">
          <style>{`
            @media print {
              body {
                background: white !important;
              }
              body * {
                visibility: hidden;
              }
              #printable-ticket-card, #printable-ticket-card * {
                visibility: visible;
              }
              #printable-ticket-card {
                position: absolute;
                left: 50% !important;
                top: 0 !important;
                transform: translateX(-50%) !important;
                width: 100% !important;
                max-width: 440px !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: 1px solid #e0e0e0 !important;
                border-radius: 16px !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col p-0 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-surface-container-low border-b border-surface-variant/30 flex justify-between items-center no-print">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
                Struk E-Tiket Kegiatan
              </h4>
              <button
                onClick={() => setShowTicketReceipt(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
              </button>
            </div>

            {/* Ticket Card Area (This area is printed) */}
            <div className="p-6 md:p-8 flex-1" id="printable-ticket-card">
              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-md relative">
                {/* Ticket Header Band */}
                <div className="bg-primary p-4 text-center text-on-primary">
                  <span className="font-mono text-[9px] tracking-widest uppercase opacity-85 block">E-TIKET MASUK RESMI</span>
                  <h3 className="font-bold text-base mt-0.5 tracking-wide">SEMADIKSI PORTAL</h3>
                  <p className="text-[10px] opacity-90 mt-0.5">Persatuan Mahasiswa KIP-K UNUSA</p>
                </div>

                {/* Ticket Main Details */}
                <div className="p-5 space-y-4">
                  {/* Event Title */}
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">NAMA AGENDA / KEGIATAN</span>
                    <h4 className="font-bold text-base text-neutral-800 leading-tight mt-0.5">{showTicketReceipt.title}</h4>
                    <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[9px] font-semibold mt-1">
                      {showTicketReceipt.category} • {showTicketReceipt.organizer || "Panitia Beasiswa"}
                    </span>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-dashed border-outline-variant/20"></div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">NAMA PESERTA</span>
                      <span className="font-bold text-neutral-800 mt-0.5 block truncate">{currentUser?.name || "Ahmad Fauzan"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">NIM MAHASISWA</span>
                      <span className="font-semibold text-neutral-700 mt-0.5 block">{currentUser?.nim || "230910023"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">TANGGAL PELAKSANAAN</span>
                      <span className="font-semibold text-neutral-700 mt-0.5 block">{showTicketReceipt.date}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">LOKASI / TEMPAT</span>
                      <span className="font-semibold text-neutral-700 mt-0.5 block leading-tight truncate" title={showTicketReceipt.location}>
                        {showTicketReceipt.location || "Auditorium UNUSA"}
                      </span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-dashed border-outline-variant/20"></div>

                  {/* Seat Booking Info */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div>
                      <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">NOMOR TEMPAT DUDUK</span>
                      <span className="font-bold text-neutral-800 text-xs mt-0.5">
                        {showTicketReceipt.bookedSeat ? `Kursi ${showTicketReceipt.bookedSeat}` : "Reguler (Tanpa Booking)"}
                      </span>
                    </div>
                    <div>
                      {showTicketReceipt.bookedSeat ? (
                        showTicketReceipt.bookedSeat.startsWith("A-") ? (
                          <span className="px-2.5 py-1 bg-error/10 border border-error/30 text-error rounded-full text-[10px] font-bold shadow-sm animate-pulse">
                            ★ Sweetbox
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary rounded-full text-[10px] font-bold shadow-sm">
                            Kursi Reguler
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-1 bg-neutral-200 border border-neutral-300 text-neutral-600 rounded-full text-[10px] font-semibold">
                          Free Seating
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ticket Tear dotted line with cut-outs */}
                  <div className="border-t-2 border-dashed border-outline-variant/40 my-5 relative">
                    <div className="w-5 h-5 rounded-full bg-black/60 absolute -left-8 -top-2.5 no-print"></div>
                    <div className="w-5 h-5 rounded-full bg-black/60 absolute -right-8 -top-2.5 no-print"></div>
                    {/* Visual print cut-outs for white printable card */}
                    <div className="w-3 h-3 rounded-full bg-[#fdfdfd] border-r border-outline-variant/30 absolute -left-[27px] -top-1.5 hidden print:block"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fdfdfd] border-l border-outline-variant/30 absolute -right-[27px] -top-1.5 hidden print:block"></div>
                  </div>

                  {/* QR Scan Area */}
                  <div className="text-center pt-1">
                    <span className="text-[8px] font-bold text-outline uppercase tracking-wider block mb-2">QR CODE MASUK KEGIATAN</span>
                    
                    {/* Dynamic Graphic QR Generator */}
                    <div className="flex flex-col items-center justify-center p-2.5 border border-surface-variant/30 rounded-xl bg-neutral-50 max-w-[130px] mx-auto mb-2 shadow-inner">
                      {(() => {
                        const size = 21;
                        const cells = [];
                        
                        const getLocatorColor = (r: number, c: number, rStart: number, cStart: number) => {
                          if (r >= rStart && r < rStart + 7 && c >= cStart && c < cStart + 7) {
                            const dr = r - rStart;
                            const dc = c - cStart;
                            // Outer black ring
                            if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return "bg-black";
                            // Inner white spacer
                            if (dr === 1 || dr === 5 || dc === 1 || dc === 5) return "bg-white";
                            // Center black square
                            return "bg-black";
                          }
                          return null;
                        };

                        for (let r = 0; r < size; r++) {
                          for (let c = 0; c < size; c++) {
                            // Check top-left locator
                            const tl = getLocatorColor(r, c, 0, 0);
                            if (tl) { cells.push(tl); continue; }
                            
                            // Check top-right locator
                            const tr = getLocatorColor(r, c, 0, 14);
                            if (tr) { cells.push(tr); continue; }
                            
                            // Check bottom-left locator
                            const bl = getLocatorColor(r, c, 14, 0);
                            if (bl) { cells.push(bl); continue; }
                            
                            // Alignment pattern at (16, 16)
                            if (r >= 14 && r <= 18 && c >= 14 && c <= 18) {
                              const dr = r - 14;
                              const dc = c - 14;
                              if (dr === 0 || dr === 4 || dc === 0 || dc === 4) {
                                cells.push("bg-black");
                              } else if (dr === 1 || dr === 3 || dc === 1 || dc === 3) {
                                cells.push("bg-white");
                              } else {
                                cells.push("bg-black");
                              }
                              continue;
                            }
                            
                            // Timing patterns (row 6 and col 6)
                            if (r === 6 || c === 6) {
                              cells.push((r + c) % 2 === 0 ? "bg-black" : "bg-white");
                              continue;
                            }

                            // Deterministic pixel blocks based on ticket code
                            const seedStr = showTicketReceipt.code + `-${r}-${c}`;
                            let hash = 0;
                            for (let idx = 0; idx < seedStr.length; idx++) {
                              hash = seedStr.charCodeAt(idx) + ((hash << 5) - hash);
                            }
                            const isFilled = (hash % 2 === 0);
                            cells.push(isFilled ? "bg-black" : "bg-white");
                          }
                        }
                        
                        return (
                          <div 
                            style={{ display: "grid", gridTemplateColumns: "repeat(21, minmax(0, 1fr))" }}
                            className="gap-[0.5px] w-24 h-24 bg-white p-1"
                          >
                            {cells.map((cls, idx) => (
                              <div key={idx} className={`w-full h-full ${cls}`} />
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <Link
                      href={`/absensi?kegiatan=${encodeURIComponent(showTicketReceipt.title)}`}
                      className="inline-block p-1 bg-white hover:ring-2 hover:ring-primary rounded-xl transition-all cursor-pointer group"
                      title="Klik untuk membuka Formulir Absensi Kehadiran Online"
                    >
                      <span className="font-mono text-xs tracking-widest text-neutral-800 font-bold block">{showTicketReceipt.code}</span>
                      <p className="text-[9px] text-primary group-hover:underline font-bold mt-1 leading-tight flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">how_to_reg</span>
                        <span>Klik Disini untuk Buka Absensi Online</span>
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-variant/30 flex flex-wrap gap-2 justify-end no-print shrink-0">
              <Link
                href={`/absensi?kegiatan=${encodeURIComponent(showTicketReceipt.title)}`}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Isi Absensi Kegiatan</span>
              </Link>
              <button
                onClick={() => setShowTicketReceipt(null)}
                className="px-5 py-2 text-xs border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-full font-bold cursor-pointer transition-all"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-primary text-on-primary hover:brightness-110 rounded-full font-bold text-xs cursor-pointer shadow-md active:scale-98 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Cetak Tiket (PDF / Kertas)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KegiatanSayaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-primary font-bold">Memuat Kegiatan Anda...</div>}>
      <KegiatanSayaContent />
    </Suspense>
  );
}
