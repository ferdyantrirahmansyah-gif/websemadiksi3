"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  BeritaAcaraItem,
  BeasiswaItem,
  AttendanceRecord,
  INITIAL_BERITA_ACARA,
  INITIAL_INFO_BEASISWA,
  INITIAL_ATTENDANCES,
} from "@/data/portalData";

const formatToIndonesianDate = (dateStr: string) => {
  if (!dateStr) return "";
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return dateStr;
  return `${day} ${months[monthIdx]} ${year}`;
};

const parseFromIndonesianDate = (formattedStr: string) => {
  if (!formattedStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(formattedStr)) return formattedStr;

  const months: { [key: string]: string } = {
    "januari": "01", "februari": "02", "maret": "03", "april": "04",
    "mei": "05", "juni": "06", "juli": "07", "agustus": "08",
    "september": "09", "oktober": "10", "november": "11", "desember": "12"
  };

  const cleanStr = formattedStr.replace(/^[a-zA-Z]+,\s*/, "");
  const parts = cleanStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const monthWord = parts[1].toLowerCase();
    const year = parts[2];
    const monthNum = months[monthWord];
    if (monthNum) {
      return `${year}-${monthNum}-${day}`;
    }
  }

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export interface SeatLayoutConfig {
  rows: number; // e.g. 15
  cols: number; // e.g. 20 (Total = 300)
  aisles: number[]; // e.g. [10] or [5, 15] (column indexes after which an aisle is inserted)
  vipRows: string[]; // e.g. ["A", "B"]
  accessibleSeats?: string[]; // e.g. ["A-1", "A-20"]
  disabledSeats?: string[]; // e.g. []
  customSeatTypes?: { [seatNo: string]: "regular" | "vip" | "accessible" | "disabled" };
  layoutPreset?: "auditorium_unusa" | "hall_3blocks" | "theater_wide" | "classroom" | "custom";
}

export const getRowLabel = (index: number): string => {
  let label = "";
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode(65 + (temp % 26)) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
};

export const calculateOptimalLayoutForQuota = (quota: number, preset: string = "auditorium_unusa"): SeatLayoutConfig => {
  const q = Math.max(1, quota || 100);

  let optimalCols = 20;
  let optimalRows = 15;

  if (q <= 30) {
    optimalCols = Math.min(q, 6);
    optimalRows = Math.ceil(q / optimalCols);
  } else if (q <= 80) {
    optimalCols = 10;
    optimalRows = Math.ceil(q / 10);
  } else if (q <= 150) {
    optimalCols = 12;
    optimalRows = Math.ceil(q / 12);
  } else if (q <= 250) {
    optimalCols = 16;
    optimalRows = Math.ceil(q / 16);
  } else if (q <= 350) {
    // 300 quota -> exactly 15 rows x 20 cols = 300 seats!
    optimalCols = 20;
    optimalRows = Math.ceil(q / 20);
  } else if (q <= 500) {
    optimalCols = 25;
    optimalRows = Math.ceil(q / 25);
  } else {
    optimalCols = 30;
    optimalRows = Math.ceil(q / 30);
  }

  // Adjust aisles based on preset & cols
  let aisles: number[] = [];
  if (preset === "hall_3blocks" && optimalCols >= 6) {
    const p1 = Math.floor(optimalCols / 3);
    const p2 = Math.floor((optimalCols * 2) / 3);
    aisles = [p1, p2];
  } else if (preset === "theater_wide") {
    aisles = [];
  } else if (preset === "classroom" && optimalCols >= 8) {
    const p1 = Math.floor(optimalCols / 4);
    const p2 = Math.floor(optimalCols / 2);
    const p3 = Math.floor((optimalCols * 3) / 4);
    aisles = [p1, p2, p3];
  } else {
    // Default Auditorium UNUSA: 1 center aisle
    aisles = [Math.floor(optimalCols / 2)];
  }

  // Disabled seats to match exact quota if rows * cols > quota
  const totalGrid = optimalRows * optimalCols;
  const excess = totalGrid - q;
  const disabledSeats: string[] = [];
  if (excess > 0) {
    const lastRowLabel = getRowLabel(optimalRows - 1);
    for (let i = 0; i < excess; i++) {
      const colNo = optimalCols - i;
      disabledSeats.push(`${lastRowLabel}-${colNo}`);
    }
  }

  return {
    rows: optimalRows,
    cols: optimalCols,
    aisles,
    vipRows: ["A"],
    disabledSeats,
    accessibleSeats: [`${getRowLabel(0)}-1`, `${getRowLabel(0)}-${optimalCols}`],
    layoutPreset: preset as any
  };
};

interface Activity {
  id: string;
  title: string;
  category: string;
  type: string;
  date: string;
  desc: string;
  status: string;
  price: string;
  tags: string[];
  img: string;
  latest?: boolean;
  closed?: boolean;
  location?: string;
  rundown?: string;
  speaker?: string;
  requireFileUpload?: boolean;
  fileUploadInstruction?: string;
  enableSeatBooking?: boolean;
  seatLayoutConfig?: SeatLayoutConfig;
  quota?: number;
  xpPoints?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  kipStatus: "KIP UNUSA" | "Umum";
  verificationStatus: "Verified" | "Pending" | "Rejected";
  nim?: string;
  yearOfEntry?: string;
  kipDocName?: string;
  queueNumber?: string;
}

interface Certificate {
  id: string;
  userName: string;
  activityTitle: string;
  code: string;
  dateUploaded: string;
}

interface Submission {
  id: string;
  activityId?: string;
  activityTitle?: string;
  groupName: string;
  leaderName: string;
  category: string;
  documentName: string;
  documentUrl: string;
  score: number | "Belum Dinilai";
  uploadedAt?: string;
}

