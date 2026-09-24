export interface BeritaAcaraItem {
  id: string;
  title: string;
  category: "Seminar" | "Workshop" | "Rapat Kerja" | "Pelatihan" | "Sosialisasi KIP-K" | "Pengabdian Masyarakat" | "Lomba" | "Lainnya";
  status: "Selesai" | "Akan Datang";
  date: string;
  time?: string;
  location: string;
  organizer: string;
  attendeeCount?: number;
  summary: string;
  content: string;
  bannerImg: string;
  attachmentFileName?: string;
  attachmentFileSize?: string;
  externalLink?: string;
  createdAt: string;
  author: string;
}

export interface BeasiswaItem {
  id: string;
  title: string;
  provider: string;
  category: "KIP Kuliah" | "Prestasi Akademik" | "Prestasi Non-Akademik" | "Bantuan UKT / Biaya Hidup" | "Beasiswa Swasta / BUMN" | "Lainnya";
  status: "Dibuka" | "Segera Dibuka" | "Ditutup";
  openDate: string;
  closeDate: string;
  coverage: string;
  requirements: string[];
  selectionStages?: string;
  description: string;
  bannerImg: string;
  guideFileName?: string;
  guideFileSize?: string;
  applyUrl?: string;
  createdAt: string;
}

export const INITIAL_BERITA_ACARA: BeritaAcaraItem[] = [
  {
    id: "ba-001",
    title: "Berita Acara Pelantikan Pengurus & Rapat Kerja SEMADIKSI UNUSA Periode 2026/2027",
    category: "Rapat Kerja",
    status: "Selesai",
    date: "10 Agustus 2026",
    time: "08:30 - 15:30 WIB",
    location: "Auditorium Tower Lantai 9 Kampus B UNUSA Jemursari",
    organizer: "Biro Kemahasiswaan UNUSA & Pengurus SEMADIKSI",
    attendeeCount: 145,
    summary: "Pelantikan 45 jajaran pengurus baru SEMADIKSI UNUSA serta perumusan 18 program kerja unggulan penguatan kapasitas mahasiswa KIP-K.",
    content: `Pada hari Senin, 10 Agustus 2026, telah dilaksanakan Pelantikan Pengurus dan Rapat Kerja SEMADIKSI UNUSA Periode 2026/2027 yang dihadiri oleh Wakil Rektor I Bidang Akademik & Kemahasiswaan UNUSA, Pembina SEMADIKSI, dan 145 perwakilan mahasiswa KIP-K.

Agenda pembahasan meliputi:
1. Pembacaan SK Penetapan Pengurus Nomor 142/UNUSA/KM/VIII/2026.
2. Pengambilan Sumpah & Janji Jabatan Pengurus oleh Wakil Rektor I.
3. Pemaparan 4 Pilar Program Kerja Utama: Akademik & Riset, Kewirausahaan, Pengabdian Masyarakat, dan Advokasi Prestasi Mahasiswa KIP-K.
4. Penetapan target publikasi laporan portofolio berkas semesteran tepat waktu sebesar 100%.

Kegiatan berlangsung secara khidmat, tertib, dan menghasilkan dokumen berita acara serta kesepakatan notulensi resmi.`,
    bannerImg: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    attachmentFileName: "Berita_Acara_Pelantikan_Raker_SEMADIKSI_2026.pdf",
    attachmentFileSize: "2.4 MB",
    externalLink: "https://unusa.ac.id/berita-acara-pelantikan-semadiksi-2026",
    createdAt: "2026-08-10 16:30",
    author: "Sekretariat SEMADIKSI"
  },
  {
    id: "ba-002",
    title: "Berita Acara Sosialisasi Monitoring & Evaluasi Prestasi Mahasiswa KIP-K Semester Genap 2026",
    category: "Sosialisasi KIP-K",
    status: "Selesai",
    date: "28 Juli 2026",
    time: "09:00 - 12:00 WIB",
    location: "Hall Utama Kafe Fastron Kampus B UNUSA & Hybrid Zoom",
    organizer: "Pengelola Beasiswa KIP-K UNUSA",
    attendeeCount: 380,
    summary: "Laporan evaluasi capaian IPK minimal 3.25, keaktifan organisasi, dan verifikasi berkas administrasi penerima beasiswa KIP Kuliah.",
    content: `Telah dilaksanakan pertemuan Monitoring dan Evaluasi (Monev) Semester Genap TA 2025/2026 bagi seluruh mahasiswa penerima KIP-K UNUSA dari angkatan 2023, 2024, dan 2025.

Hasil evaluasi Monev:
1. 96.8% mahasiswa KIP-K berhasil mempertahankan IPK di atas 3.30.
2. Ditegaskan kewajiban unggah 4 berkas wajib: Keaktifan Ormawa, Webinar Soft Skill, Sertifikat Lomba, dan KHS semester terbaru pada Portal SEMADIKSI.
3. Pemberian sesi bimbingan khusus bagi mahasiswa yang membutuhkan pendampingan akademik.`,
    bannerImg: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    attachmentFileName: "BA_Monev_KIPK_Semester_Genap_2026.pdf",
    attachmentFileSize: "1.8 MB",
    externalLink: "https://unusa.ac.id/kemahasiswaan/monev-kipk-2026",
    createdAt: "2026-07-28 14:00",
    author: "Admin Kemahasiswaan UNUSA"
  },
  {
    id: "ba-003",
    title: "Dokumentasi & Berita Acara Bootcamp Pelatihan Public Speaking & Personal Branding Mahasiswa KIP-K",
    category: "Pelatihan",
    status: "Selesai",
    date: "15 Juli 2026",
    time: "08:00 - 16:00 WIB",
    location: "Ruang Teater FKK UNUSA Lantai 5",
    organizer: "Divisi Pengembangan SDM SEMADIKSI",
    attendeeCount: 110,
    summary: "Pelatihan intensif teknik public speaking profesional, pembuatan portofolio LinkedIn, dan persiapan wawancara karir industri.",
    content: `Bootcamp Public Speaking & Personal Branding menghadirkan narasumber praktisi Corporate Trainer Nasional dan Alumni Berprestasi UNUSA.

Materi & Output Kegiatan:
1. Teknik vokal, struktur pesan elevator pitch, dan penguasaan panggung.
2. Praktik langsung presentasi ide inovasi di hadapan juri dengan rekaman video feedback.
3. Seluruh peserta mendapatkan sertifikat kompetensi berbobot SKP Kemahasiswaan.`,
    bannerImg: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    attachmentFileName: "Berita_Acara_Bootcamp_Public_Speaking_2026.pdf",
    attachmentFileSize: "3.1 MB",
    externalLink: "https://semadiksi.unusa.ac.id/bootcamp-public-speaking-2026",
    createdAt: "2026-07-15 17:00",
    author: "Divisi PSDM SEMADIKSI"
  },
  {
    id: "ba-004",
    title: "Agenda Kegiatan Semadiksi Fest 2026: Lomba Inovasi Nasional & Seminar Kewirausahaan Mahasiswa",
    category: "Lomba",
    status: "Akan Datang",
    date: "25 September 2026",
    time: "08:00 - 17:00 WIB",
    location: "Auditorium Lantai 9 Tower UNUSA & Gedung Serbaguna",
    organizer: "Panitia Semadiksi Fest 2026",
    attendeeCount: 300,
    summary: "Kompetisi karya inovasi sains terapan dan bisnis plan tingkat nasional serta seminar wirausaha teknologi muda.",
    content: `Semadiksi Fest 2026 merupakan festival tahunan terbesar yang menyatukan mahasiswa berprestasi KIP-K dari berbagai perguruan tinggi di Indonesia.

Rangkaian acara:
- Lomba Business Plan & Inovasi Digital Mahasiswa (Total Hadiah Rp 25.000.000).
- Seminar Nasional 'Gen-Z Inovatif Mandiri Berdaya Saing Global'.
- Expo Produk Wirausaha Mahasiswa KIP-K.
- Pendaftaran karya dibuka mulai 1 Agustus s.d. 15 September 2026.`,
    bannerImg: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    attachmentFileName: "Panduan_Semadiksi_Fest_2026.pdf",
    attachmentFileSize: "4.2 MB",
    externalLink: "https://semadiksi.unusa.ac.id/fest-2026",
    createdAt: "2026-08-01 10:00",
    author: "Ketua Panitia Semadiksi Fest"
  },
  {
    id: "ba-005",
    title: "Sosialisasi & Workshop Pengisian Laporan Kinerja Portofolio KIP-K Semester Ganjil 2026/2027",
    category: "Workshop",
    status: "Akan Datang",
    date: "12 Oktober 2026",
    time: "13:00 - 15:30 WIB",
    location: "Online Zoom Meeting & Live YouTube SEMADIKSI TV",
    organizer: "Biro Kemahasiswaan & SEMADIKSI UNUSA",
    attendeeCount: 400,
    summary: "Panduan teknis pengunggahan berkas ormawa, sertifikat webinar soft skill, transkrip nilai, dan validasi berkas pada portal.",
    content: `Workshop ini ditujukan untuk seluruh mahasiswa penerima KIP-K baru dan lama guna memastikan kelengkapan dokumen administrasi tepat waktu sesuai pedoman Kemendikbudristek RI.`,
    bannerImg: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    attachmentFileName: "Panduan_Laporan_Kinerja_KIPK_2026.pdf",
    attachmentFileSize: "1.5 MB",
    externalLink: "https://unusa.ac.id/workshop-portofolio-kipk-2026",
    createdAt: "2026-08-05 09:00",
    author: "Admin Kemahasiswaan UNUSA"
  }
];

