"use client";

import { useState, useEffect, useRef } from "react";

export default function ProfilPage() {
  const [profileTab, setProfileTab] = useState<"riwayat" | "grafik">("riwayat");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ubah Password (Keamanan Akun) modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Transkrip Nilai KIP-K modal state
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  // Acara Riwayat Kegiatan modal state & filter
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState<"selesai" | "terdaftar">("selesai");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  // 3D card tilt effect
  useEffect(() => {
    const card = document.querySelector(".profile-header-card") as HTMLElement;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    };
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const openEditModal = () => {
    setSaveMessage(null);
    setEditName(currentUser?.name || "");
    setEditAvatarPreview(currentUser?.avatarUrl || "");
    setEditAvatarFile(null);
    setShowEditModal(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: "error", text: "Ukuran foto maksimal 5MB" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEditAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setEditAvatarFile(file);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveMessage({ type: "error", text: "Nama tidak boleh kosong" });
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      let newAvatarUrl = currentUser?.avatarUrl || "";

      if (editAvatarFile) {
        try {
          const formData = new FormData();
          formData.append("file", editAvatarFile);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            newAvatarUrl = uploadData.url;
          } else {
            // Fallback to base64 preview
            newAvatarUrl = editAvatarPreview;
          }
        } catch {
          // Fallback to base64 preview on error
          newAvatarUrl = editAvatarPreview;
        }
      } else if (!editAvatarPreview) {
        newAvatarUrl = "";
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUser?.id, name: editName.trim(), avatarUrl: newAvatarUrl }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Gagal menyimpan");

      const updatedUser = { ...currentUser, name: data.user.name, avatarUrl: data.user.avatarUrl };
      setCurrentUser(updatedUser);
      localStorage.setItem("semadiksi_current_user", JSON.stringify(updatedUser));

      // Synchronize with semadiksi_users to prevent stale overwrite
      try {
        const storedUsers = localStorage.getItem("semadiksi_users");
        const usersList = storedUsers ? JSON.parse(storedUsers) : [];
        const idx = usersList.findIndex((u: any) => u.id === updatedUser.id || (u.email && u.email.toLowerCase() === updatedUser.email?.toLowerCase()));
        if (idx >= 0) {
          usersList[idx] = { ...usersList[idx], ...updatedUser };
        } else {
          usersList.push(updatedUser);
        }
        localStorage.setItem("semadiksi_users", JSON.stringify(usersList));
      } catch (e) {}

      // Trigger custom event to update header and layout instantly
      window.dispatchEvent(new Event("userProfileUpdated"));

      setSaveMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setTimeout(() => { setShowEditModal(false); setSaveMessage(null); }, 1200);
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "Terjadi kesalahan" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Password saat ini harus diisi" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    setIsChangingPass(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      setPasswordMessage({ type: "success", text: "Password berhasil diubah!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage(null);
      }, 1500);
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Terjadi kesalahan saat mengubah password" });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handlePrintTranscriptWindow = () => {
    const printWindow = window.open("", "_blank", "width=880,height=920");
    if (!printWindow) {
      alert("Izinkan jendela sembulan (pop-up) untuk mencetak transkrip nilai.");
      return;
    }

    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Transkrip Kemajuan Studi KIP-K - ${displayName}</title>
        <style>
          @page { size: A4; margin: 15mm 20mm; }
          body { font-family: 'Times New Roman', Times, serif; color: #111; margin: 0; padding: 20px; line-height: 1.4; font-size: 12pt; }
          .header { text-align: center; border-bottom: 3px double #111; padding-bottom: 12px; margin-bottom: 16px; }
          .header h2 { margin: 0; font-size: 13pt; text-transform: uppercase; letter-spacing: 0.5px; }
          .header h1 { margin: 4px 0; font-size: 15pt; text-transform: uppercase; color: #0d5926; }
          .header p { margin: 2px 0; font-size: 9.5pt; color: #444; }
          .title { text-align: center; margin: 16px 0; }
          .title h3 { margin: 0; font-size: 13pt; text-decoration: underline; text-transform: uppercase; }
          .title p { margin: 2px 0; font-size: 10pt; }
          .info-table { width: 100%; margin-bottom: 16px; border-collapse: collapse; font-size: 11pt; }
          .info-table td { padding: 3px 0; vertical-align: top; }
          .info-table td:nth-child(1) { width: 22%; }
          .info-table td:nth-child(2) { width: 3%; }
          .info-table td:nth-child(3) { width: 45%; font-weight: bold; }
          .info-table td:nth-child(4) { width: 30%; text-align: right; }
          table.data { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10.5pt; }
          table.data th, table.data td { border: 1px solid #333; padding: 6px 8px; text-align: center; }
          table.data th { background-color: #f2f6f3; font-weight: bold; }
          table.data td.left { text-align: left; }
          .summary-box { border: 1.5px solid #1b6d24; background-color: #f4fbf5; padding: 12px; margin-bottom: 20px; border-radius: 4px; font-size: 10.5pt; }
          .sig-container { display: flex; justify-content: space-between; margin-top: 30px; }
          .sig-box { width: 45%; text-align: center; font-size: 10.5pt; }
          .sig-space { height: 75px; }
          .sig-name { font-weight: bold; text-decoration: underline; }
          .stamp { color: #0d5926; font-size: 9pt; border: 1px dashed #0d5926; display: inline-block; padding: 2px 8px; margin-top: 4px; border-radius: 3px; font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 8px; text-align: center;">
          <button onclick="window.print()" style="background: #1b6d24; color: white; border: none; padding: 10px 28px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Cetak / Unduh PDF Sekarang
          </button>
        </div>
        <div class="header">
          <h2>UNIVERSITAS NAHDLATUL ULAMA SURABAYA</h2>
          <h1>FORUM MAHASISWA BIDIKMISI &amp; KIP KULIAH (SEMADIKSI)</h1>
          <p>Jl. Raya Jemursari No. 57, Surabaya 60237 • Surel: semadiksi@unusa.ac.id • Laman: unusa.ac.id</p>
        </div>
        <div class="title">
          <h3>TRANSKRIP KEMAJUAN AKADEMIK &amp; KEAKTIFAN KIP-K</h3>
          <p>Nomor: UNUSA/SEMADIKSI/KIP-K/EVAL-2024/09</p>
        </div>
        <table class="info-table">
          <tr>
            <td>Nama Mahasiswa</td><td>:</td><td>${displayName}</td>
            <td rowspan="4" style="text-align: right; vertical-align: middle;">
              <span style="border: 2px solid #1b6d24; color: #1b6d24; padding: 6px 12px; font-weight: bold; border-radius: 4px; font-size: 9.5pt;">
                BEASISWA KIP-K AKTIF
              </span>
            </td>
          </tr>
          <tr><td>NIM</td><td>:</td><td>${displayNim}</td></tr>
          <tr><td>Program Studi</td><td>:</td><td>${displayProdi}</td></tr>
          <tr><td>Tahun Angkatan</td><td>:</td><td>${displayAngkatan}</td></tr>
        </table>
        <table class="data">
          <thead>
            <tr>
              <th style="width: 8%;">Semester</th>
              <th style="width: 14%;">Beban SKS</th>
              <th style="width: 14%;">IPS</th>
              <th style="width: 14%;">IPK</th>
              <th style="width: 18%;">Keaktifan</th>
              <th style="width: 32%;">Status Evaluasi Beasiswa</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Semester 1</td><td>20 SKS</td><td>3.75</td><td>3.75</td><td>12.5%</td><td class="left">✓ Memenuhi Standar Kelayakan</td></tr>
            <tr><td>Semester 2</td><td>22 SKS</td><td>3.85</td><td>3.80</td><td>12.5%</td><td class="left">✓ Memenuhi Standar Kelayakan</td></tr>
            <tr><td>Semester 3</td><td>21 SKS</td><td>3.90</td><td>3.84</td><td>12.0%</td><td class="left">✓ Memenuhi Standar Kelayakan</td></tr>
            <tr><td>Semester 4</td><td>20 SKS</td><td>3.75</td><td>3.82</td><td>12.5%</td><td class="left">✓ Memenuhi Standar Kelayakan</td></tr>
            <tr><td>Semester 5</td><td>19 SKS</td><td>3.95</td><td>3.85</td><td>12.5%</td><td class="left">✓ Memenuhi Standar Kelayakan</td></tr>
          </tbody>
        </table>
        <div class="summary-box">
          <div style="font-weight: bold; margin-bottom: 6px; color: #0d5926;">HASIL EVALUASI KOMPREHENSIF KIP KULIAH:</div>
          <table style="width: 100%; border: none; font-size: 10pt;">
            <tr>
              <td style="width: 33%;"><strong>Total SKS Lulus:</strong> 102 SKS</td>
              <td style="width: 33%;"><strong>IPK Kumulatif:</strong> 3.85 / 4.00</td>
              <td style="width: 34%;"><strong>Akumulasi Keaktifan:</strong> 62.0% / 100%</td>
            </tr>
            <tr>
              <td colspan="3" style="padding-top: 6px;">
                <strong>Keputusan Monev:</strong> Dinyatakan <span style="color: #1b6d24; font-weight: bold;">MEMENUHI SYARAT &amp; LAYAK</span> melanjutkan pendanaan Beasiswa KIP Kuliah untuk semester berikutnya.
              </td>
            </tr>
          </table>
        </div>
        <div class="sig-container">
          <div class="sig-box">
            <p>Mengetahui,<br>Ketua Umum SEMADIKSI UNUSA</p>
            <div class="sig-space"></div>
            <p class="sig-name">M. Rizky Pratama</p>
            <p>NIM. 3130022005</p>
            <div class="stamp">DIVERIFIKASI DIGITAL</div>
          </div>
          <div class="sig-box">
            <p>Surabaya, ${todayStr}<br>Pengelola &amp; Pembina KIP-K UNUSA</p>
            <div class="sig-space"></div>
            <p class="sig-name">Achmad Syafi'i, M.Pd.</p>
            <p>NIDN. 0715088201</p>
            <div class="stamp">TERVALIDASI OTENTIK</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const displayName = currentUser?.name || "Pengguna";
  const displayAvatar = currentUser?.avatarUrl || "";
  const displayProdi = currentUser?.prodi || "Teknik Informatika";
  const displayUniversity = currentUser?.university || "Universitas Nahdlatul Ulama Surabaya";
  const displayNim = currentUser?.nim || "-";
  const displayAngkatan = currentUser?.angkatan || "-";
  const displayEmail = currentUser?.email || "-";
  const isKip = currentUser?.kipStatus === "KIP UNUSA";

  const historyItems = [
    {
      id: "ev-1",
      title: "Malam Keakraban & Upgrading SEMADIKSI 2023",
      category: "Akademik",
      date: "12 Des 2023",
      time: "08:00 - 15:30 WIB",
      location: "Auditorium Lantai 9 Tower UNUSA Kampus B",
      speaker: "Dr. Achmad Syafi'i, M.Pd & Pengurus Harian SEMADIKSI",
      desc: "Kegiatan tahunan untuk mempererat rasa persaudaraan dan solidaritas antar penerima KIP-K lintas angkatan. Meliputi sharing session, penulisan target akademik, dan pembekalan motivasi berprestasi.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlUaW-ZS6LpTsZ64agwr8nm5KWchmhzxBNj90aAxaA3HOdxHVhyO9B4MKjILy1O_XdhuY8fZnK-aJ3EUTcLM7obEmEbw9-0MKnQUVuNXkEZLbQPq5P_DH-R5o5tilfc5HNFb6Zlsu9SjaORp6sy2EGmO0n_GRnmqNwerEgyn-MXuxgpwbDuM7d780dbRRjV62TGfDQf41ztasbWhx7gyMP0dqSc0RVZkyjbdcAPpJKhLcz9bUVvMsjqA",
      status: "Selesai",
      xp: "+300 XP",
      attendance: "Hadir (100%)",
      certificate: "SERT-LKMB-2023-018.pdf",
    },
    {
      id: "ev-2",
      title: "Strategi Manajemen Keuangan Mahasiswa",
      category: "Webinar",
      date: "05 Okt 2023",
      time: "13:00 - 16:00 WIB",
      location: "Zoom Meeting & Live Streaming YouTube UNUSA",
      speaker: "Nadia Faradina, S.E., CFP (Praktisi Perencana Keuangan)",
      desc: "Webinar komprehensif tentang cara mengelola uang saku biaya hidup KIP-K agar tetap produktif, hemat, serta teknik menyisihkan tabungan darurat dan biaya pendukung skripsi/tugas akhir.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL2OfXTZKzZtu2JVrmy9SMkMOwiOgCfMxy8zHIHlKSVRmtSdN2Uvy_Zk9Sg-sQaHptSM7atdP0qAm4aN6mum3E6xnN1jSeR15t5cBuN8k_6lB-T4ROwufkCxRWg-qZOz36SdH5uMx_9eFk90CtBMqr3K4q3WjF6uxLjI3lQgbphE3MVTkaVGU4vYYSsVNHj_uxctlneg5Q-wT5aXmBYqYRi2TFi3gkzBIGJ9gSuEY_vnOoAFD_GPXG6w",
      status: "Selesai",
      xp: "+200 XP",
      attendance: "Hadir (100%)",
      certificate: "SERT-FINANCE-2023-094.pdf",
    },
    {
      id: "ev-3",
      title: "SEMADIKSI Berbagi: Desa Binaan 2023",
      category: "Sosial",
      date: "15 Sep 2023",
      time: "07:00 - 17:00 WIB",
      location: "Desa Segoro Tambak, Sedati",
      speaker: "Divisi Pengabdian Masyarakat SEMADIKSI & Tokoh Warga",
      desc: "Program pengabdian masyarakat nyata di desa binaan SEMADIKSI. Mengajarkan literasi teknologi informasi kepada anak-anak sekolah dasar dan pembagian paket sembako edukatif.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAEAZ_aAheRNVnJq1QBdkXB1An12KhbmqJ_qvTTyzk4wAzqwSdzJNi5x_DWJQB9ZnIleaf7nggVVM-2-fRGTh-ehVIlRBRqXzyOZ21L9s0Wo-ByPE-9Po_2sJtuDYLHmWxjJsqfnMshvoqJlgQ3BK9_HaDeBtXvUC3kTLVnjCGkmDdie3ym8qwEwNFENj1jzgFsqeREyJKc0kT3QIvjr9Jh7eiK7oyUxmzvPK3KUbdbYfP2U8Jzm2-hA",
      status: "Selesai",
      xp: "+450 XP",
      attendance: "Hadir (100%)",
      certificate: "SERT-PENGABDIAN-2023-033.pdf",
    },
    {
      id: "ev-4",
      title: "Seminar Nasional Hilirisasi Riset Mahasiswa KIP-K",
      category: "Akademik",
      date: "28 Okt 2024",
      time: "09:00 - 12:30 WIB",
      location: "Auditorium Kafe Fastron Lantai 3 UNUSA Kampus B",
      speaker: "Prof. Dr. Ir. Wahid Susanto (Reviewer Nasional PKM)",
      desc: "Sosialisasi skema hibah riset mahasiswa dan bimbingan teknis penyusunan proposal PKM (Program Kreativitas Mahasiswa) khusus mahasiswa penerima KIP-K berprestasi.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlUaW-ZS6LpTsZ64agwr8nm5KWchmhzxBNj90aAxaA3HOdxHVhyO9B4MKjILy1O_XdhuY8fZnK-aJ3EUTcLM7obEmEbw9-0MKnQUVuNXkEZLbQPq5P_DH-R5o5tilfc5HNFb6Zlsu9SjaORp6sy2EGmO0n_GRnmqNwerEgyn-MXuxgpwbDuM7d780dbRRjV62TGfDQf41ztasbWhx7gyMP0dqSc0RVZkyjbdcAPpJKhLcz9bUVvMsjqA",
      status: "Terdaftar",
      xp: "+250 XP",
      attendance: "Terdaftar Aktif",
      certificate: "Tersedia Setelah Acara Selesai",
    },
    {
      id: "ev-5",
      title: "Workshop Penulisan Jurnal SINTA & Publikasi Ilmiah",
      category: "Pelatihan",
      date: "14 Nov 2024",
      time: "13:30 - 16:30 WIB",
      location: "Lab CBT Center UNUSA Kampus B",
      speaker: "Rina Kusuma Dewi, M.Sc (Managing Editor Jurnal UNUSA)",
      desc: "Pelatihan teknik sitasi standar IEEE/APA dengan aplikasi Mendeley, parafrase bebas plagiarisme, dan strategi submit ke jurnal nasional terindeks SINTA 2-4.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL2OfXTZKzZtu2JVrmy9SMkMOwiOgCfMxy8zHIHlKSVRmtSdN2Uvy_Zk9Sg-sQaHptSM7atdP0qAm4aN6mum3E6xnN1jSeR15t5cBuN8k_6lB-T4ROwufkCxRWg-qZOz36SdH5uMx_9eFk90CtBMqr3K4q3WjF6uxLjI3lQgbphE3MVTkaVGU4vYYSsVNHj_uxctlneg5Q-wT5aXmBYqYRi2TFi3gkzBIGJ9gSuEY_vnOoAFD_GPXG6w",
      status: "Terdaftar",
      xp: "+300 XP",
      attendance: "Terdaftar Aktif",
      certificate: "Tersedia Setelah Acara Selesai",
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md md:py-xl relative">
        {/* Profile Header */}
        <section className="mb-xl">
          <div className="profile-header-card bg-surface-container-lowest rounded-[32px] p-md md:p-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] relative overflow-hidden transition-transform duration-300 ease-out">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-md md:gap-lg relative z-10">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface-container-high">
                  {displayAvatar ? (
                    <img className="w-full h-full object-cover" alt={displayName} src={displayAvatar} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="material-symbols-outlined text-primary text-6xl">person</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-md">
                  <span className="material-symbols-outlined text-[20px] font-bold">verified</span>
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                  <h2 className="font-display text-3xl font-extrabold text-on-surface">{displayName}</h2>
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold w-fit mx-auto md:mx-0">
                    <span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    {isKip ? "Mahasiswa KIP-K" : "Mahasiswa Umum"}
                  </span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant">{displayProdi} • {displayUniversity}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    id="btn-edit-profil"
                    onClick={openEditModal}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-label-md flex items-center gap-2 active:scale-95 transition-all shadow-md hover:brightness-110 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profil
                  </button>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(window.location.href); alert("Link profil disalin ke clipboard."); }}
                    className="border-2 border-primary text-primary px-6 py-2.5 rounded-full font-bold text-label-md flex items-center gap-2 active:scale-95 transition-all hover:bg-primary/5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-primary rotate-12 translate-x-20 -translate-y-10">school</span>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-md md:gap-lg">
          {/* Left: Data Diri */}
          <div className="lg:col-span-4 flex flex-col gap-md">
            <div className="bg-surface rounded-xl p-md border border-surface-container-high shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-headline-md text-xl font-extrabold text-primary">Data Diri</h3>
                <span className="material-symbols-outlined text-on-surface-variant">info</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "NIM", value: displayNim },
                  { label: "Angkatan", value: displayAngkatan },
                  { label: "Email Akademik", value: displayEmail },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-surface-container-low rounded-lg">
                    <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">{item.label}</span>
                    <span className="font-body-md text-body-md text-on-surface font-semibold">{item.value}</span>
                  </div>
                ))}
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Status KIP-K</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-3 h-3 rounded-full ${isKip ? "bg-primary animate-pulse" : "bg-on-surface-variant"}`}></span>
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      {isKip ? "Penerima Beasiswa Aktif" : "Bukan Penerima Beasiswa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-md border border-surface-container-high shadow-sm">
              <h3 className="font-headline-md text-xl font-extrabold text-on-surface mb-md">Pengaturan</h3>
              <div className="space-y-1">
                <a
                  id="btn-open-keamanan-akun"
                  onClick={() => {
                    setPasswordMessage(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowPasswordModal(true);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                    <span className="font-body-md text-body-md font-semibold">Keamanan Akun</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                </a>
                <a
                  id="btn-unduh-transkrip-menu"
                  onClick={() => setShowTranscriptModal(true)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">description</span>
                    <span className="font-body-md text-body-md font-semibold">Unduh Transkrip KIP</span>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-y-0.5 transition-transform">download</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Activity */}
          <div className="lg:col-span-8 flex flex-col gap-md">
            <div className="bg-surface rounded-xl p-md md:p-lg border border-surface-container-high shadow-sm flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-lg pb-4 border-b border-surface-container-high">
                <div className="flex gap-6">
                  <button
                    onClick={() => setProfileTab("riwayat")}
                    className={`pb-2 font-display text-lg font-bold border-b-2 transition-all cursor-pointer ${profileTab === "riwayat" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
                  >
                    Riwayat Kegiatan
                  </button>
                  {isKip && (
                    <button
                      onClick={() => setProfileTab("grafik")}
                      className={`pb-2 font-display text-lg font-bold border-b-2 transition-all cursor-pointer ${profileTab === "grafik" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
                    >
                      Grafik Kemajuan
                    </button>
                  )}
                </div>
                {profileTab === "riwayat" && (
                  <div className="flex items-center bg-surface-container-low p-1 rounded-full border border-surface-container-high w-fit">
                    <button
                      onClick={() => setHistoryFilter("selesai")}
                      className={`px-5 py-2 rounded-full font-bold text-label-md transition-all cursor-pointer ${
                        historyFilter === "selesai"
                          ? "bg-white text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Selesai
                    </button>
                    <button
                      onClick={() => setHistoryFilter("terdaftar")}
                      className={`px-5 py-2 rounded-full font-bold text-label-md transition-all cursor-pointer ${
                        historyFilter === "terdaftar"
                          ? "bg-white text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Terdaftar
                    </button>
                  </div>
                )}
              </div>

              {profileTab === "riwayat" ? (
                <>
                  <div className="space-y-4">
                    {historyItems
                      .filter((item) => item.status.toLowerCase() === historyFilter.toLowerCase())
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedEvent(item);
                            setShowEventModal(true);
                          }}
                          className="group flex flex-col md:flex-row gap-md p-md rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-surface-container-high cursor-pointer shadow-sm hover:shadow"
                        >
                          <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden shadow-sm shrink-0 relative">
                            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} src={item.img} />
                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white font-bold text-[10px]">
                              {item.status}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">{item.category}</span>
                              <span className="text-on-surface-variant font-label-sm text-label-sm">• {item.date}</span>
                              <span className="text-primary font-semibold text-xs ml-auto md:ml-0 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">stars</span>
                                {item.xp}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-on-surface-variant font-body-md text-body-md line-clamp-2">{item.desc}</p>
                          </div>
                          <div className="flex items-center justify-end md:justify-center">
                            <span className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all">
                              <span className="material-symbols-outlined">chevron_right</span>
                            </span>
                          </div>
                        </div>
                      ))}

                    {historyItems.filter((item) => item.status.toLowerCase() === historyFilter.toLowerCase()).length === 0 && (
                      <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-surface-container-high">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">event_busy</span>
                        <p className="font-bold text-on-surface">Tidak ada kegiatan {historyFilter}</p>
                        <p className="text-xs text-on-surface-variant mt-1">Jelajahi agenda beasiswa KIP-K di menu Kegiatan.</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 pt-8 border-t border-surface-container-high text-center">
                    <button
                      onClick={() => {
                        // Open first event or show list
                        if (historyItems.length > 0) {
                          setSelectedEvent(historyItems[0]);
                          setShowEventModal(true);
                        }
                      }}
                      className="text-primary font-bold text-label-md flex items-center gap-2 mx-auto hover:underline cursor-pointer"
                    >
                      Lihat Detail Riwayat Kegiatan
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-lg text-on-surface">Grafik Akademik &amp; Non Akademik</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Pantau perkembangan nilai IPK, IPS, dan Keaktifan Anda selama masa studi.</p>
                    </div>
                    <button
                      id="btn-unduh-transkrip-grafik"
                      onClick={() => setShowTranscriptModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer w-fit"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Unduh Transkrip Nilai &amp; Kemajuan
                    </button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary text-xl">show_chart</span>
                        <span className="font-bold text-sm text-on-surface">Perkembangan IPK &amp; IPS</span>
                      </div>
                      <div className="w-full overflow-x-auto select-none scrollbar-none">
                        <svg className="w-full min-w-[360px] h-60" viewBox="0 0 500 240">
                          {[0,0.5,1.0,1.5,2.0,2.5,3.0,3.5,4.0].map((val)=>{const y=195-(val/4.0)*180;return(<g key={val}><line x1="40" y1={y} x2="480" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/><text x="30" y={y+3.5} textAnchor="end" className="text-[10px] fill-outline-variant font-bold font-mono">{val.toFixed(1).replace(".",",")}</text></g>);})}
                          {["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"].map((sem,idx)=>{const x=40+idx*62.85;return(<g key={sem}><line x1={x} y1="15" x2={x} y2="195" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2"/><text x={x} y="215" textAnchor="middle" className="text-[10px] fill-on-surface-variant font-bold">{sem}</text></g>);})}
                          <path d="M 40 195 L 40 37.5 L 102.8 35.25 L 165.7 33 L 228.5 33.9 L 291.4 30.75 L 291.4 195 Z" fill="rgba(27,109,36,0.08)"/>
                          <path d="M 40 37.5 L 102.8 33 L 165.7 28.5 L 228.5 37.5 L 291.4 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="4"/>
                          <path d="M 40 37.5 L 102.8 35.25 L 165.7 33 L 228.5 33.9 L 291.4 30.75" fill="none" stroke="#1b6d24" strokeWidth="3"/>
                          {[{x:40,y:37.5},{x:102.8,y:33},{x:165.7,y:28.5},{x:228.5,y:37.5},{x:291.4,y:24}].map((pt,i)=>(<g key={i}><circle cx={pt.x} cy={pt.y} r="5" fill="#0284c7"/><circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff"/></g>))}
                          {[{x:40,y:37.5},{x:102.8,y:35.25},{x:165.7,y:33},{x:228.5,y:33.9},{x:291.4,y:30.75}].map((pt,i)=>(<g key={i}><circle cx={pt.x} cy={pt.y} r="5" fill="#1b6d24"/><circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff"/></g>))}
                        </svg>
                      </div>
                      <div className="flex justify-center items-center gap-6 text-xs font-bold pt-4 border-t border-surface-variant/30 mt-4">
                        <div className="flex items-center gap-2"><span className="w-5 h-3.5 bg-primary/10 border-2 border-primary rounded"></span><span className="text-on-surface-variant">IPK</span></div>
                        <div className="flex items-center gap-2"><span className="w-5 h-3.5 border-2 border-dashed border-sky-600 rounded"></span><span className="text-on-surface-variant">IPS</span></div>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-amber-500 text-xl">bar_chart</span>
                        <span className="font-bold text-sm text-on-surface">Keaktifan Non Akademik (Max 12.5% / Smt)</span>
                      </div>
                      <div className="w-full overflow-x-auto select-none scrollbar-none">
                        <svg className="w-full min-w-[360px] h-60" viewBox="0 0 500 240">
                          {[0,2,4,6,8,10,12,14,15].map((val)=>{const y=195-(val/15.0)*180;return(<g key={val}><line x1="40" y1={y} x2="480" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/><text x="30" y={y+3.5} textAnchor="end" className="text-[10px] fill-outline-variant font-bold font-mono">{val}%</text></g>);})}
                          {["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"].map((sem,idx)=>{const x=40+idx*62.85;return(<g key={sem}><line x1={x} y1="15" x2={x} y2="195" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2"/><text x={x} y="215" textAnchor="middle" className="text-[10px] fill-on-surface-variant font-bold">{sem}</text></g>);})}
                          {[{y:75,h:120},{y:45,h:150},{y:81,h:114},{y:63,h:132},{y:51,h:144}].map((col,idx)=>{const x=40+idx*62.85;return(<g key={idx}><rect x={x-10} y={col.y} width="20" height={col.h} fill="#f59e0b" rx="4" className="transition-all hover:brightness-105 cursor-pointer"/></g>);})}
                        </svg>
                      </div>
                      <div className="text-center text-[10px] text-on-surface-variant font-semibold pt-4 border-t border-surface-variant/30 mt-4 leading-normal">
                        *Total target akumulasi 8 semester adalah 100%. Setiap semester menyumbang maksimal 12.5%.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profil Modal ── */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative"
            style={{ maxHeight: "90vh", overflowY: "auto", animation: "modalIn 0.2s ease" }}
          >
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-on-surface">Edit Profil</h2>
              <button
                id="btn-close-edit-modal"
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Avatar Editor */}
            <div className="flex flex-col items-center mb-6">
              <label
                htmlFor="avatar-file-input"
                className="relative group cursor-pointer block rounded-full focus:outline-none"
                title="Klik untuk memilih foto profil"
              >
                <div className="w-28 h-28 rounded-full border-4 border-primary/20 shadow-lg overflow-hidden bg-surface-container-high transition-transform duration-200 group-hover:scale-105">
                  {editAvatarPreview ? (
                    <img src={editAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="material-symbols-outlined text-primary text-5xl">person</span>
                    </div>
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                  <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
                </div>
                {/* Camera badge */}
                <div className="absolute bottom-0 right-0 bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 border-surface">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </div>
              </label>

              {/* Native file input */}
              <input
                id="avatar-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={handlePhotoSelect}
              />

              {/* Action buttons below avatar */}
              <div className="flex items-center gap-2 mt-3">
                <label
                  htmlFor="avatar-file-input"
                  id="btn-choose-avatar"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                  {editAvatarPreview ? "Ganti Foto" : "Pilih Foto"}
                </label>
                {editAvatarPreview && (
                  <button
                    type="button"
                    id="btn-remove-avatar"
                    onClick={() => {
                      setEditAvatarPreview("");
                      setEditAvatarFile(null);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    Hapus
                  </button>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 text-center">
                Format: <span className="font-semibold text-on-surface">JPG, PNG, WebP</span> • Maks. 5MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Nama (editable) */}
              <div>
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Nama / Username
                </label>
                <input
                  id="input-edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={60}
                  placeholder="Masukkan nama kamu"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-surface-container-high bg-surface-container-low text-on-surface font-medium text-base focus:outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-on-surface-variant mt-1 text-right">{editName.length}/60</p>
              </div>

              {/* Read-only info */}
              <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 space-y-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tidak dapat diubah</p>
                {[
                  { icon: "alternate_email", label: "Email", value: currentUser?.email },
                  { icon: "badge", label: "NIM", value: currentUser?.nim },
                  { icon: "school", label: "Program Studi", value: currentUser?.prodi },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{f.icon}</span>
                    <div>
                      <p className="text-xs text-on-surface-variant">{f.label}</p>
                      <p className="text-sm font-semibold text-on-surface">{f.value || "-"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message */}
              {saveMessage && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${saveMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <span className="material-symbols-outlined text-[18px]">{saveMessage.type === "success" ? "check_circle" : "error"}</span>
                  {saveMessage.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-surface-container-high text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-save-profil"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Keamanan Akun (Ubah Password) ── */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <div
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative border border-surface-container-high"
            style={{ maxHeight: "90vh", overflowY: "auto", animation: "modalIn 0.2s ease" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Ubah Password</h2>
                  <p className="text-xs text-on-surface-variant">Jaga keamanan akun portal SEMADIKSI Anda</p>
                </div>
              </div>
              <button
                id="btn-close-password-modal"
                onClick={() => setShowPasswordModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Password Saat Ini */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    id="input-current-password"
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-surface-container-high bg-surface-container-low text-on-surface font-medium text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showCurrentPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    id="input-new-password"
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-surface-container-high bg-surface-container-low text-on-surface font-medium text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showNewPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    id="input-confirm-password"
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    minLength={6}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-surface-container-high bg-surface-container-low text-on-surface font-medium text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Feedback Message */}
              {passwordMessage && (
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {passwordMessage.type === "success" ? "check_circle" : "error"}
                  </span>
                  {passwordMessage.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-surface-container-high text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-change-password"
                  disabled={isChangingPass}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md text-sm"
                >
                  {isChangingPass ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">key</span>
                      Simpan Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Pratinjau & Unduh Transkrip Nilai KIP-K ── */}
      {showTranscriptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTranscriptModal(false); }}
        >
          <div
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-8 relative border border-surface-container-high flex flex-col"
            style={{ maxHeight: "92vh", overflowY: "auto", animation: "modalIn 0.2s ease" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">Transkrip Kemajuan Nilai KIP-K</h2>
                  <p className="text-xs text-on-surface-variant">Hasil evaluasi berkala akademik &amp; keaktifan penerima beasiswa</p>
                </div>
              </div>
              <button
                id="btn-close-transcript-modal"
                onClick={() => setShowTranscriptModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Document Preview Sheet */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 md:p-8 shadow-inner mb-6 space-y-6">
              {/* Kop */}
              <div className="text-center border-b-2 border-on-surface/80 pb-4">
                <p className="text-xs font-bold tracking-widest text-on-surface uppercase">Universitas Nahdlatul Ulama Surabaya</p>
                <h3 className="text-base md:text-lg font-extrabold text-primary uppercase mt-0.5">Forum Mahasiswa Bidikmisi &amp; KIP Kuliah (SEMADIKSI)</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Jl. Raya Jemursari No. 57 Surabaya • Surel: semadiksi@unusa.ac.id • Laman: unusa.ac.id</p>
              </div>

              {/* Title */}
              <div className="text-center">
                <h4 className="font-extrabold text-sm md:text-base text-on-surface underline uppercase">Transkrip Kemajuan Akademik &amp; Keaktifan KIP-K</h4>
                <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Nomor: UNUSA/SEMADIKSI/KIP-K/EVAL-2024/09</p>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface-container-low p-4 rounded-xl">
                <div>
                  <p className="text-on-surface-variant">Nama Mahasiswa:</p>
                  <p className="font-bold text-on-surface text-sm">{displayName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Nomor Induk Mahasiswa (NIM):</p>
                  <p className="font-bold text-on-surface font-mono">{displayNim}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Program Studi:</p>
                  <p className="font-bold text-on-surface">{displayProdi}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Status Beasiswa:</p>
                  <p className="font-bold text-primary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Penerima Beasiswa KIP-K Aktif ({displayAngkatan})
                  </p>
                </div>
              </div>

              {/* Table Semester Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/10 text-primary border-b border-primary/20">
                      <th className="py-2.5 px-3 font-bold">Semester</th>
                      <th className="py-2.5 px-3 font-bold text-center">Beban SKS</th>
                      <th className="py-2.5 px-3 font-bold text-center">IPS</th>
                      <th className="py-2.5 px-3 font-bold text-center">IPK</th>
                      <th className="py-2.5 px-3 font-bold text-center">Keaktifan</th>
                      <th className="py-2.5 px-3 font-bold">Status Evaluasi Beasiswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-medium">
                    <tr><td className="py-2.5 px-3 font-semibold">Semester 1</td><td className="py-2.5 px-3 text-center">20 SKS</td><td className="py-2.5 px-3 text-center">3.75</td><td className="py-2.5 px-3 text-center font-bold">3.75</td><td className="py-2.5 px-3 text-center text-amber-600 font-bold">12.5%</td><td className="py-2.5 px-3 text-primary font-semibold">✓ Memenuhi Standar</td></tr>
                    <tr><td className="py-2.5 px-3 font-semibold">Semester 2</td><td className="py-2.5 px-3 text-center">22 SKS</td><td className="py-2.5 px-3 text-center">3.85</td><td className="py-2.5 px-3 text-center font-bold">3.80</td><td className="py-2.5 px-3 text-center text-amber-600 font-bold">12.5%</td><td className="py-2.5 px-3 text-primary font-semibold">✓ Memenuhi Standar</td></tr>
                    <tr><td className="py-2.5 px-3 font-semibold">Semester 3</td><td className="py-2.5 px-3 text-center">21 SKS</td><td className="py-2.5 px-3 text-center">3.90</td><td className="py-2.5 px-3 text-center font-bold">3.84</td><td className="py-2.5 px-3 text-center text-amber-600 font-bold">12.0%</td><td className="py-2.5 px-3 text-primary font-semibold">✓ Memenuhi Standar</td></tr>
                    <tr><td className="py-2.5 px-3 font-semibold">Semester 4</td><td className="py-2.5 px-3 text-center">20 SKS</td><td className="py-2.5 px-3 text-center">3.75</td><td className="py-2.5 px-3 text-center font-bold">3.82</td><td className="py-2.5 px-3 text-center text-amber-600 font-bold">12.5%</td><td className="py-2.5 px-3 text-primary font-semibold">✓ Memenuhi Standar</td></tr>
                    <tr><td className="py-2.5 px-3 font-semibold">Semester 5</td><td className="py-2.5 px-3 text-center">19 SKS</td><td className="py-2.5 px-3 text-center">3.95</td><td className="py-2.5 px-3 text-center font-bold">3.85</td><td className="py-2.5 px-3 text-center text-amber-600 font-bold">12.5%</td><td className="py-2.5 px-3 text-primary font-semibold">✓ Memenuhi Standar</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Evaluation */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs">
                <p className="font-extrabold text-primary mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  HASIL EVALUASI KOMPREHENSIF KIP KULIAH:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 font-semibold text-on-surface">
                  <p>Total SKS: <span className="text-primary font-bold">102 SKS</span></p>
                  <p>IPK Kumulatif: <span className="text-primary font-bold">3.85 / 4.00</span></p>
                  <p>Akumulasi Keaktifan: <span className="text-amber-600 font-bold">62.0%</span></p>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Kesimpulan: Dinyatakan <strong className="text-primary">MEMENUHI SYARAT &amp; LAYAK</strong> melanjutkan pencairan dana beasiswa KIP Kuliah untuk semester berikutnya (IPK memenuhi standar minimal &ge; 3.00).
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="py-3 px-6 rounded-2xl border-2 border-surface-container-high text-on-surface font-bold hover:bg-surface-container-low transition-colors cursor-pointer text-sm"
              >
                Tutup
              </button>
              <button
                id="btn-print-transcript"
                onClick={handlePrintTranscriptWindow}
                className="flex-1 py-3 px-6 rounded-2xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Cetak / Unduh PDF Transkrip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail Acara Riwayat Kegiatan ── */}
      {showEventModal && selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEventModal(false); }}
        >
          <div
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-xl p-6 md:p-8 relative border border-surface-container-high"
            style={{ maxHeight: "90vh", overflowY: "auto", animation: "modalIn 0.2s ease" }}
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {selectedEvent.category}
                </span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                  selectedEvent.status === "Selesai"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedEvent.status === "Selesai" ? "Selesai Diikuti" : "Terdaftar Aktif"}
                </span>
              </div>
              <button
                id="btn-close-event-modal"
                onClick={() => setShowEventModal(false)}
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Event Photo Banner */}
            <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-md mb-5 relative">
              <img
                src={selectedEvent.img}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Dokumentasi Acara</span>
                  <p className="text-sm font-semibold">{selectedEvent.title}</p>
                </div>
              </div>
            </div>

            {/* Event Title */}
            <h3 className="text-xl font-extrabold text-on-surface mb-3 leading-snug">
              {selectedEvent.title}
            </h3>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                <div>
                  <p className="text-[11px] text-on-surface-variant">Tanggal &amp; Waktu</p>
                  <p className="text-xs font-bold text-on-surface">{selectedEvent.date} • {selectedEvent.time}</p>
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                <div>
                  <p className="text-[11px] text-on-surface-variant">Tempat / Lokasi</p>
                  <p className="text-xs font-bold text-on-surface line-clamp-1">{selectedEvent.location}</p>
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3 sm:col-span-2">
                <span className="material-symbols-outlined text-primary text-xl">record_voice_over</span>
                <div>
                  <p className="text-[11px] text-on-surface-variant">Narasumber / Penyelenggara</p>
                  <p className="text-xs font-bold text-on-surface">{selectedEvent.speaker}</p>
                </div>
              </div>
            </div>

            {/* Narrative / Description */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Deskripsi &amp; Pelaksanaan Kegiatan
              </h4>
              <p className="text-sm text-on-surface leading-relaxed bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high">
                {selectedEvent.desc}
              </p>
            </div>

            {/* Achievements / Points Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-xl">stars</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">Poin Keaktifan Beasiswa</p>
                  <p className="text-sm font-extrabold text-on-surface">{selectedEvent.xp} • Presensi: {selectedEvent.attendance}</p>
                </div>
              </div>
              {selectedEvent.status === "Selesai" ? (
                <button
                  onClick={() => alert(`Mengunduh e-sertifikat resmi kegiatan: ${selectedEvent.title}`)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Unduh Sertifikat
                </button>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  {selectedEvent.certificate}
                </span>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-1">
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm transition-colors cursor-pointer"
              >
                Tutup Informasi Acara
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
