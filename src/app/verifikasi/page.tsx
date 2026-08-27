"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SignatoryItem {
  name: string;
  nipNim: string;
  type: "NIP" | "NIM";
}

interface ValidCert {
  code: string;
  title: string;
  recipientName: string;
  author: string;
  hash: string;
  date: string;
  signatories: SignatoryItem[];
}

function VerifikasiContent() {
  const searchParams = useSearchParams();
  const [certCodeInput, setCertCodeInput] = useState("");
  const [searchedCode, setSearchedCode] = useState<string | null>(null);
  const [matchedCert, setMatchedCert] = useState<ValidCert | null>(null);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Default valid certificates list
  const defaultValidCerts: ValidCert[] = [
    {
      code: "CERT-LKMB-2024-0891",
      title: "Sertifikat Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
      recipientName: "Ahmad Fauzan",
      author: "SEMADIKSI Divisi Keorganisasian",
      hash: "e566c805ba07b8c6869e1f37847d0287",
      date: "2024-11-16 09:12:05",
      signatories: [
        { name: "Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", nipNim: "197508122002121001", type: "NIP" },
        { name: "Muhammad Fatih (Ketua Umum SEMADIKSI)", nipNim: "3130021045", type: "NIM" }
      ]
    },
    {
      code: "CERT-VOL-2024-1102",
      title: "Sertifikat Volunteer Mengajar Pesisir - SEMADIKSI Berbagi",
      recipientName: "Siti Nurhaliza",
      author: "SEMADIKSI Divisi Pengabdian Masyarakat",
      hash: "8c7a6e112d88f6c99c5d01243170e881",
      date: "2024-10-13 14:35:10",
      signatories: [
        { name: "Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", nipNim: "197508122002121001", type: "NIP" },
        { name: "Fauzi Rahmat (Ketua Divisi Pengabdian)", nipNim: "2140021088", type: "NIM" }
      ]
    },
    {
      code: "CERT-WD-2024-0345",
      title: "Sertifikat Workshop Web Development Modern dengan Next.js",
      recipientName: "Muhammad Ilham",
      author: "SEMADIKSI Divisi IPTEK & Humas",
      hash: "f566c805ba07b8c6869e1f37847d0345",
      date: "2024-09-05 16:40:02",
      signatories: [
        { name: "Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", nipNim: "197508122002121001", type: "NIP" },
        { name: "Ferdian W. (Senior Frontend Engineer / Pemateri)", nipNim: "198805202015041002", type: "NIP" }
      ]
    }
  ];

  // Helper to check code validity
  const checkCode = (codeToCheck: string) => {
    const codeClean = codeToCheck.trim().toUpperCase();
    setSearchedCode(codeClean);

    // 1. Check default list
    let found = defaultValidCerts.find(c => c.code === codeClean);

    if (found) {
      setMatchedCert(found);
      setIsValidCode(true);
      return;
    }

    // 2. Check localStorage for admin certificates
    try {
      const storedCertsStr = localStorage.getItem("semadiksi_certificates_admin");
      if (storedCertsStr) {
        const storedCerts = JSON.parse(storedCertsStr);
        const adminCert = storedCerts.find((c: any) => c.code.toUpperCase() === codeClean);
        
        if (adminCert) {
          const mockCert: ValidCert = {
            code: adminCert.code,
            title: `Sertifikat Kegiatan: ${adminCert.activityTitle}`,
            recipientName: adminCert.recipientName || adminCert.studentName || "Ahmad Fauzan",
            author: "SEMADIKSI Panitia Pelaksana",
            hash: `h${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}8e1f37847d0287`,
            date: `${adminCert.dateUploaded} 17:00:00`,
            signatories: [
              { name: "Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", nipNim: "197508122002121001", type: "NIP" },
              { name: "Muhammad Fatih (Ketua Umum SEMADIKSI)", nipNim: "3130021045", type: "NIM" }
            ]
          };
          setMatchedCert(mockCert);
          setIsValidCode(true);
          return;
        }
      }

      // Check student registered completed activities
      const studentCertsStr = localStorage.getItem("semadiksi_registered_activities");
      if (studentCertsStr) {
        const studentCerts = JSON.parse(studentCertsStr);
        const matchStudent = studentCerts.find((c: any) => c.code && c.code.toUpperCase() === codeClean && c.status === "Selesai");
        
        if (matchStudent) {
          const mockCert: ValidCert = {
            code: matchStudent.code,
            title: matchStudent.title,
            recipientName: matchStudent.recipientName || matchStudent.studentName || "Ahmad Fauzan",
            author: matchStudent.organizer || "SEMADIKSI Panitia Pelaksana",
            hash: `d8b5c${Math.random().toString(16).substring(2, 12)}e1f37847d0287`,
            date: `${matchStudent.date} 16:30:00`,
            signatories: [
              { name: "Dr. Ir. Wahyu Utomo, M.Si. (Pembina SEMADIKSI)", nipNim: "197508122002121001", type: "NIP" },
              { name: "Muhammad Fatih (Ketua Umum SEMADIKSI)", nipNim: "3130021045", type: "NIM" }
            ]
          };
          setMatchedCert(mockCert);
          setIsValidCode(true);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setMatchedCert(null);
    setIsValidCode(false);
  };

  useEffect(() => {
    // Parse URL parameter
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCertCodeInput(urlCode);
      checkCode(urlCode);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certCodeInput.trim()) {
      checkCode(certCodeInput);
    }
  };

  // Simulate scanning QR Code
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Pick a random valid certificate to simulate a successful scan
      const codes = ["CERT-LKMB-2024-0891", "CERT-VOL-2024-1102", "CERT-WD-2024-0345"];
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      setCertCodeInput(randomCode);
      setIsScanning(false);
      checkCode(randomCode);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none pb-12">
      {/* Banner Header - Matching user's screenshot digital signature layout */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center py-6 px-4 shadow-md shrink-0">
        <p className="tracking-widest uppercase text-xs font-semibold opacity-90">Digital Signature Verification</p>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide mt-1 uppercase">
          Portal Validasi Sertifikat SEMADIKSI
        </h1>
      </div>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 mt-8 flex flex-col items-center">
        {/* Search & Scan Form */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Verifikasi Keaslian Sertifikat</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                qr_code_scanner
              </span>
              <input
                type="text"
                placeholder="Masukkan Nomor Seri Sertifikat (contoh: CERT-LKMB-2024-0891)"
                value={certCodeInput}
                onChange={(e) => setCertCodeInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-mono tracking-wide"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Verifikasi
              </button>
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="px-4 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:bg-gray-300"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                {isScanning ? "Scanning..." : "Scan QR"}
              </button>
            </div>
          </form>

          {/* Scanner Viewport Simulation */}
          {isScanning && (
            <div className="mt-6 w-full max-w-sm mx-auto aspect-video rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center text-white">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <span className="material-symbols-outlined text-4xl text-emerald-400 animate-bounce">qr_code_2</span>
              <p className="text-[10px] tracking-wider uppercase font-semibold text-emerald-300 mt-2">Membuka Kamera QR Scanner...</p>
            </div>
          )}
        </section>

        {/* Verification Result Display */}
        {searchedCode && (
          <section className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isValidCode && matchedCert ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-8">
                {/* 1. INFORMASI DOKUMEN - Banyuwangi Screenshot layout */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-b border-slate-100 pb-2 mb-4">
                    Informasi Dokumen
                  </h3>
                  
                  <div className="divide-y divide-slate-100 text-sm font-medium">
                    <div className="grid grid-cols-3 py-3 items-center">
                      <span className="text-slate-400">STATUS</span>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span className="text-emerald-600 font-extrabold tracking-wider uppercase text-sm">VALID</span>
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] font-bold">check_circle</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 py-3 items-center">
                      <span className="text-slate-400">Hash Dokumen</span>
                      <span className="col-span-2 font-mono text-xs text-slate-600 select-all break-all bg-slate-50 p-1.5 rounded border border-slate-200/50">
                        {matchedCert.hash}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-3 items-center">
                      <span className="text-slate-400">Nama Penerima</span>
                      <span className="col-span-2 font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{matchedCert.recipientName}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] border border-blue-200 font-bold">
                          Penerima Sah
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 py-3">
                      <span className="text-slate-400">Judul Dokumen</span>
                      <span className="col-span-2 font-bold text-slate-800">{matchedCert.title}</span>
                    </div>

                    <div className="grid grid-cols-3 py-3">
                      <span className="text-slate-400">Author Dokumen</span>
                      <span className="col-span-2 text-slate-700">{matchedCert.author}</span>
                    </div>

                    <div className="grid grid-cols-3 py-3 items-center">
                      <span className="text-slate-400">File Dokumen</span>
                      <div className="col-span-2">
                        <button
                          onClick={() => alert(`Mengunduh berkas sertifikat asli:\nNomor Seri: ${matchedCert.code}`)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span> Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. INFORMASI PENANDATANGAN - Banyuwangi Screenshot layout */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-b border-slate-100 pb-2 mb-4">
                    Informasi Penandatanganan (TTE)
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-3 w-10 text-center">NO</th>
                          <th className="p-3 w-48 text-center">NIP / NIM</th>
                          <th className="p-3">NAMA PENANDATANGAN</th>
                          <th className="p-3 w-44">TANGGAL</th>
                          <th className="p-3 w-20 text-center">CERTIFIED</th>
                          <th className="p-3 w-20 text-center">VALIDITY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {matchedCert.signatories.map((sig, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-center">{idx + 1}</td>
                            <td className="p-3 text-center font-mono text-xs font-bold text-slate-700 bg-slate-50/50">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                sig.type === "NIP"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {sig.type}. {sig.nipNim}
                              </span>
                            </td>
                            <td className="p-3 text-slate-800 font-bold">{sig.name}</td>
                            <td className="p-3 text-slate-500 flex items-center gap-1">
                              <span>{matchedCert.date}</span>
                              <span className="material-symbols-outlined text-emerald-600 text-[14px] font-bold">check</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">done</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="material-symbols-outlined text-emerald-600 font-bold text-[18px]">done</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Verification Seal Badge footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">S</span>
                    <span>BEASISWA KIP-K PORTAL</span>
                  </div>
                  <span>©2026 Digital Signature Management</span>
                </div>
              </div>
            ) : (
              // Invalid Code Alert
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                <span className="material-symbols-outlined text-red-600 text-5xl font-bold animate-pulse">warning</span>
                <h3 className="text-lg font-bold text-red-800 uppercase tracking-wide">STATUS: TIDAK VALID / PALSU</h3>
                <p className="text-sm text-red-700 max-w-lg mx-auto leading-relaxed">
                  Dokumen dengan nomor seri <strong className="font-mono text-red-950 font-extrabold bg-red-100 px-2 py-0.5 rounded border border-red-200">{searchedCode}</strong> tidak terdaftar dalam database sertifikasi resmi SEMADIKSI.
                </p>
                <div className="bg-white rounded-xl border border-red-100 p-3 max-w-md mx-auto text-left text-xs text-red-600 space-y-1">
                  <p className="font-bold">⚠️ PERINGATAN:</p>
                  <p className="leading-normal">Mohon waspada terhadap potensi pemalsuan sertifikat kegiatan. Hubungi sekretariat SEMADIKSI untuk memverifikasi dokumen lebih lanjut.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Public Home redirect */}
      <footer className="mt-auto text-center pt-8 text-xs text-slate-400">
        <Link href="/masuk" className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Kembali ke Portal Masuk Mahasiswa
        </Link>
      </footer>
    </div>
  );
}

export default function VerifikasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-blue-600 font-bold">Loading Verification System...</div>}>
      <VerifikasiContent />
    </Suspense>
  );
}