export const INITIAL_INFO_BEASISWA: BeasiswaItem[] = [
  {
    id: "bea-001",
    title: "Program Beasiswa KIP Kuliah Merdeka Kemendikbudristek 2026",
    provider: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI & UNUSA",
    category: "KIP Kuliah",
    status: "Dibuka",
    openDate: "1 Juni 2026",
    closeDate: "30 September 2026",
    coverage: "Bebas Biaya Kuliah (UKT 100%) Penuh 8 Semester + Biaya Hidup Rp 1.400.000 / Bulan",
    requirements: [
      "Mahasiswa aktif S1/D4/D3 semester berjalan di UNUSA.",
      "Memiliki Kartu Indonesia Pintar (KIP) atau terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS) / PPKE Kemensos.",
      "Surat Keterangan Tidak Mampu (SKTM) resmi dari Kelurahan/Desa bagi yang belum terdaftar DTKS.",
      "Memiliki potensi akademik baik dengan IPK minimal 3.00.",
      "Tidak sedang menerima beasiswa dari instansi atau lembaga lain (Double Funding)."
    ],
    selectionStages: "1. Pendaftaran Berkas Online -> 2. Verifikasi Data Faktual & Slip Gaji Orang Tua -> 3. Visitasi / Wawancara Khusus -> 4. Pengumuman Kelulusan SK Rektor.",
    description: "Program bantuan biaya pendidikan tinggi dari pemerintah bagi lulusan SMA/SMK/MA sederajat yang memiliki potensi akademik baik tetapi memiliki keterbatasan ekonomi untuk melanjutkan studi di UNUSA.",
    bannerImg: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    guideFileName: "Buku_Panduan_KIP_Kuliah_Merdeka_2026.pdf",
    guideFileSize: "3.5 MB",
    applyUrl: "https://kip-kuliah.kemdikbud.go.id/",
    createdAt: "2026-06-01 08:00"
  },
  {
    id: "bea-002",
    title: "Beasiswa Prestasi Unggulan Rektor UNUSA 2026 (Akademik & Minat Bakat)",
    provider: "Universitas Nahdlatul Ulama Surabaya (UNUSA)",
    category: "Prestasi Akademik",
    status: "Dibuka",
    openDate: "15 Juli 2026",
    closeDate: "15 Oktober 2026",
    coverage: "Potongan Biaya UKT 50% s.d. 100% Selama 1 Tahun Akademik + Program Mentoring Riset",
    requirements: [
      "Mahasiswa aktif UNUSA minimal semester 2.",
      "Meraih juara 1, 2, atau 3 dalam kompetisi tingkat regional/nasional/internasional dalam 1 tahun terakhir.",
      "IPK semester terakhir minimal 3.60 untuk kategori akademik.",
      "Melampirkan sertifikat kejuaraan resmi dan surat rekomendasi Dekan Fakultas."
    ],
    selectionStages: "1. Unggah Sertifikat & Transkrip -> 2. Verifikasi Komisi Beasiswa -> 3. Sidang Pleno Penetapan.",
    description: "Apresiasi universitas bagi para mahasiswa berprestasi yang berhasil mengharumkan nama almamater UNUSA di tingkat nasional dan internasional.",
    bannerImg: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    guideFileName: "Juknis_Beasiswa_Prestasi_Rektor_UNUSA_2026.pdf",
    guideFileSize: "2.1 MB",
    applyUrl: "https://unusa.ac.id/beasiswa-prestasi-2026",
    createdAt: "2026-07-15 09:00"
  },
  {
    id: "bea-003",
    title: "BSI Scholarship Prestasi & Inspirasi 2026",
    provider: "PT Bank Syariah Indonesia Tbk & BSI Maslahat",
    category: "Beasiswa Swasta / BUMN",
    status: "Dibuka",
    openDate: "1 Agustus 2026",
    closeDate: "20 September 2026",
    coverage: "Bantuan UKT Rp 3.000.000/semester + Uang Saku Rp 700.000/bln + Pembinaan Leadership Perbankan Syariah",
    requirements: [
      "Mahasiswa S1 semester 3 atau semester 5.",
      "IPK minimal 3.25 (kategori Prestasi) atau IPK minimal 3.00 (kategori Inspirasi/Afirmasi).",
      "Memiliki kepedulian sosial tinggi dan aktif dalam organisasi kemahasiswaan.",
      "Bersedia mengikuti seluruh rangkaian program pembinaan kepemimpinan BSI."
    ],
    selectionStages: "1. Pendaftaran Online -> 2. Tes Pengetahuan Dasar & Psikotes -> 3. Wawancara Panel -> 4. Penetapan Awardee.",
    description: "Program beasiswa dan pembinaan karakter insan teladan syariah untuk mencetak pemimpin masa depan perbankan dan industri halal nasional.",
    bannerImg: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    guideFileName: "Guidebook_BSI_Scholarship_2026.pdf",
    guideFileSize: "4.8 MB",
    applyUrl: "https://bsimaslahat.org/program/bsi-scholarship/",
    createdAt: "2026-08-01 10:00"
  },
  {
    id: "bea-004",
    title: "Djarum Beasiswa Plus Angkatan 42",
    provider: "Djarum Foundation",
    category: "Beasiswa Swasta / BUMN",
    status: "Segera Dibuka",
    openDate: "1 November 2026",
    closeDate: "30 Desember 2026",
    coverage: "Dana Beasiswa Rp 1.000.000/bulan selama 1 tahun + Pelatihan Soft Skills Nasional",
    requirements: [
      "Mahasiswa S1/D4 semester 4 pada saat pendaftaran.",
      "IPK semester 3 minimal 3.20.",
      "Aktif berorganisasi baik di dalam maupun luar kampus.",
      "Tidak sedang menerima beasiswa dari institusi lain."
    ],
    selectionStages: "1. Pendaftaran Berkas -> 2. Tes Tertulis Online -> 3. Wawancara Komprehensif -> 4. Pengumuman Beswan Djarum.",
    description: "Program beasiswa prestisius dari Djarum Foundation yang fokus melatih Character Building, Leadership Development, Competition Challenges, dan International Exposure.",
    bannerImg: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    guideFileName: "Info_Pendaftaran_Beswan_Djarum_42.pdf",
    guideFileSize: "1.9 MB",
    applyUrl: "https://djarumbeasiswaplus.org/",
    createdAt: "2026-08-05 11:00"
  },
  {
    id: "bea-005",
    title: "Beasiswa BAZNAS Cendekia Mahasiswa Berprestasi 2026",
    provider: "Badan Amil Zakat Nasional (BAZNAS) Republik Indonesia",
    category: "Bantuan UKT / Biaya Hidup",
    status: "Dibuka",
    openDate: "10 Agustus 2026",
    closeDate: "25 Oktober 2026",
    coverage: "Bantuan Subsidi Biaya Kuliah Rp 4.000.000 / Semester + Pembinaan Mentor BAZNAS",
    requirements: [
      "Warga Negara Indonesia, beragama Islam.",
      "Mahasiswa aktif S1 tingkat 1 s.d. tingkat 4.",
      "Memenuhi kriteria Asnaf Zakat (Fakir, Miskin, Fisabilillah).",
      "Melampirkan Surat Rekomendasi Tokoh Masyarakat atau Pengurus Ormawa/Kampus."
    ],
    selectionStages: "1. Verifikasi Dokumen Kelayakan -> 2. Uji Baca Al-Qur'an & Wawancara -> 3. Penetapan SK Awardee BAZNAS.",
    description: "Bantuan pendidikan dari dana zakat nasional untuk memastikan mahasiswa berpotensi tidak putus kuliah dan mampu menyelesaikan studi tepat waktu.",
    bannerImg: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    guideFileName: "Pedoman_Beasiswa_Cendekia_BAZNAS_2026.pdf",
    guideFileSize: "2.7 MB",
    applyUrl: "https://beasiswa.baznas.go.id/",
    createdAt: "2026-08-10 13:00"
  }
];

