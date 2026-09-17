"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Daftar() {
  const router = useRouter();
  const [kipStatus, setKipStatus] = useState("kipk");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [university, setUniversity] = useState("Universitas Nahdlatul Ulama Surabaya");
  const [nim, setNim] = useState("");
  const [yearOfEntry, setYearOfEntry] = useState("");
  const [kipDocName, setKipDocName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullNameFocus, setFullNameFocus] = useState(false);
  const [contactFocus, setContactFocus] = useState(false);
  const [universityFocus, setUniversityFocus] = useState(false);
  const [nimFocus, setNimFocus] = useState(false);
  const [yearOfEntryFocus, setYearOfEntryFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Password konfirmasi tidak cocok!");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter!");
      return;
    }

    if (kipStatus === "kipk" && !kipDocName) {
      setErrorMessage("Silakan unggah dokumen bukti penerima KIP-K terlebih dahulu!");
      return;
    }

    const emailClean = contact.trim().toLowerCase();
    const effectiveUniversity =
      kipStatus === "kipk"
        ? "Universitas Nahdlatul Ulama Surabaya"
        : university.trim() || "Universitas Nahdlatul Ulama Surabaya";

    setIsSubmitting(true);

    try {
      // Send registration data to centralized SQLite database
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: emailClean,
          password: password,
          nim: nim.trim(),
          angkatan: yearOfEntry.trim(),
          university: effectiveUniversity,
          kipStatus: kipStatus === "kipk" ? "KIP UNUSA" : "Umum",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal melakukan pendaftaran akun.");
        setIsSubmitting(false);
        return;
      }

      // Sync registered user to localStorage for offline cache
      try {
        const storedUsers = localStorage.getItem("semadiksi_users");
        const usersList = storedUsers ? JSON.parse(storedUsers) : [];

        if (!usersList.some((u: any) => u.email.toLowerCase() === emailClean)) {
          usersList.push({
            id: data.user?.id || `usr-${Date.now()}`,
            name: fullName.trim(),
            email: emailClean,
            university: effectiveUniversity,
            kipStatus: kipStatus === "kipk" ? "KIP UNUSA" : "Umum",
            verificationStatus: kipStatus === "kipk" ? "Pending" : "Verified",
            password: password,
            nim: nim.trim(),
            yearOfEntry: yearOfEntry.trim(),
            kipDocName: kipStatus === "kipk" ? kipDocName : undefined,
          });
          localStorage.setItem("semadiksi_users", JSON.stringify(usersList));
        }
      } catch (err) { }

      alert("Pendaftaran akun berhasil! Akun Anda telah tersimpan di database. Silakan masuk.");
      router.push("/masuk");
    } catch (err: any) {
      console.error("Register request error:", err);
      setErrorMessage("Tidak dapat terhubung ke server pendaftaran. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-mesh min-h-screen flex flex-col items-center justify-center py-xl px-margin-mobile relative overflow-hidden">
      {/* Atmospheric Blobs */}
      <div className="organic-blob bg-primary w-[300px] h-[300px] -top-20 -left-20 animate-pulse"></div>
      <div className="organic-blob bg-primary-fixed w-[400px] h-[400px] -bottom-40 -right-20 opacity-20"></div>

      <main className="w-full max-w-[540px] relative z-10">
        {/* Brand / Header */}
        <div className="text-center mb-lg">
          <h1 className="font-display text-primary text-headline-md md:text-5xl font-extrabold mb-xs">
            SEMADIKSI
          </h1>
          <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">
            Daftar Akun Baru
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
            Lengkapi data diri untuk bergabung dengan komunitas SEMADIKSI.
          </p>
        </div>

        {/* Registration Card */}
        <section className="bg-surface-container-lowest border border-surface-variant/30 shadow-[0px_8px_30px_0px_rgba(13,99,27,0.08)] rounded-3xl p-md md:p-lg">
          {errorMessage && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-2xl text-error text-sm font-medium flex items-start gap-3 animate-shake">
              <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1">
                <p className="font-semibold text-error">Pendaftaran Gagal</p>
                <p className="text-on-surface-variant text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Status Mahasiswa Toggle */}
            <div className="space-y-sm">
              <label className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold">
                Status Mahasiswa
              </label>
              <div className="grid grid-cols-2 gap-sm">
                <button
                  className={`flex items-center justify-center gap-2 p-md rounded-xl border-2 transition-all duration-200 cursor-pointer ${kipStatus === "kipk"
                    ? "border-primary bg-primary-container/5 text-primary font-bold"
                    : "border-surface-variant bg-surface text-on-surface-variant font-medium"
                    }`}
                  onClick={() => {
                    setKipStatus("kipk");
                    setUniversity("Universitas Nahdlatul Ulama Surabaya");
                  }}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings:
                        kipStatus === "kipk" ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    verified
                  </span>
                  <span className="text-label-md">Mahasiswa KIP UNUSA</span>
                </button>
                <button
                  className={`flex items-center justify-center gap-2 p-md rounded-xl border-2 transition-all duration-200 cursor-pointer ${kipStatus === "nonkip"
                    ? "border-primary bg-primary-container/5 text-primary font-bold"
                    : "border-surface-variant bg-surface text-on-surface-variant font-medium"
                    }`}
                  onClick={() => {
                    setKipStatus("nonkip");
                  }}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings:
                        kipStatus === "nonkip" ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    school
                  </span>
                  <span className="text-label-md">Umum</span>
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-sm">
              <label
                className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                htmlFor="full_name"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span
                  className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${fullNameFocus ? "text-primary" : "text-outline"
                    }`}
                >
                  person
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                  id="full_name"
                  placeholder="Contoh: Budi Santoso"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFullNameFocus(true)}
                  onBlur={() => setFullNameFocus(false)}
                  required
                />
              </div>
            </div>

            {/* Email / Nomor HP */}
            <div className="space-y-sm">
              <label
                className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                htmlFor="contact"
              >
                Email / Nomor HP
              </label>
              <div className="relative">
                <span
                  className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${contactFocus ? "text-primary" : "text-outline"
                    }`}
                >
                  mail
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                  id="contact"
                  placeholder="email@universitas.ac.id"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onFocus={() => setContactFocus(true)}
                  onBlur={() => setContactFocus(false)}
                  required
                />
              </div>
            </div>

            {/* Asal Universitas */}
            <div className="space-y-sm">
              <div className="flex items-center justify-between ml-1">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block font-semibold"
                  htmlFor="university"
                >
                  Asal Universitas
                </label>
                {kipStatus === "kipk" && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    Terkunci (Khusus UNUSA)
                  </span>
                )}
              </div>
              <div className="relative">
                <span
                  className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${universityFocus ? "text-primary" : "text-outline"
                    }`}
                >
                  account_balance
                </span>
                <input
                  className={`w-full pl-12 pr-11 py-4 rounded-xl transition-all outline-none font-body-md ${kipStatus === "kipk"
                    ? "bg-surface-container/70 border border-primary/20 text-on-surface font-semibold cursor-not-allowed select-none"
                    : "bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-white text-on-surface"
                    }`}
                  id="university"
                  placeholder={
                    kipStatus === "kipk"
                      ? "Universitas Nahdlatul Ulama Surabaya"
                      : "Masukkan Asal Universitas"
                  }
                  type="text"
                  value={
                    kipStatus === "kipk"
                      ? "Universitas Nahdlatul Ulama Surabaya"
                      : university
                  }
                  onChange={(e) => {
                    if (kipStatus !== "kipk") {
                      setUniversity(e.target.value);
                    }
                  }}
                  readOnly={kipStatus === "kipk"}
                  onFocus={() => setUniversityFocus(true)}
                  onBlur={() => setUniversityFocus(false)}
                  required
                />
                {kipStatus === "kipk" ? (
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none"
                    title="Terkunci untuk Mahasiswa KIP UNUSA"
                  >
                    lock
                  </span>
                ) : (
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline/60 pointer-events-none text-sm">
                    edit
                  </span>
                )}
              </div>
              {kipStatus === "kipk" ? (
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5 ml-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                  Pendaftaran akun Mahasiswa KIP hanya berlaku bagi mahasiswa <strong className="text-primary font-semibold">Universitas Nahdlatul Ulama Surabaya</strong>.
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant ml-1">
                  Ketik nama lengkap perguruan tinggi / universitas Anda.
                </p>
              )}
            </div>

            {/* NIM & Tahun Masuk Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* NIM */}
              <div className="space-y-sm">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                  htmlFor="nim"
                >
                  NIM (Nomor Induk Mahasiswa)
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${nimFocus ? "text-primary" : "text-outline"
                      }`}
                  >
                    badge
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                    id="nim"
                    placeholder="Masukkan NIM Anda"
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    onFocus={() => setNimFocus(true)}
                    onBlur={() => setNimFocus(false)}
                    required
                  />
                </div>
              </div>

              {/* Tahun Masuk */}
              <div className="space-y-sm">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                  htmlFor="year_of_entry"
                >
                  Tahun Masuk
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${yearOfEntryFocus ? "text-primary" : "text-outline"
                      }`}
                  >
                    calendar_today
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                    id="year_of_entry"
                    placeholder="Contoh: 2024"
                    type="text"
                    value={yearOfEntry}
                    onChange={(e) => setYearOfEntry(e.target.value)}
                    onFocus={() => setYearOfEntryFocus(true)}
                    onBlur={() => setYearOfEntryFocus(false)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dokumen Penerima KIP-K (Hanya jika KIP-K terpilih) */}
            {kipStatus === "kipk" && (
              <div className="space-y-sm animate-in fade-in duration-300">
                <label className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold">
                  Dokumen Penerima KIP-K
                </label>
                <div className="relative">
                  <label
                    htmlFor="kip_document"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-surface-variant hover:border-primary rounded-xl cursor-pointer bg-surface-container-low transition-all text-center hover:bg-primary-container/5 group"
                  >
                    <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors mb-2">
                      cloud_upload
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                      {kipDocName ? kipDocName : "Pilih atau Seret Dokumen KIP-K"}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Maks. 5 MB (Format: PDF, JPG, PNG)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="kip_document"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setKipDocName(file.name);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-sm">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${passwordFocus ? "text-primary" : "text-outline"
                      }`}
                  >
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-sm">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block ml-1 font-semibold"
                  htmlFor="confirm_password"
                >
                  Konfirmasi
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${confirmPasswordFocus ? "text-primary" : "text-outline"
                      }`}
                  >
                    lock_reset
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-body-md text-on-surface"
                    id="confirm_password"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocus(true)}
                    onBlur={() => setConfirmPasswordFocus(false)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-base">
              <button
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">
                      progress_activity
                    </span>
                    <span>Mendaftarkan Akun ke Database...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-md pt-md border-t border-surface-variant/30 text-center">
            <p className="font-body-md text-on-surface-variant">
              Sudah punya akun?
              <Link href="/masuk" className="text-primary font-bold hover:underline ml-1">
                Masuk
              </Link>
            </p>
          </div>
        </section>

        {/* Extra Info / Legal */}
        <p className="text-center mt-md text-label-sm text-outline font-label-sm px-md">
          Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan
          Privasi SEMADIKSI.
        </p>
      </main>

      {/* Decoration Images (Abstract) */}
      <div className="fixed top-20 right-[-5%] w-64 h-64 opacity-10 pointer-events-none hidden xl:block">
        <div
          className="w-full h-full bg-contain bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDmgwT8u2G6JQQQDcCO2J-wxg908ACDAc-blzfPtJrJDrG08ts7wWA3MZBYp8OdOWDaEhqlcQDJ8PxClVEvMzUF7wnVa8wiUaIRSRQ1IPOZDNAXS0rrt0ru1gmGp7hp86OE2yycG3rQPVtA7QL_Cx39mHefPIwK2Io6fLQ2RJMD_cCByDtx51lhmf7Te2q7ZyuVzlr3kkYOr1V_0IFGrViC-Y_ZSYsLLcpwOuGlJaQaUZUXH7WNGLSaBw')",
          }}
        ></div>
      </div>
    </div>
  );
}
