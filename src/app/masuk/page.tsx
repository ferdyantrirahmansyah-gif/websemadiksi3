"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Masuk() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [kipStatus, setKipStatus] = useState("KIP UNUSA");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [identityFocus, setIdentityFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    const emailClean = identity.trim().toLowerCase();
    
    // Check if the user is trying to login as administrator
    if (emailClean === "admin123@gmail.com") {
      alert("Email ini terdaftar sebagai Administrator. Anda akan dialihkan ke halaman login Admin.");
      router.push("/admin/masuk");
      return;
    }

    setIsLoading(true);

    try {
      // Call centralized backend authentication API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password, kipStatus })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal masuk. Periksa kembali akun dan password Anda.");
        setIsLoading(false);
        return;
      }

      // If login successful, synchronize user session to localStorage
      if (data.user) {
        localStorage.setItem("semadiksi_current_user", JSON.stringify(data.user));

        try {
          const storedUsers = localStorage.getItem("semadiksi_users");
          const usersList = storedUsers ? JSON.parse(storedUsers) : [];
          const idx = usersList.findIndex((u: any) => u.id === data.user.id || u.email.toLowerCase() === data.user.email.toLowerCase());
          if (idx >= 0) {
            usersList[idx] = { ...usersList[idx], ...data.user };
          } else {
            usersList.push(data.user);
          }
          localStorage.setItem("semadiksi_users", JSON.stringify(usersList));
        } catch (e) {}
      }

      // Redirect to student dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login request error:", err);
      setErrorMessage("Tidak dapat terhubung ke server. Pastikan koneksi Anda aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center relative p-margin-mobile overflow-hidden">
      {/* Organic Background Elements */}
      <div className="organic-blob bg-primary w-[500px] h-[500px] -top-24 -left-24 animate-pulse"></div>
      <div
        className="organic-blob bg-secondary-container w-[400px] h-[400px] -bottom-24 -right-24 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div className="organic-blob bg-tertiary-fixed-dim w-[300px] h-[300px] top-1/2 left-1/3 opacity-10"></div>

      {/* Main Container */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] rounded-[2rem] overflow-hidden bg-surface-container-lowest relative z-10">
        {/* Left Section: Branding & Illustration */}
        <section className="hidden lg:flex flex-col justify-center items-center p-xl bg-primary-fixed/30 relative overflow-hidden">
          <div className="z-10 text-center space-y-md">
            <h1 className="font-display text-5xl font-extrabold text-primary leading-tight">
              SEMADIKSI
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xs mx-auto">
              Seduluran Selawase. Wadah bagi para pejuang pendidikan untuk
              tumbuh bersama.
            </p>
            <div className="relative mt-lg w-full h-80">
              <img
                className="w-full h-full object-contain"
                alt="Students collaborating"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpLlumFvI1xr5W1he3BgRcFHK1vrr5Gczj1PP5l18yqEHshmL5w6kzwuk3nqvqArH8-7LzI55d_QOJzOR1t3wLStb41-UlZ7fOq_fWt_mOBwSJbcjioRnqDW55W6EnDf67UP3Fbaf2AZJ3ITPxsV_JH0zlL8WBwS18_RwgXzlStiZjvsBlLGBYDnHWW-oaWwdDi95ZusLEBIjWO0ajQcc-Syx3bap1lok4bfggdeQ2BkYqPm4Jl92-Tg"
              />
            </div>
          </div>
          {/* Decorative circle behind illustration */}
          <div className="absolute w-96 h-96 bg-primary-fixed-dim rounded-full blur-3xl -bottom-20 -left-20 opacity-40"></div>
        </section>

        {/* Right Section: Login Form */}
        <section className="p-md md:p-xl flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <header className="mb-lg">
              <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-xs">
                Selamat Datang
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Silakan lengkapi data untuk masuk ke portal.
              </p>
            </header>

            {errorMessage && (
              <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-2xl text-error text-sm font-medium flex items-start gap-3 animate-shake">
                <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-error">Gagal Masuk</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form className="space-y-base" onSubmit={handleSubmit}>
              {/* Identity Input */}
              <div className="space-y-xs">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="identity"
                >
                  Email / Username / Nomor HP
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      identityFocus ? "text-primary" : "text-outline-variant"
                    }`}
                  >
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest input-transition font-body-md text-body-md text-on-surface outline-none"
                    id="identity"
                    name="identity"
                    placeholder="Masukkan identitas Anda"
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    onFocus={() => setIdentityFocus(true)}
                    onBlur={() => setIdentityFocus(false)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-xs">
                <label
                  className="font-label-md text-label-md text-on-surface-variant ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      passwordFocus ? "text-primary" : "text-outline-variant"
                    }`}
                  >
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest input-transition font-body-md text-body-md text-on-surface outline-none"
                    id="password"
                    name="password"
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

              {/* KIP Toggle / Radio Pattern */}
              <div className="py-sm">
                <p className="font-label-md text-label-md text-on-surface-variant mb-base ml-1">
                  Status Mahasiswa
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <label className="cursor-pointer group">
                    <input
                      checked={kipStatus === "KIP UNUSA"}
                      onChange={() => setKipStatus("KIP UNUSA")}
                      className="hidden peer"
                      name="kip_status"
                      type="radio"
                      value="KIP UNUSA"
                    />
                    <div className="flex items-center justify-center gap-base py-3 px-4 rounded-xl border-2 border-transparent bg-surface-container peer-checked:bg-primary-container/10 peer-checked:border-primary transition-all duration-300">
                      <span
                        className={`material-symbols-outlined ${
                          kipStatus === "KIP UNUSA"
                            ? "text-primary fill-1"
                            : "text-outline-variant"
                        }`}
                      >
                        stars
                      </span>
                      <span
                        className={`font-label-md text-label-md ${
                          kipStatus === "KIP UNUSA"
                            ? "text-primary font-bold"
                            : "text-on-surface-variant"
                        }`}
                      >
                        Mahasiswa KIP UNUSA
                      </span>
                    </div>
                  </label>
                  <label className="cursor-pointer group">
                    <input
                      checked={kipStatus === "Umum"}
                      onChange={() => setKipStatus("Umum")}
                      className="hidden peer"
                      name="kip_status"
                      type="radio"
                      value="Umum"
                    />
                    <div className="flex items-center justify-center gap-base py-3 px-4 rounded-xl border-2 border-transparent bg-surface-container peer-checked:bg-primary-container/10 peer-checked:border-primary transition-all duration-300">
                      <span
                        className={`material-symbols-outlined ${
                          kipStatus === "Umum"
                            ? "text-primary"
                            : "text-outline-variant"
                        }`}
                      >
                        verified_user
                      </span>
                      <span
                        className={`font-label-md text-label-md ${
                          kipStatus === "Umum"
                            ? "text-primary font-bold"
                            : "text-on-surface-variant"
                        }`}
                      >
                        Umum
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-sm space-y-sm">
                {/* CTA Primary */}
                <button
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-label-md shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[18px]">
                        progress_activity
                      </span>
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
                {/* CTA Secondary */}
                <Link
                  href="/daftar"
                  className="w-full border-2 border-primary text-primary py-4 rounded-full font-bold text-label-md hover:bg-primary/5 active:scale-98 transition-all text-center block"
                >
                  Daftar Akun Baru
                </Link>
              </div>

              <div className="flex flex-col items-center justify-center pt-md space-y-2">
                <a
                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-outline-variant/30 underline-offset-4 cursor-pointer"
                  onClick={() => alert("Fitur reset password sedang disiapkan.")}
                >
                  Lupa Password?
                </a>
                <Link
                  href="/admin/masuk"
                  className="font-label-sm text-label-sm text-primary hover:underline font-bold"
                >
                  Masuk sebagai Administrator
                </Link>
              </div>
            </form>

            <footer className="mt-xl text-center">
              <p className="font-label-sm text-label-sm text-outline">
                © 2024 SEMADIKSI. Seduluran Selawase.
              </p>
            </footer>
          </div>
        </section>
      </main>

      {/* Social Proof / Footer Minimal */}
      <div className="mt-md text-center lg:flex items-center gap-sm hidden relative z-10">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Student avatar 1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHedYDEsCBRyg9p3myjmrkCgHc2cYzEbMuWvRIlFb-uUlmD73khMXNWqDH_PYavqbAkminaRjw2imk-949VX1OoGjxyx2sMGE0AvNB3SceiPxBxgfYMrNCx-1RPB9dUGS_zsBvtnW3x_D9DwFVT6neiTGJhnn2BF2hAotp3tVmvbotslVLFBYbVFkesLzlh9zAqi9MT7m_lBOhLrzNCmk7zlka8-WkOr-52_RYQ0i3kqn-nRjv8SVi8A"
            />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Student avatar 2"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGLZdH8uCO9LUpy93S3gIXVs8Lwc0-tTESLkNCR03IJ0ZA-F50VXwSKTR0VRd8ij4qQzX_ruMuDmvTmEcGWAQL1wE2c72fkC-a-443JQG5SA9f0jDAepoJkS_CE0UqsiyZwz2jIK9sgDdeixD_0Iq3lXgbxi4qKCKaMDg3hvUNne8wrqQbbImggb5w2-s7trmVWsSqDIj6cI5RV_nY6AjpqPqG1CG5qIhcIb0jKp7g9dfIbgOWZzMpJw"
            />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Student avatar 3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkKoEO3ejHHywaBtwunnaERqgRKrC3n_zq6MVyRkJmL6Fr7g65C1QqKgYMdsk2-ERQq8S0-vXYfZmcFAW1AVJzvKJiP189_GdS1Q_C7RXDo3Rey1T_9TCDQ8fC4FQcoOSoDxH80vMyY5k_Dj1pYWwxHhZCQjCXHNGtGYtHh_tURBW73KSRjor1JjX7voR5bD9-uSSlPqM61PyHjWsrnhOHhk_ZHOAvwkNDyxZDHmocuMZrKOgH6Ibo4w"
            />
          </div>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          Bergabung dengan 2,400+ mahasiswa lainnya
        </p>
      </div>
    </div>
  );
}