export interface AttendanceRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  activityCategory?: string;
  activityDate?: string;
  studentName: string;
  studentNim: string;
  university: string;
  studentEmail?: string;
  studentPhone?: string;
  proofImageUrl: string;
  proofFileName?: string;
  timestamp: string;
  status: "Hadir" | "Menunggu Verifikasi" | "Ditolak";
  notes?: string;
  deviceInfo?: string;
  locationName?: string;
}

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [
  {
    id: "att-001",
    activityId: "act-b",
    activityTitle: "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
    activityCategory: "Seminar",
    activityDate: "16 November 2026",
    studentName: "Ahmad Fauzan",
    studentNim: "2240021001",
    university: "Universitas Nahdlatul Ulama Surabaya",
    studentEmail: "ahmad.fauzan@unusa.ac.id",
    studentPhone: "081234567890",
    proofImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    proofFileName: "Selfie_Kehadiran_LKMB_AhmadFauzan.jpg",
    timestamp: "16 Nov 2026, 08:45 WIB",
    status: "Hadir",
    notes: "Kehadiran terverifikasi di Auditorium Tower UNUSA Lantai 9.",
    deviceInfo: "Mobile Web (Chrome Android)",
    locationName: "Auditorium Kampus B UNUSA (GPS Valid)"
  },
  {
    id: "att-002",
    activityId: "act-b",
    activityTitle: "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
    activityCategory: "Seminar",
    activityDate: "16 November 2026",
    studentName: "Budi Santoso",
    studentNim: "2240021045",
    university: "Universitas Nahdlatul Ulama Surabaya",
    studentEmail: "budi.santoso@unusa.ac.id",
    studentPhone: "081987654321",
    proofImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    proofFileName: "Bukti_Registrasi_BudiSantoso.jpg",
    timestamp: "16 Nov 2026, 08:52 WIB",
    status: "Hadir",
    notes: "Bukti absensi valid.",
    deviceInfo: "Mobile Web (Safari iOS)",
    locationName: "Kampus B UNUSA Surabaya"
  },
  {
    id: "att-003",
    activityId: "act-a",
    activityTitle: "SEMADIKSI Peduli: Bakti Sosial Akhir Tahun",
    activityCategory: "Sosial",
    activityDate: "20 Desember 2026",
    studentName: "Clara Citra",
    studentNim: "2240021088",
    university: "Universitas Diponegoro",
    studentEmail: "clara.citra@student.undip.ac.id",
    studentPhone: "082134567899",
    proofImageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80",
    proofFileName: "Dokumentasi_Baksos_Clara.jpg",
    timestamp: "20 Des 2026, 09:10 WIB",
    status: "Menunggu Verifikasi",
    notes: "Menunggu pencocokan daftar hadir panitia.",
    deviceInfo: "Desktop Web (Windows 11)",
    locationName: "Panti Asuhan Al-Ikhlas Jemursari"
  },
  {
    id: "att-004",
    activityId: "act-d",
    activityTitle: "Lomba Poster Digital SEMADIKSI 2025",
    activityCategory: "Kompetisi",
    activityDate: "15 Februari 2026",
    studentName: "Evi Latifah",
    studentNim: "2240021033",
    university: "Universitas Nahdlatul Ulama Surabaya",
    studentEmail: "evi.latifah@unusa.ac.id",
    studentPhone: "085712345678",
    proofImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    proofFileName: "Screenshot_Zoom_EviLatifah.png",
    timestamp: "15 Feb 2026, 09:05 WIB",
    status: "Hadir",
    notes: "Terverifikasi hadir di Zoom Room 1.",
    deviceInfo: "Mobile Web (Chrome)",
    locationName: "Daring (Online Meeting)"
  },
  {
    id: "att-005",
    activityId: "ba-001",
    activityTitle: "Berita Acara Pelantikan Pengurus & Rapat Kerja SEMADIKSI UNUSA Periode 2026/2027",
    activityCategory: "Rapat Kerja",
    activityDate: "10 Agustus 2026",
    studentName: "Dedi Kurnia",
    studentNim: "2240021072",
    university: "UIN Walisongo",
    studentEmail: "dedi.kurnia@walisongo.ac.id",
    studentPhone: "087812349988",
    proofImageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    proofFileName: "Presensi_Raker_Dedi.jpg",
    timestamp: "10 Agu 2026, 08:30 WIB",
    status: "Menunggu Verifikasi",
    notes: "Menunggu approval ketua divisi.",
    deviceInfo: "Mobile Web (Android)",
    locationName: "Auditorium Tower UNUSA"
  }
];

