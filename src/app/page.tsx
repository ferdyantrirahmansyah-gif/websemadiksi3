"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Floating hover effect for blobs
    const handleMouseMove = (e: MouseEvent) => {
      const blobs = document.querySelectorAll(".organic-blob");
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        (blob as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden">
      {/* Floating Background Blobs */}
      <div className="organic-blob bg-primary w-96 h-96 top-0 left-0"></div>
      <div className="organic-blob bg-secondary-container w-80 h-80 top-1/4 right-0"></div>

      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky z-40 bg-surface/90 backdrop-blur-md shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant/10 transition-colors rounded-full lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "close" : "menu"}
          </button>
          <span className="font-display text-headline-md font-extrabold text-primary">
            SEMADIKSI
          </span>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            href="/"
          >
            Beranda
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            href="/profil-semadiksi"
          >
            Profil SEMADIKSI
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            href="/berita-acara"
          >
            Berita Acara
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/masuk"
            className="hidden sm:inline-block font-label-md text-label-md text-primary hover:underline font-semibold"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="bg-primary text-on-primary px-5 sm:px-6 py-2.5 rounded-full font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all shadow-sm font-semibold"
          >
            Daftar
          </Link>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 w-full bg-surface shadow-lg border-b border-surface-variant/20 z-30 p-md flex flex-col gap-sm">
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            Beranda
          </Link>
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/profil-semadiksi"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profil SEMADIKSI
          </Link>
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/berita-acara"
            onClick={() => setMobileMenuOpen(false)}
          >
            Berita Acara
          </Link>
          <div className="flex gap-md pt-sm">
            <Link
              href="/masuk"
              className="flex-1 text-center py-3 text-primary border border-primary rounded-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="flex-1 text-center py-3 bg-primary text-on-primary rounded-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar
            </Link>
          </div>
        </div>
      )}

      <main className="relative">
        {/* Hero Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-lg md:py-xl flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md mb-md">
              Organisasi Mahasiswa KIP-K UNUSA
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-sm">
              Wadah Mahasiswa <span className="text-primary">KIP-K UNUSA</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-2xl mx-auto">
              Komunitas, kegiatan, dan peluang. Kami hadir untuk mendukung
              perjalanan akademik dan pengembangan diri Anda di Universitas
              Nahdlatul Ulama Surabaya.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <Link
                href="/berita-acara"
                className="w-full sm:w-auto bg-primary text-on-primary px-lg py-4 rounded-full font-label-md text-label-md hover:brightness-110 transition-all shadow-lg active:scale-95 text-center"
              >
                Lihat Berita Acara
              </Link>
              <Link
                href="/profil-semadiksi"
                className="w-full sm:w-auto border-2 border-primary text-primary px-lg py-4 rounded-full font-label-md text-label-md hover:bg-primary/5 transition-all active:scale-95 text-center"
              >
                Tentang Kami
              </Link>
            </div>
          </div>
          {/* Hero Illustration Placeholder */}
          <div className="mt-xl w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              className="w-full h-full object-cover"
              alt="SEMADIKSI Hero Collage"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGt4gZkIAKbWUZYHHFW1UWyuynlnecEJrF9XvO_W6FRq0xxl4xglnFJuitzkSQ2ACl5scyqjI0Wqb_O4UV2N-iOArY0mBx5WXG6oL12akGs3COvFxwMztJ5CWYRL0DI1QSBMY3Vd6vmibqJMN1y2T-NBL82_Otdbt-BWsqvX33P0uP_OCAp1a4OKI2qldgkPL9pjH4R-hAleYbxQzuJbs5iAPaM8f1QC4YX-22hlJqZmjGM_LVtgzwnQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </section>

        {/* Info SEMADIKSI (Bento Grid Style) */}
        <section className="px-margin-mobile md:px-margin-desktop py-lg">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Info SEMADIKSI
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tetap terinformasi dengan berita terbaru kami.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline font-bold"
            >
              Lihat Semua{" "}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* Main Info Card */}
            <div className="md:col-span-2 bg-surface-container-lowest p-md rounded-3xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] border border-surface-container hover:shadow-lg transition-shadow group flex flex-col md:flex-row gap-md">
              <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Student Essentials"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChf_J_jtp9d6Dn4TooplxfF9qGceC8fnGIJkHnN0CWXoiTTwBM6OnLHkgwyOPoU2rYRdu3xI7wX8U0vOzkb1-rZVbHKhcqz0lJ92IQ7fA9CU8QyrSo-gvZRziQgnfG51PKHlXrZiyZIR1Ke6lemuh6UuWz6mGbrAcICZNGDv15zwUBFNc-algCNv4eJhq90gM0Pv8Te-kbDpQ84sVSzcWjPInnTwsACN25CrdRT5UD8UmKYgY_3m7xgw"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <span className="text-primary font-label-sm text-label-sm uppercase tracking-wider mb-sm block font-bold">
                  BERITA UTAMA
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
                  Pembukaan Pendaftaran Anggota Baru 2024
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                  Mari bergabung dalam keluarga besar SEMADIKSI dan kembangkan
                  potensi dirimu bersama kami melalui berbagai divisi kreatif.
                </p>
                <Link
                  href="/dashboard"
                  className="text-primary font-label-md text-label-md flex items-center gap-2 group/btn font-bold"
                >
                  Baca Selengkapnya{" "}
                  <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                    east
                  </span>
                </Link>
              </div>
            </div>
            {/* Secondary Info Card */}
            <div className="bg-primary-container p-md rounded-3xl text-on-primary-container flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-white/20 px-3 py-1 rounded-full text-label-sm font-label-sm backdrop-blur-sm font-semibold">
                  TIPS MAHASISWA
                </span>
                <h3 className="font-headline-md text-headline-md mt-md text-white">
                  Cara Manajemen Waktu untuk Penerima KIP-K
                </h3>
              </div>
              <div className="mt-lg relative z-10">
                <p className="font-body-md text-body-md text-white/90 mb-md">
                  Dapatkan panduan praktis menyeimbangkan antara kuliah,
                  organisasi, dan syarat beasiswa.
                </p>
                <button className="bg-white text-primary w-full py-3 rounded-xl font-label-md text-label-md shadow-md active:scale-95 transition-transform hover:bg-zinc-100 font-bold">
                  Download Panduan
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Event Terbaru (Horizontal Scroll) */}
        <section className="py-lg bg-surface-container-low overflow-hidden">
          <div className="px-margin-mobile md:px-margin-desktop mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Event Terbaru
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Ikuti keseruan kegiatan kami mendatang.
            </p>
          </div>
          <div className="flex gap-md overflow-x-auto px-margin-mobile md:px-margin-desktop scrollbar-none pb-md">
            {/* Card 1 */}
            <div className="min-w-[300px] md:min-w-[380px] bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-variant/30 overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Student Workshop"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3FwgIuRCwiq3NqPpuwqzeubfjxPGasK3zZO2HENy0U3jaOzruwbTIQvvd70eRS4vkN-U9CUzt4BP6-uzsD_D78MkNq4V3CO7BA6-kWH6erI8Lqkb9lP-xvsgTcPr64uB3QBCJ2yC7nhgCzdTgZhnS4547Le2iJVlsE8JjfbMsL_kBfTo0sDLPR9-5nMFKXVodBAHJmqQopoK9DJVlpWFue3A2Lre78NzIm9mc6_UDxo8gzd3ia1J97Q"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg flex flex-col items-center">
                  <span className="text-primary font-bold text-headline-md leading-none">
                    15
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">
                    Okt
                  </span>
                </div>
              </div>
              <div className="p-md">
                <div className="flex gap-2 mb-sm">
                  <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                    Akademik
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
                  Seminar Beasiswa 101
                </h3>
                <p className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-md">
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>{" "}
                  Auditorium Lt. 9 Tower UNUSA
                </p>
                <Link
                  href="/berita-acara"
                  className="w-full py-3 bg-surface-container text-primary rounded-xl font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center font-bold"
                >
                  Lihat Berita Acara
                </Link>
              </div>
            </div>
            {/* Card 2 */}
            <div className="min-w-[300px] md:min-w-[380px] bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-variant/30 overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Community Service"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX2no7jdbfZpqKXV3mB1dS637ogogPjiECF_qz1uMxIA4t28e7XwGY3coFu2nNum96jXfmkisIdMw87bxvT9QUL_LzOpb59fBxZMmL_knpXI4oc1P3AZTwzBmICGWTyxFX6WLJ62X8bV1W9oLxtGwlMFJ3VcClfAVq0clF8M2OqlfwQ0DVDn2c5VFzqFF8iJjHobXFcw7S7KGaFb6_3bHATYU6AIH8zkvoQXESB7lgdFCONBAnQIAqyQ"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg flex flex-col items-center">
                  <span className="text-primary font-bold text-headline-md leading-none">
                    22
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">
                    Okt
                  </span>
                </div>
              </div>
              <div className="p-md">
                <div className="flex gap-2 mb-sm">
                  <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                    Sosial
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
                  SEMADIKSI Berbagi
                </h3>
                <p className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-md">
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>{" "}
                  Panti Asuhan Surabaya
                </p>
                <Link
                  href="/berita-acara"
                  className="w-full py-3 bg-surface-container text-primary rounded-xl font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center font-bold"
                >
                  Lihat Berita Acara
                </Link>
              </div>
            </div>
            {/* Card 3 */}
            <div className="min-w-[300px] md:min-w-[380px] bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-variant/30 overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Sports Tournament"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5MzwE8DGoCEVKRQD4HRrDkfUZ4yzDFwvAcNgNpRpGpBZSfLx_2zHsLtqNUJaq2XSkZvKsZonjmAowiHCx_4XgO2ioq8Z1zQmWLcMQMoNx1G-0Fef2XGXfRBbGPe-G5Bjjpj5MJFHx7c9Fo3aU9lj_Lv_UVfjqDX5f54v54-OV7zx7zptsYTd7AUlOett__mKbtPc6gUTnJOr1ao7GCYOwrq1shGGDPjmQEHVVYftGZaC05ejQ9JWhtQ"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg flex flex-col items-center">
                  <span className="text-primary font-bold text-headline-md leading-none">
                    05
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">
                    Nov
                  </span>
                </div>
              </div>
              <div className="p-md">
                <div className="flex gap-2 mb-sm">
                  <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm">
                    Olahraga
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
                  SEMADIKSI Cup 2024
                </h3>
                <p className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-md">
                  <span className="material-symbols-outlined text-base">
                    location_on
                  </span>{" "}
                  GOR Kampus B UNUSA
                </p>
                <Link
                  href="/berita-acara"
                  className="w-full py-3 bg-surface-container text-primary rounded-xl font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center font-bold"
                >
                  Lihat Berita Acara
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pengumuman (List Layout) */}
        <section className="px-margin-mobile md:px-margin-desktop py-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">
            Pengumuman
          </h2>
          <div className="space-y-sm">
            {/* Announcement Item 1 */}
            <div className="flex items-center gap-md p-md bg-white rounded-2xl border border-surface-container-high hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-fixed-dim rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-label-md text-label-md text-on-surface">
                  Update Jadwal Verifikasi Berkas KIP-K 2024
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  2 jam yang lalu • Penting
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                chevron_right
              </span>
            </div>
            {/* Announcement Item 2 */}
            <div className="flex items-center gap-md p-md bg-white rounded-2xl border border-surface-container-high hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary-fixed-dim rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">
                  notifications_active
                </span>
              </div>
              <div className="flex-grow">
                <h4 className="font-label-md text-label-md text-on-surface">
                  Pengumpulan Sertifikat Kegiatan Semester Genap
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Kemarin • Akademik
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                chevron_right
              </span>
            </div>
            {/* Announcement Item 3 */}
            <div className="flex items-center gap-md p-md bg-white rounded-2xl border border-surface-container-high hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-label-md text-label-md text-on-surface">
                  Panduan Laporan Pertanggungjawaban Divisi
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  3 hari yang lalu • Internal
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                chevron_right
              </span>
            </div>
          </div>

          <div className="mt-lg p-lg bg-surface-container rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-md border border-dashed border-primary/30">
            <div className="text-center md:text-left">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Punya Pertanyaan atau Kendala?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Hubungi admin SEMADIKSI untuk bantuan lebih lanjut.
              </p>
            </div>
            <button className="bg-primary text-white px-lg py-3 rounded-full flex items-center gap-2 shadow-lg active:scale-95 transition-transform font-bold hover:brightness-110">
              <span className="material-symbols-outlined">chat</span> Hubungi
              Kami
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl mt-xl bg-surface-container-lowest border-t border-surface-container shadow-sm">
        <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="text-center md:text-left">
            <span className="font-display text-headline-md text-primary font-bold">
              SEMADIKSI
            </span>
            <p className="text-on-surface-variant font-body-md text-body-md mt-2">
              © 2024 SEMADIKSI. Seduluran Selawase.
            </p>
          </div>
          <div className="flex gap-md">
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md"
              href="/profil-semadiksi"
            >
              Tentang Kami
            </Link>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md cursor-pointer"
              onClick={() => alert("Hubungi kami di: admin@semadiksi.org")}
            >
              Hubungi Kami
            </a>
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md"
              href="/"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