interface KipkDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userNim: string;
  userUniversity: string;
  userYearOfEntry?: string;
  category: "Kartu KIP-K" | "SKTM" | "Keaktifan Ormawa" | "Kegiatan Webinar Soft Skill" | "Keikutsertaan Kompetisi" | "Kegiatan Semadiksi" | "KHS / Transkrip" | "Dokumen Tambahan";
  title: string;
  fileName: string;
  fileSize?: string;
  fileType?: "pdf" | "image" | "doc";
  uploadedAt: string;
  uploadedBy: "Mahasiswa" | "Admin";
  status: "Disetujui" | "Perlu Perbaikan" | "Menunggu Review" | "Belum Ada Berkas";
  score: number; // 0 - 100
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"beranda" | "kegiatan" | "antrean_kip" | "berkas_kipk" | "berita_acara" | "info_beasiswa" | "absensi_kegiatan" | "pengguna" | "sertifikat" | "validasi_sertifikat" | "bobot">("beranda");

  // State arrays
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [kipkDocs, setKipkDocs] = useState<KipkDocument[]>([]);
  const [beritaAcaraList, setBeritaAcaraList] = useState<BeritaAcaraItem[]>([]);
  const [beasiswaList, setBeasiswaList] = useState<BeasiswaItem[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  // Attendance Management States (Admin)
  const [attSearchQuery, setAttSearchQuery] = useState("");
  const [attStatusFilter, setAttStatusFilter] = useState<"Semua" | "Hadir" | "Menunggu Verifikasi" | "Ditolak">("Semua");
  const [attActivityFilter, setAttActivityFilter] = useState<string>("Semua");
  const [selectedAttendanceForDetail, setSelectedAttendanceForDetail] = useState<AttendanceRecord | null>(null);
  const [showAttendanceDetailModal, setShowAttendanceDetailModal] = useState(false);
  const [showAdminProjectorQrModal, setShowAdminProjectorQrModal] = useState(false);
  const [projectorActivity, setProjectorActivity] = useState<string>("Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)");
  const [validationAdminNotes, setValidationAdminNotes] = useState<string>("");

  // Berita Acara Management States
  const [baSearchQuery, setBaSearchQuery] = useState("");
  const [baStatusFilter, setBaStatusFilter] = useState<"Semua" | "Selesai" | "Akan Datang">("Semua");
  const [baCategoryFilter, setBaCategoryFilter] = useState<string>("Semua");
  const [showBeritaAcaraModal, setShowBeritaAcaraModal] = useState(false);
  const [currentBeritaAcara, setCurrentBeritaAcara] = useState<BeritaAcaraItem | null>(null);
  const [baFormTitle, setBaFormTitle] = useState("");
  const [baFormCategory, setBaFormCategory] = useState<BeritaAcaraItem["category"]>("Rapat Kerja");
  const [baFormStatus, setBaFormStatus] = useState<"Selesai" | "Akan Datang">("Selesai");
  const [baFormDate, setBaFormDate] = useState("");
  const [baFormTime, setBaFormTime] = useState("");
  const [baFormLocation, setBaFormLocation] = useState("");
  const [baFormOrganizer, setBaFormOrganizer] = useState("Biro Kemahasiswaan & SEMADIKSI UNUSA");
  const [baFormAttendeeCount, setBaFormAttendeeCount] = useState<number>(100);
  const [baFormSummary, setBaFormSummary] = useState("");
  const [baFormContent, setBaFormContent] = useState("");
  const [baFormBannerImg, setBaFormBannerImg] = useState("");
  const [baFormAttachmentFileName, setBaFormAttachmentFileName] = useState("");
  const [baFormExternalLink, setBaFormExternalLink] = useState("");
  const [showBeritaAcaraDetailModal, setShowBeritaAcaraDetailModal] = useState(false);
  const [selectedBeritaAcaraForDetail, setSelectedBeritaAcaraForDetail] = useState<BeritaAcaraItem | null>(null);

  // Info Beasiswa Management States
  const [beaSearchQuery, setBeaSearchQuery] = useState("");
  const [beaStatusFilter, setBeaStatusFilter] = useState<"Semua" | "Dibuka" | "Segera Dibuka" | "Ditutup">("Semua");
  const [beaCategoryFilter, setBeaCategoryFilter] = useState<string>("Semua");
  const [showBeasiswaModal, setShowBeasiswaModal] = useState(false);
  const [currentBeasiswa, setCurrentBeasiswa] = useState<BeasiswaItem | null>(null);
  const [beaFormTitle, setBeaFormTitle] = useState("");
  const [beaFormProvider, setBeaFormProvider] = useState("");
  const [beaFormCategory, setBeaFormCategory] = useState<BeasiswaItem["category"]>("KIP Kuliah");
  const [beaFormStatus, setBeaFormStatus] = useState<"Dibuka" | "Segera Dibuka" | "Ditutup">("Dibuka");
  const [beaFormOpenDate, setBeaFormOpenDate] = useState("");
  const [beaFormCloseDate, setBeaFormCloseDate] = useState("");
  const [beaFormCoverage, setBeaFormCoverage] = useState("");
  const [beaFormRequirements, setBeaFormRequirements] = useState("");
  const [beaFormSelectionStages, setBeaFormSelectionStages] = useState("");
  const [beaFormDescription, setBeaFormDescription] = useState("");
  const [beaFormBannerImg, setBeaFormBannerImg] = useState("");
  const [beaFormGuideFileName, setBeaFormGuideFileName] = useState("");
  const [beaFormApplyUrl, setBeaFormApplyUrl] = useState("");
  const [showBeasiswaDetailModal, setShowBeasiswaDetailModal] = useState(false);
  const [selectedBeasiswaForDetail, setSelectedBeasiswaForDetail] = useState<BeasiswaItem | null>(null);

  // KIP-K Documents Management filters
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [docStatusFilter, setDocStatusFilter] = useState<"Semua" | "Menunggu Review" | "Disetujui" | "Perlu Perbaikan">("Semua");
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("Semua");

  // Document Validation Modal states
  const [showDocValidationModal, setShowDocValidationModal] = useState(false);
  const [selectedDocForValidation, setSelectedDocForValidation] = useState<KipkDocument | null>(null);
  const [validationScore, setValidationScore] = useState<number>(100);
  const [validationStatus, setValidationStatus] = useState<"Disetujui" | "Perlu Perbaikan" | "Menunggu Review">("Disetujui");
  const [validationNotes, setValidationNotes] = useState<string>("");
  const [savingValidation, setSavingValidation] = useState(false);

  // Student Grouped View & Dossier Modal States
  const [docViewMode, setDocViewMode] = useState<"grouped" | "flat">("grouped");
  const [expandedStudentRows, setExpandedStudentRows] = useState<string[]>([]);
  const [showStudentDocsModal, setShowStudentDocsModal] = useState(false);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<{
    userName: string;
    userNim: string;
    userEmail: string;
    userUniversity: string;
    userYearOfEntry?: string;
    userId?: string;
  } | null>(null);

  // Admin Upload Document Modal states
  const [showAdminUploadDocModal, setShowAdminUploadDocModal] = useState(false);
  const [adminUploadStudentName, setAdminUploadStudentName] = useState("");
  const [adminUploadCategory, setAdminUploadCategory] = useState<KipkDocument["category"]>("Keaktifan Ormawa");
  const [adminUploadTitle, setAdminUploadTitle] = useState("");
  const [adminUploadFileName, setAdminUploadFileName] = useState("");
  const [adminUploadScore, setAdminUploadScore] = useState<number>(90);
  const [adminUploadStatus, setAdminUploadStatus] = useState<"Disetujui" | "Menunggu Review">("Disetujui");
  const [adminUploadNotes, setAdminUploadNotes] = useState("");
  const [adminUploadSubmitting, setAdminUploadSubmitting] = useState(false);

  // Activity Form Modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [actTitle, setActTitle] = useState("");
  const [actCategory, setActCategory] = useState("Workshop");
  const [actDate, setActDate] = useState("");
  const [actPrice, setActPrice] = useState("Gratis");
  const [actImg, setActImg] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actRundown, setActRundown] = useState("");
  const [actSpeaker, setActSpeaker] = useState("");
  const [actRequireFileUpload, setActRequireFileUpload] = useState(false);
  const [actFileUploadInstruction, setActFileUploadInstruction] = useState("");
  const [actEnableSeatBooking, setActEnableSeatBooking] = useState(false);
  const [actQuota, setActQuota] = useState<number>(300);
  const [actXpPoints, setActXpPoints] = useState<number>(0);

  // Seating Layout Editor states
  const [actSeatLayoutRows, setActSeatLayoutRows] = useState<number>(15);
  const [actSeatLayoutCols, setActSeatLayoutCols] = useState<number>(20);
  const [actSeatLayoutAisles, setActSeatLayoutAisles] = useState<number[]>([10]);
  const [actSeatLayoutVipRows, setActSeatLayoutVipRows] = useState<string[]>(["A"]);
  const [actSeatLayoutDisabledSeats, setActSeatLayoutDisabledSeats] = useState<string[]>([]);
  const [actSeatLayoutAccessibleSeats, setActSeatLayoutAccessibleSeats] = useState<string[]>(["A-1", "A-20"]);
  const [actSeatLayoutPreset, setActSeatLayoutPreset] = useState<"auditorium_unusa" | "hall_3blocks" | "theater_wide" | "classroom" | "custom">("auditorium_unusa");
  const [actSeatLayoutZoom, setActSeatLayoutZoom] = useState<number>(1);

  // Activity Uploads Modal states
  const [showUploadsModal, setShowUploadsModal] = useState(false);
  const [selectedUploadsActivity, setSelectedUploadsActivity] = useState<Activity | null>(null);
  const [activitySubmissions, setActivitySubmissions] = useState<Submission[]>([]);

  // Seat Booking Details Modal states
  const [showSeatBookingDetailsModal, setShowSeatBookingDetailsModal] = useState(false);
  const [selectedSeatActivity, setSelectedSeatActivity] = useState<Activity | null>(null);
  const [selectedSeatBookings, setSelectedSeatBookings] = useState<any[]>([]);

  // Certificate Upload Form states
  const [certUser, setCertUser] = useState("");
  const [certActivity, setCertActivity] = useState("");
  const [certCode, setCertCode] = useState("");
  const [uploadingCert, setUploadingCert] = useState(false);

  // Category weights configuration states
  const [categoryWeights, setCategoryWeights] = useState<{ [key: string]: number }>({
    "Keaktifan Ormawa": 25,
    "Kegiatan Webinar Soft Skill": 25,
    "Keikutsertaan Kompetisi": 25,
    "Kegiatan Semadiksi": 25
  });

  // Verification Portal States (Admin Tab)
  const [adminCertInput, setAdminCertInput] = useState("");
  const [adminSearchedCode, setAdminSearchedCode] = useState<string | null>(null);
  const [adminMatchedCert, setAdminMatchedCert] = useState<any | null>(null);
  const [adminCertValid, setAdminCertValid] = useState(false);
  const [adminScanning, setAdminScanning] = useState(false);

  // KIP-K Dedicated Queue Tab States
  const [kipSearchQuery, setKipSearchQuery] = useState("");
  const [kipStatusFilter, setKipStatusFilter] = useState<"Pending" | "Verified" | "Rejected" | "Semua">("Pending");

  // Judging States
  const [tempScores, setTempScores] = useState<{ [key: string]: string }>({});

  // Check login session & Initialize data
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in");
    if (isLoggedIn !== "true") {
      router.push("/admin/masuk");
      return;
    }
    setIsAdminLoggedIn(true);

    // Load activities from localStorage or default ones
    const storedActivities = localStorage.getItem("semadiksi_activities");
    if (storedActivities) {
      try {
        setActivities(JSON.parse(storedActivities));
      } catch (e) {
        initDefaultActivities();
      }
    } else {
      initDefaultActivities();
    }

    // Load users list (initial mock)
    const storedUsers = localStorage.getItem("semadiksi_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUsers: User[] = [
        { id: "usr-1", name: "Ahmad Fauzan", email: "ahmad.fauzan@gmail.com", university: "Universitas Diponegoro", kipStatus: "KIP UNUSA", verificationStatus: "Verified" },
        { id: "usr-2", name: "Budi Santoso", email: "budi.santoso@gmail.com", university: "Universitas Negeri Semarang", kipStatus: "KIP UNUSA", verificationStatus: "Pending" },
        { id: "usr-3", name: "Clara Citra", email: "clara.citra@gmail.com", university: "Universitas Diponegoro", kipStatus: "Umum", verificationStatus: "Verified" },
        { id: "usr-4", name: "Dedi Kurnia", email: "dedi.kurnia@gmail.com", university: "UIN Walisongo", kipStatus: "KIP UNUSA", verificationStatus: "Pending" },
        { id: "usr-5", name: "Evi Latifah", email: "evi.latifah@gmail.com", university: "Universitas PGRI Semarang", kipStatus: "KIP UNUSA", verificationStatus: "Rejected" },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("semadiksi_users", JSON.stringify(defaultUsers));
    }

    // Load KIP-K Documents list
    const storedKipkDocs = localStorage.getItem("semadiksi_kipk_documents");
    if (storedKipkDocs) {
      try {
        setKipkDocs(JSON.parse(storedKipkDocs));
      } catch (e) {
        initDefaultKipkDocs();
      }
    } else {
      initDefaultKipkDocs();
    }

    // Load certificates list
    const storedCerts = localStorage.getItem("semadiksi_certificates_admin");
    if (storedCerts) {
      setCertificates(JSON.parse(storedCerts));
    } else {
      const defaultCerts: Certificate[] = [
        { id: "cert-1", userName: "Ahmad Fauzan", activityTitle: "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)", code: "CERT-LKMB-2024-0891", dateUploaded: "16 Nov 2024" },
        { id: "cert-2", userName: "Ahmad Fauzan", activityTitle: "SEMADIKSI Berbagi: Volunteer Mengajar Pesisir", code: "CERT-VOL-2024-1102", dateUploaded: "13 Okt 2024" },
      ];
      setCertificates(defaultCerts);
      localStorage.setItem("semadiksi_certificates_admin", JSON.stringify(defaultCerts));
    }

    // Load contest submissions list
    const storedSubmissions = localStorage.getItem("semadiksi_submissions");
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    } else {
      const defaultSubmissions: Submission[] = [
        { id: "sub-1", activityId: "act-d", activityTitle: "Lomba Poster Digital SEMADIKSI 2025", groupName: "Tim Barokah", leaderName: "Ahmad Fauzan", category: "Poster Digital", documentName: "Poster_TimBarokah_OptimalisasiPendidikan.png", documentUrl: "#", score: 87, uploadedAt: "10 Feb 2025" },
        { id: "sub-2", activityId: "act-d", activityTitle: "Lomba Poster Digital SEMADIKSI 2025", groupName: "Tim Srikandi", leaderName: "Evi Latifah", category: "Poster Digital", documentName: "Poster_TimSrikandi_MerdekaBelajar.png", documentUrl: "#", score: "Belum Dinilai", uploadedAt: "12 Feb 2025" },
        { id: "sub-3", activityId: "act-d", activityTitle: "Lomba Poster Digital SEMADIKSI 2025", groupName: "Tim Garuda", leaderName: "Budi Santoso", category: "Poster Digital", documentName: "Poster_TimGaruda_SistemBeasiswaTepatSasaran.png", documentUrl: "#", score: 92, uploadedAt: "14 Feb 2025" },
        { id: "sub-4", activityId: "act-c", activityTitle: "SEMADIKSI Cultural Night & Reunion", groupName: "Clara Citra", leaderName: "clara.citra@gmail.com", category: "Workshop", documentName: "Dokumen_Persyaratan_ClaraCitra.pdf", documentUrl: "#", score: "Belum Dinilai", uploadedAt: "08 Jan 2025" },
      ];
      setSubmissions(defaultSubmissions);
      localStorage.setItem("semadiksi_submissions", JSON.stringify(defaultSubmissions));
    }

    // Load category weights from localStorage
    const storedWeights = localStorage.getItem("semadiksi_category_weights");
    if (storedWeights && storedWeights.includes("Keaktifan Ormawa")) {
      try {
        setCategoryWeights(JSON.parse(storedWeights));
      } catch (err) { }
    } else {
      const defaultWeights = {
        "Keaktifan Ormawa": 25,
        "Kegiatan Webinar Soft Skill": 25,
        "Keikutsertaan Kompetisi": 25,
        "Kegiatan Semadiksi": 25
      };
      setCategoryWeights(defaultWeights);
      localStorage.setItem("semadiksi_category_weights", JSON.stringify(defaultWeights));
    }

    // Load Berita Acara list
    const storedBA = localStorage.getItem("semadiksi_berita_acara");
    if (storedBA) {
      try {
        setBeritaAcaraList(JSON.parse(storedBA));
      } catch (e) {
        setBeritaAcaraList(INITIAL_BERITA_ACARA);
        localStorage.setItem("semadiksi_berita_acara", JSON.stringify(INITIAL_BERITA_ACARA));
      }
    } else {
      setBeritaAcaraList(INITIAL_BERITA_ACARA);
      localStorage.setItem("semadiksi_berita_acara", JSON.stringify(INITIAL_BERITA_ACARA));
    }

    // Load Info Beasiswa list
    const storedBea = localStorage.getItem("semadiksi_info_beasiswa");
    if (storedBea) {
      try {
        setBeasiswaList(JSON.parse(storedBea));
      } catch (e) {
        setBeasiswaList(INITIAL_INFO_BEASISWA);
        localStorage.setItem("semadiksi_info_beasiswa", JSON.stringify(INITIAL_INFO_BEASISWA));
      }
    } else {
      setBeasiswaList(INITIAL_INFO_BEASISWA);
      localStorage.setItem("semadiksi_info_beasiswa", JSON.stringify(INITIAL_INFO_BEASISWA));
    }

    // Load Attendance / Presensi list
    const storedAtt = localStorage.getItem("semadiksi_attendances");
    if (storedAtt) {
      try {
        setAttendanceList(JSON.parse(storedAtt));
      } catch (e) {
        setAttendanceList(INITIAL_ATTENDANCES);
        localStorage.setItem("semadiksi_attendances", JSON.stringify(INITIAL_ATTENDANCES));
      }
    } else {
      setAttendanceList(INITIAL_ATTENDANCES);
      localStorage.setItem("semadiksi_attendances", JSON.stringify(INITIAL_ATTENDANCES));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "semadiksi_submissions") {
        if (e.newValue) {
          try {
            setSubmissions(JSON.parse(e.newValue));
          } catch (err) { }
        }
      }
      if (e.key === "semadiksi_kipk_documents") {
        if (e.newValue) {
          try {
            setKipkDocs(JSON.parse(e.newValue));
          } catch (err) { }
        }
      }
      if (e.key === "semadiksi_berita_acara") {
        if (e.newValue) {
          try {
            setBeritaAcaraList(JSON.parse(e.newValue));
          } catch (err) { }
        }
      }
      if (e.key === "semadiksi_info_beasiswa") {
        if (e.newValue) {
          try {
            setBeasiswaList(JSON.parse(e.newValue));
          } catch (err) { }
        }
      }
      if (e.key === "semadiksi_attendances") {
        if (e.newValue) {
          try {
            setAttendanceList(JSON.parse(e.newValue));
          } catch (err) { }
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  const initDefaultActivities = () => {
    const defaultActs: Activity[] = [
      {
        id: "act-a",
        title: "SEMADIKSI Peduli: Bakti Sosial Akhir Tahun",
        category: "Sosial",
        type: "Sosial",
        date: "24 Desember 2024",
        desc: "Mari bergabung dalam aksi nyata untuk berbagi kebahagiaan bersama saudara-saudara kita di Panti Asuhan Kasih Bunda. Kegiatan meliputi penyaluran donasi dan edukasi kreatif.",
        status: "Gratis",
        price: "Gratis",
        tags: ["KIP-K", "Sosial"],
        img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
        latest: true,
        location: "Panti Asuhan Kasih Bunda, Ngaliyan",
        rundown: "08.00 - 08.30: Registrasi Panitia & Keberangkatan\n09.00 - 11.00: Penyerahan Sembako & Edukasi Mewarnai\n11.00 - 12.00: Game Bersama Anak Panti\n12.00 - 13.00: Penutupan & Doa Bersama",
        speaker: "Relawan Divisi Pengabdian",
        xpPoints: 200
      },
      {
        id: "act-b",
        title: "Latihan Kepemimpinan Mahasiswa Berprestasi",
        category: "Seminar",
        type: "Seminar",
        date: "15 November 2024",
        desc: "Program intensif 2 hari untuk mengasah skill kepemimpinan, manajemen waktu, dan public speaking bagi penerima beasiswa.",
        status: "Pendaftaran Ditutup",
        price: "IDR 25.000",
        tags: ["Kepemimpinan", "Internal"],
        img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        closed: true,
        location: "Gedung Auditorium Utama, Kampus Pleburan",
        rundown: "08.00 - 09.00: Pembukaan & Sambutan\n09.00 - 12.00: Sesi Kepemimpinan\n12.00 - 13.00: Ishoma\n13.00 - 16.00: Sesi Public Speaking & Evaluasi",
        speaker: "Dr. Hendrawan (Konsultan Kepemimpinan)",
        xpPoints: 300
      },
      {
        id: "act-c",
        title: "SEMADIKSI Cultural Night & Reunion",
        category: "Workshop",
        type: "Workshop",
        date: "10 Januari 2025",
        desc: "Malam keakraban antar angkatan dengan pertunjukan seni budaya dan sharing session dari alumni inspiratif.",
        status: "Beli Tiket",
        price: "IDR 50.000",
        tags: ["Budaya", "Hiburan"],
        img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
        location: "Gedung Auditorium Utama, Kampus Pleburan",
        rundown: "18.30 - 19.00: Registrasi & Pintu Dibuka\n19.00 - 20.30: Pertunjukan Budaya Nusantara\n20.30 - 21.30: Sharing Session Alumni Inspiratif\n21.30 - 22.00: Foto Bersama & Penutupan",
        speaker: "Alumni Berprestasi SEMADIKSI",
        xpPoints: 150
      },
      {
        id: "act-d",
        title: "Lomba Poster Digital SEMADIKSI 2025",
        category: "Lomba",
        type: "Lomba",
        date: "15 Februari 2025",
        desc: "Tunjukkan kreativitas Anda dalam mendesain poster digital dengan tema 'Inovasi Mahasiswa KIP-K untuk Indonesia Emas 2045'. Terbuka untuk umum dan mahasiswa KIP-K.",
        status: "Daftar Lomba",
        price: "Gratis",
        tags: ["Lomba", "Kreativitas", "Nasional"],
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        location: "Online (Unggah Karya)",
        rundown: "01 Feb - 15 Feb 2025: Pengunggahan Karya\n16 Feb - 20 Feb 2025: Penjurian Karya\n22 Februari 2025: Pengumuman Pemenang",
        speaker: "Juri Profesional Desain Grafis",
        requireFileUpload: true,
        fileUploadInstruction: "Unggah karya poster digital Anda dalam format PNG/JPG dengan ukuran maksimal 5MB.",
        xpPoints: 500
      },
    ];
    setActivities(defaultActs);
    localStorage.setItem("semadiksi_activities", JSON.stringify(defaultActs));
  };

  const initDefaultKipkDocs = () => {
    const defaultKipkDocs: KipkDocument[] = [
      {
        id: "doc-1",
        userId: "usr-1",
        userName: "Ahmad Fauzan",
        userEmail: "ahmad.fauzan@gmail.com",
        userNim: "2441089",
        userUniversity: "Universitas Diponegoro",
        userYearOfEntry: "2024",
        category: "Keaktifan Ormawa",
        title: "SK Kepengurusan BEM & Surat Tanda Aktif",
        fileName: "SK_BEM_2026.pdf",
        fileSize: "2.4 MB",
        fileType: "pdf",
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
        userNim: "2441089",
        userUniversity: "Universitas Diponegoro",
        userYearOfEntry: "2024",
        category: "Kegiatan Webinar Soft Skill",
        title: "Sertifikat Webinar Leadership & Public Speaking",
        fileName: "Sertifikat_Webinar.jpg",
        fileSize: "1.8 MB",
        fileType: "image",
        uploadedAt: "12 Feb 2026, 11:15",
        uploadedBy: "Mahasiswa",
        status: "Perlu Perbaikan",
        score: 40,
        notes: "Sertifikat buram/tidak terbaca. Harap scan ulang dengan resolusi lebih tinggi (minimal 300 DPI)."
      },
      {
        id: "doc-3",
        userId: "usr-1",
        userName: "Ahmad Fauzan",
        userEmail: "ahmad.fauzan@gmail.com",
        userNim: "2441089",
        userUniversity: "Universitas Diponegoro",
        userYearOfEntry: "2024",
        category: "Kegiatan Semadiksi",
        title: "Sertifikat LKMB & Temu Akbar Semadiksi",
        fileName: "Sertifikat_Semadiksi_Maba.pdf",
        fileSize: "3.1 MB",
        fileType: "pdf",
        uploadedAt: "13 Feb 2026, 16:45",
        uploadedBy: "Mahasiswa",
        status: "Menunggu Review",
        score: 100,
        notes: "Menunggu review dan validasi berkas fisik oleh panitia/admin."
      },
      {
        id: "doc-4",
        userId: "usr-1",
        userName: "Ahmad Fauzan",
        userEmail: "ahmad.fauzan@gmail.com",
        userNim: "2441089",
        userUniversity: "Universitas Diponegoro",
        userYearOfEntry: "2024",
        category: "Kartu KIP-K",
        title: "Kartu Resmi KIP Kuliah Kemendikbudristek",
        fileName: "Kartu_KIPK_AhmadFauzan.pdf",
        fileSize: "1.2 MB",
        fileType: "pdf",
        uploadedAt: "01 Jan 2026, 08:00",
        uploadedBy: "Mahasiswa",
        status: "Disetujui",
        score: 100,
        notes: "Data KIP Kuliah valid di PDDikti dan Puslapdik.",
        verifiedAt: "02 Jan 2026, 10:00",
        verifiedBy: "Admin Kemahasiswaan"
      },
      {
        id: "doc-5",
        userId: "usr-2",
        userName: "Budi Santoso",
        userEmail: "budi.santoso@gmail.com",
        userNim: "2441092",
        userUniversity: "Universitas Negeri Semarang",
        userYearOfEntry: "2024",
        category: "Kartu KIP-K",
        title: "Bukti Kartu KIP-K & Slip Registrasi",
        fileName: "KIP_BudiSantoso_2024.pdf",
        fileSize: "2.0 MB",
        fileType: "pdf",
        uploadedAt: "14 Jan 2026, 13:20",
        uploadedBy: "Mahasiswa",
        status: "Menunggu Review",
        score: 85,
        notes: "Menunggu pencocokan nomor KIP di sistem kementerian."
      },
      {
        id: "doc-6",
        userId: "usr-2",
        userName: "Budi Santoso",
        userEmail: "budi.santoso@gmail.com",
        userNim: "2441092",
        userUniversity: "Universitas Negeri Semarang",
        userYearOfEntry: "2024",
        category: "Keikutsertaan Kompetisi",
        title: "Sertifikat Juara 2 Lomba Karya Tulis Ilmiah Nasional",
        fileName: "Sertifikat_Juara_LKTIN_Budi.pdf",
        fileSize: "4.5 MB",
        fileType: "pdf",
        uploadedAt: "08 Feb 2026, 10:05",
        uploadedBy: "Mahasiswa",
        status: "Disetujui",
        score: 95,
        notes: "Prestasi nasional terverifikasi tingkat universitas.",
        verifiedAt: "09 Feb 2026, 11:30",
        verifiedBy: "Admin Kemahasiswaan"
      },
      {
        id: "doc-7",
        userId: "usr-4",
        userName: "Dedi Kurnia",
        userEmail: "dedi.kurnia@gmail.com",
        userNim: "2441015",
        userUniversity: "UIN Walisongo",
        userYearOfEntry: "2024",
        category: "SKTM",
        title: "Surat Keterangan Tidak Mampu dari Kelurahan",
        fileName: "SKTM_DediKurnia_2026.pdf",
        fileSize: "1.5 MB",
        fileType: "pdf",
        uploadedAt: "05 Feb 2026, 15:40",
        uploadedBy: "Mahasiswa",
        status: "Disetujui",
        score: 90,
        notes: "SKTM resmi berstempel basah kelurahan."
      },
      {
        id: "doc-8",
        userId: "usr-5",
        userName: "Evi Latifah",
        userEmail: "evi.latifah@gmail.com",
        userNim: "2441077",
        userUniversity: "Universitas PGRI Semarang",
        userYearOfEntry: "2023",
        category: "Keaktifan Ormawa",
        title: "Surat Rekomendasi Ketua Himpunan Mahasiswa",
        fileName: "Surat_Aktif_HIMA_Evi.pdf",
        fileSize: "1.1 MB",
        fileType: "pdf",
        uploadedAt: "11 Feb 2026, 17:00",
        uploadedBy: "Mahasiswa",
        status: "Perlu Perbaikan",
        score: 50,
        notes: "Masa berlaku surat telah kedaluwarsa (tahun ajaran lalu). Mohon perbarui surat aktif untuk semester berjalan."
      },
      {
        id: "doc-9",
        userId: "usr-1",
        userName: "Ahmad Fauzan",
        userEmail: "ahmad.fauzan@gmail.com",
        userNim: "2441089",
        userUniversity: "Universitas Diponegoro",
        userYearOfEntry: "2024",
        category: "KHS / Transkrip",
        title: "Transkrip Nilai Akademik Semester Ganjil (IPK 3.82)",
        fileName: "Transkrip_Semester_1_AhmadFauzan.pdf",
        fileSize: "850 KB",
        fileType: "pdf",
        uploadedAt: "12 Feb 2026, 08:20",
        uploadedBy: "Admin",
        status: "Disetujui",
        score: 98,
        notes: "Diinput langsung oleh Admin Akademik UNUSA berdasarkan KHS resmi.",
        verifiedAt: "12 Feb 2026, 08:30",
        verifiedBy: "Admin Akademik"
      }
    ];
    setKipkDocs(defaultKipkDocs);
    localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(defaultKipkDocs));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    router.push("/admin/masuk");
  };

  // --- BERKAS KIP-K UNUSA VALIDATION & UPLOAD HANDLERS ---
  const openDocValidationModal = (doc: KipkDocument) => {
    setSelectedDocForValidation(doc);
    setValidationScore(doc.score || 0);
    setValidationStatus(doc.status === "Belum Ada Berkas" ? "Menunggu Review" : doc.status);
    setValidationNotes(doc.notes || "");
    setShowDocValidationModal(true);
  };

  const closeDocValidationModal = () => {
    setShowDocValidationModal(false);
    setSelectedDocForValidation(null);
    setValidationNotes("");
  };

  const saveDocValidation = () => {
    if (!selectedDocForValidation) return;
    setSavingValidation(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      const updatedDocs = kipkDocs.map((doc) => {
        if (doc.id === selectedDocForValidation.id) {
          return {
            ...doc,
            score: validationScore,
            status: validationStatus,
            notes: validationNotes,
            verifiedAt: nowStr,
            verifiedBy: "Administrator Utama"
          };
        }
        return doc;
      });

      setKipkDocs(updatedDocs);
      localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updatedDocs));

      // 1. Two-way sync with semadiksi_report_files (for student pelaporan page)
      const storedReportFiles = localStorage.getItem("semadiksi_report_files");
      if (storedReportFiles) {
        try {
          const reportFiles = JSON.parse(storedReportFiles);
          const catMap: { [key: string]: string } = {
            "Keaktifan Ormawa": "ormawa",
            "Kegiatan Webinar Soft Skill": "webinar",
            "Keikutsertaan Kompetisi": "kompetisi",
            "Kegiatan Semadiksi": "semadiksi"
          };
          const targetId = catMap[selectedDocForValidation.category];
          if (targetId) {
            const updatedReports = reportFiles.map((rf: any) => {
              if (rf.id === targetId) {
                return {
                  ...rf,
                  score: validationScore,
                  status: validationStatus,
                  notes: validationNotes
                };
              }
              return rf;
            });
            localStorage.setItem("semadiksi_report_files", JSON.stringify(updatedReports));
          }
        } catch (e) { }
      }

      // 2. Sync user verification status if validating registration card or main user
      if (selectedDocForValidation.category === "Kartu KIP-K" || selectedDocForValidation.category === "SKTM") {
        const storedUsers = localStorage.getItem("semadiksi_users");
        if (storedUsers) {
          try {
            const usersList = JSON.parse(storedUsers);
            const updatedUsers = usersList.map((u: any) => {
              if (u.id === selectedDocForValidation.userId || u.email?.toLowerCase() === selectedDocForValidation.userEmail?.toLowerCase()) {
                return {
                  ...u,
                  verificationStatus: validationStatus === "Disetujui" ? "Verified" : validationStatus === "Perlu Perbaikan" ? "Rejected" : "Pending"
                };
              }
              return u;
            });
            setUsers(updatedUsers);
            localStorage.setItem("semadiksi_users", JSON.stringify(updatedUsers));
          } catch (e) { }
        }
      }

      setSavingValidation(false);
      closeDocValidationModal();
      alert(`Validasi berkas "${selectedDocForValidation.title}" milik ${selectedDocForValidation.userName} berhasil disimpan!`);
    }, 300);
  };

  const quickApproveDoc = (docId: string, title: string, userName: string) => {
    const nowStr = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const updatedDocs = kipkDocs.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          score: Math.max(doc.score, 95),
          status: "Disetujui" as const,
          notes: "Berkas telah diverifikasi dan disetujui penuh oleh Admin.",
          verifiedAt: nowStr,
          verifiedBy: "Administrator Utama"
        };
      }
      return doc;
    });

    setKipkDocs(updatedDocs);
    localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updatedDocs));

    // Sync with semadiksi_report_files
    const targetDoc = kipkDocs.find(d => d.id === docId);
    if (targetDoc) {
      const storedReportFiles = localStorage.getItem("semadiksi_report_files");
      if (storedReportFiles) {
        try {
          const reportFiles = JSON.parse(storedReportFiles);
          const catMap: { [key: string]: string } = {
            "Keaktifan Ormawa": "ormawa",
            "Kegiatan Webinar Soft Skill": "webinar",
            "Keikutsertaan Kompetisi": "kompetisi",
            "Kegiatan Semadiksi": "semadiksi"
          };
          const targetId = catMap[targetDoc.category];
          if (targetId) {
            const updatedReports = reportFiles.map((rf: any) => {
              if (rf.id === targetId) {
                return {
                  ...rf,
                  score: Math.max(rf.score || 0, 95),
                  status: "Disetujui",
                  notes: "Berkas telah diverifikasi dan disetujui penuh oleh Admin."
                };
              }
              return rf;
            });
            localStorage.setItem("semadiksi_report_files", JSON.stringify(updatedReports));
          }
        } catch (e) { }
      }
    }

    alert(`Berkas "${title}" milik ${userName} berhasil disetujui!`);
  };

  const toggleExpandStudentRow = (studentKey: string) => {
    setExpandedStudentRows(prev =>
      prev.includes(studentKey) ? prev.filter(k => k !== studentKey) : [...prev, studentKey]
    );
  };

  const openStudentDocsModal = (student: {
    userName: string;
    userNim: string;
    userEmail: string;
    userUniversity: string;
    userYearOfEntry?: string;
    userId?: string;
  }) => {
    setSelectedStudentForDocs(student);
    setShowStudentDocsModal(true);
  };

  const closeStudentDocsModal = () => {
    setShowStudentDocsModal(false);
    setSelectedStudentForDocs(null);
  };

  const approveAllDocsForStudent = (userName: string) => {
    const updated = kipkDocs.map(d =>
      d.userName.toLowerCase() === userName.toLowerCase()
        ? { ...d, status: "Disetujui" as const, score: Math.max(d.score || 85, 90) }
        : d
    );
    setKipkDocs(updated);
    localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updated));

    // Update in localStorage pelaporan if matches
    alert(`Semua berkas untuk mahasiswa "${userName}" telah disetujui!`);
  };

  const openAdminUploadDocModal = (prefillUser?: User | string) => {
    if (typeof prefillUser === "string") {
      setAdminUploadStudentName(prefillUser);
    } else if (prefillUser && typeof prefillUser === "object") {
      setAdminUploadStudentName(prefillUser.name);
    } else if (users.length > 0) {
      setAdminUploadStudentName(users[0].name);
    } else {
      setAdminUploadStudentName("");
    }
    setAdminUploadCategory("Keaktifan Ormawa");
    setAdminUploadTitle("");
    setAdminUploadFileName("");
    setAdminUploadScore(90);
    setAdminUploadStatus("Disetujui");
    setAdminUploadNotes("Diverifikasi langsung oleh Admin Kemahasiswaan UNUSA.");
    setShowAdminUploadDocModal(true);
  };

  const closeAdminUploadDocModal = () => {
    setShowAdminUploadDocModal(false);
    setAdminUploadFileName("");
    setAdminUploadTitle("");
    setAdminUploadNotes("");
  };

  const handleAdminUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUploadStudentName || !adminUploadTitle) {
      alert("Harap lengkapi nama mahasiswa dan judul berkas!");
      return;
    }

    setAdminUploadSubmitting(true);
    setTimeout(() => {
      const matchedUser = users.find(u => u.name === adminUploadStudentName) || {
        id: `usr-${Date.now()}`,
        name: adminUploadStudentName,
        email: `${adminUploadStudentName.toLowerCase().replace(/\s+/g, ".")}@unusa.ac.id`,
        nim: "2441" + Math.floor(100 + Math.random() * 900),
        university: "Universitas Nahdlatul Ulama Surabaya (UNUSA)",
        yearOfEntry: "2024"
      };

      const finalFileName = adminUploadFileName || `${adminUploadTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      const nowStr = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      const newDoc: KipkDocument = {
        id: `doc-${Date.now()}`,
        userId: matchedUser.id,
        userName: matchedUser.name,
        userEmail: matchedUser.email,
        userNim: (matchedUser as any).nim || "2441099",
        userUniversity: matchedUser.university || "UNUSA",
        userYearOfEntry: (matchedUser as any).yearOfEntry || "2024",
        category: adminUploadCategory,
        title: adminUploadTitle,
        fileName: finalFileName,
        fileSize: "1.5 MB",
        fileType: finalFileName.endsWith(".png") || finalFileName.endsWith(".jpg") ? "image" : "pdf",
        uploadedAt: nowStr,
        uploadedBy: "Admin",
        status: adminUploadStatus,
        score: adminUploadScore,
        notes: adminUploadNotes || "Diunggah langsung oleh Administrator.",
        verifiedAt: nowStr,
        verifiedBy: "Administrator Utama"
      };

      const updatedDocs = [newDoc, ...kipkDocs];
      setKipkDocs(updatedDocs);
      localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updatedDocs));

      // Sync with semadiksi_report_files if applicable
      const catMap: { [key: string]: string } = {
        "Keaktifan Ormawa": "ormawa",
        "Kegiatan Webinar Soft Skill": "webinar",
        "Keikutsertaan Kompetisi": "kompetisi",
        "Kegiatan Semadiksi": "semadiksi"
      };
      const targetId = catMap[adminUploadCategory];
      if (targetId) {
        try {
          const storedReports = localStorage.getItem("semadiksi_report_files");
          if (storedReports) {
            const reportFiles = JSON.parse(storedReports);
            const updatedReports = reportFiles.map((rf: any) => {
              if (rf.id === targetId) {
                return {
                  ...rf,
                  fileName: finalFileName,
                  score: adminUploadScore,
                  status: adminUploadStatus,
                  notes: adminUploadNotes
                };
              }
              return rf;
            });
            localStorage.setItem("semadiksi_report_files", JSON.stringify(updatedReports));
          }
        } catch (e) { }
      }

      setAdminUploadSubmitting(false);
      closeAdminUploadDocModal();
      alert(`Berkas "${adminUploadTitle}" untuk mahasiswa ${matchedUser.name} berhasil diunggah & disimpan!`);
    }, 350);
  };

  const handleDeleteDoc = (docId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas "${title}" dari sistem?`)) {
      const updated = kipkDocs.filter(d => d.id !== docId);
      setKipkDocs(updated);
      localStorage.setItem("semadiksi_kipk_documents", JSON.stringify(updated));
      alert("Berkas berhasil dihapus dari portal.");
    }
  };

  const exportKipkDocsToExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Rekap Berkas KIPK</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; width: 100%; }
  th { background-color: #1B6D24; color: #FFFFFF; font-weight: bold; text-align: center; padding: 10px 14px; border: 1px solid #14521B; }
  td { padding: 8px 12px; border: 1px solid #D0D0D0; vertical-align: middle; }
  .title-header { background-color: #E8F5E9; font-size: 14pt; font-weight: bold; color: #1B6D24; text-align: center; padding: 14px; border: 1px solid #C8E6C9; }
  .subtitle-header { background-color: #F1F8E9; font-size: 10pt; color: #333333; text-align: center; padding: 6px; border: 1px solid #C8E6C9; }
  .status-approved { background-color: #E8F5E9; color: #2E7D32; font-weight: bold; text-align: center; }
  .status-pending { background-color: #FFF8E1; color: #F57F17; font-weight: bold; text-align: center; }
  .status-revision { background-color: #FFEBEE; color: #C62828; font-weight: bold; text-align: center; }
  .score-cell { font-weight: bold; text-align: center; color: #1B6D24; }
  .center { text-align: center; }
</style>
</head>
<body>
<table>
  <tr>
    <td colSpan="10" class="title-header">
      REKAPITULASI DOKUMEN & VALIDASI BERKAS KIP-K UNUSA - SEMADIKSI PORTAL
    </td>
  </tr>
  <tr>
    <td colSpan="10" class="subtitle-header">
      Tanggal Ekspor: <strong>${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong> | Total Berkas: <strong>${kipkDocs.length} Dokumen</strong>
    </td>
  </tr>
  <tr><td colSpan="10" style="height: 10px; border: none;"></td></tr>
  <thead>
    <tr>
      <th style="width: 50px;">NO</th>
      <th>NAMA MAHASISWA</th>
      <th style="width: 120px;">NIM</th>
      <th>ASAL UNIVERSITAS</th>
      <th>KATEGORI BERKAS</th>
      <th>JUDUL BERKAS</th>
      <th>NAMA FILE</th>
      <th style="width: 80px;">NILAI (0-100)</th>
      <th style="width: 140px;">STATUS VERIFIKASI</th>
      <th>CATATAN ADMIN</th>
    </tr>
  </thead>
  <tbody>`;

    kipkDocs.forEach((doc, idx) => {
      const statusClass = doc.status === "Disetujui" ? "status-approved" : doc.status === "Perlu Perbaikan" ? "status-revision" : "status-pending";
      html += `
    <tr>
      <td class="center"><b>${idx + 1}</b></td>
      <td><b>${doc.userName}</b></td>
      <td class="center" style="mso-number-format:'\\@';">${doc.userNim || "-"}</td>
      <td>${doc.userUniversity}</td>
      <td>${doc.category}</td>
      <td>${doc.title}</td>
      <td>${doc.fileName}</td>
      <td class="score-cell">${doc.score}</td>
      <td class="${statusClass}">${doc.status}</td>
      <td>${doc.notes || "-"}</td>
    </tr>`;
    });

    html += `
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Berkas_KIPK_UNUSA_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD BERITA ACARA KEGIATAN LOGIC ---
  const openCreateBeritaAcaraModal = () => {
    setCurrentBeritaAcara(null);
    setBaFormTitle("");
    setBaFormCategory("Rapat Kerja");
    setBaFormStatus("Selesai");
    setBaFormDate(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    setBaFormTime("09:00 - 15:00 WIB");
    setBaFormLocation("Kampus B UNUSA Jemursari");
    setBaFormOrganizer("Pengurus SEMADIKSI & Kemahasiswaan UNUSA");
    setBaFormAttendeeCount(100);
    setBaFormSummary("");
    setBaFormContent("");
    setBaFormBannerImg("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80");
    setBaFormAttachmentFileName("Berita_Acara_Kegiatan.pdf");
    setBaFormExternalLink("");
    setShowBeritaAcaraModal(true);
  };

  const openEditBeritaAcaraModal = (ba: BeritaAcaraItem) => {
    setCurrentBeritaAcara(ba);
    setBaFormTitle(ba.title);
    setBaFormCategory(ba.category);
    setBaFormStatus(ba.status);
    setBaFormDate(ba.date);
    setBaFormTime(ba.time || "");
    setBaFormLocation(ba.location);
    setBaFormOrganizer(ba.organizer);
    setBaFormAttendeeCount(ba.attendeeCount || 0);
    setBaFormSummary(ba.summary);
    setBaFormContent(ba.content);
    setBaFormBannerImg(ba.bannerImg);
    setBaFormAttachmentFileName(ba.attachmentFileName || "");
    setBaFormExternalLink(ba.externalLink || "");
    setShowBeritaAcaraModal(true);
  };

  const closeBeritaAcaraModal = () => {
    setShowBeritaAcaraModal(false);
    setCurrentBeritaAcara(null);
  };

  const handleSaveBeritaAcara = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baFormTitle || !baFormSummary) {
      alert("Harap isi judul dan ringkasan berita acara!");
      return;
    }

    const item: BeritaAcaraItem = {
      id: currentBeritaAcara ? currentBeritaAcara.id : `ba-${Date.now()}`,
      title: baFormTitle,
      category: baFormCategory,
      status: baFormStatus,
      date: baFormDate || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      time: baFormTime,
      location: baFormLocation || "Kampus UNUSA",
      organizer: baFormOrganizer || "SEMADIKSI UNUSA",
      attendeeCount: Number(baFormAttendeeCount) || 0,
      summary: baFormSummary,
      content: baFormContent || baFormSummary,
      bannerImg: baFormBannerImg || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      attachmentFileName: baFormAttachmentFileName || "Berita_Acara.pdf",
      attachmentFileSize: "2.0 MB",
      externalLink: baFormExternalLink,
      createdAt: currentBeritaAcara ? currentBeritaAcara.createdAt : new Date().toISOString().slice(0, 16).replace("T", " "),
      author: "Admin Kemahasiswaan"
    };

    let updated: BeritaAcaraItem[];
    if (currentBeritaAcara) {
      updated = beritaAcaraList.map(b => b.id === currentBeritaAcara.id ? item : b);
    } else {
      updated = [item, ...beritaAcaraList];
    }

    setBeritaAcaraList(updated);
    localStorage.setItem("semadiksi_berita_acara", JSON.stringify(updated));
    closeBeritaAcaraModal();
    alert(`Berita Acara "${baFormTitle}" berhasil disimpan!`);
  };

  const handleDeleteBeritaAcara = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Berita Acara "${title}"?`)) {
      const updated = beritaAcaraList.filter(b => b.id !== id);
      setBeritaAcaraList(updated);
      localStorage.setItem("semadiksi_berita_acara", JSON.stringify(updated));
      alert("Berita Acara berhasil dihapus.");
    }
  };

  const exportBeritaAcaraToExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; width: 100%; }
  th { background-color: #1B6D24; color: #FFFFFF; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #14521B; }
  td { padding: 6px 10px; border: 1px solid #D0D0D0; }
  .title-header { background-color: #E8F5E9; font-size: 13pt; font-weight: bold; color: #1B6D24; text-align: center; padding: 10px; }
  .center { text-align: center; }
</style>
</head>
<body>
<table>
  <tr><td colSpan="8" class="title-header">REKAPITULASI DOKUMEN BERITA ACARA KEGIATAN KIP-K UNUSA</td></tr>
  <thead>
    <tr>
      <th>NO</th>
      <th>JUDUL BERITA ACARA</th>
      <th>KATEGORI</th>
      <th>STATUS</th>
      <th>TANGGAL & WAKTU</th>
      <th>LOKASI</th>
      <th>PENYELENGGARA</th>
      <th>PESERTA</th>
    </tr>
  </thead>
  <tbody>`;
    beritaAcaraList.forEach((ba, idx) => {
      html += `
    <tr>
      <td class="center">${idx + 1}</td>
      <td><b>${ba.title}</b></td>
      <td>${ba.category}</td>
      <td class="center">${ba.status}</td>
      <td>${ba.date} ${ba.time ? `(${ba.time})` : ""}</td>
      <td>${ba.location}</td>
      <td>${ba.organizer}</td>
      <td class="center">${ba.attendeeCount || 0}</td>
    </tr>`;
    });
    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Berita_Acara_KIPK_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD INFO BEASISWA LOGIC ---
  const openCreateBeasiswaModal = () => {
    setCurrentBeasiswa(null);
    setBeaFormTitle("");
    setBeaFormProvider("Biro Kemahasiswaan UNUSA");
    setBeaFormCategory("KIP Kuliah");
    setBeaFormStatus("Dibuka");
    setBeaFormOpenDate(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    setBeaFormCloseDate("30 November 2026");
    setBeaFormCoverage("Bebas Biaya UKT 100% + Bantuan Biaya Hidup");
    setBeaFormRequirements("Mahasiswa aktif UNUSA semester berjalan.\nIPK minimal 3.25.\nMemiliki surat rekomendasi Dekan.");
    setBeaFormSelectionStages("1. Seleksi Berkas -> 2. Wawancara -> 3. Pengumuman Kelulusan");
    setBeaFormDescription("");
    setBeaFormBannerImg("https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80");
    setBeaFormGuideFileName("Panduan_Pendaftaran_Beasiswa.pdf");
    setBeaFormApplyUrl("https://unusa.ac.id/beasiswa");
    setShowBeasiswaModal(true);
  };

  const openEditBeasiswaModal = (bea: BeasiswaItem) => {
    setCurrentBeasiswa(bea);
    setBeaFormTitle(bea.title);
    setBeaFormProvider(bea.provider);
    setBeaFormCategory(bea.category);
    setBeaFormStatus(bea.status);
    setBeaFormOpenDate(bea.openDate);
    setBeaFormCloseDate(bea.closeDate);
    setBeaFormCoverage(bea.coverage);
    setBeaFormRequirements(Array.isArray(bea.requirements) ? bea.requirements.join("\n") : "");
    setBeaFormSelectionStages(bea.selectionStages || "");
    setBeaFormDescription(bea.description);
    setBeaFormBannerImg(bea.bannerImg);
    setBeaFormGuideFileName(bea.guideFileName || "");
    setBeaFormApplyUrl(bea.applyUrl || "");
    setShowBeasiswaModal(true);
  };

  const closeBeasiswaModal = () => {
    setShowBeasiswaModal(false);
    setCurrentBeasiswa(null);
  };

  const handleSaveBeasiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beaFormTitle || !beaFormProvider) {
      alert("Harap isi nama beasiswa dan instansi penyelenggara!");
      return;
    }

    const reqArray = beaFormRequirements
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const item: BeasiswaItem = {
      id: currentBeasiswa ? currentBeasiswa.id : `bea-${Date.now()}`,
      title: beaFormTitle,
      provider: beaFormProvider,
      category: beaFormCategory,
      status: beaFormStatus,
      openDate: beaFormOpenDate || "1 Januari 2026",
      closeDate: beaFormCloseDate || "31 Desember 2026",
      coverage: beaFormCoverage || "Bantuan Biaya Pendidikan",
      requirements: reqArray.length > 0 ? reqArray : ["Mahasiswa aktif UNUSA", "IPK minimal 3.00"],
      selectionStages: beaFormSelectionStages || "Seleksi Berkas dan Wawancara",
      description: beaFormDescription || beaFormTitle,
      bannerImg: beaFormBannerImg || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      guideFileName: beaFormGuideFileName || "Panduan_Beasiswa.pdf",
      guideFileSize: "2.5 MB",
      applyUrl: beaFormApplyUrl || "https://unusa.ac.id/beasiswa",
      createdAt: currentBeasiswa ? currentBeasiswa.createdAt : new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    let updated: BeasiswaItem[];
    if (currentBeasiswa) {
      updated = beasiswaList.map(b => b.id === currentBeasiswa.id ? item : b);
    } else {
      updated = [item, ...beasiswaList];
    }

    setBeasiswaList(updated);
    localStorage.setItem("semadiksi_info_beasiswa", JSON.stringify(updated));
    closeBeasiswaModal();
    alert(`Info Beasiswa "${beaFormTitle}" berhasil disimpan!`);
  };

  const handleDeleteBeasiswa = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus program beasiswa "${title}"?`)) {
      const updated = beasiswaList.filter(b => b.id !== id);
      setBeasiswaList(updated);
      localStorage.setItem("semadiksi_info_beasiswa", JSON.stringify(updated));
      alert("Info Beasiswa berhasil dihapus.");
    }
  };

  const exportBeasiswaToExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; width: 100%; }
  th { background-color: #1B6D24; color: #FFFFFF; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #14521B; }
  td { padding: 6px 10px; border: 1px solid #D0D0D0; }
  .title-header { background-color: #E8F5E9; font-size: 13pt; font-weight: bold; color: #1B6D24; text-align: center; padding: 10px; }
  .center { text-align: center; }
</style>
</head>
<body>
<table>
  <tr><td colSpan="7" class="title-header">DAFTAR INFORMASI PROGRAM BEASISWA - SEMADIKSI UNUSA</td></tr>
  <thead>
    <tr>
      <th>NO</th>
      <th>NAMA BEASISWA</th>
      <th>INSTANSI / PENYELENGGARA</th>
      <th>KATEGORI</th>
      <th>STATUS</th>
      <th>PERIODE PENDAFTARAN</th>
      <th>CAKUPAN PEMBIAYAAN</th>
    </tr>
  </thead>
  <tbody>`;
    beasiswaList.forEach((bea, idx) => {
      html += `
    <tr>
      <td class="center">${idx + 1}</td>
      <td><b>${bea.title}</b></td>
      <td>${bea.provider}</td>
      <td>${bea.category}</td>
      <td class="center">${bea.status}</td>
      <td>${bea.openDate} s.d. ${bea.closeDate}</td>
      <td>${bea.coverage}</td>
    </tr>`;
    });
    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Info_Beasiswa_UNUSA_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ATTENDANCE (PRESENSI KEGIATAN) LOGIC ---
  const handleValidateAttendance = (
    attId: string,
    newStatus: "Hadir" | "Menunggu Verifikasi" | "Ditolak",
    customNotes?: string
  ) => {
    const updated = attendanceList.map((att) => {
      if (att.id === attId) {
        return {
          ...att,
          status: newStatus,
          notes: customNotes !== undefined ? customNotes : (newStatus === "Hadir" ? "Kehadiran diverifikasi sah oleh Admin." : "Bukti tidak sesuai / ditolak.")
        };
      }
      return att;
    });

    setAttendanceList(updated);
    localStorage.setItem("semadiksi_attendances", JSON.stringify(updated));
    if (selectedAttendanceForDetail && selectedAttendanceForDetail.id === attId) {
      setSelectedAttendanceForDetail({
        ...selectedAttendanceForDetail,
        status: newStatus,
        notes: customNotes !== undefined ? customNotes : (newStatus === "Hadir" ? "Kehadiran diverifikasi sah oleh Admin." : "Bukti tidak sesuai / ditolak.")
      });
    }
    alert(`Status presensi berhasil diubah menjadi "${newStatus}"!`);
  };

  const handleDeleteAttendance = (attId: string, studentName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data presensi mahasiswa "${studentName}"?`)) {
      const updated = attendanceList.filter((att) => att.id !== attId);
      setAttendanceList(updated);
      localStorage.setItem("semadiksi_attendances", JSON.stringify(updated));
      alert("Data presensi berhasil dihapus.");
    }
  };

  const openProjectorQrModal = (activityTitle?: string) => {
    if (activityTitle) {
      setProjectorActivity(activityTitle);
    } else if (activities.length > 0) {
      setProjectorActivity(activities[0].title);
    }
    setShowAdminProjectorQrModal(true);
  };

  const exportAttendanceToExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; width: 100%; }
  th { background-color: #1B6D24; color: #FFFFFF; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #14521B; }
  td { padding: 6px 10px; border: 1px solid #D0D0D0; }
  .title-header { background-color: #E8F5E9; font-size: 13pt; font-weight: bold; color: #1B6D24; text-align: center; padding: 10px; }
  .center { text-align: center; }
</style>
</head>
<body>
<table>
  <tr><td colSpan="8" class="title-header">REKAPITULASI PRESENSI & KEHADIRAN MAHASISWA - SEMADIKSI UNUSA</td></tr>
  <thead>
    <tr>
      <th>NO</th>
      <th>KODE PRESENSI</th>
      <th>NAMA MAHASISWA</th>
      <th>NIM</th>
      <th>UNIVERSITAS</th>
      <th>KEGIATAN</th>
      <th>WAKTU PRESENSI</th>
      <th>STATUS</th>
    </tr>
  </thead>
  <tbody>`;
    attendanceList.forEach((att, idx) => {
      html += `
    <tr>
      <td class="center">${idx + 1}</td>
      <td class="center"><b>${att.id}</b></td>
      <td><b>${att.studentName}</b></td>
      <td>'${att.studentNim}</td>
      <td>${att.university}</td>
      <td>${att.activityTitle}</td>
      <td>${att.timestamp}</td>
      <td class="center">${att.status}</td>
    </tr>`;
    });
    html += `</tbody></table></body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Presensi_Mahasiswa_UNUSA_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD KEGIATAN & SEATING LAYOUT LOGIC ---
  const syncLayoutWithQuota = (quotaValue: number = actQuota, preset: string = actSeatLayoutPreset) => {
    const layout = calculateOptimalLayoutForQuota(quotaValue, preset);
    setActSeatLayoutRows(layout.rows);
    setActSeatLayoutCols(layout.cols);
    setActSeatLayoutAisles(layout.aisles);
    setActSeatLayoutVipRows(layout.vipRows);
    setActSeatLayoutDisabledSeats(layout.disabledSeats || []);
    setActSeatLayoutAccessibleSeats(layout.accessibleSeats || []);
  };

  const syncQuotaWithLayout = () => {
    const totalActive = (actSeatLayoutRows * actSeatLayoutCols) - actSeatLayoutDisabledSeats.length;
    setActQuota(Math.max(1, totalActive));
  };

  const applySeatLayoutPreset = (preset: "auditorium_unusa" | "hall_3blocks" | "theater_wide" | "classroom" | "custom") => {
    setActSeatLayoutPreset(preset);
    if (preset === "auditorium_unusa") {
      setActSeatLayoutAisles([Math.floor(actSeatLayoutCols / 2)]);
    } else if (preset === "hall_3blocks") {
      const p1 = Math.floor(actSeatLayoutCols / 3);
      const p2 = Math.floor((actSeatLayoutCols * 2) / 3);
      setActSeatLayoutAisles([p1, p2]);
    } else if (preset === "theater_wide") {
      setActSeatLayoutAisles([]);
    } else if (preset === "classroom") {
      const p1 = Math.floor(actSeatLayoutCols / 4);
      const p2 = Math.floor(actSeatLayoutCols / 2);
      const p3 = Math.floor((actSeatLayoutCols * 3) / 4);
      setActSeatLayoutAisles([p1, p2, p3]);
    }
  };

  const toggleSeatOnCanvas = (seatNo: string, rowLabel: string) => {
    const isDisabled = actSeatLayoutDisabledSeats.includes(seatNo);
    const isAccessible = actSeatLayoutAccessibleSeats.includes(seatNo);
    const isVip = actSeatLayoutVipRows.includes(rowLabel);

    if (isDisabled) {
      // Disabled -> Regular (remove from disabled)
      setActSeatLayoutDisabledSeats(actSeatLayoutDisabledSeats.filter(s => s !== seatNo));
    } else if (isAccessible) {
      // Accessible -> Disabled
      setActSeatLayoutAccessibleSeats(actSeatLayoutAccessibleSeats.filter(s => s !== seatNo));
      setActSeatLayoutDisabledSeats([...actSeatLayoutDisabledSeats, seatNo]);
    } else {
      // Regular / VIP -> Accessible
      setActSeatLayoutAccessibleSeats([...actSeatLayoutAccessibleSeats, seatNo]);
    }
  };

  const saveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Activity[] = [];

    const formattedDate = formatToIndonesianDate(actDate);

    const currentLayoutConfig: SeatLayoutConfig = {
      rows: actSeatLayoutRows,
      cols: actSeatLayoutCols,
      aisles: actSeatLayoutAisles,
      vipRows: actSeatLayoutVipRows,
      disabledSeats: actSeatLayoutDisabledSeats,
      accessibleSeats: actSeatLayoutAccessibleSeats,
      layoutPreset: actSeatLayoutPreset,
    };

    if (currentActivity) {
      // Edit
      updated = activities.map((act) =>
        act.id === currentActivity.id
          ? {
            ...act,
            title: actTitle,
            category: actCategory,
            type: actCategory,
            date: formattedDate,
            price: actPrice,
            status: actPrice === "Gratis" ? "Gratis" : "Beli Tiket",
            img: actImg || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            desc: actDesc,
            location: actLocation,
            rundown: actRundown,
            speaker: actSpeaker,
            requireFileUpload: actRequireFileUpload,
            fileUploadInstruction: actRequireFileUpload ? actFileUploadInstruction : "",
            enableSeatBooking: actEnableSeatBooking,
            seatLayoutConfig: actEnableSeatBooking ? currentLayoutConfig : undefined,
            quota: actQuota,
            xpPoints: actXpPoints,
          }
          : act
      );
      alert("Kegiatan berhasil diperbarui!");
    } else {
      // Create
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        title: actTitle,
        category: actCategory,
        type: actCategory,
        date: formattedDate,
        desc: actDesc,
        price: actPrice,
        status: actPrice === "Gratis" ? "Gratis" : "Beli Tiket",
        tags: [actCategory, actPrice === "Gratis" ? "Gratis" : "Berbayar"],
        img: actImg || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        location: actLocation,
        rundown: actRundown,
        speaker: actSpeaker,
        requireFileUpload: actRequireFileUpload,
        fileUploadInstruction: actRequireFileUpload ? actFileUploadInstruction : "",
        enableSeatBooking: actEnableSeatBooking,
        seatLayoutConfig: actEnableSeatBooking ? currentLayoutConfig : undefined,
        quota: actQuota,
        xpPoints: actXpPoints,
      };
      updated = [...activities, newAct];
      alert("Kegiatan baru berhasil diunggah!");
    }

    setActivities(updated);
    localStorage.setItem("semadiksi_activities", JSON.stringify(updated));
    closeActivityModal();
  };

  const deleteActivity = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      const updated = activities.filter((act) => act.id !== id);
      setActivities(updated);
      localStorage.setItem("semadiksi_activities", JSON.stringify(updated));
      alert("Kegiatan telah dihapus!");
    }
  };

  const openActivityModal = (act: Activity | null = null) => {
    setCurrentActivity(act);
    if (act) {
      setActTitle(act.title);
      setActCategory(act.category);
      setActDate(parseFromIndonesianDate(act.date));
      setActPrice(act.price);
      setActImg(act.img);
      setActDesc(act.desc);
      setActLocation(act.location || "");
      setActRundown(act.rundown || "");
      setActSpeaker(act.speaker || "");
      setActRequireFileUpload(!!act.requireFileUpload);
      setActFileUploadInstruction(act.fileUploadInstruction || "");
      setActEnableSeatBooking(!!act.enableSeatBooking);
      setActQuota(act.quota || 100);
      setActXpPoints(act.xpPoints || 0);

      // Load seating layout config
      if (act.seatLayoutConfig) {
        setActSeatLayoutRows(act.seatLayoutConfig.rows || 15);
        setActSeatLayoutCols(act.seatLayoutConfig.cols || 20);
        setActSeatLayoutAisles(act.seatLayoutConfig.aisles || [10]);
        setActSeatLayoutVipRows(act.seatLayoutConfig.vipRows || ["A"]);
        setActSeatLayoutDisabledSeats(act.seatLayoutConfig.disabledSeats || []);
        setActSeatLayoutAccessibleSeats(act.seatLayoutConfig.accessibleSeats || []);
        setActSeatLayoutPreset(act.seatLayoutConfig.layoutPreset || "auditorium_unusa");
      } else {
        const layout = calculateOptimalLayoutForQuota(act.quota || 100, "auditorium_unusa");
        setActSeatLayoutRows(layout.rows);
        setActSeatLayoutCols(layout.cols);
        setActSeatLayoutAisles(layout.aisles);
        setActSeatLayoutVipRows(layout.vipRows);
        setActSeatLayoutDisabledSeats(layout.disabledSeats || []);
        setActSeatLayoutAccessibleSeats(layout.accessibleSeats || []);
        setActSeatLayoutPreset("auditorium_unusa");
      }
    } else {
      setActTitle("");
      setActCategory("Workshop");
      setActDate("");
      setActPrice("Gratis");
      setActImg("");
      setActDesc("");
      setActLocation("");
      setActRundown("");
      setActSpeaker("");
      setActRequireFileUpload(false);
      setActFileUploadInstruction("");
      setActEnableSeatBooking(false);
      setActQuota(300);
      setActXpPoints(0);

      const layout = calculateOptimalLayoutForQuota(300, "auditorium_unusa");
      setActSeatLayoutRows(layout.rows);
      setActSeatLayoutCols(layout.cols);
      setActSeatLayoutAisles(layout.aisles);
      setActSeatLayoutVipRows(layout.vipRows);
      setActSeatLayoutDisabledSeats(layout.disabledSeats || []);
      setActSeatLayoutAccessibleSeats(layout.accessibleSeats || []);
      setActSeatLayoutPreset("auditorium_unusa");
    }
    setActSeatLayoutZoom(1);
    setShowActivityModal(true);
  };

  const closeActivityModal = () => {
    setShowActivityModal(false);
    setCurrentActivity(null);
    setActRequireFileUpload(false);
    setActFileUploadInstruction("");
    setActEnableSeatBooking(false);
    setActQuota(300);
    setActXpPoints(0);
  };

  const openSeatBookingDetailsModal = (act: Activity) => {
    setSelectedSeatActivity(act);
    const stored = localStorage.getItem(`semadiksi_bookings_${act.id}`);
    if (stored) {
      try {
        setSelectedSeatBookings(JSON.parse(stored));
      } catch (e) {
        setSelectedSeatBookings([]);
      }
    } else {
      setSelectedSeatBookings([]);
    }
    setShowSeatBookingDetailsModal(true);
  };

  const closeSeatBookingDetailsModal = () => {
    setShowSeatBookingDetailsModal(false);
    setSelectedSeatActivity(null);
    setSelectedSeatBookings([]);
  };

  const handleAdminToggleSeat = (seatNumber: string) => {
    if (!selectedSeatActivity) return;
    const existingIndex = selectedSeatBookings.findIndex((b: any) => b.seatNumber === seatNumber);
    let updated = [...selectedSeatBookings];

    if (existingIndex > -1) {
      const booking = selectedSeatBookings[existingIndex];
      if (confirm(`Apakah Anda yakin ingin membatalkan/merilis booking kursi ${seatNumber} oleh ${booking.userName}?`)) {
        updated.splice(existingIndex, 1);
        setSelectedSeatBookings(updated);
        localStorage.setItem(`semadiksi_bookings_${selectedSeatActivity.id}`, JSON.stringify(updated));
        alert(`Kursi ${seatNumber} berhasil dirilis.`);
      }
    } else {
      if (confirm(`Apakah Anda ingin memblokir/mereservasi kursi ${seatNumber} untuk Panitia?`)) {
        const newBooking = {
          seatNumber,
          userName: "Reservasi Panitia (Blocked)",
          userEmail: "admin@semadiksi.org",
          bookedAt: new Date().toLocaleString("id-ID")
        };
        updated.push(newBooking);
        setSelectedSeatBookings(updated);
        localStorage.setItem(`semadiksi_bookings_${selectedSeatActivity.id}`, JSON.stringify(updated));
        alert(`Kursi ${seatNumber} berhasil direservasi untuk Panitia.`);
      }
    }
  };

  // --- ACTIVITY UPLOADS / PENJURIAN MODAL LOGIC ---
  const openActivityUploadsModal = (act: Activity) => {
    setSelectedUploadsActivity(act);

    // Load submissions from state or localStorage
    const stored = localStorage.getItem("semadiksi_submissions");
    let allSubs: Submission[] = [];
    if (stored) {
      try {
        allSubs = JSON.parse(stored);
      } catch (e) { }
    }

    const filtered = allSubs.filter(
      (sub) => sub.activityId === act.id || sub.activityTitle === act.title
    );
    setActivitySubmissions(filtered);

    // Populate tempScores for these submissions
    const preloadedScores: { [key: string]: string } = {};
    filtered.forEach((sub) => {
      preloadedScores[sub.id] = sub.score === "Belum Dinilai" ? "" : String(sub.score);
    });
    setTempScores((prev) => ({ ...prev, ...preloadedScores }));

    setShowUploadsModal(true);
  };

  const closeActivityUploadsModal = () => {
    setShowUploadsModal(false);
    setSelectedUploadsActivity(null);
    setActivitySubmissions([]);
  };

  const saveUploadScore = (id: string) => {
    const rawScore = tempScores[id];
    if (rawScore === undefined || rawScore.trim() === "") {
      alert("Harap masukkan nilai terlebih dahulu!");
      return;
    }

    const scoreNum = parseInt(rawScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Nilai harus berupa angka di antara 0 - 100!");
      return;
    }

    // Load latest submissions from localStorage
    const stored = localStorage.getItem("semadiksi_submissions");
    let allSubs: Submission[] = [];
    if (stored) {
      try {
        allSubs = JSON.parse(stored);
      } catch (e) { }
    }

    // Update the item
    const updated = allSubs.map((sub) =>
      sub.id === id ? { ...sub, score: scoreNum } : sub
    );

    // Save globally
    setSubmissions(updated);
    localStorage.setItem("semadiksi_submissions", JSON.stringify(updated));

    // Update in modal state
    setActivitySubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, score: scoreNum } : sub))
    );

    alert("Nilai karya berhasil disimpan!");
  };

  // --- USER VALIDATION & ACC MANAGEMENT ---
  const validateKipUser = (id: string, status: "Verified" | "Rejected") => {
    const updated = users.map((usr) =>
      usr.id === id ? { ...usr, verificationStatus: status } : usr
    );
    setUsers(updated);
    localStorage.setItem("semadiksi_users", JSON.stringify(updated));
    alert(`Status KIP-K pengguna telah diset ke: ${status}`);
  };

  const deleteUser = (id: string, email: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus email "${email}"? Pengguna tidak akan bisa login lagi ke portal.`)) {
      const updated = users.filter((usr) => usr.id !== id);
      setUsers(updated);
      localStorage.setItem("semadiksi_users", JSON.stringify(updated));

      // Simulate account revocation by recording in a local blocklist
      const blocklist = JSON.parse(localStorage.getItem("semadiksi_blocked_emails") || "[]");
      blocklist.push(email);
      localStorage.setItem("semadiksi_blocked_emails", JSON.stringify(blocklist));

      alert(`Email ${email} telah diblokir dan dihapus dari portal.`);
    }
  };

  // --- EKSPOR & IMPOR DATA EXCEL (XLS & CSV) LOGIC ---
  const exportActivityUploadsToExcel = () => {
    if (!selectedUploadsActivity) return;

    if (activitySubmissions.length === 0) {
      alert("Belum ada data unggahan/karya peserta pada kegiatan ini untuk diekspor.");
      return;
    }

    const isLomba = selectedUploadsActivity.category === "Lomba";
    const title = selectedUploadsActivity.title;

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Sheet1</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; width: 100%; }
  th { background-color: #1B6D24; color: #FFFFFF; font-weight: bold; text-align: center; padding: 10px 14px; border: 1px solid #14521B; }
  td { padding: 8px 12px; border: 1px solid #D0D0D0; vertical-align: middle; }
  .title-header { background-color: #E8F5E9; font-size: 14pt; font-weight: bold; color: #1B6D24; text-align: center; padding: 14px; border: 1px solid #C8E6C9; }
  .subtitle-header { background-color: #F1F8E9; font-size: 10pt; color: #333333; text-align: center; padding: 6px; border: 1px solid #C8E6C9; }
  .score-cell { background-color: #FFFDE7; font-weight: bold; text-align: center; color: #D84315; }
  .input-cell { background-color: #E8F5E9; border: 2px solid #2E7D32; text-align: center; font-weight: bold; }
  .link-cell { color: #1565C0; font-weight: bold; }
  .center { text-align: center; }
</style>
</head>
<body>
<table>
  <tr>
    <td colSpan="${isLomba ? 9 : 7}" class="title-header">
      ${isLomba ? "LEMBAR PENJURIAN & PENILAIAN KARYA LOMBA" : "REKAPITULASI UNGGAHAN DOKUMEN PESERTA"} - SEMADIKSI PORTAL
    </td>
  </tr>
  <tr>
    <td colSpan="${isLomba ? 9 : 7}" class="subtitle-header">
      Kegiatan: <strong>${title}</strong> | Kategori: <strong>${selectedUploadsActivity.category}</strong> | Tanggal Ekspor: <strong>${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
    </td>
  </tr>
  <tr><td colSpan="${isLomba ? 9 : 7}" style="height: 10px; border: none;"></td></tr>
  <thead>
    <tr>
      <th style="width: 130px;">ID Submission</th>
      <th style="width: 50px;">NO</th>
      <th>${isLomba ? "NAMA KELOMPOK / PESERTA" : "NAMA PESERTA"}</th>
      <th>${isLomba ? "KETUA / KONTAK" : "EMAIL / KONTAK"}</th>
      ${isLomba ? `
        <th>LAMPIRAN KARYA</th>
        <th style="width: 140px;">TANGGAL UNGGAH</th>
        <th style="width: 120px;">NILAI SAAT INI</th>
        <th style="width: 180px; background-color: #2E7D32;">INPUT NILAI JURI (0-100)</th>
        <th style="width: 200px;">CATATAN / FEEDBACK JURI</th>
      ` : `
        <th>INFORMASI PESERTA (UNIVERSITAS / NIM)</th>
        <th>DOKUMEN UNGGAHAN</th>
        <th style="width: 140px;">TANGGAL UNGGAH</th>
      `}
    </tr>
  </thead>
  <tbody>`;

    activitySubmissions.forEach((sub, idx) => {
      const matchedUser = users.find(u => u.name === sub.groupName || u.email === sub.leaderName || u.name === sub.leaderName);
      if (isLomba) {
        html += `
    <tr>
      <td class="center" style="font-family: monospace; font-size: 9pt; color: #666;">${sub.id}</td>
      <td class="center"><b>${idx + 1}</b></td>
      <td><b>${sub.groupName}</b></td>
      <td>${sub.leaderName}</td>
      <td class="link-cell">${sub.documentName}</td>
      <td class="center" style="mso-number-format:'\\@';">${sub.uploadedAt || "-"}</td>
      <td class="score-cell">${sub.score === "Belum Dinilai" ? "Belum Dinilai" : sub.score}</td>
      <td class="input-cell">${sub.score === "Belum Dinilai" ? "" : sub.score}</td>
      <td></td>
    </tr>`;
      } else {
        const userInfo = matchedUser ? `${matchedUser.university} ${matchedUser.nim ? `(NIM: ${matchedUser.nim})` : ""}` : "Mahasiswa Terdaftar";
        html += `
    <tr>
      <td class="center" style="font-family: monospace; font-size: 9pt; color: #666;">${sub.id}</td>
      <td class="center"><b>${idx + 1}</b></td>
      <td><b>${sub.groupName}</b></td>
      <td>${sub.leaderName}</td>
      <td>${userInfo}</td>
      <td class="link-cell">${sub.documentName}</td>
      <td class="center" style="mso-number-format:'\\@';">${sub.uploadedAt || "-"}</td>
    </tr>`;
      }
    });

    html += `
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
    const prefix = isLomba ? "Penjurian_Lomba" : "Unggahan_Dokumen";
    link.setAttribute("href", url);
    link.setAttribute("download", `${prefix}_${safeTitle}_${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportScoresFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUploadsActivity) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const stored = localStorage.getItem("semadiksi_submissions");
      let allSubs: Submission[] = stored ? JSON.parse(stored) : [];

      let updatedCount = 0;
      const updatedScoresMap: { [key: string]: number } = {};

      allSubs.forEach((sub) => {
        if (sub.activityId === selectedUploadsActivity.id || sub.activityTitle === selectedUploadsActivity.title) {
          const idIndex = text.indexOf(sub.id);
          const nameIndex = text.indexOf(sub.groupName);

          if (idIndex !== -1 || nameIndex !== -1) {
            const pos = idIndex !== -1 ? idIndex : nameIndex;
            const snippet = text.substring(pos, pos + 350);

            const numberMatches = snippet.match(/\b([0-9]{1,2}|100)\b/g);
            if (numberMatches) {
              for (const matchStr of numberMatches) {
                const val = parseInt(matchStr, 10);
                if (!isNaN(val) && val >= 0 && val <= 100 && val !== sub.score) {
                  updatedScoresMap[sub.id] = val;
                  updatedCount++;
                  break;
                }
              }
            }
          }
        }
      });

      if (updatedCount > 0) {
        const newSubs = allSubs.map((sub) =>
          updatedScoresMap[sub.id] !== undefined ? { ...sub, score: updatedScoresMap[sub.id] } : sub
        );
        setSubmissions(newSubs);
        localStorage.setItem("semadiksi_submissions", JSON.stringify(newSubs));

        const currentFiltered = newSubs.filter(
          (s) => s.activityId === selectedUploadsActivity.id || s.activityTitle === selectedUploadsActivity.title
        );
        setActivitySubmissions(currentFiltered);

        const newTemp: { [key: string]: string } = {};
        currentFiltered.forEach((s) => {
          newTemp[s.id] = s.score === "Belum Dinilai" ? "" : String(s.score);
        });
        setTempScores((prev) => ({ ...prev, ...newTemp }));

        alert(`Berhasil mengimpor ${updatedCount} nilai juri dari file Excel!`);
      } else {
        alert("Tidak ada pembaruan nilai juri yang terdeteksi dari file Excel yang diunggah.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportLombaToExcel = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "No;Nama Kelompok;Ketua Kelompok;Kegiatan Lomba;Kategori Lomba;Lampiran Karya;Nilai\n";
    submissions.forEach((sub, idx) => {
      const row = [
        idx + 1,
        sub.groupName,
        sub.leaderName,
        sub.activityTitle || "Lomba Poster Digital SEMADIKSI 2025",
        sub.category,
        sub.documentName,
        sub.score
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";");
      csvContent += row + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Karya_Lomba_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportKipToExcel = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "No;Nama Mahasiswa;No. Antrean;Email;NIM;Angkatan;Asal Universitas;Status Verifikasi\n";
    const filtered = users
      .filter((usr) => usr.kipStatus === "KIP UNUSA")
      .filter((usr) => {
        if (kipStatusFilter !== "Semua" && usr.verificationStatus !== kipStatusFilter) {
          return false;
        }
        if (kipSearchQuery.trim() !== "") {
          const query = kipSearchQuery.toLowerCase();
          return (
            usr.name.toLowerCase().includes(query) ||
            usr.email.toLowerCase().includes(query) ||
            usr.university.toLowerCase().includes(query) ||
            (usr.nim && usr.nim.toLowerCase().includes(query)) ||
            (usr.queueNumber && usr.queueNumber.toLowerCase().includes(query))
          );
        }
        return true;
      });

    filtered.forEach((usr, idx) => {
      const row = [
        idx + 1,
        usr.name,
        usr.queueNumber || "Belum Ambil",
        usr.email,
        usr.nim || "-",
        usr.yearOfEntry || "-",
        usr.university,
        usr.verificationStatus
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";");
      csvContent += row + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Antrean_KIP_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPenggunaToExcel = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "No;Nama Lengkap;Email;NIM;Angkatan;Asal Universitas;Status KIP;Verifikasi KIP\n";
    users.forEach((usr, idx) => {
      const row = [
        idx + 1,
        usr.name,
        usr.email,
        usr.nim || "-",
        usr.yearOfEntry || "-",
        usr.university,
        usr.kipStatus,
        usr.verificationStatus
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";");
      csvContent += row + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pengguna_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateSerialCodeForActivity = (title: string) => {
    if (!title) return `CERT-SEMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 6) || "SEMA";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CERT-${cleanTitle}-${year}-${rand}`;
  };

  // --- UPLOAD CERTIFICATE LOGIC ---
  const handleUploadCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certUser || !certActivity || !certCode) {
      alert("Harap lengkapi semua isian formulir sertifikat!");
      return;
    }

    setUploadingCert(true);

    setTimeout(() => {
      if (certUser === "ALL_STUDENTS") {
        const newCertsList: Certificate[] = [];
        const studentCertsStr = localStorage.getItem("semadiksi_registered_activities") || "[]";
        let studentCerts: any[] = [];
        try {
          studentCerts = JSON.parse(studentCertsStr);
        } catch (e) { }

        const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

        users.forEach((usr, idx) => {
          const code = `${certCode}-${idx + 1}`;
          newCertsList.push({
            id: `cert-${Date.now()}-${idx}`,
            userName: usr.name,
            activityTitle: certActivity,
            code: code,
            dateUploaded: todayStr
          });

          studentCerts.push({
            id: `act-cert-${Date.now()}-${idx}`,
            title: certActivity,
            category: "Pencapaian",
            organizer: "SEMADIKSI Panitia Pelaksana",
            date: todayStr,
            duration: "8 JP",
            status: "Selesai",
            code: code,
            img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            description: `Sertifikat resmi yang diberikan kepada ${usr.name} atas partisipasinya dalam kegiatan ${certActivity}.`
          });
        });

        const updated = [...newCertsList, ...certificates];
        setCertificates(updated);
        localStorage.setItem("semadiksi_certificates_admin", JSON.stringify(updated));
        localStorage.setItem("semadiksi_registered_activities", JSON.stringify(studentCerts));

        setUploadingCert(false);
        setCertCode(generateSerialCodeForActivity(certActivity));
        alert(`Berhasil menerbitkan sertifikat untuk seluruh ${users.length} mahasiswa pada kegiatan ${certActivity}!`);
      } else {
        const newCert: Certificate = {
          id: `cert-${Date.now()}`,
          userName: certUser,
          activityTitle: certActivity,
          code: certCode,
          dateUploaded: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        };

        const updated = [newCert, ...certificates];
        setCertificates(updated);
        localStorage.setItem("semadiksi_certificates_admin", JSON.stringify(updated));

        // Append to the student certificate registry in localStorage so the student sees it!
        try {
          const studentCerts = JSON.parse(localStorage.getItem("semadiksi_registered_activities") || "[]");
          studentCerts.push({
            id: `act-cert-${Date.now()}`,
            title: certActivity,
            category: "Pencapaian",
            organizer: "SEMADIKSI Panitia Pelaksana",
            date: newCert.dateUploaded,
            duration: "8 JP",
            status: "Selesai",
            code: certCode,
            img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            description: `Sertifikat resmi yang diberikan kepada ${certUser} atas partisipasinya dalam kegiatan ${certActivity}.`
          });
          localStorage.setItem("semadiksi_registered_activities", JSON.stringify(studentCerts));
        } catch (err) { }

        setUploadingCert(false);
        setCertCode(generateSerialCodeForActivity(certActivity));
        alert(`Sertifikat berhasil diterbitkan untuk ${certUser}!`);
      }
    }, 1200);
  };

  // --- VERIFICATION PORTAL LOGIC (Admin Tab) ---
  const handleAdminCertSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCertInput.trim()) return;

    const codeClean = adminCertInput.trim().toUpperCase();
    setAdminSearchedCode(codeClean);

    // List of valid certificates
    const defaultValidCerts = [
      {
        code: "CERT-LKMB-2024-0891",
        title: "Sertifikat Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
        author: "SEMADIKSI Divisi Keorganisasian",
        hash: "e566c805ba07b8c6869e1f37847d0287",
        date: "2024-11-16 09:12:05",
        signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Muhammad Fatih (Ketua Umum SEMADIKSI)"]
      },
      {
        code: "CERT-VOL-2024-1102",
        title: "Sertifikat Volunteer Mengajar Pesisir - SEMADIKSI Berbagi",
        author: "SEMADIKSI Divisi Pengabdian Masyarakat",
        hash: "8c7a6e112d88f6c99c5d01243170e881",
        date: "2024-10-13 14:35:10",
        signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Fauzi Rahmat (Ketua Divisi Pengabdian)"]
      },
      {
        code: "CERT-WD-2024-0345",
        title: "Sertifikat Workshop Web Development Modern dengan Next.js",
        author: "SEMADIKSI Divisi IPTEK & Humas",
        hash: "f566c805ba07b8c6869e1f37847d0345",
        date: "2024-09-05 16:40:02",
        signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Ferdian W. (Senior Frontend Engineer / Pemateri)"]
      }
    ];

    let found = defaultValidCerts.find(c => c.code === codeClean);
    if (found) {
      setAdminMatchedCert(found);
      setAdminCertValid(true);
      return;
    }

    // Check localStorage admin certs
    const storedCertsStr = localStorage.getItem("semadiksi_certificates_admin");
    if (storedCertsStr) {
      try {
        const storedCerts = JSON.parse(storedCertsStr);
        const adminCert = storedCerts.find((c: any) => c.code.toUpperCase() === codeClean);
        if (adminCert) {
          setAdminMatchedCert({
            code: adminCert.code,
            title: `Sertifikat Kegiatan: ${adminCert.activityTitle}`,
            author: "SEMADIKSI Panitia Pelaksana",
            hash: `h${adminCert.id.replace("cert-", "")}8e1f37847d0287`,
            date: `${adminCert.dateUploaded} 17:00:00`,
            signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Muhammad Fatih (Ketua Umum SEMADIKSI)"]
          });
          setAdminCertValid(true);
          return;
        }
      } catch (err) { }
    }

    setAdminMatchedCert(null);
    setAdminCertValid(false);
  };

  const handleAdminSimulateScan = () => {
    setAdminScanning(true);
    setTimeout(() => {
      const codes = ["CERT-LKMB-2024-0891", "CERT-VOL-2024-1102", "CERT-WD-2024-0345"];
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      setAdminCertInput(randomCode);
      setAdminScanning(false);

      // Auto trigger search
      setAdminSearchedCode(randomCode);
      const defaultValidCerts = [
        {
          code: "CERT-LKMB-2024-0891",
          title: "Sertifikat Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
          author: "SEMADIKSI Divisi Keorganisasian",
          hash: "e566c805ba07b8c6869e1f37847d0287",
          date: "2024-11-16 09:12:05",
          signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Muhammad Fatih (Ketua Umum SEMADIKSI)"]
        },
        {
          code: "CERT-VOL-2024-1102",
          title: "Sertifikat Volunteer Mengajar Pesisir - SEMADIKSI Berbagi",
          author: "SEMADIKSI Divisi Pengabdian Masyarakat",
          hash: "8c7a6e112d88f6c99c5d01243170e881",
          date: "2024-10-13 14:35:10",
          signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Fauzi Rahmat (Ketua Divisi Pengabdian)"]
        },
        {
          code: "CERT-WD-2024-0345",
          title: "Sertifikat Workshop Web Development Modern dengan Next.js",
          author: "SEMADIKSI Divisi IPTEK & Humas",
          hash: "f566c805ba07b8c6869e1f37847d0345",
          date: "2024-09-05 16:40:02",
          signatories: ["Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", "Ferdian W. (Senior Frontend Engineer / Pemateri)"]
        }
      ];
      setAdminMatchedCert(defaultValidCerts.find(c => c.code === randomCode) || null);
      setAdminCertValid(true);
    }, 2500);
  };

  // --- JUDGING LOGIC ---
  const handleScoreChange = (id: string, value: string) => {
    setTempScores({
      ...tempScores,
      [id]: value,
    });
  };

  const saveScore = (id: string) => {
    const rawScore = tempScores[id];
    if (rawScore === undefined || rawScore.trim() === "") {
      alert("Harap masukkan nilai terlebih dahulu!");
      return;
    }

    const scoreNum = parseInt(rawScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Nilai harus berupa angka di antara 0 - 100!");
      return;
    }

    const updated = submissions.map((sub) =>
      sub.id === id ? { ...sub, score: scoreNum } : sub
    );
    setSubmissions(updated);
    localStorage.setItem("semadiksi_submissions", JSON.stringify(updated));
    alert("Nilai dari juri berhasil disimpan!");
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary font-bold">Memuat Dashboard Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="w-full top-0 sticky shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] bg-surface flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-40">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[14px] font-bold">
            A
          </span>
          <span className="font-display text-lg font-extrabold text-primary">
            SEMADIKSI ADMIN PORTAL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-label-md text-label-md text-on-surface font-semibold hidden sm:inline">
            Administrator Utama
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-error-container/10 text-error hover:bg-error-container/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Navigation Drawer */}
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface shadow-md z-30 pt-20 flex flex-col justify-between border-r border-surface-variant/20 hidden lg:flex">
          <nav className="flex flex-col gap-1 px-2 overflow-y-auto">
            {[
              { id: "beranda", label: "Beranda", icon: "dashboard" },
              { id: "kegiatan", label: "CRUD Kegiatan", icon: "event_note" },
              { id: "antrean_kip", label: "Antrean KIP-K", icon: "assignment_turned_in" },
              { id: "berkas_kipk", label: "Berkas KIP-K", icon: "folder_shared" },
              { id: "berita_acara", label: "Berita Acara", icon: "newspaper" },
              { id: "info_beasiswa", label: "Info Beasiswa", icon: "school" },
              { id: "absensi_kegiatan", label: "Absensi Kegiatan", icon: "how_to_reg" },
              { id: "pengguna", label: "Kelola Pengguna", icon: "group_add" },
              { id: "sertifikat", label: "Upload Sertifikat", icon: "upload_file" },
              { id: "validasi_sertifikat", label: "Validasi Sertifikat", icon: "qr_code_scanner" },
              { id: "bobot", label: "Bobot Persentase", icon: "percent" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 flex items-center gap-3.5 rounded-full transition-all active:scale-98 duration-150 cursor-pointer text-left ${activeTab === tab.id
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span className="font-label-md text-xs">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-surface-variant/30 text-center text-[10px] text-outline">
            SEMADIKSI Admin Panel v1.0
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-grow lg:ml-64 bg-background min-h-screen p-6 md:p-8 space-y-md relative overflow-hidden pb-12">
          {/* Mobile Navigation bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-surface-variant/30 lg:hidden scrollbar-none mb-4">
            {[
              { id: "beranda", label: "Beranda", icon: "dashboard" },
              { id: "kegiatan", label: "Kegiatan", icon: "event_note" },
              { id: "antrean_kip", label: "Antrean", icon: "assignment_turned_in" },
              { id: "berkas_kipk", label: "Berkas", icon: "folder_shared" },
              { id: "berita_acara", label: "Berita", icon: "newspaper" },
              { id: "info_beasiswa", label: "Beasiswa", icon: "school" },
              { id: "absensi_kegiatan", label: "Absensi", icon: "how_to_reg" },
              { id: "pengguna", label: "Pengguna", icon: "group_add" },
              { id: "sertifikat", label: "Sertifikat", icon: "upload_file" },
              { id: "validasi_sertifikat", label: "Validasi", icon: "qr_code_scanner" },
              { id: "bobot", label: "Bobot", icon: "percent" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${activeTab === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container-high text-on-surface-variant"
                  }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 0: BERANDA */}
          {activeTab === "beranda" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Welcome Banner */}
              <div className="bg-primary-container/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="z-10 space-y-1">
                  <h2 className="font-display text-2xl font-extrabold text-primary">Selamat Datang di Portal Admin SEMADIKSI</h2>
                  <p className="text-sm text-on-surface-variant">Anda masuk sebagai Administrator Utama. Berikut ringkasan portal hari ini.</p>
                </div>
                <div className="z-10 px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full">
                  Sesi Aktif
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-primary text-3xl">groups</span>
                  <p className="text-[10px] text-outline uppercase font-semibold mt-2">Total Mahasiswa</p>
                  <h3 className="text-xl font-bold text-on-surface mt-1">{users.length} Orang</h3>
                </div>
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-tertiary text-3xl">verified</span>
                  <p className="text-[10px] text-outline uppercase font-semibold mt-2">Terverifikasi KIP UNUSA</p>
                  <h3 className="text-xl font-bold text-on-surface mt-1">
                    {users.filter(u => u.kipStatus === "KIP UNUSA" && u.verificationStatus === "Verified").length} Orang
                  </h3>
                </div>
                <div
                  onClick={() => setActiveTab("berkas_kipk")}
                  className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  title="Buka Menu Berkas KIP-K"
                >
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">folder_shared</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                      {kipkDocs.filter(d => d.status === "Menunggu Review").length} Pending
                    </span>
                  </div>
                  <p className="text-[10px] text-outline uppercase font-semibold mt-2">Berkas KIP-K Masuk</p>
                  <h3 className="text-xl font-bold text-on-surface mt-1">{kipkDocs.length} Dokumen</h3>
                </div>
                <div
                  onClick={() => setActiveTab("kegiatan")}
                  className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  title="Lihat Manajemen Kegiatan"
                >
                  <span className="material-symbols-outlined text-outline text-3xl">folder_open</span>
                  <p className="text-[10px] text-outline uppercase font-semibold mt-2">Karya & Unggahan</p>
                  <h3 className="text-xl font-bold text-on-surface mt-1">{submissions.length} Berkas / Kelompok</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending KIP UNUSA Validations Queue Widget */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-on-surface">Antrean Validasi KIP UNUSA</h3>
                    <span className="px-2.5 py-1 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 text-xs font-bold rounded-full">
                      {users.filter(u => u.kipStatus === "KIP UNUSA" && u.verificationStatus === "Pending").length} Tertunda
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm space-y-4">
                    {users.filter(u => u.kipStatus === "KIP UNUSA" && u.verificationStatus === "Pending").length > 0 ? (
                      <div className="divide-y divide-surface-variant/20">
                        {users.filter(u => u.kipStatus === "KIP UNUSA" && u.verificationStatus === "Pending").slice(0, 3).map((usr) => (
                          <div key={usr.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                              <p className="font-bold text-sm text-on-surface">{usr.name}</p>
                              <p className="text-xs text-on-surface-variant">
                                {usr.email} • {usr.university}
                                {usr.nim ? ` • NIM: ${usr.nim}` : ""}
                                {usr.yearOfEntry ? ` • Angkatan: ${usr.yearOfEntry}` : ""}
                              </p>
                              <button
                                onClick={() => {
                                  const matchedDoc = kipkDocs.find(d => d.userId === usr.id || d.userName === usr.name);
                                  if (matchedDoc) {
                                    openDocValidationModal(matchedDoc);
                                  } else {
                                    openDocValidationModal({
                                      id: `doc-gen-${usr.id}`,
                                      userId: usr.id,
                                      userName: usr.name,
                                      userEmail: usr.email,
                                      userNim: usr.nim || "-",
                                      userUniversity: usr.university,
                                      userYearOfEntry: usr.yearOfEntry || "2024",
                                      category: "Kartu KIP-K",
                                      title: `Dokumen Bukti Penerima KIP-K UNUSA - ${usr.name}`,
                                      fileName: usr.kipDocName || `Kartu_KIP_${usr.name.replace(/\s+/g, "_")}.pdf`,
                                      fileSize: "1.8 MB",
                                      fileType: "pdf",
                                      uploadedAt: "Hari ini",
                                      uploadedBy: "Mahasiswa",
                                      status: "Menunggu Review",
                                      score: 85,
                                      notes: "Menunggu review berkas KIP-K oleh Admin."
                                    });
                                  }
                                }}
                                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">visibility</span> Lihat & Validasi Berkas KIP UNUSA
                              </button>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => validateKipUser(usr.id, "Verified")}
                                className="px-3.5 py-2 bg-primary text-on-primary hover:brightness-110 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-sm"
                              >
                                Setujui KIP UNUSA
                              </button>
                              <button
                                onClick={() => validateKipUser(usr.id, "Rejected")}
                                className="px-3.5 py-2 bg-error text-on-error hover:brightness-110 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-sm"
                              >
                                Tolak KIP UNUSA
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-primary text-4xl mb-2">done_all</span>
                        <p className="text-sm font-bold text-on-surface-variant">Antrean Bersih!</p>
                        <p className="text-xs text-outline mt-0.5">Semua permohonan status KIP UNUSA mahasiswa telah divalidasi.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="font-bold text-lg text-on-surface">Aksi Cepat</h3>
                  <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
                    <button
                      onClick={() => openAdminUploadDocModal()}
                      className="w-full flex items-center gap-3 p-3 bg-surface hover:bg-surface-variant/20 rounded-xl transition-all cursor-pointer text-left border border-surface-variant/10 group"
                    >
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">upload_file</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Upload Berkas Mahasiswa</p>
                        <p className="text-[10px] text-outline">Unggah & validasi dokumen KIP-K</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("berkas_kipk")}
                      className="w-full flex items-center gap-3 p-3 bg-surface hover:bg-surface-variant/20 rounded-xl transition-all cursor-pointer text-left border border-surface-variant/10 group"
                    >
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">folder_shared</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Kelola Berkas KIP-K</p>
                        <p className="text-[10px] text-outline">Tinjau, nilai, & validasi dokumen</p>
                      </div>
                    </button>
                    <button
                      onClick={() => openActivityModal(null)}
                      className="w-full flex items-center gap-3 p-3 bg-surface hover:bg-surface-variant/20 rounded-xl transition-all cursor-pointer text-left border border-surface-variant/10"
                    >
                      <span className="material-symbols-outlined text-primary">add_circle</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Tambah Kegiatan</p>
                        <p className="text-[10px] text-outline">Publikasikan agenda beasiswa</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("sertifikat");
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-surface hover:bg-surface-variant/20 rounded-xl transition-all cursor-pointer text-left border border-surface-variant/10"
                    >
                      <span className="material-symbols-outlined text-primary">verified</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Terbitkan Sertifikat</p>
                        <p className="text-[10px] text-outline">Kirim e-sertifikat ke mahasiswa</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CRUD KEGIATAN */}
          {activeTab === "kegiatan" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface">Manajemen Kegiatan</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Buat, edit, dan hapus kegiatan atau agenda beasiswa.</p>
                </div>
                <button
                  onClick={() => openActivityModal(null)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4 w-20">Gambar</th>
                      <th className="p-4">Nama Kegiatan</th>
                      <th className="p-4 w-32">Kategori</th>
                      <th className="p-4 w-40">Tanggal</th>
                      <th className="p-4 w-32">Biaya</th>
                      <th className="p-4 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-sm">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4">
                          <img className="w-12 h-12 object-cover rounded-lg shadow-sm" alt={act.title} src={act.img} />
                        </td>
                        <td className="p-4 font-bold text-on-surface">
                          {act.title}
                          {act.latest && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">Terbaru</span>}
                          {act.closed && <span className="ml-2 px-2 py-0.5 bg-surface-variant text-outline text-[10px] rounded-full font-bold">Tutup</span>}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant">
                            {act.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-on-surface-variant">{act.date}</td>
                        <td className="p-4 font-bold text-primary">{act.price}</td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-1">
                            {act.enableSeatBooking && (
                              <button
                                onClick={() => openSeatBookingDetailsModal(act)}
                                className="p-2 hover:bg-secondary-container/10 text-secondary rounded-lg transition-colors cursor-pointer"
                                title="Lihat Booking Kursi"
                              >
                                <span className="material-symbols-outlined text-[18px]">event_seat</span>
                              </button>
                            )}
                            {(act.category === "Lomba" || act.requireFileUpload) && (
                              <button
                                onClick={() => openActivityUploadsModal(act)}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${act.category === "Lomba"
                                  ? "hover:bg-amber-500/10 text-amber-600"
                                  : "hover:bg-tertiary-container/10 text-tertiary"
                                  }`}
                                title={act.category === "Lomba" ? "Penjurian & Penilaian Karya Lomba" : "Lihat Dokumen Unggahan Peserta"}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {act.category === "Lomba" ? "gavel" : "folder_open"}
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCertActivity(act.title);
                                setCertCode(generateSerialCodeForActivity(act.title));
                                setActiveTab("sertifikat");
                              }}
                              className="p-2 hover:bg-emerald-500/10 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Terbitkan Sertifikat untuk Kegiatan Ini"
                            >
                              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                            </button>
                            <button
                              onClick={() => openActivityModal(act)}
                              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => deleteActivity(act.id)}
                              className="p-2 hover:bg-error-container/10 text-error rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ANTREAN DEDIKASI KIP-K */}
          {activeTab === "antrean_kip" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface">Antrean Validasi KIP-K</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Tinjau berkas beasiswa KIP-K mahasiswa dan ubah status verifikasinya.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                  <div className="flex gap-2 text-xs font-bold bg-surface-container rounded-xl p-1 shrink-0">
                    {(["Pending", "Verified", "Rejected", "Semua"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setKipStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${kipStatusFilter === filter
                          ? "bg-primary text-white"
                          : "text-on-surface-variant hover:bg-surface-variant/20"
                          }`}
                      >
                        {filter === "Pending" ? "Antrean" : filter}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={exportKipToExcel}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Ekspor Excel</span>
                  </button>
                </div>
              </div>

              {/* Search Widget */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama mahasiswa, email, atau asal universitas..."
                    value={kipSearchQuery}
                    onChange={(e) => setKipSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"
                  />
                </div>
              </div>

              {/* Applicants List Grid */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4">Nama Mahasiswa</th>
                      <th className="p-4 w-28 text-center">No. Antrean</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">NIM</th>
                      <th className="p-4">Angkatan</th>
                      <th className="p-4">Universitas</th>
                      <th className="p-4 w-32 text-center">Status Verifikasi</th>
                      <th className="p-4 w-48 text-center">Berkas Pendukung</th>
                      <th className="p-4 w-44 text-center">Aksi Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-sm">
                    {users
                      .filter((usr) => usr.kipStatus === "KIP UNUSA")
                      .filter((usr) => {
                        // Status filter
                        if (kipStatusFilter !== "Semua" && usr.verificationStatus !== kipStatusFilter) {
                          return false;
                        }
                        // Search filter
                        if (kipSearchQuery.trim() !== "") {
                          const query = kipSearchQuery.toLowerCase();
                          return (
                            usr.name.toLowerCase().includes(query) ||
                            usr.email.toLowerCase().includes(query) ||
                            usr.university.toLowerCase().includes(query) ||
                            (usr.nim && usr.nim.toLowerCase().includes(query)) ||
                            (usr.queueNumber && usr.queueNumber.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      }).length > 0 ? (
                      users
                        .filter((usr) => usr.kipStatus === "KIP UNUSA")
                        .filter((usr) => {
                          if (kipStatusFilter !== "Semua" && usr.verificationStatus !== kipStatusFilter) {
                            return false;
                          }
                          if (kipSearchQuery.trim() !== "") {
                            const query = kipSearchQuery.toLowerCase();
                            return (
                              usr.name.toLowerCase().includes(query) ||
                              usr.email.toLowerCase().includes(query) ||
                              usr.university.toLowerCase().includes(query) ||
                              (usr.nim && usr.nim.toLowerCase().includes(query)) ||
                              (usr.queueNumber && usr.queueNumber.toLowerCase().includes(query))
                            );
                          }
                          return true;
                        })
                        .map((usr) => (
                          <tr key={usr.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="p-4 font-bold text-on-surface">{usr.name}</td>
                            <td className="p-4 text-center">
                              {usr.queueNumber ? (
                                <span className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-black tracking-wide shadow-sm border border-primary/10">
                                  {usr.queueNumber}
                                </span>
                              ) : (
                                <span className="text-outline text-xs italic">Belum Ambil</span>
                              )}
                            </td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.email}</td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.nim || "-"}</td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.yearOfEntry || "-"}</td>
                            <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.university}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${usr.verificationStatus === "Verified" ? "bg-primary-container/10 text-primary" :
                                usr.verificationStatus === "Pending" ? "bg-secondary-container/20 text-on-secondary-container" :
                                  "bg-error-container/10 text-error"
                                }`}>
                                {usr.verificationStatus}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  const matchedDoc = kipkDocs.find(d => d.userId === usr.id || d.userName === usr.name);
                                  if (matchedDoc) {
                                    openDocValidationModal(matchedDoc);
                                  } else {
                                    openDocValidationModal({
                                      id: `doc-gen-${usr.id}`,
                                      userId: usr.id,
                                      userName: usr.name,
                                      userEmail: usr.email,
                                      userNim: usr.nim || "-",
                                      userUniversity: usr.university,
                                      userYearOfEntry: usr.yearOfEntry || "2024",
                                      category: "Kartu KIP-K",
                                      title: `Dokumen Bukti Penerima KIP-K UNUSA - ${usr.name}`,
                                      fileName: usr.kipDocName || `Kartu_KIP_${usr.name.replace(/\s+/g, "_")}.pdf`,
                                      fileSize: "1.8 MB",
                                      fileType: "pdf",
                                      uploadedAt: "Hari ini",
                                      uploadedBy: "Mahasiswa",
                                      status: "Menunggu Review",
                                      score: 85,
                                      notes: "Menunggu review berkas KIP-K oleh Admin."
                                    });
                                  }
                                }}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 mx-auto cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                <span>Lihat Berkas (PDF)</span>
                              </button>
                            </td>
                            <td className="p-4">
                              {usr.verificationStatus === "Pending" ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => validateKipUser(usr.id, "Verified")}
                                    className="px-3.5 py-1.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                                  >
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => validateKipUser(usr.id, "Rejected")}
                                    className="px-3.5 py-1.5 bg-error text-on-error text-[10px] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                                  >
                                    Tolak
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => validateKipUser(usr.id, usr.verificationStatus === "Verified" ? "Rejected" : "Verified")}
                                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-surface-variant/20"
                                  >
                                    Ubah Status
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-outline italic">
                          Tidak ada antrean validasi KIP-K yang cocok dengan pencarian / filter Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2.5: BERKAS KIP-K UNUSA MAHASISWA */}
          {activeTab === "berkas_kipk" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Main Actions */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">folder_shared</span>
                    <span>Validasi & Berkas KIP-K UNUSA</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Tinjau dokumen laporan keaktifan & administrasi beasiswa KIP-K mahasiswa, berikan skor penilaian kelayakan, atau unggah berkas baru.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => openAdminUploadDocModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Upload Berkas Mahasiswa</span>
                  </button>

                  <button
                    onClick={exportKipkDocsToExcel}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    title="Ekspor Rekapitulasi Berkas KIP-K ke file Excel (.xls)"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Ekspor Excel (.xls)</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">description</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Berkas</p>
                    <h3 className="text-lg font-black text-on-surface mt-0.5">{kipkDocs.length} Dokumen</h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">hourglass_top</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Perlu Review</p>
                    <h3 className="text-lg font-black text-amber-600 mt-0.5">
                      {kipkDocs.filter(d => d.status === "Menunggu Review").length} Dokumen
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">task_alt</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Disetujui</p>
                    <h3 className="text-lg font-black text-primary mt-0.5">
                      {kipkDocs.filter(d => d.status === "Disetujui").length} Dokumen
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-2xl">error_outline</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Perlu Perbaikan</p>
                    <h3 className="text-lg font-black text-error mt-0.5">
                      {kipkDocs.filter(d => d.status === "Perlu Perbaikan").length} Dokumen
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">grade</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Rata-rata Skor</p>
                    <h3 className="text-lg font-black text-indigo-600 mt-0.5">
                      {kipkDocs.length > 0
                        ? Math.round(kipkDocs.reduce((a, b) => a + (b.score || 0), 0) / kipkDocs.length)
                        : 0}%
                    </h3>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                {/* Search box */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama mahasiswa, NIM, judul berkas, atau nama file..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                  />
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {/* Filter Category, Status & View Mode */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Dropdown */}
                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
                  >
                    <option value="Semua">📁 Semua Kategori</option>
                    <option value="Kartu KIP-K">Kartu KIP-K</option>
                    <option value="SKTM">SKTM</option>
                    <option value="Keaktifan Ormawa">Keaktifan Ormawa</option>
                    <option value="Kegiatan Webinar Soft Skill">Webinar Soft Skill</option>
                    <option value="Keikutsertaan Kompetisi">Keikutsertaan Kompetisi</option>
                    <option value="Kegiatan Semadiksi">Kegiatan Semadiksi</option>
                    <option value="KHS / Transkrip">KHS / Transkrip</option>
                    <option value="Dokumen Tambahan">Dokumen Tambahan</option>
                  </select>

                  {/* Status Pills */}
                  <div className="flex gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
                    {(["Semua", "Menunggu Review", "Disetujui", "Perlu Perbaikan"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setDocStatusFilter(st)}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] ${docStatusFilter === st
                          ? "bg-primary text-white shadow-sm font-bold"
                          : "text-on-surface-variant hover:bg-surface-variant/20"
                          }`}
                      >
                        {st === "Menunggu Review" ? "Pending" : st}
                      </button>
                    ))}
                  </div>

                  {/* View Mode Toggle: Grouped vs Flat */}
                  <div className="flex gap-1 bg-surface-container-high p-1 rounded-xl border border-surface-variant/20">
                    <button
                      type="button"
                      onClick={() => setDocViewMode("grouped")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${docViewMode === "grouped"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-variant/20"
                        }`}
                      title="Tampilkan 1 baris per mahasiswa dan buka semua unggahannya"
                    >
                      <span className="material-symbols-outlined text-[15px]">group</span>
                      <span>Per Mahasiswa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocViewMode("flat")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${docViewMode === "flat"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-variant/20"
                        }`}
                      title="Tampilkan daftar seluruh berkas secara rinci"
                    >
                      <span className="material-symbols-outlined text-[15px]">view_list</span>
                      <span>Semua Berkas</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of Documents / Students */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                {(() => {
                  const filteredDocs = kipkDocs.filter((doc) => {
                    // Category filter
                    if (docCategoryFilter !== "Semua" && doc.category !== docCategoryFilter) {
                      return false;
                    }
                    // Status filter
                    if (docStatusFilter !== "Semua" && doc.status !== docStatusFilter) {
                      return false;
                    }
                    // Search query
                    if (docSearchQuery.trim() !== "") {
                      const q = docSearchQuery.toLowerCase();
                      return (
                        doc.userName.toLowerCase().includes(q) ||
                        doc.userNim.toLowerCase().includes(q) ||
                        doc.userEmail.toLowerCase().includes(q) ||
                        doc.title.toLowerCase().includes(q) ||
                        doc.fileName.toLowerCase().includes(q) ||
                        doc.category.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  });

                  const categoryColorMap: { [key: string]: string } = {
                    "Kartu KIP-K": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
                    "SKTM": "bg-amber-500/10 text-amber-700 border-amber-200",
                    "Keaktifan Ormawa": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                    "Kegiatan Webinar Soft Skill": "bg-sky-500/10 text-sky-700 border-sky-200",
                    "Keikutsertaan Kompetisi": "bg-purple-500/10 text-purple-700 border-purple-200",
                    "Kegiatan Semadiksi": "bg-primary/10 text-primary border-primary/20",
                    "KHS / Transkrip": "bg-blue-500/10 text-blue-700 border-blue-200",
                    "Dokumen Tambahan": "bg-stone-500/10 text-stone-700 border-stone-200"
                  };

                  if (filteredDocs.length === 0) {
                    return (
                      <div className="text-center py-16 text-outline">
                        <span className="material-symbols-outlined text-5xl block mb-2 text-outline/40">folder_off</span>
                        <p className="font-bold text-sm text-on-surface">Tidak ada berkas KIP-K yang cocok dengan filter atau pencarian Anda.</p>
                        <p className="text-xs text-outline mt-1">Silakan sesuaikan kata kunci atau gunakan tombol "Upload Berkas Mahasiswa" di atas.</p>
                      </div>
                    );
                  }

                  // 1. GROUPED VIEW: 1 BARIS PER MAHASISWA (DEFAULT)
                  if (docViewMode === "grouped") {
                    const studentMap = new Map<string, {
                      userName: string;
                      userNim: string;
                      userEmail: string;
                      userUniversity: string;
                      userYearOfEntry?: string;
                      userId?: string;
                      documents: KipkDocument[];
                      totalScoreAvg: number;
                      hasPending: boolean;
                      hasRevision: boolean;
                      allApproved: boolean;
                      latestUpload: string;
                    }>();

                    filteredDocs.forEach((doc) => {
                      const key = (doc.userName || "Mahasiswa").trim();
                      if (!studentMap.has(key)) {
                        studentMap.set(key, {
                          userName: doc.userName,
                          userNim: doc.userNim || "-",
                          userEmail: doc.userEmail || "",
                          userUniversity: doc.userUniversity || "Universitas Nahdlatul Ulama Surabaya",
                          userYearOfEntry: doc.userYearOfEntry || "2024",
                          userId: doc.userId,
                          documents: [],
                          totalScoreAvg: 0,
                          hasPending: false,
                          hasRevision: false,
                          allApproved: true,
                          latestUpload: doc.uploadedAt
                        });
                      }
                      const grp = studentMap.get(key)!;
                      grp.documents.push(doc);
                    });

                    const studentGroups = Array.from(studentMap.values()).map((g) => {
                      const totalScore = g.documents.reduce((acc, d) => acc + (d.score || 0), 0);
                      const avg = g.documents.length > 0 ? Math.round(totalScore / g.documents.length) : 0;
                      const hasPending = g.documents.some(d => d.status === "Menunggu Review");
                      const hasRevision = g.documents.some(d => d.status === "Perlu Perbaikan");
                      const allApproved = g.documents.every(d => d.status === "Disetujui");
                      return {
                        ...g,
                        totalScoreAvg: avg,
                        hasPending,
                        hasRevision,
                        allApproved
                      };
                    });

                    return (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                            <th className="p-4 w-72">Mahasiswa KIP-K</th>
                            <th className="p-4">Berkas Terunggah</th>
                            <th className="p-4 w-48 text-center">Status Kelayakan</th>
                            <th className="p-4 w-32 text-center">Rata-rata Skor</th>
                            <th className="p-4 w-36">Unggahan Terakhir</th>
                            <th className="p-4 w-60 text-center">Aksi Berkas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant/20 text-xs">
                          {studentGroups.map((student) => {
                            const isExpanded = expandedStudentRows.includes(student.userName);
                            const pendingCount = student.documents.filter(d => d.status === "Menunggu Review").length;
                            const revisionCount = student.documents.filter(d => d.status === "Perlu Perbaikan").length;
                            const approvedCount = student.documents.filter(d => d.status === "Disetujui").length;

                            // Distinct categories
                            const distinctCategories = Array.from(new Set(student.documents.map(d => d.category)));

                            return (
                              <Fragment key={student.userName}>
                                <tr className={`hover:bg-surface-container-low/40 transition-colors ${isExpanded ? "bg-surface-container-low/50" : ""}`}>
                                  {/* Mahasiswa Info */}
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                        {student.userName.charAt(0)}
                                      </div>
                                      <div className="space-y-0.5 min-w-0">
                                        <p className="font-bold text-on-surface text-sm truncate flex items-center gap-1.5">
                                          <span>{student.userName}</span>
                                          <span className="px-1.5 py-0.2 bg-primary/10 text-primary rounded text-[9px] font-black">KIP-K</span>
                                        </p>
                                        <p className="text-[11px] text-on-surface-variant font-mono">
                                          NIM: {student.userNim} {student.userYearOfEntry ? `• Angkatan ${student.userYearOfEntry}` : ""}
                                        </p>
                                        <p className="text-[10px] text-outline truncate">{student.userUniversity}</p>
                                        <p className="text-[10px] text-outline font-sans truncate">{student.userEmail}</p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Uploaded Documents Badges & Categories */}
                                  <td className="p-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 bg-primary/15 text-primary text-[11px] font-extrabold rounded-full border border-primary/20 flex items-center gap-1 shadow-2xs">
                                          <span className="material-symbols-outlined text-[13px]">folder</span>
                                          <span>{student.documents.length} Dokumen Terunggah</span>
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {distinctCategories.map((cat) => (
                                          <span
                                            key={cat}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryColorMap[cat] || "bg-surface-container text-on-surface"}`}
                                          >
                                            {cat}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Status Kelayakan / Progress */}
                                  <td className="p-4 text-center">
                                    {student.allApproved ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[11px] font-bold shadow-2xs">
                                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                        <span>Lengkap ({approvedCount}/{student.documents.length})</span>
                                      </span>
                                    ) : student.hasRevision ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 border border-error/20 text-error rounded-full text-[11px] font-bold shadow-2xs">
                                        <span className="material-symbols-outlined text-[13px]">warning</span>
                                        <span>{revisionCount} Perlu Perbaikan</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full text-[11px] font-bold shadow-2xs">
                                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                                        <span>{pendingCount} Menunggu Review</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Average Score */}
                                  <td className="p-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className={`font-black text-sm ${student.allApproved ? "text-primary" : student.hasRevision ? "text-error" : "text-amber-600"}`}>
                                        {student.totalScoreAvg}%
                                      </span>
                                      <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${student.allApproved ? "bg-primary" : student.hasRevision ? "bg-error" : "bg-amber-500"}`}
                                          style={{ width: `${student.totalScoreAvg}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Latest Upload Timestamp */}
                                  <td className="p-4 text-[11px] text-on-surface-variant font-medium">
                                    {student.latestUpload}
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="p-4">
                                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => openStudentDocsModal(student)}
                                        className="px-3 py-1.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                                        title={`Buka & periksa ${student.documents.length} berkas ${student.userName}`}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">folder_open</span>
                                        <span>Lihat Berkas ({student.documents.length})</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => toggleExpandStudentRow(student.userName)}
                                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${isExpanded
                                          ? "bg-surface-variant text-on-surface border-surface-variant"
                                          : "bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant border-surface-variant/20"
                                          }`}
                                        title={isExpanded ? "Tutup detail berkas baris" : "Buka detail berkas langsung di tabel"}
                                      >
                                        <span className="material-symbols-outlined text-[16px]">
                                          {isExpanded ? "expand_less" : "expand_more"}
                                        </span>
                                      </button>

                                      {student.hasPending && (
                                        <button
                                          type="button"
                                          onClick={() => approveAllDocsForStudent(student.userName)}
                                          className="p-1.5 hover:bg-primary/15 text-primary rounded-xl transition-colors cursor-pointer"
                                          title={`Setujui langsung semua berkas ${student.userName}`}
                                        >
                                          <span className="material-symbols-outlined text-[16px]">done_all</span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {/* INLINE EXPANDED SUB-TABLE FOR STUDENT'S DOCUMENTS */}
                                {isExpanded && (
                                  <tr className="bg-surface-container-lowest/80 border-y-2 border-primary/20">
                                    <td colSpan={6} className="p-4">
                                      <div className="bg-surface-container-low rounded-2xl border border-surface-variant/30 p-4 space-y-3 shadow-inner">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-variant/20 pb-2.5">
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[18px]">attachment</span>
                                            <h4 className="font-bold text-xs text-on-surface">
                                              Daftar Seluruh Berkas Unggahan: <strong className="text-primary">{student.userName}</strong> ({student.documents.length} Berkas)
                                            </h4>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => openAdminUploadDocModal(student.userName)}
                                              className="px-2.5 py-1 bg-primary text-on-primary hover:brightness-110 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                                            >
                                              <span className="material-symbols-outlined text-[12px]">add</span>
                                              <span>Upload Berkas untuk Mahasiswa Ini</span>
                                            </button>

                                            {student.hasPending && (
                                              <button
                                                type="button"
                                                onClick={() => approveAllDocsForStudent(student.userName)}
                                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                                              >
                                                <span className="material-symbols-outlined text-[12px]">check</span>
                                                <span>Setujui Semua Berkas</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse">
                                            <thead>
                                              <tr className="border-b border-surface-variant/20 text-outline text-[10px] uppercase font-bold">
                                                <th className="pb-2 w-8">No</th>
                                                <th className="pb-2">Kategori & Judul Berkas</th>
                                                <th className="pb-2 w-48">Lampiran File</th>
                                                <th className="pb-2 w-28">Waktu Unggah</th>
                                                <th className="pb-2 w-20 text-center">Skor</th>
                                                <th className="pb-2 w-28 text-center">Status</th>
                                                <th className="pb-2">Catatan Admin</th>
                                                <th className="pb-2 w-28 text-center">Aksi</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-variant/15 text-[11px]">
                                              {student.documents.map((doc, dIdx) => (
                                                <tr key={doc.id} className="hover:bg-white transition-colors">
                                                  <td className="py-2.5 font-bold text-outline">{dIdx + 1}</td>
                                                  <td className="py-2.5">
                                                    <div className="space-y-0.5">
                                                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${categoryColorMap[doc.category] || "bg-surface-container"}`}>
                                                        {doc.category}
                                                      </span>
                                                      <p className="font-semibold text-on-surface">{doc.title}</p>
                                                    </div>
                                                  </td>
                                                  <td className="py-2.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => openDocValidationModal(doc)}
                                                      className="flex items-center gap-1 text-primary hover:underline font-bold truncate max-w-[180px] cursor-pointer"
                                                      title="Klik untuk membuka pratinjau & validasi berkas"
                                                    >
                                                      <span className="material-symbols-outlined text-[14px]">
                                                        {doc.fileType === "image" ? "image" : "picture_as_pdf"}
                                                      </span>
                                                      <span className="truncate">{doc.fileName}</span>
                                                    </button>
                                                  </td>
                                                  <td className="py-2.5 text-outline text-[10px]">{doc.uploadedAt}</td>
                                                  <td className="py-2.5 text-center font-bold text-primary">{doc.score}%</td>
                                                  <td className="py-2.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${doc.status === "Disetujui"
                                                      ? "bg-primary/10 text-primary border-primary/20"
                                                      : doc.status === "Perlu Perbaikan"
                                                        ? "bg-error/10 text-error border-error/20"
                                                        : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                                      }`}>
                                                      {doc.status}
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 text-outline text-[10px] max-w-[150px] truncate" title={doc.notes || ""}>
                                                    {doc.notes || "-"}
                                                  </td>
                                                  <td className="py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                      <button
                                                        type="button"
                                                        onClick={() => openDocValidationModal(doc)}
                                                        className="px-2 py-1 bg-primary text-on-primary rounded text-[9px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-2xs"
                                                      >
                                                        Validasi
                                                      </button>
                                                      {doc.status !== "Disetujui" && (
                                                        <button
                                                          type="button"
                                                          onClick={() => quickApproveDoc(doc.id, doc.title, doc.userName)}
                                                          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer"
                                                          title="Setujui Berkas"
                                                        >
                                                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        </button>
                                                      )}
                                                      <button
                                                        type="button"
                                                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                                        className="p-1 text-error hover:bg-error-container/20 rounded transition-colors cursor-pointer"
                                                        title="Hapus Berkas"
                                                      >
                                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  }

                  // 2. FLAT VIEW: DETAIL SETIAP BERKAS
                  return (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                          <th className="p-4 w-60">Mahasiswa</th>
                          <th className="p-4">Kategori & Judul Berkas</th>
                          <th className="p-4 w-52">Lampiran Berkas</th>
                          <th className="p-4 w-32">Waktu Unggah</th>
                          <th className="p-4 w-28 text-center">Skor</th>
                          <th className="p-4 w-36 text-center">Status</th>
                          <th className="p-4">Catatan Admin</th>
                          <th className="p-4 w-32 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant/20 text-xs">
                        {filteredDocs.map((doc) => {
                          const isApproved = doc.status === "Disetujui";
                          const isPending = doc.status === "Menunggu Review";
                          const isRevision = doc.status === "Perlu Perbaikan";

                          return (
                            <tr key={doc.id} className="hover:bg-surface-container-low/40 transition-colors">
                              {/* Mahasiswa Info */}
                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                    {doc.userName.charAt(0)}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="font-bold text-on-surface text-sm truncate">{doc.userName}</p>
                                    <p className="text-[11px] text-on-surface-variant font-mono">
                                      {doc.userNim ? `NIM: ${doc.userNim}` : doc.userEmail}
                                    </p>
                                    <p className="text-[10px] text-outline truncate">{doc.userUniversity}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Category & Title */}
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryColorMap[doc.category] || "bg-surface-container text-on-surface"}`}>
                                      {doc.category}
                                    </span>
                                    {doc.uploadedBy === "Admin" && (
                                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-extrabold">
                                        Input Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-semibold text-on-surface text-xs">{doc.title}</p>
                                </div>
                              </td>

                              {/* File Attachment */}
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => openDocValidationModal(doc)}
                                  className="flex items-center gap-1.5 p-2 bg-surface hover:bg-surface-container rounded-xl border border-surface-variant/20 text-left transition-all cursor-pointer group max-w-[200px]"
                                  title="Klik untuk membuka pratinjau dokumen"
                                >
                                  <span className={`material-symbols-outlined text-[20px] shrink-0 ${doc.fileType === "image" ? "text-amber-600" : "text-primary"}`}>
                                    {doc.fileType === "image" ? "image" : "picture_as_pdf"}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-primary truncate group-hover:underline">
                                      {doc.fileName}
                                    </p>
                                    <p className="text-[9px] text-outline">{doc.fileSize || "1.5 MB"}</p>
                                  </div>
                                </button>
                              </td>

                              {/* Upload Time */}
                              <td className="p-4 text-[11px] text-on-surface-variant font-medium">
                                {doc.uploadedAt}
                              </td>

                              {/* Score */}
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`font-black text-sm ${isApproved ? "text-primary" : isRevision ? "text-error" : "text-amber-600"}`}>
                                    {doc.score}%
                                  </span>
                                  <div className="w-14 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${isApproved ? "bg-primary" : isRevision ? "bg-error" : "bg-amber-500"}`}
                                      style={{ width: `${doc.score}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="p-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isApproved
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : isRevision
                                      ? "bg-error/10 border-error/20 text-error"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {isApproved ? "check_circle" : isRevision ? "cancel" : "schedule"}
                                  </span>
                                  <span>{doc.status}</span>
                                </span>
                              </td>

                              {/* Notes */}
                              <td className="p-4 text-on-surface-variant text-[11px] max-w-[200px]">
                                {doc.notes ? (
                                  <span className="line-clamp-2" title={doc.notes}>
                                    {doc.notes}
                                  </span>
                                ) : (
                                  <span className="text-outline italic">Belum ada catatan</span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openDocValidationModal(doc)}
                                    className="px-2.5 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                    title="Validasi & Pratinjau Dokumen"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">rate_review</span>
                                    <span>Validasi</span>
                                  </button>

                                  {!isApproved && (
                                    <button
                                      type="button"
                                      onClick={() => quickApproveDoc(doc.id, doc.title, doc.userName)}
                                      className="p-1.5 hover:bg-primary/15 text-primary rounded-lg transition-colors cursor-pointer"
                                      title="Langsung Setujui Berkas"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                    className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors cursor-pointer"
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
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 2.6: BERITA ACARA KEGIATAN */}
          {activeTab === "berita_acara" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Main Actions */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">newspaper</span>
                    <span>Berita Acara & Publikasi Kegiatan</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Kelola arsip berita acara resmi, notulensi kegiatan selesai, dan publikasi agenda kegiatan mahasiswa KIP-K UNUSA.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openCreateBeritaAcaraModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Upload Berita Acara Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportBeritaAcaraToExcel}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    title="Ekspor Rekapitulasi Berita Acara ke file Excel (.xls)"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Ekspor Excel (.xls)</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">newspaper</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Publikasi</p>
                    <h3 className="text-lg font-black text-on-surface mt-0.5">{beritaAcaraList.length} Berita/Agenda</h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Kegiatan Selesai</p>
                    <h3 className="text-lg font-black text-emerald-600 mt-0.5">
                      {beritaAcaraList.filter(b => b.status === "Selesai").length} Dokumen
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Agenda Mendatang</p>
                    <h3 className="text-lg font-black text-amber-600 mt-0.5">
                      {beritaAcaraList.filter(b => b.status === "Akan Datang").length} Kegiatan
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Peserta Terlibat</p>
                    <h3 className="text-lg font-black text-indigo-600 mt-0.5">
                      {beritaAcaraList.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0)} Orang
                    </h3>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari judul berita acara, lokasi, topik, atau penyelenggara..."
                    value={baSearchQuery}
                    onChange={(e) => setBaSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                  />
                  {baSearchQuery && (
                    <button
                      onClick={() => setBaSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={baCategoryFilter}
                    onChange={(e) => setBaCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
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

                  <div className="flex gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
                    {(["Semua", "Selesai", "Akan Datang"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setBaStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] ${
                          baStatusFilter === st
                            ? "bg-primary text-white shadow-sm font-bold"
                            : "text-on-surface-variant hover:bg-surface-variant/20"
                        }`}
                      >
                        {st === "Selesai" ? "✅ Selesai" : st === "Akan Datang" ? "📅 Akan Datang" : "Semua"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of Berita Acara */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Judul Berita Acara & Ringkasan</th>
                      <th className="p-4 w-36">Kategori</th>
                      <th className="p-4 w-36 text-center">Status</th>
                      <th className="p-4 w-48">Waktu & Tempat</th>
                      <th className="p-4 w-28 text-center">Peserta</th>
                      <th className="p-4 w-44">Lampiran PDF</th>
                      <th className="p-4 w-36 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-xs">
                    {(() => {
                      const filtered = beritaAcaraList.filter((item) => {
                        if (baStatusFilter !== "Semua" && item.status !== baStatusFilter) return false;
                        if (baCategoryFilter !== "Semua" && item.category !== baCategoryFilter) return false;
                        if (baSearchQuery.trim() !== "") {
                          const q = baSearchQuery.toLowerCase();
                          return (
                            item.title.toLowerCase().includes(q) ||
                            item.summary.toLowerCase().includes(q) ||
                            item.location.toLowerCase().includes(q) ||
                            item.organizer.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-outline">
                              <span className="material-symbols-outlined text-4xl block mb-2 text-outline/40">newspaper</span>
                              <p className="font-bold text-sm text-on-surface">Tidak ada berita acara yang cocok dengan filter atau pencarian.</p>
                              <p className="text-xs text-outline mt-0.5">Gunakan tombol "Upload Berita Acara Baru" di atas untuk menambahkan dokumen.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((item, idx) => {
                        const isSelesai = item.status === "Selesai";

                        return (
                          <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="p-4 text-center font-bold text-outline">{idx + 1}</td>

                            {/* Title & Summary */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <p className="font-bold text-on-surface text-sm">{item.title}</p>
                                <p className="text-[11px] text-on-surface-variant line-clamp-2">{item.summary}</p>
                                <p className="text-[10px] text-outline">Penyelenggara: <strong>{item.organizer}</strong></p>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-surface-container text-on-surface border border-surface-variant/30 rounded-full text-[10px] font-bold">
                                {item.category}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isSelesai
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              }`}>
                                <span className="material-symbols-outlined text-[12px]">
                                  {isSelesai ? "check_circle" : "event"}
                                </span>
                                <span>{isSelesai ? "Selesai" : "Akan Datang"}</span>
                              </span>
                            </td>

                            {/* Date & Location */}
                            <td className="p-4 text-[11px] text-on-surface-variant">
                              <p className="font-semibold text-on-surface">{item.date}</p>
                              {item.time && <p className="text-outline">{item.time}</p>}
                              <p className="text-[10px] text-outline truncate">{item.location}</p>
                            </td>

                            {/* Attendee count */}
                            <td className="p-4 text-center">
                              <span className="font-extrabold text-xs text-primary">
                                {item.attendeeCount || 0}
                              </span>
                              <span className="text-[10px] text-outline block">Orang</span>
                            </td>

                            {/* Attachment */}
                            <td className="p-4">
                              {item.attachmentFileName ? (
                                <button
                                  type="button"
                                  onClick={() => alert(`Mengunduh berkas: ${item.attachmentFileName}`)}
                                  className="flex items-center gap-1.5 text-primary hover:underline font-bold text-xs truncate max-w-[160px] cursor-pointer"
                                  title={item.attachmentFileName}
                                >
                                  <span className="material-symbols-outlined text-[16px] shrink-0">picture_as_pdf</span>
                                  <span className="truncate">{item.attachmentFileName}</span>
                                </button>
                              ) : (
                                <span className="text-outline italic text-[11px]">-</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBeritaAcaraForDetail(item);
                                    setShowBeritaAcaraDetailModal(true);
                                  }}
                                  className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer"
                                  title="Pratinjau Berita Acara Lengkap"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditBeritaAcaraModal(item)}
                                  className="p-1.5 hover:bg-surface-variant/30 text-on-surface-variant rounded-lg transition-colors cursor-pointer"
                                  title="Edit Berita Acara"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBeritaAcara(item.id, item.title)}
                                  className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Berita Acara"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2.7: INFO BEASISWA */}
          {activeTab === "info_beasiswa" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Main Actions */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">school</span>
                    <span>Manajemen & Publikasi Info Beasiswa</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Kelola pengumuman beasiswa KIP Kuliah, beasiswa prestasi UNUSA, beasiswa kemitraan industri & perbankan, serta bantuan pembiayaan studi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openCreateBeasiswaModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Upload Info Beasiswa Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportBeasiswaToExcel}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    title="Ekspor Rekapitulasi Beasiswa ke file Excel (.xls)"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Ekspor Excel (.xls)</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Program</p>
                    <h3 className="text-lg font-black text-on-surface mt-0.5">{beasiswaList.length} Program</h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Sedang Dibuka</p>
                    <h3 className="text-lg font-black text-emerald-600 mt-0.5">
                      {beasiswaList.filter(b => b.status === "Dibuka").length} Program
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">timelapse</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Segera Dibuka</p>
                    <h3 className="text-lg font-black text-amber-600 mt-0.5">
                      {beasiswaList.filter(b => b.status === "Segera Dibuka").length} Program
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Telah Ditutup</p>
                    <h3 className="text-lg font-black text-error mt-0.5">
                      {beasiswaList.filter(b => b.status === "Ditutup").length} Program
                    </h3>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama beasiswa, instansi penyedia, atau cakupan biaya..."
                    value={beaSearchQuery}
                    onChange={(e) => setBeaSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                  />
                  {beaSearchQuery && (
                    <button
                      onClick={() => setBeaSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={beaCategoryFilter}
                    onChange={(e) => setBeaCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
                  >
                    <option value="Semua">📁 Semua Kategori</option>
                    <option value="KIP Kuliah">KIP Kuliah</option>
                    <option value="Prestasi Akademik">Prestasi Akademik</option>
                    <option value="Prestasi Non-Akademik">Prestasi Non-Akademik</option>
                    <option value="Bantuan UKT / Biaya Hidup">Bantuan UKT / Biaya Hidup</option>
                    <option value="Beasiswa Swasta / BUMN">Beasiswa Swasta / BUMN</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>

                  <div className="flex gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
                    {(["Semua", "Dibuka", "Segera Dibuka", "Ditutup"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setBeaStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] ${
                          beaStatusFilter === st
                            ? "bg-primary text-white shadow-sm font-bold"
                            : "text-on-surface-variant hover:bg-surface-variant/20"
                        }`}
                      >
                        {st === "Dibuka" ? "🟢 Dibuka" : st === "Segera Dibuka" ? "🟡 Segera" : st === "Ditutup" ? "🔴 Tutup" : "Semua"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of Scholarships */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Nama Beasiswa & Instansi</th>
                      <th className="p-4 w-40">Kategori</th>
                      <th className="p-4 w-32 text-center">Status</th>
                      <th className="p-4 w-52">Periode Pendaftaran</th>
                      <th className="p-4">Cakupan Pembiayaan</th>
                      <th className="p-4 w-40">Buku Panduan / Link</th>
                      <th className="p-4 w-36 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-xs">
                    {(() => {
                      const filtered = beasiswaList.filter((item) => {
                        if (beaStatusFilter !== "Semua" && item.status !== beaStatusFilter) return false;
                        if (beaCategoryFilter !== "Semua" && item.category !== beaCategoryFilter) return false;
                        if (beaSearchQuery.trim() !== "") {
                          const q = beaSearchQuery.toLowerCase();
                          return (
                            item.title.toLowerCase().includes(q) ||
                            item.provider.toLowerCase().includes(q) ||
                            item.coverage.toLowerCase().includes(q) ||
                            item.description.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-outline">
                              <span className="material-symbols-outlined text-4xl block mb-2 text-outline/40">school</span>
                              <p className="font-bold text-sm text-on-surface">Tidak ada program beasiswa yang cocok dengan filter atau pencarian.</p>
                              <p className="text-xs text-outline mt-0.5">Gunakan tombol "Upload Info Beasiswa Baru" di atas untuk menambahkan data.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((item, idx) => {
                        const isDibuka = item.status === "Dibuka";
                        const isSegera = item.status === "Segera Dibuka";

                        return (
                          <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="p-4 text-center font-bold text-outline">{idx + 1}</td>

                            {/* Title & Provider */}
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-bold text-on-surface text-sm">{item.title}</p>
                                <p className="text-[11px] text-primary font-semibold">{item.provider}</p>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-surface-container text-on-surface border border-surface-variant/30 rounded-full text-[10px] font-bold">
                                {item.category}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isDibuka
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : isSegera
                                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                    : "bg-error/10 text-error border-error/20"
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                <span>{item.status}</span>
                              </span>
                            </td>

                            {/* Period */}
                            <td className="p-4 text-[11px] text-on-surface-variant">
                              <p className="font-medium">{item.openDate} s.d.</p>
                              <p className="font-bold text-on-surface">{item.closeDate}</p>
                            </td>

                            {/* Coverage */}
                            <td className="p-4 text-xs font-semibold text-on-surface max-w-[220px]">
                              <span className="line-clamp-2" title={item.coverage}>{item.coverage}</span>
                            </td>

                            {/* Guide & Link */}
                            <td className="p-4 text-xs">
                              <div className="space-y-1">
                                {item.guideFileName && (
                                  <button
                                    type="button"
                                    onClick={() => alert(`Mengunduh panduan: ${item.guideFileName}`)}
                                    className="flex items-center gap-1 text-primary hover:underline font-bold text-[11px] truncate max-w-[150px] cursor-pointer"
                                    title={item.guideFileName}
                                  >
                                    <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                                    <span className="truncate">{item.guideFileName}</span>
                                  </button>
                                )}
                                {item.applyUrl && (
                                  <a
                                    href={item.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-outline hover:text-primary text-[10px] truncate max-w-[150px]"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">link</span>
                                    <span>Web Pendaftaran</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBeasiswaForDetail(item);
                                    setShowBeasiswaDetailModal(true);
                                  }}
                                  className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer"
                                  title="Lihat Detail Beasiswa"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditBeasiswaModal(item)}
                                  className="p-1.5 hover:bg-surface-variant/30 text-on-surface-variant rounded-lg transition-colors cursor-pointer"
                                  title="Edit Info Beasiswa"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBeasiswa(item.id, item.title)}
                                  className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Info Beasiswa"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2.8: ABSENSI KEGIATAN MAHASISWA */}
          {activeTab === "absensi_kegiatan" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Main Actions */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">how_to_reg</span>
                    <span>Sistem Presensi & Absensi Kegiatan Mahasiswa</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Pantau data kehadiran mahasiswa secara real-time, verifikasi foto bukti keikutsertaan kegiatan (selfie/screenshot Zoom), dan kelola QR Code presensi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => openProjectorQrModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    <span>Layar QR Code Proyektor</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportAttendanceToExcel}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    title="Ekspor Rekapitulasi Presensi ke file Excel (.xls)"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Ekspor Excel (.xls)</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Presensi</p>
                    <h3 className="text-lg font-black text-on-surface mt-0.5">{attendanceList.length} Mahasiswa</h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Hadir Sah</p>
                    <h3 className="text-lg font-black text-emerald-600 mt-0.5">
                      {attendanceList.filter(a => a.status === "Hadir").length} Terverifikasi
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined text-2xl">pending</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Menunggu Review</p>
                    <h3 className="text-lg font-black text-amber-600 mt-0.5">
                      {attendanceList.filter(a => a.status === "Menunggu Verifikasi").length} Peserta
                    </h3>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Ditolak</p>
                    <h3 className="text-lg font-black text-error mt-0.5">
                      {attendanceList.filter(a => a.status === "Ditolak").length} Berkas
                    </h3>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama mahasiswa, NIM, universitas, atau kegiatan..."
                    value={attSearchQuery}
                    onChange={(e) => setAttSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                  />
                  {attSearchQuery && (
                    <button
                      onClick={() => setAttSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={attActivityFilter}
                    onChange={(e) => setAttActivityFilter(e.target.value)}
                    className="px-3 py-2.5 bg-surface-container border border-surface-variant/20 rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer max-w-[220px]"
                  >
                    <option value="Semua">🎯 Semua Kegiatan</option>
                    {Array.from(new Set(attendanceList.map(a => a.activityTitle))).map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>

                  <div className="flex gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
                    {(["Semua", "Hadir", "Menunggu Verifikasi", "Ditolak"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setAttStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] ${
                          attStatusFilter === st
                            ? "bg-primary text-white shadow-sm font-bold"
                            : "text-on-surface-variant hover:bg-surface-variant/20"
                        }`}
                      >
                        {st === "Hadir" ? "✅ Hadir" : st === "Menunggu Verifikasi" ? "🟡 Pending" : st === "Ditolak" ? "🔴 Tolak" : "Semua"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of Attendance Records */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4 w-64">Mahasiswa & Asal Kampus</th>
                      <th className="p-4">Kegiatan Yang Diikuti</th>
                      <th className="p-4 w-44">Bukti Kehadiran (Foto)</th>
                      <th className="p-4 w-44">Waktu & Lokasi Presensi</th>
                      <th className="p-4 w-36 text-center">Status</th>
                      <th className="p-4 w-36 text-center">Aksi Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-xs">
                    {(() => {
                      const filtered = attendanceList.filter((item) => {
                        if (attStatusFilter !== "Semua" && item.status !== attStatusFilter) return false;
                        if (attActivityFilter !== "Semua" && item.activityTitle !== attActivityFilter) return false;
                        if (attSearchQuery.trim() !== "") {
                          const q = attSearchQuery.toLowerCase();
                          return (
                            item.studentName.toLowerCase().includes(q) ||
                            item.studentNim.toLowerCase().includes(q) ||
                            item.university.toLowerCase().includes(q) ||
                            item.activityTitle.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-outline">
                              <span className="material-symbols-outlined text-4xl block mb-2 text-outline/40">how_to_reg</span>
                              <p className="font-bold text-sm text-on-surface">Tidak ada data presensi yang cocok dengan filter atau pencarian.</p>
                              <p className="text-xs text-outline mt-0.5">Buka "Layar QR Code Proyektor" untuk mengajak mahasiswa melakukan absensi.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((item, idx) => {
                        const isHadir = item.status === "Hadir";
                        const isPending = item.status === "Menunggu Verifikasi";

                        return (
                          <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="p-4 text-center font-bold text-outline">{idx + 1}</td>

                            {/* Student Profile */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                  {item.studentName.charAt(0)}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-bold text-on-surface text-sm truncate">{item.studentName}</p>
                                  <p className="text-[11px] text-on-surface-variant font-mono">
                                    NIM: <strong className="text-primary">{item.studentNim}</strong>
                                  </p>
                                  <p className="text-[10px] text-outline truncate font-semibold">{item.university}</p>
                                  {item.studentPhone && <p className="text-[9px] text-outline">WA: {item.studentPhone}</p>}
                                </div>
                              </div>
                            </td>

                            {/* Activity */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold">
                                  {item.activityCategory || "Kegiatan KIP-K"}
                                </span>
                                <p className="font-bold text-on-surface text-xs leading-snug">{item.activityTitle}</p>
                                {item.notes && <p className="text-[10px] text-outline italic">Catatan: {item.notes}</p>}
                              </div>
                            </td>

                            {/* Proof Image with 1-click preview */}
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAttendanceForDetail(item);
                                  setValidationAdminNotes(item.notes || "");
                                  setShowAttendanceDetailModal(true);
                                }}
                                className="flex items-center gap-2 p-1.5 bg-surface hover:bg-surface-container rounded-xl border border-surface-variant/20 text-left transition-all cursor-pointer group"
                                title="Klik untuk memperbesar foto bukti kehadiran"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-surface-variant/30 bg-surface-container shrink-0">
                                  <img src={item.proofImageUrl} alt="Bukti" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-primary group-hover:underline truncate max-w-[100px]">
                                    {item.proofFileName || "Foto_Bukti.jpg"}
                                  </p>
                                  <p className="text-[9px] text-outline flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">zoom_in</span>
                                    <span>Zoom Bukti</span>
                                  </p>
                                </div>
                              </button>
                            </td>

                            {/* Timestamp & Location */}
                            <td className="p-4 text-[11px] text-on-surface-variant">
                              <p className="font-bold text-on-surface">{item.timestamp}</p>
                              <p className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">pin_drop</span>
                                <span className="truncate max-w-[130px]">{item.locationName || "Kampus B UNUSA"}</span>
                              </p>
                              <p className="text-[9px] text-outline/80">{item.deviceInfo}</p>
                            </td>

                            {/* Status */}
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isHadir
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : isPending
                                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                    : "bg-error/10 text-error border-error/20"
                              }`}>
                                <span className="material-symbols-outlined text-[12px]">
                                  {isHadir ? "check_circle" : isPending ? "pending" : "cancel"}
                                </span>
                                <span>{item.status}</span>
                              </span>
                            </td>

                            {/* Validation Actions */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAttendanceForDetail(item);
                                    setValidationAdminNotes(item.notes || "");
                                    setShowAttendanceDetailModal(true);
                                  }}
                                  className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer"
                                  title="Buka Pratinjau & Validasi Lengkap"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>

                                {!isHadir && (
                                  <button
                                    type="button"
                                    onClick={() => handleValidateAttendance(item.id, "Hadir")}
                                    className="p-1.5 hover:bg-emerald-500/20 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                    title="Setujui Kehadiran (Hadir)"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  </button>
                                )}

                                {isHadir && (
                                  <button
                                    type="button"
                                    onClick={() => handleValidateAttendance(item.id, "Ditolak")}
                                    className="p-1.5 hover:bg-amber-500/20 text-amber-700 rounded-lg transition-colors cursor-pointer"
                                    title="Tolak Bukti Kehadiran"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttendance(item.id, item.studentName)}
                                  className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Data Presensi"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA PENGGUNA */}
          {activeTab === "pengguna" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-on-surface">Manajemen Pengguna</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Kelola hak akses login, profil, dan hapus/blokir akun pengguna.</p>
                </div>
                <button
                  onClick={exportPenggunaToExcel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white hover:bg-green-800 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Ekspor Excel</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">NIM</th>
                      <th className="p-4">Angkatan</th>
                      <th className="p-4">Asal Universitas</th>
                      <th className="p-4 w-28">Status KIP</th>
                      <th className="p-4 w-32">Verifikasi</th>
                      <th className="p-4 w-16 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/20 text-sm">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4 font-bold text-on-surface">{usr.name}</td>
                        <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.email}</td>
                        <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.nim || "-"}</td>
                        <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.yearOfEntry || "-"}</td>
                        <td className="p-4 text-xs font-semibold text-on-surface-variant">{usr.university}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${usr.kipStatus === "KIP UNUSA" ? "bg-primary-container/20 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                            {usr.kipStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${usr.verificationStatus === "Verified" ? "bg-primary-container/10 text-primary" :
                            usr.verificationStatus === "Pending" ? "bg-secondary-container/20 text-on-secondary-container" :
                              "bg-error-container/10 text-error"
                            }`}>
                            {usr.verificationStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => deleteUser(usr.id, usr.email)}
                              className="p-2 hover:bg-error-container/10 text-error rounded-lg transition-colors cursor-pointer"
                              title="Hapus / Blokir Akun"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD SERTIFIKAT */}
          {activeTab === "sertifikat" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              {/* Form Upload */}
              <div className="lg:col-span-1 bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 shadow-sm space-y-md h-fit">
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface">Penerbitan Sertifikat</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Terbitkan sertifikat elektronik resmi untuk mahasiswa.</p>
                </div>

                <form onSubmit={handleUploadCertificate} className="space-y-md">
                  {/* Select Activity */}
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Pilih Kegiatan Beasiswa</label>
                    <select
                      value={activities.some(a => a.title === certActivity) ? certActivity : certActivity ? "CUSTOM" : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "CUSTOM") {
                          setCertActivity("");
                        } else {
                          setCertActivity(val);
                          if (val) {
                            setCertCode(generateSerialCodeForActivity(val));
                          }
                        }
                      }}
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-on-surface cursor-pointer font-semibold"
                    >
                      <option value="" disabled>-- Pilih Kegiatan Beasiswa --</option>
                      {activities.map((act) => (
                        <option key={act.id} value={act.title}>
                          {act.title} ({act.category})
                        </option>
                      ))}
                      <option value="CUSTOM">+ Ketik Nama Kegiatan Lain...</option>
                    </select>

                    {(!activities.some(a => a.title === certActivity) || certActivity === "") && (
                      <input
                        type="text"
                        placeholder="Ketik Nama Kegiatan..."
                        value={certActivity}
                        onChange={(e) => {
                          setCertActivity(e.target.value);
                          if (e.target.value) {
                            setCertCode(generateSerialCodeForActivity(e.target.value));
                          }
                        }}
                        className="w-full p-3 mt-2 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-on-surface"
                        required
                      />
                    )}
                  </div>

                  {/* Select User */}
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Penerima Sertifikat (Mahasiswa)</label>
                    <select
                      value={users.some(u => u.name === certUser) ? certUser : certUser === "ALL_STUDENTS" ? "ALL_STUDENTS" : certUser ? "CUSTOM" : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "CUSTOM") {
                          setCertUser("");
                        } else {
                          setCertUser(val);
                        }
                      }}
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-on-surface cursor-pointer font-semibold"
                    >
                      <option value="" disabled>-- Pilih Mahasiswa Penerima --</option>
                      <option value="ALL_STUDENTS" className="font-bold text-primary">
                        🌟 Semua Mahasiswa Terdaftar ({users.length} Orang - Terbitkan Masal)
                      </option>
                      {users.map((usr) => (
                        <option key={usr.id} value={usr.name}>
                          {usr.name} ({usr.university} - {usr.kipStatus})
                        </option>
                      ))}
                      <option value="CUSTOM">+ Ketik Nama Mahasiswa Lain...</option>
                    </select>

                    {(!users.some(u => u.name === certUser) && certUser !== "ALL_STUDENTS") && (
                      <input
                        type="text"
                        placeholder="Ketik Nama Lengkap Mahasiswa..."
                        value={certUser}
                        onChange={(e) => setCertUser(e.target.value)}
                        className="w-full p-3 mt-2 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-on-surface"
                        required
                      />
                    )}
                  </div>

                  {/* Serial Code */}
                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Nomor Seri Sertifikat</label>
                      <button
                        type="button"
                        onClick={() => setCertCode(generateSerialCodeForActivity(certActivity))}
                        className="text-[11px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">refresh</span> Generate Otomatis
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: CERT-LKMB-2024-0891"
                      value={certCode}
                      onChange={(e) => setCertCode(e.target.value)}
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono text-on-surface font-bold"
                      required
                    />
                  </div>

                  {/* File Upload (Mock) */}
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Lampiran Berkas Sertifikat (PDF)</label>
                    <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-4 text-center cursor-pointer hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                      <p className="text-xs text-on-surface-variant font-semibold mt-1">Seret berkas PDF di sini atau klik untuk memilih file</p>
                      <p className="text-[10px] text-outline mt-0.5">Template sertifikat otomatis terhubung ke sistem verifikasi QR</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={uploadingCert}
                    className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-300"
                  >
                    {uploadingCert ? "Menerbitkan Sertifikat..." : certUser === "ALL_STUDENTS" ? `Terbitkan ke Seluruh Mahasiswa (${users.length} Orang)` : "Terbitkan Sertifikat"}
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </button>
                </form>
              </div>

              {/* List generated certificates */}
              <div className="lg:col-span-2 space-y-md">
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface">Daftar Sertifikat Terbit</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Sertifikat elektronik yang telah dikirimkan ke mahasiswa.</p>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                        <th className="p-4">Mahasiswa</th>
                        <th className="p-4">Kegiatan</th>
                        <th className="p-4 w-44">No Seri</th>
                        <th className="p-4 w-28">Tanggal Terbit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/20 text-xs">
                      {certificates.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="p-4 font-bold text-on-surface">{c.userName}</td>
                          <td className="p-4 text-on-surface-variant font-semibold">{c.activityTitle}</td>
                          <td className="p-4 font-mono font-bold text-stone-700">{c.code}</td>
                          <td className="p-4 text-outline font-semibold">{c.dateUploaded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VALIDASI SERTIFIKAT */}
          {activeTab === "validasi_sertifikat" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">Validasi Sertifikat Elektronik</h2>
                <p className="text-xs text-on-surface-variant mt-1">Verifikasi keaslian dokumen sertifikat digital SEMADIKSI dengan nomor seri atau pemindaian QR code.</p>
              </div>

              {/* Validation Search & Scan UI inside Admin */}
              <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 shadow-sm space-y-md">
                <form onSubmit={handleAdminCertSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                      qr_code_scanner
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan Nomor Seri Sertifikat (contoh: CERT-LKMB-2024-0891)"
                      value={adminCertInput}
                      onChange={(e) => setAdminCertInput(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono tracking-wide text-on-surface"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Verifikasi
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminSimulateScan}
                      disabled={adminScanning}
                      className="px-4 py-3 bg-secondary-container text-on-secondary-container font-bold text-sm rounded-xl hover:brightness-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:bg-gray-300"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      {adminScanning ? "Scanning..." : "Simulasi Scan QR"}
                    </button>
                  </div>
                </form>

                {/* Scanner animation simulation */}
                {adminScanning && (
                  <div className="w-full max-w-sm mx-auto aspect-video rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center text-white">
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <span className="material-symbols-outlined text-4xl text-emerald-400 animate-bounce">qr_code_2</span>
                    <p className="text-[10px] tracking-wider uppercase font-semibold text-emerald-300 mt-2">Membuka Kamera QR Scanner...</p>
                  </div>
                )}
              </div>

              {/* Result Area */}
              {adminSearchedCode && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {adminCertValid && adminMatchedCert ? (
                    <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-outline uppercase tracking-widest text-center border-b border-surface-variant/20 pb-2 mb-4">
                          Informasi Dokumen
                        </h3>

                        <div className="divide-y divide-surface-variant/10 text-sm">
                          <div className="grid grid-cols-3 py-3 items-center">
                            <span className="text-on-surface-variant">STATUS</span>
                            <div className="col-span-2 flex items-center gap-1.5">
                              <span className="text-primary font-extrabold tracking-wider uppercase text-sm">VALID</span>
                              <span className="material-symbols-outlined text-primary text-[18px] font-bold">check_circle</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 py-3 items-center">
                            <span className="text-on-surface-variant">Hash Dokumen</span>
                            <span className="col-span-2 font-mono text-xs text-on-surface break-all bg-surface-container p-1.5 rounded border border-surface-variant/20">
                              {adminMatchedCert.hash}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 py-3">
                            <span className="text-on-surface-variant">Judul Dokumen</span>
                            <span className="col-span-2 font-bold text-on-surface">{adminMatchedCert.title}</span>
                          </div>

                          <div className="grid grid-cols-3 py-3">
                            <span className="text-on-surface-variant">Author Dokumen</span>
                            <span className="col-span-2 text-on-surface-variant">{adminMatchedCert.author}</span>
                          </div>

                          <div className="grid grid-cols-3 py-3 items-center">
                            <span className="text-on-surface-variant">File Dokumen</span>
                            <div className="col-span-2">
                              <button
                                onClick={() => alert(`Mengunduh berkas sertifikat asli:\nNomor Seri: ${adminMatchedCert.code}`)}
                                className="px-4 py-2 bg-primary text-on-primary hover:brightness-110 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow"
                              >
                                <span className="material-symbols-outlined text-[14px]">download</span> Download PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Signatures Table */}
                      <div>
                        <h3 className="text-xs font-bold text-outline uppercase tracking-widest text-center border-b border-surface-variant/20 pb-2 mb-4">
                          Informasi Penandatanganan (TTE)
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-surface-variant/20">
                                <th className="p-3 w-10 text-center">NO</th>
                                <th className="p-3 w-20 text-center">REQUEST</th>
                                <th className="p-3">NAMA PENANDATANGAN</th>
                                <th className="p-3 w-44">TANGGAL</th>
                                <th className="p-3 w-20 text-center">CERTIFIED</th>
                                <th className="p-3 w-20 text-center">VALIDITY</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-variant/10">
                              {adminMatchedCert.signatories.map((sig: string, idx: number) => (
                                <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                                  <td className="p-3 text-center">{idx + 1}</td>
                                  <td className="p-3 text-center font-bold text-outline bg-surface-container/30">TTE</td>
                                  <td className="p-3 text-on-surface font-bold">{sig}</td>
                                  <td className="p-3 text-on-surface-variant flex items-center gap-1">
                                    <span>{adminMatchedCert.date}</span>
                                    <span className="material-symbols-outlined text-primary text-[14px] font-bold">check</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="material-symbols-outlined text-primary font-bold text-[18px]">done</span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="material-symbols-outlined text-primary font-bold text-[18px]">done</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Invalid Alert
                    <div className="bg-error-container/10 border border-error/20 rounded-2xl p-6 text-center space-y-3">
                      <span className="material-symbols-outlined text-error text-5xl font-bold animate-pulse">warning</span>
                      <h3 className="text-lg font-bold text-error uppercase tracking-wide">STATUS: DOKUMEN TIDAK VALID / PALSU</h3>
                      <p className="text-sm text-on-error-container max-w-lg mx-auto">
                        Dokumen dengan nomor seri <strong className="font-mono text-error font-extrabold bg-error-container/20 px-2 py-0.5 rounded border border-error/20">{adminSearchedCode}</strong> tidak ditemukan di database portal.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* TAB 7: BOBOT PERSENTASE */}
          {activeTab === "bobot" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">Bobot Persentase Kegiatan</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Atur persentase kontribusi masing-masing kategori kegiatan dalam perhitungan akumulasi Skor Keaktifan Mahasiswa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inputs card */}
                <div className="md:col-span-2 bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">tune</span>
                    <span>Konfigurasi Persentase Kategori</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(categoryWeights).map((catName) => (
                      <div key={catName} className="space-y-sm">
                        <label className="font-label-md text-label-md text-on-surface-variant block font-bold">
                          Kategori {catName} (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={categoryWeights[catName]}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                              setCategoryWeights({
                                ...categoryWeights,
                                [catName]: val
                              });
                            }}
                            className="w-full p-3 pr-10 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold text-on-surface"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-outline text-sm">%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Visual Stack Bar distribution */}
                  <div className="space-y-2 pt-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-bold">Distribusi Bobot Visual</label>
                    {(() => {
                      const total = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
                      const colors: { [key: string]: string } = {
                        "Keaktifan Ormawa": "bg-primary text-on-primary",
                        "Kegiatan Webinar Soft Skill": "bg-secondary text-on-secondary",
                        "Keikutsertaan Kompetisi": "bg-tertiary text-on-tertiary",
                        "Kegiatan Semadiksi": "bg-error text-on-error"
                      };
                      return (
                        <div className="space-y-3">
                          {/* Split Bar */}
                          <div className="w-full h-8 rounded-xl overflow-hidden flex border border-surface-variant/20 bg-surface-container shadow-inner">
                            {total > 0 ? (
                              Object.keys(categoryWeights).map((catName) => {
                                const w = categoryWeights[catName];
                                const pct = (w / total) * 100;
                                if (pct === 0) return null;
                                return (
                                  <div
                                    key={catName}
                                    style={{ width: `${pct}%` }}
                                    className={`${colors[catName] || "bg-neutral-500"} h-full flex items-center justify-center font-bold text-[9px] transition-all duration-300 truncate px-1`}
                                    title={`${catName}: ${w}%`}
                                  >
                                    {catName} ({w}%)
                                  </div>
                                );
                              })
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-outline font-semibold">
                                Tidak ada bobot terkonfigurasi (0%)
                              </div>
                            )}
                          </div>

                          {/* Legends */}
                          <div className="flex flex-wrap gap-4 text-xs font-semibold">
                            {Object.keys(categoryWeights).map((catName) => (
                              <div key={catName} className="flex items-center gap-1.5">
                                <span className={`w-3.5 h-3.5 rounded ${colors[catName] || "bg-neutral-500"}`}></span>
                                <span className="text-on-surface-variant">{catName} ({categoryWeights[catName]}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Validation & Save card */}
                <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-on-surface">Validasi Persentase</h3>

                    {(() => {
                      const total = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
                      const isValid = total === 100;

                      return (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/20 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Total Akumulasi</span>
                            <span className={`text-4xl font-extrabold mt-1 block ${isValid ? "text-primary" : "text-error animate-pulse"}`}>
                              {total}%
                            </span>

                            <div className="mt-3">
                              {isValid ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold shadow-sm">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  Bobot Sesuai (100%)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error border border-error/20 rounded-full text-xs font-bold shadow-sm animate-bounce">
                                  <span className="material-symbols-outlined text-[14px]">warning</span>
                                  Harus Berjumlah 100%
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            <strong className="text-on-surface block mb-1">Catatan Penting:</strong>
                            Total penjumlahan seluruh kategori bobot persentase di kiri **wajib bernilai tepat 100%** sebelum konfigurasi dapat disimpan ke portal.
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => {
                      const total = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
                      if (total !== 100) {
                        alert(`Gagal menyimpan! Total bobot persentase harus berjumlah tepat 100% (saat ini: ${total}%). Silakan sesuaikan kembali.`);
                        return;
                      }
                      localStorage.setItem("semadiksi_category_weights", JSON.stringify(categoryWeights));
                      alert("Konfigurasi bobot persentase kegiatan berhasil disimpan ke sistem!");
                    }}
                    className="w-full py-3.5 bg-primary text-on-primary hover:brightness-110 rounded-full font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Simpan Konfigurasi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL FORM: CRUD KEGIATAN */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface">
                  {currentActivity ? "Edit Informasi Kegiatan" : "Upload Kegiatan Baru"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Lengkapi form di bawah untuk mempublikasikan agenda.</p>
              </div>
              <button
                onClick={closeActivityModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={saveActivity} className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Nama Kegiatan</label>
                  <input
                    type="text"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    placeholder="Contoh: Seminar Kewirausahaan KIP"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Kategori</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm cursor-pointer"
                    required
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Lomba">Lomba</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm cursor-pointer"
                    required
                  />
                </div>

                {/* Price */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Biaya Pendaftaran</label>
                  <input
                    type="text"
                    value={actPrice}
                    onChange={(e) => setActPrice(e.target.value)}
                    placeholder="Contoh: Gratis atau IDR 50.000"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Quota Kegiatan */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Kuota Kegiatan</label>
                  <input
                    type="number"
                    min="1"
                    value={actQuota === 0 ? "" : actQuota}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/^0+(?=\d)/, '');
                      setActQuota(raw === "" ? 0 : parseInt(raw, 10) || 0);
                    }}
                    placeholder="Contoh: 100"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Poin Keaktifan (XP) */}
                <div className="space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Poin Keaktifan (XP)</label>
                  <input
                    type="number"
                    min="0"
                    value={actXpPoints === 0 ? "" : actXpPoints}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/^0+(?=\d)/, '');
                      setActXpPoints(raw === "" ? 0 : parseInt(raw, 10) || 0);
                    }}
                    placeholder="Contoh: 250"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Image File Input */}
                <div className="space-y-sm md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Gambar Banner</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setActImg(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm cursor-pointer"
                    />
                    {actImg && (
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant">Pratinjau:</span>
                        <img
                          className="w-16 h-12 object-cover rounded-lg shadow-sm border border-surface-variant/30"
                          alt="Banner Preview"
                          src={actImg}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-sm md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                    placeholder="Contoh: Gedung Auditorium Utama atau Link Zoom Meeting"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Speaker */}
                <div className="space-y-sm md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Narasumber / Pengisi Acara</label>
                  <input
                    type="text"
                    value={actSpeaker}
                    onChange={(e) => setActSpeaker(e.target.value)}
                    placeholder="Contoh: Budi Subarjo (CEO Tech) & Tim Mentor"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* Rundown Textarea */}
                <div className="space-y-sm md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Jadwal Rundown Acara (pisahkan dengan baris baru)</label>
                  <textarea
                    rows={4}
                    value={actRundown}
                    onChange={(e) => setActRundown(e.target.value)}
                    placeholder="Contoh:&#10;08.00 - 09.00 : Registrasi&#10;09.00 - 10.30 : Sesi Materi Utama"
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono text-xs"
                    required
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-sm md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Deskripsi Kegiatan</label>
                  <textarea
                    rows={4}
                    value={actDesc}
                    onChange={(e) => setActDesc(e.target.value)}
                    placeholder="Tulis ringkasan mengenai program kegiatan..."
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    required
                  />
                </div>

                {/* File Upload Requirement Checkbox */}
                <div className="space-y-sm md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="requireFileUpload"
                    checked={actRequireFileUpload}
                    onChange={(e) => setActRequireFileUpload(e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                  <label htmlFor="requireFileUpload" className="font-label-md text-label-md text-on-surface-variant font-bold cursor-pointer select-none">
                    Wajibkan Peserta Mengunggah Karya / File Pendukung
                  </label>
                </div>

                {/* File Upload Instruction */}
                {actRequireFileUpload && (
                  <div className="space-y-sm md:col-span-2 animate-in fade-in duration-200">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-semibold">Instruksi Unggah File</label>
                    <textarea
                      rows={2}
                      value={actFileUploadInstruction}
                      onChange={(e) => setActFileUploadInstruction(e.target.value)}
                      placeholder="Contoh: Unggah karya poster digital Anda dalam format PNG/JPG dengan ukuran maksimal 5MB."
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      required={actRequireFileUpload}
                    />
                  </div>
                )}

                {/* Seat Booking Checkbox */}
                <div className="space-y-sm md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="enableSeatBooking"
                    checked={actEnableSeatBooking}
                    onChange={(e) => setActEnableSeatBooking(e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                  <label htmlFor="enableSeatBooking" className="font-label-md text-label-md text-on-surface-variant font-bold cursor-pointer select-none">
                    Aktifkan Fitur Booking Tempat Duduk (Auditorium UNUSA)
                  </label>
                </div>

                {actEnableSeatBooking && (
                  <div className="space-y-4 md:col-span-2 animate-in fade-in duration-200 border-2 border-primary/20 rounded-3xl p-5 bg-surface-container-low shadow-sm">
                    {/* Header Editor */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-surface-variant/30 pb-3">
                      <div>
                        <label className="font-display font-black text-sm text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">chair</span>
                          <span>Editor & Desain Sketsa Denah Tempat Duduk</span>
                        </label>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          Atur jumlah baris, kolom, lorong/gang, zona VIP/Sweetbox, dan sinkronkan otomatis dengan kuota peserta.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold shadow-sm">
                        Editor Interaktif
                      </span>
                    </div>

                    {/* Quota Sync Toolbar & Statistics */}
                    {(() => {
                      const totalGrid = actSeatLayoutRows * actSeatLayoutCols;
                      const totalDisabled = actSeatLayoutDisabledSeats.length;
                      const totalActive = Math.max(0, totalGrid - totalDisabled);
                      const isQuotaMatched = totalActive === actQuota;

                      return (
                        <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-3.5 space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-on-surface">Status Sinkronisasi Kuota:</span>
                              {isQuotaMatched ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full border border-primary/20">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  <span>Tersinkronisasi ({totalActive} Kursi = Kuota {actQuota})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-700 text-[11px] font-bold rounded-full border border-amber-500/30">
                                  <span className="material-symbols-outlined text-[14px]">warning</span>
                                  <span>Selisih: Denah ({totalActive} Kursi) vs Kuota ({actQuota} Peserta)</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => syncLayoutWithQuota(actQuota)}
                                className="px-3 py-1.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                                title="Otomatis hitung dan buat layout kursi pas dengan jumlah kuota"
                              >
                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                <span>Hitung Layout dari Kuota ({actQuota})</span>
                              </button>

                              <button
                                type="button"
                                onClick={syncQuotaWithLayout}
                                className="px-3 py-1.5 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-secondary-container/30 shadow-sm flex items-center gap-1"
                                title="Samakan kuota kegiatan mengikuti jumlah kursi aktif"
                              >
                                <span className="material-symbols-outlined text-[14px]">sync</span>
                                <span>Samakan Kuota ke Kursi ({totalActive})</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                            <div className="p-2 bg-surface-container rounded-xl">
                              <p className="text-[9px] font-bold text-outline uppercase">Total Kursi Aktif</p>
                              <p className="font-black text-sm text-primary mt-0.5">{totalActive} Kursi</p>
                            </div>
                            <div className="p-2 bg-surface-container rounded-xl">
                              <p className="text-[9px] font-bold text-outline uppercase">Grid (Baris x Kolom)</p>
                              <p className="font-black text-sm text-on-surface mt-0.5">{actSeatLayoutRows} x {actSeatLayoutCols} ({totalGrid})</p>
                            </div>
                            <div className="p-2 bg-surface-container rounded-xl">
                              <p className="text-[9px] font-bold text-outline uppercase">Baris VIP / Sweetbox</p>
                              <p className="font-black text-sm text-error mt-0.5">{actSeatLayoutVipRows.join(", ") || "-"}</p>
                            </div>
                            <div className="p-2 bg-surface-container rounded-xl">
                              <p className="text-[9px] font-bold text-outline uppercase">Kursi Nonaktif / Kosong</p>
                              <p className="font-black text-sm text-outline mt-0.5">{totalDisabled} Kursi</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Layout Preset & Custom Controls Grid */}
                    <div className="space-y-3 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl p-4">
                      {/* Preset Selection Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant block">Pilih Template / Preset Layout</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { id: "auditorium_unusa", label: "Auditorium UNUSA (2 Blok)", desc: "1 Lorong Tengah" },
                            { id: "hall_3blocks", label: "Hall Utama (3 Blok)", desc: "2 Lorong Gang" },
                            { id: "theater_wide", label: "Teater / Bioskop", desc: "1 Blok Besar Tanpa Gang" },
                            { id: "classroom", label: "Seminar / Kelas", desc: "4 Blok Teratur" },
                            { id: "custom", label: "Kustom Mandiri", desc: "Atur Bebas" },
                          ].map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => applySeatLayoutPreset(preset.id as any)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-xs ${actSeatLayoutPreset === preset.id
                                ? "bg-primary text-white border-primary shadow-sm font-bold"
                                : "bg-surface-container border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                                }`}
                            >
                              <p className="font-bold text-[11px] truncate">{preset.label}</p>
                              <p className={`text-[9px] truncate ${actSeatLayoutPreset === preset.id ? "text-white/80" : "text-outline"}`}>{preset.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Row, Col, and Aisle Steppers */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-surface-variant/20">
                        {/* Rows */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-on-surface flex justify-between">
                            <span>Jumlah Baris (A s.d. {getRowLabel(actSeatLayoutRows - 1)})</span>
                            <span className="text-primary font-black">{actSeatLayoutRows} Baris</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActSeatLayoutRows(Math.max(1, actSeatLayoutRows - 1))}
                              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-variant/40 font-black text-sm flex items-center justify-center cursor-pointer border border-surface-variant/20"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={actSeatLayoutRows || ""}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/^0+(?=\d)/, '');
                                setActSeatLayoutRows(raw === "" ? 1 : Math.min(30, Math.max(1, parseInt(raw, 10) || 1)));
                              }}
                              className="flex-1 p-2 bg-surface-container text-center font-bold text-xs rounded-lg border border-surface-variant/20 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => setActSeatLayoutRows(Math.min(30, actSeatLayoutRows + 1))}
                              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-variant/40 font-black text-sm flex items-center justify-center cursor-pointer border border-surface-variant/20"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Cols */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-on-surface flex justify-between">
                            <span>Kursi per Baris (Kolom 1 - {actSeatLayoutCols})</span>
                            <span className="text-primary font-black">{actSeatLayoutCols} Kursi</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newCols = Math.max(1, actSeatLayoutCols - 1);
                                setActSeatLayoutCols(newCols);
                                if (actSeatLayoutPreset === "auditorium_unusa") {
                                  setActSeatLayoutAisles([Math.floor(newCols / 2)]);
                                }
                              }}
                              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-variant/40 font-black text-sm flex items-center justify-center cursor-pointer border border-surface-variant/20"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="35"
                              value={actSeatLayoutCols || ""}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/^0+(?=\d)/, '');
                                const val = raw === "" ? 1 : Math.min(35, Math.max(1, parseInt(raw, 10) || 1));
                                setActSeatLayoutCols(val);
                                if (actSeatLayoutPreset === "auditorium_unusa") {
                                  setActSeatLayoutAisles([Math.floor(val / 2)]);
                                }
                              }}
                              className="flex-1 p-2 bg-surface-container text-center font-bold text-xs rounded-lg border border-surface-variant/20 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newCols = Math.min(35, actSeatLayoutCols + 1);
                                setActSeatLayoutCols(newCols);
                                if (actSeatLayoutPreset === "auditorium_unusa") {
                                  setActSeatLayoutAisles([Math.floor(newCols / 2)]);
                                }
                              }}
                              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-variant/40 font-black text-sm flex items-center justify-center cursor-pointer border border-surface-variant/20"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Aisles / Gang Configuration */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-on-surface">Pembagian Lorong / Gang</label>
                          <select
                            value={
                              actSeatLayoutAisles.length === 0
                                ? "none"
                                : actSeatLayoutAisles.length === 1
                                  ? "center"
                                  : actSeatLayoutAisles.length === 2
                                    ? "two_aisles"
                                    : "three_aisles"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "none") {
                                setActSeatLayoutAisles([]);
                              } else if (val === "center") {
                                setActSeatLayoutAisles([Math.floor(actSeatLayoutCols / 2)]);
                              } else if (val === "two_aisles") {
                                const p1 = Math.floor(actSeatLayoutCols / 3);
                                const p2 = Math.floor((actSeatLayoutCols * 2) / 3);
                                setActSeatLayoutAisles([p1, p2]);
                              } else {
                                const p1 = Math.floor(actSeatLayoutCols / 4);
                                const p2 = Math.floor(actSeatLayoutCols / 2);
                                const p3 = Math.floor((actSeatLayoutCols * 3) / 4);
                                setActSeatLayoutAisles([p1, p2, p3]);
                              }
                            }}
                            className="w-full p-2 bg-surface-container rounded-lg border border-surface-variant/20 font-bold text-xs outline-none cursor-pointer"
                          >
                            <option value="center">1 Gang Tengah (2 Blok Simetris)</option>
                            <option value="two_aisles">2 Gang (3 Blok: Kiri - Tengah - Kanan)</option>
                            <option value="three_aisles">3 Gang (4 Blok Ruang Kelas)</option>
                            <option value="none">Tanpa Gang (1 Blok Utuh)</option>
                          </select>
                        </div>
                      </div>

                      {/* VIP / Sweetbox Rows Selector */}
                      <div className="space-y-1.5 pt-2 border-t border-surface-variant/20">
                        <label className="text-xs font-bold text-on-surface flex justify-between items-center">
                          <span>Pilih Baris VIP / Sweetbox (Warna Merah Premium)</span>
                          <span className="text-[10px] text-outline">Klik tombol baris untuk toggle VIP</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {Array.from({ length: actSeatLayoutRows }).map((_, rIdx) => {
                            const rLabel = getRowLabel(rIdx);
                            const isVip = actSeatLayoutVipRows.includes(rLabel);
                            return (
                              <button
                                key={rLabel}
                                type="button"
                                onClick={() => {
                                  if (isVip) {
                                    setActSeatLayoutVipRows(actSeatLayoutVipRows.filter(r => r !== rLabel));
                                  } else {
                                    setActSeatLayoutVipRows([...actSeatLayoutVipRows, rLabel]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${isVip
                                  ? "bg-error text-white border-error shadow-sm scale-105"
                                  : "bg-surface-container border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                                  }`}
                              >
                                Baris {rLabel} {isVip ? "★ VIP" : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Seating Canvas */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">touch_app</span>
                          <span>Pratinjau Denah Interaktif (Klik Kursi untuk Ubah Status)</span>
                        </span>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setActSeatLayoutZoom(Math.max(0.7, actSeatLayoutZoom - 0.15))}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-surface-variant/30 text-on-surface"
                            title="Zoom Out"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-bold px-1.5 text-on-surface font-mono">
                            {Math.round(actSeatLayoutZoom * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setActSeatLayoutZoom(Math.min(1.4, actSeatLayoutZoom + 0.15))}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-surface-variant/30 text-on-surface"
                            title="Zoom In"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => setActSeatLayoutZoom(1)}
                            className="text-[9px] font-bold px-1.5 hover:bg-surface-variant/30 rounded text-outline"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Canvas Container */}
                      <div className="bg-white border-2 border-stone-300/80 rounded-2xl p-4 shadow-inner overflow-x-auto overflow-y-auto max-h-[440px] flex flex-col items-center select-none">
                        <div
                          className="flex flex-col items-center space-y-4 pt-1 transition-transform origin-top"
                          style={{ transform: `scale(${actSeatLayoutZoom})` }}
                        >
                          {/* Stage / Screen indicator */}
                          <div className="w-full max-w-lg py-2 bg-stone-100 border-2 border-stone-300 rounded-xl text-center text-[10px] font-black text-stone-700 uppercase tracking-widest shadow-sm">
                            PANGGUNG UTAMA / LAYAR DEPAN
                          </div>

                          {/* Dynamic Seating Grid */}
                          <div className="flex flex-col gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                            {/* Column Number Headers */}
                            <div className="flex items-center gap-1 justify-center">
                              <div className="w-6 text-center font-bold text-[9px] text-stone-400"></div>
                              {Array.from({ length: actSeatLayoutCols }).map((_, cIdx) => {
                                const colNo = cIdx + 1;
                                const isAisle = actSeatLayoutAisles.includes(colNo);

                                return (
                                  <Fragment key={`col-hdr-${colNo}`}>
                                    <div className="w-6 h-4 text-center font-bold text-[8px] text-stone-400 flex items-center justify-center">
                                      {colNo}
                                    </div>
                                    {isAisle && (
                                      <div className="w-5 text-center text-[7px] font-bold text-stone-300 italic">
                                        gang
                                      </div>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </div>

                            {/* Rows A..Z.. */}
                            {Array.from({ length: actSeatLayoutRows }).map((_, rIdx) => {
                              const rowLabel = getRowLabel(rIdx);
                              const isVipRow = actSeatLayoutVipRows.includes(rowLabel);

                              return (
                                <div key={`row-${rowLabel}`} className="flex items-center gap-1 justify-center">
                                  {/* Row Label Header */}
                                  <div className={`w-6 font-bold text-[10px] text-right pr-1 self-center ${isVipRow ? "text-error font-black" : "text-stone-600"}`}>
                                    {rowLabel}
                                  </div>

                                  {/* Seats in Row */}
                                  {Array.from({ length: actSeatLayoutCols }).map((_, cIdx) => {
                                    const colNo = cIdx + 1;
                                    const seatNo = `${rowLabel}-${colNo}`;
                                    const isAisle = actSeatLayoutAisles.includes(colNo);
                                    const isDisabled = actSeatLayoutDisabledSeats.includes(seatNo);
                                    const isAccessible = actSeatLayoutAccessibleSeats.includes(seatNo);

                                    return (
                                      <Fragment key={seatNo}>
                                        <button
                                          type="button"
                                          onClick={() => toggleSeatOnCanvas(seatNo, rowLabel)}
                                          title={`Kursi ${seatNo} (${isDisabled ? "Nonaktif / Kosong" : isAccessible ? "Kursi Aksesibel / Difabel" : isVipRow ? "Sweetbox / VIP" : "Reguler"})\nKlik untuk ubah status`}
                                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[8px] border transition-all cursor-pointer active:scale-90 ${isDisabled
                                            ? "bg-stone-200 border-dashed border-stone-400 text-stone-400 opacity-40 hover:opacity-100"
                                            : isAccessible
                                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                              : isVipRow
                                                ? "bg-error/15 border-error text-error shadow-sm hover:bg-error/30"
                                                : "bg-white border-stone-300 text-stone-700 hover:border-primary hover:text-primary shadow-xs"
                                            }`}
                                        >
                                          {isDisabled ? "✕" : isAccessible ? "♿" : colNo}
                                        </button>

                                        {/* Aisle Column */}
                                        {isAisle && (
                                          <div className="w-5 flex items-center justify-center text-[7px] text-stone-400 font-bold select-none opacity-60">
                                            │
                                          </div>
                                        )}
                                      </Fragment>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>

                          {/* Legend & Instructions */}
                          <div className="flex flex-wrap gap-4 text-[10px] font-semibold justify-center pt-2 border-t border-stone-200 w-full">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 bg-white border border-stone-300 rounded"></span>
                              <span className="text-stone-700">Tersedia / Reguler</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 bg-error/15 border border-error rounded"></span>
                              <span className="text-error font-bold">Sweetbox / VIP ({actSeatLayoutVipRows.join(", ") || "-"})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 bg-blue-50 border border-blue-500 rounded"></span>
                              <span className="text-blue-700 font-bold">♿ Aksesibel / Difabel</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 bg-stone-200 border border-dashed border-stone-400 rounded opacity-60"></span>
                              <span className="text-stone-500 italic">Nonaktif / Lorong Kosong</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-outline text-center italic">
                        💡 <strong>Tips Interaktif:</strong> Klik kotak kursi pada denah di atas untuk mengubah tipe (Reguler &rarr; Aksesibel &rarr; Nonaktif &rarr; Reguler).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-4 pt-4 border-t border-surface-variant/30 justify-end">
                <button
                  type="button"
                  onClick={closeActivityModal}
                  className="px-6 py-3 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-full font-bold text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-on-primary hover:brightness-110 rounded-full font-bold text-xs cursor-pointer shadow-md active:scale-98 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Simpan Publikasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEAT BOOKING DETAILS (ADMIN VIEW) */}
      {showSeatBookingDetailsModal && selectedSeatActivity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event_seat</span>
                  <span>Denah & Manajemen Booking Tempat Duduk</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {selectedSeatActivity.title} (Auditorium UNUSA)
                </p>
              </div>
              <button
                onClick={closeSeatBookingDetailsModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Dynamic Layout Configuration Calculation for Admin View */}
            {(() => {
              const cfg: SeatLayoutConfig = selectedSeatActivity.seatLayoutConfig || calculateOptimalLayoutForQuota(selectedSeatActivity.quota || 100, "auditorium_unusa");
              const totalActive = (cfg.rows * cfg.cols) - (cfg.disabledSeats?.length || 0);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left & Middle: Seat Grid Selection (8 cols) */}
                  <div className="lg:col-span-8 space-y-4 flex flex-col items-center">
                    {/* Stage Indicator */}
                    <div className="w-full max-w-md py-2.5 bg-stone-100 border-2 border-stone-300 rounded-xl text-center text-xs font-black text-stone-700 uppercase tracking-widest shadow-inner">
                      PANGGUNG UTAMA / LAYAR DEPAN
                    </div>

                    {/* Dynamic Seat Grid */}
                    <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20 shadow-sm w-full overflow-x-auto overflow-y-auto max-h-[500px] flex justify-center">
                      <div className="flex flex-col gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-xl min-w-max">
                        {/* Col Headers */}
                        <div className="flex items-center gap-1 justify-center">
                          <div className="w-6 text-center font-bold text-[9px] text-stone-400"></div>
                          {Array.from({ length: cfg.cols }).map((_, cIdx) => {
                            const colNo = cIdx + 1;
                            const isAisle = cfg.aisles?.includes(colNo);

                            return (
                              <Fragment key={`admin-col-hdr-${colNo}`}>
                                <div className="w-7 h-5 text-center font-bold text-[9px] text-stone-400 flex items-center justify-center">
                                  {colNo}
                                </div>
                                {isAisle && (
                                  <div className="w-5 text-center text-[8px] font-bold text-stone-300 italic">
                                    gang
                                  </div>
                                )}
                              </Fragment>
                            );
                          })}
                        </div>

                        {/* Rows */}
                        {Array.from({ length: cfg.rows }).map((_, rIdx) => {
                          const rowLabel = getRowLabel(rIdx);
                          const isVipRow = cfg.vipRows?.includes(rowLabel);

                          return (
                            <div key={`admin-row-${rowLabel}`} className="flex items-center gap-1 justify-center">
                              {/* Row Letter */}
                              <div className={`w-6 font-bold text-xs text-right pr-1 self-center ${isVipRow ? "text-error font-black" : "text-stone-600"}`}>
                                {rowLabel}
                              </div>

                              {/* Seats */}
                              {Array.from({ length: cfg.cols }).map((_, cIdx) => {
                                const colNo = cIdx + 1;
                                const seatNo = `${rowLabel}-${colNo}`;
                                const isAisle = cfg.aisles?.includes(colNo);
                                const isDisabled = cfg.disabledSeats?.includes(seatNo);
                                const isAccessible = cfg.accessibleSeats?.includes(seatNo);

                                if (isDisabled) {
                                  return (
                                    <Fragment key={seatNo}>
                                      <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[8px] bg-stone-200 border border-dashed border-stone-300 text-stone-400 opacity-40 select-none"
                                        title={`Kursi ${seatNo} (Nonaktif)`}
                                      >
                                        ✕
                                      </div>
                                      {isAisle && <div className="w-5 flex items-center justify-center text-stone-400 font-bold opacity-40">│</div>}
                                    </Fragment>
                                  );
                                }

                                const booking = selectedSeatBookings.find((b: any) => b.seatNumber === seatNo);
                                const isBooked = !!booking;
                                const isBlocked = isBooked && booking.userName.includes("Panitia");

                                return (
                                  <Fragment key={seatNo}>
                                    <button
                                      type="button"
                                      onClick={() => handleAdminToggleSeat(seatNo)}
                                      title={`Kursi ${seatNo}${isBooked ? ` - Dipesan oleh ${booking.userName}` : " (Tersedia)"}\nKlik untuk blokir Panitia / batalkan booking`}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-[10px] border transition-all cursor-pointer select-none active:scale-90 ${isBlocked
                                        ? "bg-error border-error text-white font-bold shadow-sm"
                                        : isBooked
                                          ? "bg-stone-300 border-stone-400 text-stone-700 font-bold shadow-xs"
                                          : isAccessible
                                            ? "bg-blue-50 border-blue-400 text-blue-700 font-bold hover:bg-blue-100"
                                            : isVipRow
                                              ? "bg-error/15 border-error text-error hover:bg-error/30 font-bold"
                                              : "bg-primary-container/20 border-primary/20 text-primary hover:bg-primary-container/45 font-semibold"
                                        }`}
                                    >
                                      {colNo}
                                    </button>

                                    {isAisle && (
                                      <div className="w-5 flex items-center justify-center text-[8px] text-stone-400 font-bold opacity-60 select-none">
                                        │
                                      </div>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-primary-container/20 border border-primary/20 rounded-md"></span>
                        <span className="text-on-surface-variant">Tersedia</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-stone-300 border border-stone-400 rounded-md"></span>
                        <span className="text-on-surface-variant">Terisi Peserta</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-error border border-error rounded-md"></span>
                        <span className="text-on-surface-variant font-bold text-error">Reservasi Panitia</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-error/15 border border-error rounded-md"></span>
                        <span className="text-error font-bold">Sweetbox / VIP</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar: Details list (4 cols) */}
                  <div className="lg:col-span-4 space-y-4 font-sans bg-surface-container-low border border-surface-variant/20 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-surface-variant/30 pb-2">
                        <h4 className="font-bold text-sm text-on-surface">
                          Daftar Booking
                        </h4>
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                          {selectedSeatBookings.length} / {totalActive} Kursi
                        </span>
                      </div>

                      <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-2 text-xs">
                        {selectedSeatBookings.length > 0 ? (
                          selectedSeatBookings.map((booking: any) => (
                            <div
                              key={booking.seatNumber}
                              className="p-3 bg-surface border border-surface-variant/20 rounded-xl flex justify-between items-start gap-2 shadow-sm"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${booking.userName.includes("Panitia") ? "bg-error text-white" : "bg-primary/10 text-primary"}`}>
                                    Kursi {booking.seatNumber}
                                  </span>
                                  {booking.userName.includes("Panitia") && (
                                    <span className="text-[9px] font-bold text-error">Blok Panitia</span>
                                  )}
                                </div>
                                <p className="font-bold text-on-surface">{booking.userName}</p>
                                <p className="text-[10px] text-outline">{booking.userEmail}</p>
                                <p className="text-[9px] text-outline italic">Waktu: {booking.bookedAt}</p>
                              </div>
                              <button
                                onClick={() => handleAdminToggleSeat(booking.seatNumber)}
                                className="text-error hover:bg-error-container/20 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Booking / Buka Kursi"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-outline">
                            <span className="material-symbols-outlined text-4xl mb-1">chair_alt</span>
                            <p className="font-bold">Belum ada kursi yang dibooking.</p>
                            <p className="text-[10px] text-outline/80 mt-0.5">Klik kursi di peta untuk membuat reservasi panitia.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-variant/20">
                      <p className="text-[10px] text-outline">
                        💡 <strong>Catatan:</strong> Klik kursi hijau untuk memblokir reservasi Panitia, atau klik kursi merah/abu untuk membatalkan/merilis booking.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer */}
            <div className="flex justify-end pt-6 border-t border-surface-variant/30 mt-6">
              <button
                onClick={closeSeatBookingDetailsModal}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup Denah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT UNGGAHAN & PENJURIAN PER KEGIATAN */}
      {showUploadsModal && selectedUploadsActivity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {selectedUploadsActivity.category === "Lomba" ? "gavel" : "folder_open"}
                  </span>
                  <span>
                    {selectedUploadsActivity.category === "Lomba"
                      ? "Penjurian & Penilaian Karya Lomba"
                      : "Daftar Unggahan Dokumen Peserta"}
                  </span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {selectedUploadsActivity.category === "Lomba"
                    ? "Pantau karya lomba yang dikumpulkan dan masukkan nilai juri untuk kegiatan: "
                    : "Lihat dokumen unggahan dan informasi peserta untuk kegiatan: "}
                  <strong className="text-primary">{selectedUploadsActivity.title}</strong> ({selectedUploadsActivity.category})
                </p>
              </div>
              <button
                onClick={closeActivityUploadsModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Content Table */}
            <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                    {selectedUploadsActivity.category === "Lomba" ? (
                      <>
                        <th className="p-4">Nama Kelompok / Peserta</th>
                        <th className="p-4">Ketua / Kontak</th>
                        <th className="p-4">Lampiran Karya</th>
                        <th className="p-4 w-32">Tanggal Unggah</th>
                        <th className="p-4 w-28 text-center">Nilai Saat Ini</th>
                        <th className="p-4 w-44 text-center">Beri / Update Nilai</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4">Nama Peserta</th>
                        <th className="p-4">Email / Kontak</th>
                        <th className="p-4">Informasi Peserta</th>
                        <th className="p-4">Dokumen Unggahan</th>
                        <th className="p-4 w-36">Tanggal Unggah</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/20 text-sm">
                  {activitySubmissions.length > 0 ? (
                    activitySubmissions.map((sub) => {
                      const matchedUser = users.find(u => u.name === sub.groupName || u.email === sub.leaderName || u.name === sub.leaderName);
                      return (
                        <tr key={sub.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="p-4 font-bold text-on-surface">{sub.groupName}</td>
                          <td className="p-4 text-xs font-semibold text-on-surface-variant">{sub.leaderName}</td>

                          {selectedUploadsActivity.category === "Lomba" ? (
                            <>
                              <td className="p-4">
                                <button
                                  onClick={() => alert(`Mengunduh berkas karya: ${sub.documentName}`)}
                                  className="flex items-center gap-1.5 text-primary hover:underline font-bold text-xs cursor-pointer text-left leading-normal"
                                >
                                  <span className="material-symbols-outlined text-[16px]">attachment</span>
                                  <span>{sub.documentName}</span>
                                </button>
                              </td>
                              <td className="p-4 text-xs text-on-surface-variant font-semibold">
                                {sub.uploadedAt || "-"}
                              </td>
                              <td className="p-4 text-center font-extrabold text-base text-primary">
                                {sub.score === "Belum Dinilai" ? (
                                  <span className="text-error font-normal text-xs italic">Belum Dinilai</span>
                                ) : (
                                  <span>{sub.score} / 100</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 items-center justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={tempScores[sub.id] || ""}
                                    onChange={(e) => handleScoreChange(sub.id, e.target.value)}
                                    className="w-20 p-2 bg-surface-container border border-surface-variant/20 rounded-lg text-center font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                  <button
                                    onClick={() => saveUploadScore(sub.id)}
                                    className="px-3.5 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs cursor-pointer active:scale-95 transition-all shadow"
                                  >
                                    Simpan
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 text-xs text-on-surface-variant">
                                {matchedUser ? (
                                  <span>{matchedUser.university} {matchedUser.nim ? `• NIM: ${matchedUser.nim}` : ""}</span>
                                ) : (
                                  <span className="italic text-outline">Mahasiswa Terdaftar</span>
                                )}
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => alert(`Mengunduh berkas dokumen: ${sub.documentName}`)}
                                  className="flex items-center gap-1.5 text-primary hover:underline font-bold text-xs cursor-pointer text-left leading-normal"
                                >
                                  <span className="material-symbols-outlined text-[16px]">description</span>
                                  <span>{sub.documentName}</span>
                                </button>
                              </td>
                              <td className="p-4 text-xs text-on-surface-variant font-semibold">
                                {sub.uploadedAt || "-"}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={selectedUploadsActivity.category === "Lomba" ? 6 : 5}
                        className="text-center py-10 text-outline italic"
                      >
                        <span className="material-symbols-outlined text-4xl block mb-2 text-outline/65">
                          {selectedUploadsActivity.category === "Lomba" ? "gavel" : "folder_open"}
                        </span>
                        {selectedUploadsActivity.category === "Lomba"
                          ? "Belum ada karya lomba yang dikumpulkan oleh peserta."
                          : "Belum ada dokumen yang diunggah oleh peserta untuk kegiatan ini."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-surface-variant/30 mt-6">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={exportActivityUploadsToExcel}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                  title="Ekspor rekapitulasi data & lembar penjurian ke file Excel (.xls)"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Ekspor Excel</span>
                </button>

                {selectedUploadsActivity.category === "Lomba" && (
                  <>
                    <input
                      type="file"
                      id="excelScoreImporter"
                      accept=".xls,.xlsx,.csv,.txt"
                      onChange={handleImportScoresFromFile}
                      className="hidden"
                    />
                    <label
                      htmlFor="excelScoreImporter"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container text-xs font-bold rounded-xl border border-secondary-container/40 shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Impor nilai juri dari file Excel/CSV yang telah diisi"
                    >
                      <span className="material-symbols-outlined text-[16px]">file_upload</span>
                      <span>Impor Nilai Excel</span>
                    </label>
                  </>
                )}
              </div>

              <button
                onClick={closeActivityUploadsModal}
                className="w-full sm:w-auto px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR SEMUA BERKAS PER MAHASISWA */}
      {showStudentDocsModal && selectedStudentForDocs && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder_shared</span>
                  <span>Portofolio & Berkas KIP-K Mahasiswa</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Daftar seluruh berkas yang diunggah oleh <strong className="text-primary">{selectedStudentForDocs.userName}</strong>.
                </p>
              </div>
              <button
                onClick={closeStudentDocsModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {(() => {
              const studentDocs = kipkDocs.filter(d => d.userName.toLowerCase() === selectedStudentForDocs.userName.toLowerCase());
              const approvedCount = studentDocs.filter(d => d.status === "Disetujui").length;
              const pendingCount = studentDocs.filter(d => d.status === "Menunggu Review").length;
              const revisionCount = studentDocs.filter(d => d.status === "Perlu Perbaikan").length;
              const avgScore = studentDocs.length > 0 ? Math.round(studentDocs.reduce((a, b) => a + (b.score || 0), 0) / studentDocs.length) : 0;

              const categoryColorMap: { [key: string]: string } = {
                "Kartu KIP-K": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
                "SKTM": "bg-amber-500/10 text-amber-700 border-amber-200",
                "Keaktifan Ormawa": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                "Kegiatan Webinar Soft Skill": "bg-sky-500/10 text-sky-700 border-sky-200",
                "Keikutsertaan Kompetisi": "bg-purple-500/10 text-purple-700 border-purple-200",
                "Kegiatan Semadiksi": "bg-primary/10 text-primary border-primary/20",
                "KHS / Transkrip": "bg-blue-500/10 text-blue-700 border-blue-200",
                "Dokumen Tambahan": "bg-stone-500/10 text-stone-700 border-stone-200"
              };

              return (
                <div className="space-y-6">
                  {/* Student Profile Info Card */}
                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-xl shadow-md shrink-0">
                        {selectedStudentForDocs.userName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-on-surface">{selectedStudentForDocs.userName}</h4>
                          <span className="px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-black tracking-wider">
                            KIP-K UNUSA
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                          <span className="font-mono font-bold">NIM: {selectedStudentForDocs.userNim || "-"}</span>
                          <span>•</span>
                          <span>{selectedStudentForDocs.userUniversity || "UNUSA"}</span>
                          {selectedStudentForDocs.userYearOfEntry && (
                            <>
                              <span>•</span>
                              <span>Angkatan {selectedStudentForDocs.userYearOfEntry}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-outline">{selectedStudentForDocs.userEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => openAdminUploadDocModal(selectedStudentForDocs.userName)}
                        className="flex-1 md:flex-initial px-4 py-2 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Tambah Berkas</span>
                      </button>

                      {pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => approveAllDocsForStudent(selectedStudentForDocs.userName)}
                          className="flex-1 md:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">done_all</span>
                          <span>Setujui Semua ({pendingCount})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 bg-surface-container rounded-2xl border border-surface-variant/20">
                      <p className="text-[10px] font-bold text-outline uppercase">Total Berkas</p>
                      <p className="text-lg font-black text-on-surface mt-0.5">{studentDocs.length}</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-2xl border border-surface-variant/20">
                      <p className="text-[10px] font-bold text-outline uppercase">Disetujui</p>
                      <p className="text-lg font-black text-primary mt-0.5">{approvedCount}</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-2xl border border-surface-variant/20">
                      <p className="text-[10px] font-bold text-outline uppercase">Menunggu Review</p>
                      <p className="text-lg font-black text-amber-600 mt-0.5">{pendingCount}</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-2xl border border-surface-variant/20">
                      <p className="text-[10px] font-bold text-outline uppercase">Perlu Perbaikan</p>
                      <p className="text-lg font-black text-error mt-0.5">{revisionCount}</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-2xl border border-surface-variant/20 col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-outline uppercase">Rata-rata Nilai</p>
                      <p className="text-lg font-black text-indigo-600 mt-0.5">{avgScore}%</p>
                    </div>
                  </div>

                  {/* Documents List Table */}
                  <div className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant/30 text-on-surface-variant font-bold text-xs uppercase">
                          <th className="p-3.5 w-10 text-center">No</th>
                          <th className="p-3.5">Kategori & Judul Berkas</th>
                          <th className="p-3.5 w-52">Lampiran File</th>
                          <th className="p-3.5 w-32">Waktu Unggah</th>
                          <th className="p-3.5 w-24 text-center">Nilai</th>
                          <th className="p-3.5 w-32 text-center">Status</th>
                          <th className="p-3.5">Catatan Admin</th>
                          <th className="p-3.5 w-36 text-center">Aksi Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant/20 text-xs">
                        {studentDocs.length > 0 ? (
                          studentDocs.map((doc, idx) => (
                            <tr key={doc.id} className="hover:bg-surface-container-low/40 transition-colors">
                              <td className="p-3.5 text-center font-bold text-outline">{idx + 1}</td>
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryColorMap[doc.category] || "bg-surface-container"}`}>
                                    {doc.category}
                                  </span>
                                  <p className="font-bold text-on-surface text-xs">{doc.title}</p>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => openDocValidationModal(doc)}
                                  className="flex items-center gap-1.5 p-1.5 bg-surface hover:bg-surface-container rounded-xl border border-surface-variant/20 text-left transition-all cursor-pointer group max-w-[200px]"
                                  title="Buka pratinjau dokumen resmi"
                                >
                                  <span className={`material-symbols-outlined text-[18px] shrink-0 ${doc.fileType === "image" ? "text-amber-600" : "text-primary"}`}>
                                    {doc.fileType === "image" ? "image" : "picture_as_pdf"}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-primary truncate group-hover:underline">{doc.fileName}</p>
                                    <p className="text-[9px] text-outline">{doc.fileSize || "1.5 MB"}</p>
                                  </div>
                                </button>
                              </td>
                              <td className="p-3.5 text-[11px] text-on-surface-variant font-medium">{doc.uploadedAt}</td>
                              <td className="p-3.5 text-center">
                                <span className={`font-black text-sm ${doc.status === "Disetujui" ? "text-primary" : doc.status === "Perlu Perbaikan" ? "text-error" : "text-amber-600"}`}>
                                  {doc.score}%
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${doc.status === "Disetujui"
                                  ? "bg-primary/10 border-primary/20 text-primary"
                                  : doc.status === "Perlu Perbaikan"
                                    ? "bg-error/10 border-error/20 text-error"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                                  }`}>
                                  <span className="material-symbols-outlined text-[12px]">
                                    {doc.status === "Disetujui" ? "check_circle" : doc.status === "Perlu Perbaikan" ? "cancel" : "schedule"}
                                  </span>
                                  <span>{doc.status}</span>
                                </span>
                              </td>
                              <td className="p-3.5 text-[11px] text-on-surface-variant max-w-[180px]">
                                {doc.notes ? (
                                  <span className="line-clamp-2" title={doc.notes}>{doc.notes}</span>
                                ) : (
                                  <span className="text-outline italic">Belum ada catatan</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openDocValidationModal(doc)}
                                    className="px-2.5 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                    title="Validasi & Pratinjau Dokumen"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">rate_review</span>
                                    <span>Validasi</span>
                                  </button>

                                  {doc.status !== "Disetujui" && (
                                    <button
                                      type="button"
                                      onClick={() => quickApproveDoc(doc.id, doc.title, doc.userName)}
                                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                      title="Setujui Berkas"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                    className="p-1.5 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Berkas"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-outline italic">
                              Belum ada berkas yang diunggah oleh mahasiswa ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-4 border-t border-surface-variant/20">
                    <button
                      type="button"
                      onClick={closeStudentDocsModal}
                      className="px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU & VALIDASI BERKAS KIP-K MAHASISWA */}
      {showDocValidationModal && selectedDocForValidation && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rate_review</span>
                  <span>Pratinjau & Validasi Berkas KIP-K UNUSA</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Tinjau berkas <strong className="text-primary">{selectedDocForValidation.title}</strong> milik <strong>{selectedDocForValidation.userName}</strong>.
                </p>
              </div>
              <button
                onClick={closeDocValidationModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Document Canvas Simulator (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                      {selectedDocForValidation.category}
                    </span>
                    <span className="text-xs font-mono text-outline">{selectedDocForValidation.fileName}</span>
                  </div>
                  <span className="text-[11px] text-outline">{selectedDocForValidation.fileSize || "1.8 MB"}</span>
                </div>

                {/* Realistic Document Paper Canvas */}
                <div className="bg-white border-2 border-stone-300/80 rounded-2xl p-6 md:p-8 shadow-inner min-h-[420px] flex flex-col justify-between relative overflow-hidden text-stone-800 font-sans">
                  {/* Diagonal Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none rotate-[-25deg]">
                    <span className="text-5xl font-black text-primary uppercase tracking-widest text-center">
                      UNUSA KIP-K REPOSITORY<br />VERIFIED DOCUMENT
                    </span>
                  </div>

                  {/* Header Letterhead */}
                  <div className="border-b-2 border-stone-800 pb-4 mb-4 text-center space-y-1 relative">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        U
                      </span>
                      <span className="font-extrabold text-sm tracking-wide text-primary">
                        UNIVERSITAS NAHDLATUL ULAMA SURABAYA
                      </span>
                    </div>
                    <p className="text-[11px] font-bold tracking-wider text-stone-600 uppercase">
                      Biro Kemahasiswaan & Pengelola Beasiswa KIP Kuliah
                    </p>
                    <p className="text-[9px] text-stone-500">
                      Kampus A: Jl. SMEA No. 57 Surabaya | Kampus B: Jl. Raya Jemursari No. 51-57 Surabaya
                    </p>
                  </div>

                  {/* Document Content Details */}
                  <div className="space-y-4 my-auto relative z-10">
                    <div className="text-center">
                      <span className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-400 pb-0.5 inline-block">
                        LEMBAR VERIFIKASI DOKUMEN BEASISWA KIP-K
                      </span>
                      <p className="text-[10px] text-stone-500 font-mono mt-1">ID Dokumen: {selectedDocForValidation.id}</p>
                    </div>

                    <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Nama Mahasiswa:</span>
                        <strong className="col-span-2 text-stone-900">{selectedDocForValidation.userName}</strong>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">NIM:</span>
                        <span className="col-span-2 font-mono font-bold text-stone-800">{selectedDocForValidation.userNim || "-"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Perguruan Tinggi:</span>
                        <span className="col-span-2 text-stone-800">{selectedDocForValidation.userUniversity}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Kategori Berkas:</span>
                        <span className="col-span-2 font-bold text-primary">{selectedDocForValidation.category}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Judul Dokumen:</span>
                        <span className="col-span-2 text-stone-800 font-semibold">{selectedDocForValidation.title}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Nama Berkas:</span>
                        <span className="col-span-2 font-mono text-primary font-bold">{selectedDocForValidation.fileName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Waktu Pengunggahan:</span>
                        <span className="col-span-2 text-stone-600">{selectedDocForValidation.uploadedAt}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-stone-500">Sumber Unggahan:</span>
                        <span className="col-span-2 text-stone-700 font-semibold">
                          {selectedDocForValidation.uploadedBy === "Admin" ? "Diinput Langsung oleh Administrator" : "Diunggah oleh Mahasiswa"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp & Barcode Footer */}
                  <div className="border-t border-stone-300 pt-3 mt-4 flex justify-between items-center text-[10px] text-stone-600">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                      <div>
                        <p className="font-bold text-stone-800">PORTAL SEMADIKSI UNUSA</p>
                        <p className="text-[9px] text-stone-500">Dokumen Terotentikasi Sistem</p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-stone-400">
                      SEC-KIPK-{selectedDocForValidation.id.toUpperCase()}-2026
                    </div>
                  </div>
                </div>

                {/* Viewer Tools */}
                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Mengunduh file: ${selectedDocForValidation.fileName}`)}
                      className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-surface-variant/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Unduh File Asli</span>
                    </button>
                    <button
                      onClick={() => alert(`Membuka berkas "${selectedDocForValidation.fileName}" di jendela pratinjau penuh.`)}
                      className="px-3 py-1.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-surface-variant/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      <span>Layar Penuh</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-outline italic">Format: {selectedDocForValidation.fileType?.toUpperCase() || "PDF"}</span>
                </div>
              </div>

              {/* Right Column: Validation & Grading Form (5 cols) */}
              <div className="lg:col-span-5 bg-surface-container-low border border-surface-variant/20 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                      <span>Formulir Validasi & Penilaian</span>
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Tentukan status kelayakan dan skor poin keaktifan untuk berkas ini.
                    </p>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant block">Status Validasi</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setValidationStatus("Disetujui")}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${validationStatus === "Disetujui"
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-surface-container border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Disetujui</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setValidationStatus("Perlu Perbaikan")}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${validationStatus === "Perlu Perbaikan"
                          ? "bg-error text-white border-error shadow-sm"
                          : "bg-surface-container border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        <span>Perbaikan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setValidationStatus("Menunggu Review")}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${validationStatus === "Menunggu Review"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-surface-container border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span>Pending</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Slider & Input */}
                  <div className="space-y-2 bg-surface-container-lowest border border-surface-variant/20 rounded-xl p-3.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface">Skor Kelayakan (0 - 100)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={validationScore}
                          onChange={(e) => setValidationScore(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                          className="w-16 p-1.5 text-center font-extrabold text-sm bg-surface-container border border-surface-variant/20 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-primary"
                        />
                        <span className="font-bold text-xs text-outline">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={validationScore}
                      onChange={(e) => setValidationScore(parseInt(e.target.value, 10) || 0)}
                      className="w-full accent-primary cursor-pointer"
                    />

                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-error">0% (Tidak Valid)</span>
                      <span className="text-amber-600">80% (Batas Antrean)</span>
                      <span className="text-primary">100% (Sempurna)</span>
                    </div>

                    <div className="text-center pt-1">
                      {validationScore >= 80 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Memenuhi Syarat Antrean KIP-K (&ge; 80%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded-full">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          Di bawah batas minimum antrean (&lt; 80%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback / Review Notes */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant">Catatan / Umpan Balik Admin</label>
                      <span className="text-[10px] text-outline">Terlihat oleh Mahasiswa</span>
                    </div>

                    <textarea
                      rows={3}
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      placeholder="Tulis catatan evaluasi atau alasan perbaikan berkas..."
                      className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                    />

                    {/* Quick Preset Feedback Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-outline font-semibold">Rekomendasi Cepat:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "Berkas sesuai dan valid.",
                          "Sertifikat buram, mohon scan ulang.",
                          "SK Ormawa belum bertanda tangan basah.",
                          "Masa berlaku dokumen telah kedaluwarsa."
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setValidationNotes(preset)}
                            className="px-2 py-1 bg-surface-container hover:bg-surface-variant/30 text-[10px] font-semibold text-on-surface-variant rounded-lg transition-all cursor-pointer text-left border border-surface-variant/10"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-2 pt-4 border-t border-surface-variant/20 mt-4">
                  <button
                    type="button"
                    onClick={closeDocValidationModal}
                    className="flex-1 py-2.5 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/20 rounded-xl font-bold text-xs cursor-pointer transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={savingValidation}
                    onClick={saveDocValidation}
                    className="flex-1 py-2.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-gray-300"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{savingValidation ? "Menyimpan..." : "Simpan Validasi"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN UPLOAD BERKAS KIP-K BARU */}
      {showAdminUploadDocModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">upload_file</span>
                  <span>Upload / Input Berkas KIP-K Mahasiswa</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Unggah berkas atas nama mahasiswa untuk keperluan administrasi atau pelaporan beasiswa KIP-K.
                </p>
              </div>
              <button
                onClick={closeAdminUploadDocModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminUploadDoc} className="space-y-4">
              {/* Select Mahasiswa */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Pilih Mahasiswa Penerima</label>
                <select
                  value={users.some(u => u.name === adminUploadStudentName) ? adminUploadStudentName : adminUploadStudentName ? "CUSTOM" : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "CUSTOM") {
                      setAdminUploadStudentName("");
                    } else {
                      setAdminUploadStudentName(val);
                    }
                  }}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Pilih Mahasiswa Terdaftar --</option>
                  {users.map((usr) => (
                    <option key={usr.id} value={usr.name}>
                      {usr.name} ({usr.university} • NIM: {usr.nim || "2441" + usr.id.replace("usr-", "")})
                    </option>
                  ))}
                  <option value="CUSTOM">+ Masukkan Nama Mahasiswa Baru...</option>
                </select>

                {(!users.some(u => u.name === adminUploadStudentName) || adminUploadStudentName === "") && (
                  <input
                    type="text"
                    placeholder="Ketik Nama Lengkap Mahasiswa..."
                    value={adminUploadStudentName}
                    onChange={(e) => setAdminUploadStudentName(e.target.value)}
                    className="w-full p-3 mt-1.5 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface font-semibold"
                    required
                  />
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Kategori Berkas Dokumen</label>
                <select
                  value={adminUploadCategory}
                  onChange={(e) => setAdminUploadCategory(e.target.value as any)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  required
                >
                  <option value="Keaktifan Ormawa">Keaktifan Ormawa (SK / Surat Tanda Aktif)</option>
                  <option value="Kegiatan Webinar Soft Skill">Kegiatan Webinar Soft Skill</option>
                  <option value="Keikutsertaan Kompetisi">Keikutsertaan Kompetisi (Sertifikat Juara/Peserta)</option>
                  <option value="Kegiatan Semadiksi">Kegiatan Semadiksi KIP-K</option>
                  <option value="Kartu KIP-K">Kartu Resmi KIP Kuliah</option>
                  <option value="SKTM">SKTM (Surat Keterangan Tidak Mampu)</option>
                  <option value="KHS / Transkrip">KHS / Transkrip Nilai Akademik</option>
                  <option value="Dokumen Tambahan">Dokumen Tambahan / Khusus</option>
                </select>
              </div>

              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Judul / Keterangan Dokumen</label>
                <input
                  type="text"
                  placeholder="Contoh: SK Pengurus Himpunan Mahasiswa 2026"
                  value={adminUploadTitle}
                  onChange={(e) => setAdminUploadTitle(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface font-semibold"
                  required
                />
              </div>

              {/* File Attachment Drag & Drop Simulator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Lampiran Berkas (PDF / PNG / JPG)</label>
                <div className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-2xl p-5 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAdminUploadFileName(file.name);
                        if (!adminUploadTitle) {
                          setAdminUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  <p className="text-xs font-bold text-on-surface mt-1">
                    {adminUploadFileName ? (
                      <span className="text-primary">Berkas terpilih: {adminUploadFileName}</span>
                    ) : (
                      "Klik atau seret berkas dokumen mahasiswa ke area ini"
                    )}
                  </p>
                  <p className="text-[10px] text-outline mt-0.5">Mendukung format PDF, PNG, JPG hingga 10MB</p>
                </div>
              </div>

              {/* Initial Status & Initial Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Status Awal</label>
                  <select
                    value={adminUploadStatus}
                    onChange={(e) => setAdminUploadStatus(e.target.value as any)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <option value="Disetujui">✅ Disetujui Penuh</option>
                    <option value="Menunggu Review">⏳ Menunggu Review Lanjutan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Skor Penilaian Awal (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={adminUploadScore}
                    onChange={(e) => setAdminUploadScore(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface"
                    required
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Catatan Tambahan Admin</label>
                <textarea
                  rows={2}
                  value={adminUploadNotes}
                  onChange={(e) => setAdminUploadNotes(e.target.value)}
                  placeholder="Contoh: Berkas fisik telah diverifikasi langsung di loket kemahasiswaan."
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-surface-variant/30 justify-end">
                <button
                  type="button"
                  onClick={closeAdminUploadDocModal}
                  className="px-5 py-2.5 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adminUploadSubmitting}
                  className="px-6 py-2.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:bg-gray-300"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>{adminUploadSubmitting ? "Mengunggah..." : "Unggah & Simpan Berkas"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORM UPLOAD & EDIT BERITA ACARA */}
      {showBeritaAcaraModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">newspaper</span>
                  <span>{currentBeritaAcara ? "Edit Berita Acara / Agenda" : "Upload Berita Acara / Agenda Baru"}</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Publikasikan arsip berita acara kegiatan yang selesai atau agenda acara mendatang untuk mahasiswa KIP-K.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBeritaAcaraModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBeritaAcara} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Judul Berita Acara / Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Berita Acara Rapat Kerja SEMADIKSI Periode 2026/2027"
                  value={baFormTitle}
                  onChange={(e) => setBaFormTitle(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                />
              </div>

              {/* Status & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Status Pelaksanaan *</label>
                  <select
                    value={baFormStatus}
                    onChange={(e) => setBaFormStatus(e.target.value as any)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <option value="Selesai">✅ Selesai (Dokumentasi & Berita Acara)</option>
                    <option value="Akan Datang">📅 Akan Datang (Agenda Acara Mendatang)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Kategori Kegiatan *</label>
                  <select
                    value={baFormCategory}
                    onChange={(e) => setBaFormCategory(e.target.value as any)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  >
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

              {/* Date, Time, Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tanggal Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 10 Agustus 2026"
                    value={baFormDate}
                    onChange={(e) => setBaFormDate(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Waktu / Jam</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00 - 15:00 WIB"
                    value={baFormTime}
                    onChange={(e) => setBaFormTime(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Jumlah Peserta</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 120"
                    value={baFormAttendeeCount === 0 ? "" : baFormAttendeeCount}
                    onChange={(e) => setBaFormAttendeeCount(Math.max(0, parseInt(e.target.value.replace(/^0+(?=\d)/, "") || "0", 10)))}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Location & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tempat / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Auditorium Tower Lantai 9 Kampus B UNUSA"
                    value={baFormLocation}
                    onChange={(e) => setBaFormLocation(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Penyelenggara Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Biro Kemahasiswaan & SEMADIKSI UNUSA"
                    value={baFormOrganizer}
                    onChange={(e) => setBaFormOrganizer(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Ringkasan Berita Acara *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan poin-poin utama berita acara atau agenda kegiatan..."
                  value={baFormSummary}
                  onChange={(e) => setBaFormSummary(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Isi Notulensi / Berita Acara Lengkap</label>
                <textarea
                  rows={4}
                  placeholder="Uraikan jalannya kegiatan, susunan acara, hasil keputusan rapat, dan notulensi resmi..."
                  value={baFormContent}
                  onChange={(e) => setBaFormContent(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                />
              </div>

              {/* Banner Img, Attachment & External Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">URL Gambar Banner</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={baFormBannerImg}
                    onChange={(e) => setBaFormBannerImg(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Nama File Lampiran (PDF)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Berita_Acara_Raker.pdf"
                    value={baFormAttachmentFileName}
                    onChange={(e) => setBaFormAttachmentFileName(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tautan Eksternal / Drive</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={baFormExternalLink}
                    onChange={(e) => setBaFormExternalLink(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-surface-variant/30 justify-end">
                <button
                  type="button"
                  onClick={closeBeritaAcaraModal}
                  className="px-5 py-2.5 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Simpan Berita Acara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORM UPLOAD & EDIT INFO BEASISWA */}
      {showBeasiswaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-6">
              <div>
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <span>{currentBeasiswa ? "Edit Info Beasiswa" : "Upload / Tambah Info Beasiswa Baru"}</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Publikasikan informasi pembukaan program beasiswa untuk mahasiswa KIP-K dan umum di UNUSA.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBeasiswaModal}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBeasiswa} className="space-y-4">
              {/* Title & Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Nama Program Beasiswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Beasiswa KIP Kuliah Merdeka Kemendikbudristek 2026"
                    value={beaFormTitle}
                    onChange={(e) => setBeaFormTitle(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Instansi / Penyelenggara *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kemendikbudristek RI & UNUSA"
                    value={beaFormProvider}
                    onChange={(e) => setBeaFormProvider(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Kategori Beasiswa *</label>
                  <select
                    value={beaFormCategory}
                    onChange={(e) => setBeaFormCategory(e.target.value as any)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <option value="KIP Kuliah">KIP Kuliah</option>
                    <option value="Prestasi Akademik">Prestasi Akademik</option>
                    <option value="Prestasi Non-Akademik">Prestasi Non-Akademik</option>
                    <option value="Bantuan UKT / Biaya Hidup">Bantuan UKT / Biaya Hidup</option>
                    <option value="Beasiswa Swasta / BUMN">Beasiswa Swasta / BUMN</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Status Pendaftaran *</label>
                  <select
                    value={beaFormStatus}
                    onChange={(e) => setBeaFormStatus(e.target.value as any)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-on-surface cursor-pointer"
                  >
                    <option value="Dibuka">🟢 Dibuka (Sedang Berlangsung)</option>
                    <option value="Segera Dibuka">🟡 Segera Dibuka</option>
                    <option value="Ditutup">🔴 Ditutup</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tanggal Buka Pendaftaran</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1 Juni 2026"
                    value={beaFormOpenDate}
                    onChange={(e) => setBeaFormOpenDate(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tanggal Penutupan (Deadline)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 30 September 2026"
                    value={beaFormCloseDate}
                    onChange={(e) => setBeaFormCloseDate(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Coverage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Cakupan Pembiayaan & Benefit *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bebas Biaya UKT 100% 8 Semester + Biaya Hidup Rp 1.400.000/bln"
                  value={beaFormCoverage}
                  onChange={(e) => setBeaFormCoverage(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">
                  Persyaratan Pendaftaran (Satu baris per syarat)
                </label>
                <textarea
                  rows={3}
                  placeholder={"Mahasiswa aktif UNUSA semester 2\nIPK minimal 3.25\nMemiliki kartu KIP/KKS"}
                  value={beaFormRequirements}
                  onChange={(e) => setBeaFormRequirements(e.target.value)}
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface font-mono"
                />
              </div>

              {/* Selection Stages & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Tahapan / Alur Seleksi</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: 1. Seleksi Berkas -> 2. Wawancara -> 3. Pengumuman Kelulusan"
                    value={beaFormSelectionStages}
                    onChange={(e) => setBeaFormSelectionStages(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Deskripsi Singkat Program</label>
                  <textarea
                    rows={2}
                    placeholder="Uraikan gambaran umum dan tujuan program beasiswa ini..."
                    value={beaFormDescription}
                    onChange={(e) => setBeaFormDescription(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Banner Img, Guide File & Apply URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">URL Poster / Banner</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={beaFormBannerImg}
                    onChange={(e) => setBeaFormBannerImg(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Nama File Panduan (PDF)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Buku_Panduan_KIPK.pdf"
                    value={beaFormGuideFileName}
                    onChange={(e) => setBeaFormGuideFileName(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant block">Link Pendaftaran Resmi</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={beaFormApplyUrl}
                    onChange={(e) => setBeaFormApplyUrl(e.target.value)}
                    className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-surface-variant/30 justify-end">
                <button
                  type="button"
                  onClick={closeBeasiswaModal}
                  className="px-5 py-2.5 border border-surface-variant text-on-surface-variant hover:bg-surface-variant/15 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Simpan Info Beasiswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PRATINJAU BERITA ACARA RESMI (ADMIN) */}
      {showBeritaAcaraDetailModal && selectedBeritaAcaraForDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">description</span>
                </span>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Pratinjau Berita Acara Resmi</h3>
                  <p className="text-xs text-on-surface-variant">ID: {selectedBeritaAcaraForDetail.id} • Diterbitkan oleh {selectedBeritaAcaraForDetail.author}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBeritaAcaraDetailModal(false);
                  setSelectedBeritaAcaraForDetail(null);
                }}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="bg-white border-2 border-stone-300/80 rounded-2xl p-6 md:p-8 shadow-inner space-y-6 text-stone-800 font-sans">
              <div className="border-b-2 border-stone-800 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">U</span>
                  <span className="font-extrabold text-sm md:text-base tracking-wide text-primary">UNIVERSITAS NAHDLATUL ULAMA SURABAYA</span>
                </div>
                <p className="text-xs font-bold tracking-wider text-stone-700 uppercase">SERIKAT MAHASISWA BIDIKMISI & KIP KULIAH (SEMADIKSI) UNUSA</p>
                <p className="text-[10px] text-stone-500">Sekretariat: Gedung Fastron Lantai 3 Kampus B UNUSA, Jl. Raya Jemursari No. 51-57 Surabaya</p>
              </div>

              <div className="text-center space-y-1">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold inline-block uppercase tracking-wider">
                  {selectedBeritaAcaraForDetail.category} • {selectedBeritaAcaraForDetail.status === "Selesai" ? "Laporan Berita Acara" : "Agenda Acara"}
                </span>
                <h2 className="font-extrabold text-lg md:text-xl text-stone-900 leading-snug pt-1">
                  {selectedBeritaAcaraForDetail.title}
                </h2>
                <p className="text-xs text-stone-500 font-mono">Pelaksanaan: {selectedBeritaAcaraForDetail.date} {selectedBeritaAcaraForDetail.time ? `(${selectedBeritaAcaraForDetail.time})` : ""}</p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block">Tempat / Lokasi:</span>
                  <strong className="text-stone-800">{selectedBeritaAcaraForDetail.location}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Penyelenggara:</span>
                  <strong className="text-stone-800">{selectedBeritaAcaraForDetail.organizer}</strong>
                </div>
                {selectedBeritaAcaraForDetail.attendeeCount && (
                  <div>
                    <span className="text-stone-500 block">Partisipasi / Kehadiran:</span>
                    <strong className="text-primary font-bold">{selectedBeritaAcaraForDetail.attendeeCount} Peserta</strong>
                  </div>
                )}
                <div>
                  <span className="text-stone-500 block">Waktu Terbit:</span>
                  <span className="text-stone-700 font-medium">{selectedBeritaAcaraForDetail.createdAt}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 border-b border-stone-300 pb-1">
                  Uraian Berita Acara & Rangkuman Kegiatan:
                </h4>
                <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line space-y-2 pt-1">
                  {selectedBeritaAcaraForDetail.content}
                </div>
              </div>

              {selectedBeritaAcaraForDetail.attachmentFileName && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
                    <div>
                      <p className="font-bold text-xs text-stone-800">{selectedBeritaAcaraForDetail.attachmentFileName}</p>
                      <p className="text-[10px] text-stone-500">Lampiran Resmi Berita Acara • {selectedBeritaAcaraForDetail.attachmentFileSize || "2.0 MB"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh dokumen: ${selectedBeritaAcaraForDetail.attachmentFileName}`)}
                    className="px-4 py-2 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Unduh PDF</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-5 border-t border-surface-variant/30 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowBeritaAcaraDetailModal(false);
                  setSelectedBeritaAcaraForDetail(null);
                }}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PRATINJAU BEASISWA (ADMIN) */}
      {showBeasiswaDetailModal && selectedBeasiswaForDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </span>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Detail Info Beasiswa</h3>
                  <p className="text-xs text-on-surface-variant">Instansi: <strong className="text-primary">{selectedBeasiswaForDetail.provider}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBeasiswaDetailModal(false);
                  setSelectedBeasiswaForDetail(null);
                }}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="h-52 rounded-2xl overflow-hidden relative shadow-inner bg-surface-container">
                <img
                  src={selectedBeasiswaForDetail.bannerImg}
                  alt={selectedBeasiswaForDetail.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-primary text-white rounded-full text-xs font-bold">
                      {selectedBeasiswaForDetail.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedBeasiswaForDetail.status === "Dibuka" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                    }`}>
                      Status: {selectedBeasiswaForDetail.status}
                    </span>
                  </div>
                  <h2 className="font-extrabold text-xl md:text-2xl drop-shadow">{selectedBeasiswaForDetail.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:col-span-2 space-y-1">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">card_giftcard</span>
                    <span>Cakupan Pembiayaan & Benefit:</span>
                  </p>
                  <p className="text-sm font-bold text-on-surface leading-snug">
                    {selectedBeasiswaForDetail.coverage}
                  </p>
                </div>

                <div className="bg-surface-container border border-surface-variant/20 rounded-2xl p-4 space-y-1">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                    <span>Periode Pendaftaran:</span>
                  </p>
                  <p className="text-xs font-bold text-on-surface">
                    {selectedBeasiswaForDetail.openDate} s.d. {selectedBeasiswaForDetail.closeDate}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                  <span>Deskripsi Program</span>
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-2xl border border-surface-variant/20">
                  {selectedBeasiswaForDetail.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
                  <span>Persyaratan Pendaftar:</span>
                </h4>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/20 space-y-2">
                  <ul className="space-y-2">
                    {selectedBeasiswaForDetail.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedBeasiswaForDetail.selectionStages && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
                    <span>Tahapan Seleksi:</span>
                  </h4>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant/20 text-xs font-medium text-on-surface leading-relaxed">
                    {selectedBeasiswaForDetail.selectionStages}
                  </div>
                </div>
              )}

              {selectedBeasiswaForDetail.guideFileName && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">picture_as_pdf</span>
                    <div>
                      <p className="font-bold text-xs text-on-surface">{selectedBeasiswaForDetail.guideFileName}</p>
                      <p className="text-[10px] text-outline">Buku Panduan & Petunjuk Teknis Resmi • {selectedBeasiswaForDetail.guideFileSize || "2.5 MB"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh dokumen panduan: ${selectedBeasiswaForDetail.guideFileName}`)}
                    className="px-4 py-2 bg-primary text-on-primary hover:brightness-110 text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Unduh Panduan (PDF)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-surface-variant/30 mt-6">
              {selectedBeasiswaForDetail.applyUrl ? (
                <a
                  href={selectedBeasiswaForDetail.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Link Portal Pendaftaran</span>
                </a>
              ) : <div></div>}

              <button
                type="button"
                onClick={() => {
                  setShowBeasiswaDetailModal(false);
                  setSelectedBeasiswaForDetail(null);
                }}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-variant/30 text-on-surface-variant rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAYAR PROYEKTOR QR CODE ABSENSI KEGIATAN (ADMIN) */}
      {showAdminProjectorQrModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl relative text-white flex flex-col p-6 md:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl md:text-2xl text-emerald-400 tracking-tight">
                    Layar QR Code Presensi Kegiatan
                  </h3>
                  <p className="text-xs text-stone-400">
                    Tampilkan layar ini di proyektor auditorium untuk dipindai oleh peserta acara.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdminProjectorQrModal(false)}
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content: Activity Selector & Big Projector QR */}
            <div className="py-6 space-y-6 text-center">
              {/* Activity Selector */}
              <div className="max-w-xl mx-auto space-y-2">
                <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Pilih Kegiatan yang Sedang Berlangsung:
                </label>
                <select
                  value={projectorActivity}
                  onChange={(e) => setProjectorActivity(e.target.value)}
                  className="w-full p-3.5 bg-stone-800 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-2xl text-xs md:text-sm font-bold text-white outline-none cursor-pointer text-center"
                >
                  {activities.map((act) => (
                    <option key={act.id} value={act.title} className="bg-stone-900 text-white">
                      {act.title}
                    </option>
                  ))}
                  {beritaAcaraList.map((ba) => (
                    <option key={ba.id} value={ba.title} className="bg-stone-900 text-white">
                      {ba.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Big High-Contrast QR Code Card */}
              <div className="bg-white text-stone-900 p-8 rounded-3xl max-w-sm mx-auto shadow-2xl space-y-4 border-4 border-emerald-400">
                <div className="space-y-1 border-b border-stone-200 pb-3">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                    SCAN UNTUK ABSEN
                  </span>
                  <h4 className="font-extrabold text-sm text-stone-900 line-clamp-2 leading-tight">
                    {projectorActivity}
                  </h4>
                </div>

                {/* Simulated High-Res Vector QR Matrix */}
                <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-2xl border border-stone-300">
                  {(() => {
                    const size = 25;
                    const cells = [];
                    const getLocator = (r: number, c: number, rS: number, cS: number) => {
                      if (r >= rS && r < rS + 7 && c >= cS && c < cS + 7) {
                        const dr = r - rS;
                        const dc = c - cS;
                        if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return "bg-black";
                        if (dr === 1 || dr === 5 || dc === 1 || dc === 5) return "bg-white";
                        return "bg-black";
                      }
                      return null;
                    };

                    for (let r = 0; r < size; r++) {
                      for (let c = 0; c < size; c++) {
                        const tl = getLocator(r, c, 0, 0);
                        if (tl) { cells.push(tl); continue; }
                        const tr = getLocator(r, c, 0, size - 7);
                        if (tr) { cells.push(tr); continue; }
                        const bl = getLocator(r, c, size - 7, 0);
                        if (bl) { cells.push(bl); continue; }

                        const seed = (r * 31 + c * 17 + projectorActivity.length * 7);
                        cells.push(seed % 3 === 0 || seed % 5 === 0 ? "bg-black" : "bg-white");
                      }
                    }

                    return (
                      <div
                        style={{ display: "grid", gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                        className="gap-[0.5px] w-48 h-48 bg-white p-1"
                      >
                        {cells.map((cls, idx) => (
                          <div key={idx} className={`w-full h-full ${cls}`} />
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-stone-500 font-semibold">
                    Arahkan kamera HP ke QR Code di atas
                  </p>
                  <p className="font-mono text-[9px] text-emerald-800 font-bold bg-emerald-50 py-1 px-2 rounded-lg truncate">
                    /absensi?kegiatan={encodeURIComponent(projectorActivity.slice(0, 20))}...
                  </p>
                </div>
              </div>

              {/* Real-time stats for this activity */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
                <div className="px-4 py-2 bg-stone-800 rounded-xl border border-stone-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Peserta Telah Presensi: </span>
                  <strong className="text-emerald-400 font-bold text-sm">
                    {attendanceList.filter(a => a.activityTitle === projectorActivity).length} Orang
                  </strong>
                </div>

                <a
                  href={`/absensi?kegiatan=${encodeURIComponent(projectorActivity)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Buka Form Absensi Mahasiswa</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-800">
              <span className="text-[11px] text-stone-500">
                Sistem E-Presensi Mandiri SEMADIKSI UNUSA • Real-Time Database Sync
              </span>

              <button
                type="button"
                onClick={() => setShowAdminProjectorQrModal(false)}
                className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Tutup Layar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL BUKTI & VALIDASI PRESENSI MAHASISWA (ADMIN) */}
      {showAttendanceDetailModal && selectedAttendanceForDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </span>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Validasi Bukti Kehadiran Mahasiswa</h3>
                  <p className="text-xs text-on-surface-variant">ID Presensi: {selectedAttendanceForDetail.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAttendanceDetailModal(false);
                  setSelectedAttendanceForDetail(null);
                }}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant/30 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Evidence Photo Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface text-xs uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[16px]">photo_camera</span>
                    <span>Foto Bukti Mengikuti Kegiatan</span>
                  </span>
                  <span className="text-[10px] text-outline">{selectedAttendanceForDetail.proofFileName}</span>
                </div>

                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-surface-variant/30 bg-surface-container relative shadow-inner">
                  <img
                    src={selectedAttendanceForDetail.proofImageUrl}
                    alt="Bukti Kehadiran"
                    className="w-full h-full object-contain bg-black/5"
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="bg-surface-container-low border border-surface-variant/20 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-outline text-[10px] block">Nama Mahasiswa:</span>
                  <strong className="text-on-surface text-sm">{selectedAttendanceForDetail.studentName}</strong>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">NIM:</span>
                  <span className="font-mono font-bold text-primary text-sm">{selectedAttendanceForDetail.studentNim}</span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Asal Perguruan Tinggi:</span>
                  <strong className="text-on-surface">{selectedAttendanceForDetail.university}</strong>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Kontak / Email:</span>
                  <span className="text-on-surface-variant font-medium">
                    {selectedAttendanceForDetail.studentPhone || "-"} • {selectedAttendanceForDetail.studentEmail || "-"}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Nama Kegiatan:</span>
                  <strong className="text-primary">{selectedAttendanceForDetail.activityTitle}</strong>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Waktu Presensi & Tanggal:</span>
                  <span className="text-on-surface font-semibold">{selectedAttendanceForDetail.timestamp}</span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Lokasi GPS:</span>
                  <span className="text-on-surface font-medium">{selectedAttendanceForDetail.locationName || "Kampus B UNUSA"}</span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Status Saat Ini:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] mt-0.5 ${
                    selectedAttendanceForDetail.status === "Hadir"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : selectedAttendanceForDetail.status === "Menunggu Verifikasi"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-error/10 text-error border border-error/20"
                  }`}>
                    {selectedAttendanceForDetail.status}
                  </span>
                </div>
              </div>

              {/* Admin Validation Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant block">Catatan Verifikasi Admin</label>
                <textarea
                  rows={2}
                  value={validationAdminNotes}
                  onChange={(e) => setValidationAdminNotes(e.target.value)}
                  placeholder="Contoh: Bukti foto selfie di auditorium terverifikasi sah."
                  className="w-full p-3 bg-surface-container border border-surface-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs text-on-surface"
                />
              </div>

              {/* Decision Actions */}
              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-surface-variant/30 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleValidateAttendance(selectedAttendanceForDetail.id, "Ditolak", validationAdminNotes);
                    setShowAttendanceDetailModal(false);
                  }}
                  className="px-4 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>Tolak Bukti</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleValidateAttendance(selectedAttendanceForDetail.id, "Menunggu Verifikasi", validationAdminNotes);
                    setShowAttendanceDetailModal(false);
                  }}
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  <span>Set Menunggu Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleValidateAttendance(selectedAttendanceForDetail.id, "Hadir", validationAdminNotes);
                    setShowAttendanceDetailModal(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Setujui (Hadir Sah)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