export interface PencairanKipkSubmission {
  id: string;
  timestamp: string;
  emailAkademik: string;
  namaLengkap: string;
  nim: string;
  prodi: string;
  tahunMasuk: string;
  suratRekomendasiProdi: string;
  suratPernyataanMahasiswa: string;
  jenisBeasiswa: "KIPK" | "Beasiswa Prestasi" | "Beasiswa Kemitraan" | "Lainnya";
  jalurPenerimaKip: "REGULER" | "SKRIPSI" | "INKLUSI" | "ASPIRASI";
  namaFraksiPengusul?: string;
  uploadRaporPengusulPartai?: string;
  keterangan: "LENGKAP" | "BELUM LENGKAP" | "Menunggu Verifikasi";
}

export const INITIAL_PENCAIRAN_KIPK: PencairanKipkSubmission[] = [
  {
    id: "pencairan-001",
    timestamp: "1/15/2026 9:40:31",
    emailAkademik: "3230023034@student.unusa.ac.id",
    namaLengkap: "FAIS MAULANA",
    nim: "3230023034",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    suratRekomendasiProdi: "https://drive.google.com/open?id=1-1_0M4M-hRhpJ23bA72NxaBPU",
    suratPernyataanMahasiswa: "https://drive.google.com/open?id=1-1kQYTV1Ok-MuVMqENsqJgQdT1v",
    jenisBeasiswa: "KIPK",
    jalurPenerimaKip: "REGULER",
    namaFraksiPengusul: "-",
    uploadRaporPengusulPartai: "-",
    keterangan: "LENGKAP"
  },
  {
    id: "pencairan-002",
    timestamp: "1/15/2026 9:42:06",
    emailAkademik: "3230023032@student.unusa.ac.id",
    namaLengkap: "VINA NURMALA SARI",
    nim: "3230023032",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    suratRekomendasiProdi: "https://drive.google.com/file/d/1TsX4AaAZ-V0Z5ZdO1C7kTB5Cw4xwtmgo/view",
    suratPernyataanMahasiswa: "https://drive.google.com/open?id=1N7Z3L0CRawLvSaPxPbcvOXk0UV",
    jenisBeasiswa: "KIPK",
    jalurPenerimaKip: "REGULER",
    namaFraksiPengusul: "-",
    uploadRaporPengusulPartai: "-",
    keterangan: "LENGKAP"
  },
  {
    id: "pencairan-003",
    timestamp: "1/15/2026 10:15:36",
    emailAkademik: "3230023037@student.unusa.ac.id",
    namaLengkap: "Andia Dini Carmila",
    nim: "3230023037",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    suratRekomendasiProdi: "https://drive.google.com/file/d/1BfPIUHXX9ZT_LdWU4A682LCs3cxyHwtp/view",
    suratPernyataanMahasiswa: "https://drive.google.com/open?id=1SNN3kP4KMNR_U3XPH1ZRMNZJU",
    jenisBeasiswa: "KIPK",
    jalurPenerimaKip: "REGULER",
    namaFraksiPengusul: "-",
    uploadRaporPengusulPartai: "-",
    keterangan: "LENGKAP"
  }
];

