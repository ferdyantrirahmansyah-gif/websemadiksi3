"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardHome() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalXp, setTotalXp] = useState<number>(1000);

  useEffect(() => {
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Load registered and global activities to calculate dynamic XP
    const storedRegistered = localStorage.getItem("semadiksi_registered_activities");
    const storedGlobalActs = localStorage.getItem("semadiksi_activities");

    let registeredList: any[] = [];
    if (storedRegistered) {
      try {
        registeredList = JSON.parse(storedRegistered);
      } catch (e) {}
    }

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

    // Default completed activities: LKMB (300 XP), Volunteer (450 XP), Workshop (250 XP) -> 1000 XP
    let sum = 1000;

    // Add registered completed activities
    registeredList.forEach((act: any) => {
      if (act.status === "Selesai") {
        const defaultTitles = [
          "Latihan Kepemimpinan Mahasiswa Berprestasi (LKMB)",
          "SEMADIKSI Berbagi: Volunteer Mengajar Pesisir",
          "Workshop Web Development Modern dengan Next.js"
        ];
        if (!defaultTitles.includes(act.title)) {
          sum += xpMap[act.title] || act.xpPoints || 100;
        }
      }
    });

    setTotalXp(sum);
  }, []);
  const highlights = [
    {
      title: "SEMADIKSI Mengajar",
      category: "Pengabdian",
      date: "15 Oct",
      status: "Free",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIWf6rG7XQ4j6dIjWO4gQFxP2L10IaeD_y9_gLEJe5RrifvHzoDIjXvkFDRPrbumVaB8J933IxVJkDFW4wfCC0lHIvnhZufHpdKU6Bh1ebH2KQS-LvAqxrkHxzKxRDGnI2uQDHL62jxYapC56k7VqsQtkoCCWTnaAKIVh3mW3iyOjuIRQ0DZCfLWaO1aQKPW-YAGb_BpcEgHxRHkiKbrzcxENOYOXPlDMvcryAEFlx5-tUNEQeJjqbhg",
    },
    {
      title: "Pelatihan Karya Tulis",
      category: "Akademik",
      date: "20 Oct",
      status: "Terbatas",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNxIRut5MMPLO3BDhtDG7ivQWI1MTwK61kAqY3VodvwtaPKIfG4VyP6Fe7st6_WNOcpWYSMBxEtK0VQ-BDf_QvKbDXo98gTqOemU9ZIDJEKIfDpYu5qrClJks1YNovLkm1rHfvw3G_Rsj6_ORBnc3zV3dHV55xy0Tkg2zQs95Ngz-VYXvp3sumBJ6CefjfFpsulKof2587B5TOfWLMURH1WHLy5B8FyS0vosuwzoHbmNTMK2mcGP9Z4A",
    },
    {
      title: "Gathering KIP-K 2024",
      category: "Sosial",
      date: "05 Nov",
      status: "Terbuka",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRMQ-d6nNFpGEE5UMuXb5ZAepbNCOdxvWhRJbToiNki5oFEgN67XLhfWuQy4bS0LJyd7_vvkMYoq1MfnltjKQj5T81z0Rojz-p9oDpAxXugm7SrEVHecWl7JQJ5HG2i9ZpD3n6qMFh70lQH3YpmMc2SRAoqlxTBXoEvNikA1Ysn7t_5TJjvv_7jb-N1XZE7B_s8Js0W4VJ-ZJenWKuL5WR6_GCIAyORUC4-spkvDmk4u2vf3y-DGOh5w",
    },
    {
      title: "Malam Inagurasi Juara",
      category: "Event",
      date: "12 Dec",
      status: "Berbayar",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFwR_Y_KEGxvg0Qjnq_xv8nEmY9gThhmJBp9y4fcSeGij7OwXKlTNrKk1E2PoYbJQNeQTfyoAJfxLxazD17FG7657UCUqiUtIHWr_blKppxnp6NtoJtl0498xyA3BB05wLsirIFd2QhKi8a2LqV4V4KQ3wV9LIqEI_GAZA1vH7jX8TBqPUQxsfc5JNyWJNlE7qvnDJyGUr2mRCJU8u3x64h04KolTml_TPAzMQZYAzUS_6cxmO5CdI2Q",
    },
  ];

  const isKip = currentUser?.kipStatus === "KIP UNUSA";

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 relative z-10">
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          {isKip ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary font-bold text-xs shadow-xs">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Dashboard Mahasiswa KIP-K UNUSA</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-600/25 text-emerald-700 font-bold text-xs shadow-xs">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Dashboard Mahasiswa Umum</span>
            </div>
          )}

          {isKip && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              currentUser?.verificationStatus === "Verified"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {currentUser?.verificationStatus === "Verified" ? "✓ Status: Terverifikasi" : "⏳ Status: Menunggu Verifikasi"}
            </span>
          )}
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface mb-2">
          Selamat Datang, {currentUser?.name || "Sobat Dikti"}!
        </h2>
        <p className="font-body-lg text-on-surface-variant max-w-3xl text-lg">
          {isKip
            ? "Portal resmi penerima Beasiswa KIP Kuliah Universitas Nahdlatul Ulama Surabaya. Kelola pelaporan semester, presensi kegiatan, dan berkas evaluasi Anda."
            : "Wadah kolaborasi dan pengembangan potensi mahasiswa. Akses informasi beasiswa terbuka, webinar inspiratif, pelatihan keahlian, dan sertifikat kegiatan."}
        </p>
      </section>

      {/* Category Quick Navigation Cards */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isKip ? (
            <>
              <Link
                href="/dashboard/pengajuan-pencairan"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Pelaporan Beasiswa</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Formulir monev semester</p>
              </Link>
              <Link
                href="/dashboard/berkas-kipk"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">folder_shared</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Berkas KIP-K</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Unggah & validasi dokumen</p>
              </Link>
              <Link
                href="/dashboard/absensi"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Presensi Kegiatan</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Absensi agenda wajib</p>
              </Link>
              <Link
                href="/dashboard/info-kip"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Info KIP UNUSA</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Panduan & pencairan</p>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/info-beasiswa"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Info Beasiswa</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Peluang beasiswa umum</p>
              </Link>
              <Link
                href="/dashboard/kegiatan"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">event_upcoming</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Seminar & Pelatihan</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Ikuti workshop terbuka</p>
              </Link>
              <Link
                href="/dashboard/sertifikat"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Sertifikat Saya</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Unduh sertifikat kegiatan</p>
              </Link>
              <Link
                href="/dashboard/berita-acara"
                className="bg-surface-container-lowest border border-surface-container-high hover:border-primary p-4 rounded-2xl shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">newspaper</span>
                </div>
                <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Berita Acara</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Dokumentasi & publikasi</p>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Feature Card */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] border border-surface-container-high p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <span className="bg-primary text-white font-semibold text-xs px-3 py-1 rounded-full">
              Coming Soon
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface mt-4 mb-4">
              Seminar Nasional Kebangsaan 2024
            </h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              Jangan lewatkan kesempatan untuk berdiskusi dengan tokoh-tokoh
              inspiratif nasional dalam rangkaian Dies Natalis SEMADIKSI.
            </p>
            <Link
              href="/dashboard/pembayaran"
              className="bg-primary text-white px-6 py-3 rounded-full font-bold text-label-md inline-flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-md w-fit cursor-pointer"
            >
              Daftar Sekarang
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[180px] -mr-12 -mt-8 rotate-12">
              school
            </span>
          </div>
        </div>

        {/* Side Stats / Small Cards */}
        <div className="flex flex-col gap-6">
          <Link
            href="/dashboard/kegiatan"
            className="bg-secondary-container text-on-secondary-container p-6 rounded-xl shadow-sm hover:brightness-105 transition-all block cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-3xl">
                confirmation_number
              </span>
              <span className="bg-white/30 px-2 py-1 rounded font-bold text-xs">
                2 Aktif
              </span>
            </div>
            <p className="font-label-md text-label-md opacity-80">Tiket Saya</p>
            <p className="font-headline-md text-xl font-bold">Workshop UI/UX</p>
          </Link>
          <div className="bg-tertiary-container text-on-tertiary-container p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-3xl">
                volunteer_activism
              </span>
            </div>
            <p className="font-label-md text-label-md opacity-80">
              Poin Keaktifan
            </p>
            <p className="font-headline-md text-3xl font-extrabold">
              {totalXp.toLocaleString("id-ID")} <span className="text-lg font-normal">XP</span>
            </p>
          </div>
        </div>

        {/* Activities Highlight Section */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {highlights.map((item, index) => (
            <Link
              key={index}
              href="/dashboard/kegiatan"
              className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer block group"
            >
              <div
                className="h-40 bg-cover bg-center transition-transform duration-300 group-hover:scale-102"
                style={{ backgroundImage: `url('${item.img}')` }}
              ></div>
              <div className="p-5">
                <span className="text-xs font-bold text-primary uppercase">
                  {item.category}
                </span>
                <h4 className="font-bold text-on-surface mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="mt-3 flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    <span className="text-xs">{item.date}</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">
                    {item.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