export interface InfoKipItem {
  id: string;
  title: string;
  category: "Pengumuman" | "Hak & Kewajiban" | "Alur Pencairan" | "Berkas & Unduhan" | "FAQ & Regulasi";
  content: string;
  dateUploaded: string;
  author: string;
  attachmentFileName?: string;
  attachmentUrl?: string;
  priority?: "Tinggi" | "Normal";
}

export const INITIAL_INFO_KIP_ITEMS: InfoKipItem[] = [
  {
    id: "info-kip-001",
    title: "Pengumuman Alur & Syarat Pencairan Beasiswa KIP Kuliah Semester Genap TA 2025/2026",
    category: "Pengumuman",
    content: "Berdasarkan Edaran Biro Kemahasiswaan UNUSA Nomor 088/UNUSA/KM/II/2026, seluruh mahasiswa penerima KIP Kuliah wajib melengkapi berkas pengajuan pencairan, KHS semester terakhir, dan Surat Rekomendasi Prodi sebelum tanggal 28 Februari 2026.",
    dateUploaded: "2026-02-10 10:00:00",
    author: "Biro Kemahasiswaan & Admin KIP UNUSA",
    attachmentFileName: "Surat_Edaran_Pencairan_KIPK_Genap_2026.pdf",
    attachmentUrl: "https://unusa.ac.id/edaran-kipk-2026.pdf",
    priority: "Tinggi"
  },
  {
    id: "info-kip-002",
    title: "Tata Cara Pembukaan & Aktivasi Rekening BTN / Bank Mandiri Penerima KIP-K Baru",
    category: "Alur Pencairan",
    content: "Bagi mahasiswa penerima KIP-K angkatan terbaru yang membutuhkan pembukaan/pembaharuan buku tabungan KIP Kuliah, pengurusan surat pengantar dapat diunduh pada portal atau diajukan ke loket advokasi SEMADIKSI Tower Lt 2.",
    dateUploaded: "2026-01-15 14:30:00",
    author: "Divisi Advokasi SEMADIKSI",
    attachmentFileName: "Panduan_Aktivasi_Rekening_KIPK.pdf",
    attachmentUrl: "#",
    priority: "Normal"
  },
  {
    id: "info-kip-003",
    title: "Ketentuan IPK Minimal 3.00 & Konsekuensi Penurunan Prestasi Akademik",
    category: "Hak & Kewajiban",
    content: "Mahasiswa penerima KIP-K UNUSA yang memperoleh IPK di bawah 3.00 akan dipanggil oleh tim evaluasi akademik untuk mendapatkan pembimbingan khusus. Penurunan IPK berturut-turut dalam 2 semester dapat mengakibatkan penangguhan Beasiswa KIP Kuliah.",
    dateUploaded: "2026-01-05 09:00:00",
    author: "Tim Evaluasi KIP UNUSA",
    priority: "Tinggi"
  }
];

export interface MonevAkademikSubmission {
  id: string;
  timestamp: string;
  emailAkademik: string;
  namaLengkap: string;
  nim: string;
  prodi: string;
  tahunMasuk: string;
  semesterSekarang: string;
  
  // Data Monev Akademik
  ipsTerakhir: number;
  ipkKumulatif: number;
  khsTranskripUrl: string;
  statusPerkuliahan: "Aktif Perkuliahan" | "Sedang Menyusun Skripsi / TA" | "Sedang Cuti / Kendala Akademik";
  kendalaAkademikText?: string;
  capaianPrestasiSoftskill?: string;

  // Data Kondisi Terkini Ekonomi & Ortu / Wali (Sesuai Spreadsheet & Lampiran User)
  berkasPenunjangEkonomi: string;
  uploadBerkasPenunjangEkonomiUrl: string;
  slipGajiOrtuUrl: string;
  pekerjaanOrtu: string;
  totalPenghasilanOrtu: string;
  jumlahTanggunganOrtu: number | string;
  kondisiTempatTinggal?: string;
  catatanKondisiTerkini?: string;

  // Status Verifikasi Admin
  status: "Disetujui" | "Perlu Perbaikan" | "Menunggu Review";
  catatanAdmin?: string;
}

export const INITIAL_MONEV_AKADEMIK_SUBMISSIONS: MonevAkademikSubmission[] = [
  {
    id: "monev-001",
    timestamp: "1/16/2026 14:20:15",
    emailAkademik: "3230023034@student.unusa.ac.id",
    namaLengkap: "FAIS MAULANA",
    nim: "3230023034",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    semesterSekarang: "Semester 6",
    ipsTerakhir: 3.75,
    ipkKumulatif: 3.68,
    khsTranskripUrl: "https://drive.google.com/open?id=1KHS_FaisMaulana_Sem5",
    statusPerkuliahan: "Aktif Perkuliahan",
    kendalaAkademikText: "Tidak ada kendala, perkuliahan berjalan lancar.",
    capaianPrestasiSoftskill: "Juara 2 Lomba Business Plan Tingkat Jawa Timur 2025",
    berkasPenunjangEkonomi: "KARTU INDONESIA PINTAR (KIP)",
    uploadBerkasPenunjangEkonomiUrl: "https://drive.google.com/open?id=1xq_HQ1upY8-92KV0Ne9haUB0",
    slipGajiOrtuUrl: "https://drive.google.com/open?id=10zgSKqK24PDw0xch92eK08Owc2b8",
    pekerjaanOrtu: "pegawai swasta",
    totalPenghasilanOrtu: "3.803.639",
    jumlahTanggunganOrtu: "10",
    kondisiTempatTinggal: "Kost dekat Kampus B",
    catatanKondisiTerkini: "Menanggung 10 anggota keluarga, membutuhkan bantuan beasiswa KIPK aktif.",
    status: "Disetujui",
    catatanAdmin: "Berkas lengkap dan verified oleh tim kemahasiswaan."
  },
  {
    id: "monev-002",
    timestamp: "1/16/2026 15:05:40",
    emailAkademik: "3230023032@student.unusa.ac.id",
    namaLengkap: "VINA NURMALA SARI",
    nim: "3230023032",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    semesterSekarang: "Semester 6",
    ipsTerakhir: 3.82,
    ipkKumulatif: 3.79,
    khsTranskripUrl: "https://drive.google.com/open?id=1KHS_VinaNurmala_Sem5",
    statusPerkuliahan: "Aktif Perkuliahan",
    kendalaAkademikText: "-",
    capaianPrestasiSoftskill: "Panitia Raker SEMADIKSI 2026 & Moderating Softskill Bootcamp",
    berkasPenunjangEkonomi: "Bukti Terdaftar DTKS/DTSEN (dibuktikan dengan screenshot)",
    uploadBerkasPenunjangEkonomiUrl: "https://drive.google.com/open?id=1ubAKpwg78IpIRTuFe7rnKqDPnf",
    slipGajiOrtuUrl: "https://drive.google.com/open?id=1xwjnX3lpSsmkxOSFIRFyFTM_6clkjM4",
    pekerjaanOrtu: "Buruh Tani",
    totalPenghasilanOrtu: "1.500.000",
    jumlahTanggunganOrtu: "7",
    kondisiTempatTinggal: "Rumah Orang Tua",
    catatanKondisiTerkini: "Orang tua bekerja sebagai buruh tani musiman.",
    status: "Disetujui",
    catatanAdmin: "Prestasi akademik memuaskan (IPK > 3.75)."
  },
  {
    id: "monev-003",
    timestamp: "1/16/2026 16:30:11",
    emailAkademik: "3230023037@student.unusa.ac.id",
    namaLengkap: "Andia Dini Carmila",
    nim: "3230023037",
    prodi: "S1 Manajemen",
    tahunMasuk: "2023",
    semesterSekarang: "Semester 6",
    ipsTerakhir: 3.60,
    ipkKumulatif: 3.55,
    khsTranskripUrl: "https://drive.google.com/open?id=1KHS_AndiaDini_Sem5",
    statusPerkuliahan: "Aktif Perkuliahan",
    kendalaAkademikText: "-",
    capaianPrestasiSoftskill: "Peserta Seminar Nasional Digital Marketing UNUSA",
    berkasPenunjangEkonomi: "Bukti Terdaftar DTKS/DTSEN (dibuktikan dengan screenshot)",
    uploadBerkasPenunjangEkonomiUrl: "https://drive.google.com/open?id=1V9ruDCK9_F-o9dU0-V48N11O7kp",
    slipGajiOrtuUrl: "https://drive.google.com/open?id=1KFXU0Fym3PWWnqeXmT_va1d8p3ZFL-p",
    pekerjaanOrtu: "orang tua saya sudah tidak bekerja selama satu tahun",
    totalPenghasilanOrtu: "Rp. 3.388.000 (Tiga Juta Tiga Ratus Delapan puluh delapan ribu)",
    jumlahTanggunganOrtu: "3",
    kondisiTempatTinggal: "Sewa / Kost",
    catatanKondisiTerkini: "Penghasilan bersumber dari usaha keluarga tidak tetap.",
    status: "Menunggu Review",
    catatanAdmin: "Menunggu konfirmasi verifikasi slip gaji ortu."
  }
];

export interface KipkDocument {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userNim?: string;
  userUniversity?: string;
  userYearOfEntry?: string;
  category: "Kartu KIP-K" | "SKTM" | "Keaktifan Ormawa" | "Kegiatan Webinar Soft Skill" | "Keikutsertaan Kompetisi" | "Kegiatan Semadiksi" | "KHS / Transkrip" | "Dokumen Tambahan";
  tahap?: 1 | 2 | 3; // 1=Pencairan, 2=Pelaporan, 3=Monev
  title: string;
  fileName: string;
  fileSize?: string;
  fileType?: "pdf" | "image" | "doc";
  fileUrl?: string;
  uploadedAt: string;
  uploadedBy?: "Mahasiswa" | "Admin";
  status: "Disetujui" | "Perlu Perbaikan" | "Menunggu Review" | "Belum Ada Berkas";
  score: number; // 0 - 100
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

// Mapping tahap KIPK ke kategori berkas yang relevan
export const KIPK_TAHAP_CATEGORIES: Record<1 | 2 | 3, KipkDocument["category"][]> = {
  1: ["Kartu KIP-K", "SKTM"],         // Tahap 1: Pengajuan Pencairan Beasiswa
  2: ["Keaktifan Ormawa", "Kegiatan Webinar Soft Skill", "Keikutsertaan Kompetisi", "Kegiatan Semadiksi"], // Tahap 2: Pelaporan Keaktifan & Lomba
  3: ["KHS / Transkrip", "Dokumen Tambahan"]  // Tahap 3: Monev Akademik & Ekonomi
};

export const KIPK_TAHAP_LABELS: Record<1 | 2 | 3, { title: string; desc: string; icon: string; color: string }> = {
  1: { title: "Tahap 1: Pengajuan Pencairan Beasiswa", desc: "Berkas administrasi wajib untuk pencairan beasiswa KIP-K (Kartu KIP-K, SKTM).", icon: "payments", color: "purple" },
  2: { title: "Tahap 2: Pelaporan Keaktifan & Lomba", desc: "Sertifikat dan SK keaktifan ormawa, webinar, kompetisi, dan kegiatan SEMADIKSI.", icon: "description", color: "emerald" },
  3: { title: "Tahap 3: Monev Akademik & Ekonomi", desc: "Kartu Hasil Studi (KHS), transkrip, dan berkas penunjang kondisi ekonomi keluarga.", icon: "analytics", color: "blue" },
};

// Get tahap for a category automatically
export function getTahapForCategory(cat: KipkDocument["category"]): 1 | 2 | 3 {
  if ((KIPK_TAHAP_CATEGORIES[1] as string[]).includes(cat)) return 1;
  if ((KIPK_TAHAP_CATEGORIES[2] as string[]).includes(cat)) return 2;
  return 3;
}

export const INITIAL_KIPK_DOCUMENTS: KipkDocument[] = [
  {
    id: "doc-1",
    userId: "usr-1",
    userName: "Ahmad Fauzan",
    userEmail: "ahmad.fauzan@gmail.com",
    userNim: "3230023034",
    userUniversity: "Universitas Nahdlatul Ulama Surabaya",
    userYearOfEntry: "2023",
    category: "Keaktifan Ormawa",
    tahap: 2,
    title: "SK Kepengurusan BEM & Surat Tanda Aktif",
    fileName: "SK_BEM_2026.pdf",
    fileSize: "2.4 MB",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/file/d/1_SK_BEM_2026/view",
    uploadedAt: "10 Feb 2026, 09:30",
    uploadedBy: "Mahasiswa",
    status: "Disetujui",
    score: 90,
    notes: "Berkas sesuai dengan ketentuan dan SK telah ditandatangani Dekanat.",
    verifiedAt: "11 Feb 2026, 14:10",
    verifiedBy: "Admin Kemahasiswaan"
  },
  {
    id: "doc-2",
    userId: "usr-1",
    userName: "Ahmad Fauzan",
    userEmail: "ahmad.fauzan@gmail.com",
    userNim: "3230023034",
    userUniversity: "Universitas Nahdlatul Ulama Surabaya",
    userYearOfEntry: "2023",
    category: "Kegiatan Webinar Soft Skill",
    tahap: 2,
    title: "Sertifikat Webinar Leadership & Public Speaking",
    fileName: "Sertifikat_Webinar.jpg",
    fileSize: "1.8 MB",
    fileType: "image",
    fileUrl: "https://drive.google.com/file/d/1_Sertifikat_Webinar/view",
    uploadedAt: "12 Feb 2026, 11:15",
    uploadedBy: "Mahasiswa",
    status: "Disetujui",
    score: 95,
    notes: "Berkas telah diverifikasi dan sertifikat aktif.",
    verifiedAt: "12 Feb 2026, 14:00",
    verifiedBy: "Admin Kemahasiswaan"
  },
  {
    id: "doc-3",
    userId: "usr-1",
    userName: "Ahmad Fauzan",
    userEmail: "ahmad.fauzan@gmail.com",
    userNim: "3230023034",
    userUniversity: "Universitas Nahdlatul Ulama Surabaya",
    userYearOfEntry: "2023",
    category: "Kegiatan Semadiksi",
    tahap: 2,
    title: "Sertifikat LKMB & Temu Akbar Semadiksi",
    fileName: "Sertifikat_Semadiksi_Maba.pdf",
    fileSize: "3.1 MB",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/file/d/1_Sertifikat_LKMB/view",
    uploadedAt: "13 Feb 2026, 16:45",
    uploadedBy: "Mahasiswa",
    status: "Disetujui",
    score: 100,
    notes: "Berkas telah diverifikasi dan lulus evaluasi.",
    verifiedAt: "14 Feb 2026, 09:15",
    verifiedBy: "Admin Kemahasiswaan"
  },
  {
    id: "doc-4",
    userId: "usr-1",
    userName: "Ahmad Fauzan",
    userEmail: "ahmad.fauzan@gmail.com",
    userNim: "3230023034",
    userUniversity: "Universitas Nahdlatul Ulama Surabaya",
    userYearOfEntry: "2023",
    category: "Kartu KIP-K",
    tahap: 1,
    title: "Kartu Resmi KIP Kuliah Kemdikbudristek",
    fileName: "Kartu_KIPK_AhmadFauzan.pdf",
    fileSize: "1.2 MB",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/file/d/1_Kartu_KIPK/view",
    uploadedAt: "01 Jan 2026, 08:00",
    uploadedBy: "Mahasiswa",
    status: "Disetujui",
    score: 100,
    notes: "Data KIP Kuliah valid di PDDikti dan PUSLAPDIK.",
    verifiedAt: "02 Jan 2026, 10:00",
    verifiedBy: "Admin Kemahasiswaan"
  },
  {
    id: "doc-5",
    userId: "usr-1",
    userName: "Ahmad Fauzan",
    userEmail: "ahmad.fauzan@gmail.com",
    userNim: "3230023034",
    userUniversity: "Universitas Nahdlatul Ulama Surabaya",
    userYearOfEntry: "2023",
    category: "KHS / Transkrip",
    tahap: 3,
    title: "Transkrip Nilai Akademik Semester Ganjil (IPK 3.82)",
    fileName: "Transkrip_Semester_1_AhmadFauzan.pdf",
    fileSize: "850 KB",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/file/d/1_Transkrip_KHS/view",
    uploadedAt: "12 Feb 2026, 08:20",
    uploadedBy: "Admin",
    status: "Disetujui",
    score: 98,
    notes: "Diinput langsung oleh Admin Akademik.",
    verifiedAt: "12 Feb 2026, 08:30",
    verifiedBy: "Admin Akademik"
  }
];



