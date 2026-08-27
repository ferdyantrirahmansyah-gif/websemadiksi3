"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProfilSemadiksi() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("semadiksi_current_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const bph = [
    {
      role: "Pembina SEMADIKSI",
      name: "Dr. Ir. H. Achmad Jazidie, M.Eng.",
      univ: "Rektor Universitas Nahdlatul Ulama Surabaya",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIWf6rG7XQ4j6dIjWO4gQFxP2L10IaeD_y9_gLEJe5RrifvHzoDIjXvkFDRPrbumVaB8J933IxVJkDFW4wfCC0lHIvnhZufHpdKU6Bh1ebH2KQS-LvAqxrkHxzKxRDGnI2uQDHL62jxYapC56k7VqsQtkoCCWTnaAKIVh3mW3iyOjuIRQ0DZCfLWaO1aQKPW-YAGb_BpcEgHxRHkiKbrzcxENOYOXPlDMvcryAEFlx5-tUNEQeJjqbhg"
    },
    {
      role: "Ketua Umum",
      name: "Ahmad Fauzan",
      univ: "Teknik Informatika 2021",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSqkIMDVmraJfuluYuOafSp5jlN1kt75ZtORGLAF-_GI8GrvQinmIMEYIzpsXit5jEHCmhSyTcKwd7a0zE9gy556BdO_r9fc_mFxTcObwkZbsTWnF_yAxi4_urSiBPr36oYZZHM96wWx2b4rHqjLy5ujL6V7xF-WgCYWTqsV5OkFYueCtA4WibIuPMe54mtCOXSNCTAmtiSSTyOLxCduLvq9Foa5tcAKVbQz-5kYy1yCAkIkmlYoSvuQ"
    },
    {
      role: "Wakil Ketua Umum",
      name: "Siti Nurhaliza",
      univ: "S1 Keperawatan 2021",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlUaW-ZS6LpTsZ64agwr8nm5KWchmhzxBNj90aAxaA3HOdxHVhyO9B4MKjILy1O_XdhuY8fZnK-aJ3EUTcLM7obEmEbw9-0MKnQUVuNXkEZLbQPq5P_DH-R5o5tilfc5HNFb6Zlsu9SjaORp6sy2EGmO0n_GRnmqNwerEgyn-MXuxgpwbDuM7d780dbRRjV62TGfDQf41ztasbWhx7gyMP0dqSc0RVZkyjbdcAPpJKhLcz9bUVvMsjqA"
    },
    {
      role: "Sekretaris Umum",
      name: "Lailatul Fitriah",
      univ: "S1 Manajemen 2022",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNxIRut5MMPLO3BDhtDG7ivQWI1MTwK61kAqY3VodvwtaPKIfG4VyP6Fe7st6_WNOcpWYSMBxEtK0VQ-BDf_QvKbDXo98gTqOemU9ZIDJEKIfDpYu5qrClJks1YNovLkm1rHfvw3G_Rsj6_ORBnc3zV3dHV55xy0Tkg2zQs95Ngz-VYXvp3sumBJ6CefjfFpsulKof2587B5TOfWLMURH1WHLy5B8FyS0vosuwzoHbmNTMK2mcGP9Z4A"
    },
    {
      role: "Bendahara Umum",
      name: "Muhammad Ilham",
      univ: "S1 Akuntansi 2021",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL2OfXTZKzZtu2JVrmy9SMkMOwiOgCfMxy8zHIHlKSVRmtSdN2Uvy_Zk9Sg-sQaHptSM7atdP0qAm4aN6mum3E6xnN1jSeR15t5cBuN8k_6lB-T4ROwufkCxRWg-qZOz36SdH5uMx_9eFk90CtBMqr3K4q3WjF6uxLjI3lQgbphE3MVTkaVGU4vYYSsVNHj_uxctlneg5Q-wT5aXmBYqYRi2TFi3gkzBIGJ9gSuEY_vnOoAFD_GPXG6w"
    }
  ];

  const divisi = [
    {
      name: "Pendidikan & Penalaran",
      icon: "school",
      desc: "Mengembangkan kompetensi ilmiah, karya tulis ilmiah, bimbingan akademik, dan program tutor sebaya untuk seluruh mahasiswa beasiswa KIP-K UNUSA.",
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      name: "Pengabdian Masyarakat",
      icon: "volunteer_activism",
      desc: "Wadah kepedulian sosial melalui aksi pengabdian masyarakat, program SEMADIKSI Mengajar di pelosok desa binaan, dan aksi tanggap bencana sosial.",
      color: "text-secondary bg-secondary/10 border-secondary/20"
    },
    {
      name: "Minat & Bakat (Soft Skill)",
      icon: "sports_esports",
      desc: "Mewadahi pengembangan potensi non-akademik, olahraga, seni budaya, serta rangkaian workshop peningkatan soft skill kepemimpinan mahasiswa.",
      color: "text-tertiary bg-tertiary/10 border-tertiary/20"
    },
    {
      name: "Humas & Media Informasi",
      icon: "campaign",
      desc: "Bertanggung jawab atas publikasi informasi, pengelolaan media sosial resmi organisasi, hubungan eksternal dengan alumni, birokrasi, dan publik.",
      color: "text-error bg-error/10 border-error/20"
    }
  ];

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col font-body">
      {/* Header */}
      <header className="w-full top-0 sticky shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] bg-surface flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-40">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-surface-variant/10 rounded-full transition-colors active:scale-95 duration-200 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-primary">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
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
            className="text-primary font-bold font-label-md text-label-md"
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
            className="text-primary font-bold py-2 border-b border-surface-variant/10"
            href="/profil-semadiksi"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profil SEMADIKSI
          </Link>
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/dashboard/kegiatan"
            onClick={() => setMobileMenuOpen(false)}
          >
            Kegiatan
          </Link>
          <Link
            className="text-on-surface-variant py-2 border-b border-surface-variant/10"
            href="/dashboard/pembayaran"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tiket
          </Link>
        </div>
      )}

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-b from-primary/5 via-transparent to-transparent text-center px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="bg-primary/10 text-primary font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
              Organisasi Mahasiswa KIP-K UNUSA
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-on-surface leading-tight">
              Profil <span className="text-primary">SEMADIKSI</span> UNUSA
            </h1>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Serikat Mahasiswa Bidikmisi & KIP-Kuliah Universitas Nahdlatul Ulama Surabaya.
              Wadah persaudaraan, pembinaan prestasi, dan kontribusi nyata penerima beasiswa bagi nusa dan bangsa.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <a
                href="#visi-misi"
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Visi &amp; Misi
              </a>
              <a
                href="#pengurus"
                className="border-2 border-primary text-primary px-8 py-3 rounded-full font-bold text-label-md hover:bg-primary/5 active:scale-95 transition-all"
              >
                BPH Organisasi
              </a>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute top-1/3 right-0 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full filter blur-3xl -z-10"></div>
        </section>

        {/* Tentang Semadiksi */}
        <section className="px-margin-mobile md:px-margin-desktop py-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-extrabold text-on-surface">
              Apa itu SEMADIKSI?
            </h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                <strong>SEMADIKSI</strong> merupakan organisasi kemahasiswaan internal kampus di Universitas Nahdlatul Ulama Surabaya yang menaungi seluruh mahasiswa penerima beasiswa Bidikmisi dan Kartu Indonesia Pintar Kuliah (KIP-K).
              </p>
              <p>
                Didirikan dengan asas kekeluargaan dan solidaritas tinggi (dengan semboyan khas <em>"Seduluran Selawase"</em>), SEMADIKSI berkomitmen menjadi wadah akselerasi potensi akademik maupun non-akademik anggotanya untuk melahirkan lulusan berkarakter Islami, profesional, dan peduli sosial.
              </p>
              <p>
                Kami bergerak aktif menyinergikan program kerja beasiswa dengan pihak rektorat, LLDIKTI, serta mitra eksternal guna mempermudah mahasiswa mendapatkan hak studi, pendampingan laporan akademik, dan partisipasi kegiatan pengembangan karakter.
              </p>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video border border-surface-container-high">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRMQ-d6nNFpGEE5UMuXb5ZAepbNCOdxvWhRJbToiNki5oFEgN67XLhfWuQy4bS0LJyd7_vvkMYoq1MfnltjKQj5T81z0Rojz-p9oDpAxXugm7SrEVHecWl7JQJ5HG2i9ZpD3n6qMFh70lQH3YpmMc2SRAoqlxTBXoEvNikA1Ysn7t_5TJjvv_7jb-N1XZE7B_s8Js0W4VJ-ZJenWKuL5WR6_GCIAyORUC4-spkvDmk4u2vf3y-DGOh5w"
              className="w-full h-full object-cover"
              alt="SEMADIKSI Gathering"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
              <span className="text-white font-bold text-sm bg-primary/80 backdrop-blur-sm px-4 py-1.5 rounded-full">
                #SeduluranSelawase
              </span>
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section id="visi-misi" className="bg-surface-container-low py-20 border-y border-surface-container-high">
          <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">
                Visi &amp; Misi Organisasi
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Arah perjuangan kepengurusan SEMADIKSI dalam mewujudkan insan beasiswa yang kompetitif.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Visi Card */}
              <div className="lg:col-span-5 bg-white border border-surface-container-high rounded-3xl p-8 shadow-sm flex flex-col justify-center text-center space-y-4">
                <span className="material-symbols-outlined text-primary text-5xl">visibility</span>
                <h3 className="font-display text-2xl font-extrabold text-on-surface">VISI</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed italic">
                  "Menjadi wadah pembinaan mahasiswa beasiswa KIP-K UNUSA yang berkarakter, unggul, berjiwa sosial, dan mandiri berlandaskan nilai-nilai Rahmatan Lil Alamin."
                </p>
              </div>

              {/* Misi Card */}
              <div className="lg:col-span-7 bg-white border border-surface-container-high rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-4xl">my_location</span>
                  <h3 className="font-display text-2xl font-extrabold text-on-surface">MISI</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Membina karakter mahasiswa KIP-K yang religius, berintegritas, beradab, serta senantiasa berprestasi di kancah akademik maupun non-akademik.",
                    "Mengembangkan kreativitas, inovasi, dan soft skill kepemimpinan melalui program pelatihan berkala dan terstruktur.",
                    "Menyelenggarakan kegiatan sosial kemasyarakatan dan pengabdian demi kebermanfaatan umat serta mengharumkan nama almamater.",
                    "Menjaga dan mempererat solidaritas, kerukunan, rasa kekeluargaan, serta kolaborasi sinergis antar sesama mahasiswa beasiswa KIP-K."
                  ].map((m, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </span>
                      <span className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                        {m}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divisi / Departemen */}
        <section className="px-margin-mobile md:px-margin-desktop py-20 max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-extrabold text-on-surface">
              Departemen &amp; Divisi Kerja
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Empat pilar fungsional SEMADIKSI dalam menjalankan roda organisasi sehari-hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {divisi.map((div, idx) => (
              <div
                key={idx}
                className="bg-white border border-surface-container-high rounded-3xl p-6 shadow-sm flex gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${div.color}`}>
                  <span className="material-symbols-outlined text-2xl">{div.icon}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-on-surface">{div.name}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{div.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BPH Pengurus */}
        <section id="pengurus" className="bg-surface-container-low py-20 border-t border-surface-container-high">
          <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">
                Badan Pengurus Harian (BPH)
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Nakhoda utama kepengurusan organisasi SEMADIKSI UNUSA Periode 2024/2025.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center">
              {bph.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-surface-container-high rounded-2xl p-5 shadow-sm text-center flex flex-col items-center group hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary/20 group-hover:border-primary transition-all duration-300">
                    <img
                      src={p.img}
                      className="w-full h-full object-cover"
                      alt={p.name}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary mb-1 block">
                    {p.role}
                  </span>
                  <h4 className="font-bold text-on-surface text-base line-clamp-1 mb-0.5">
                    {p.name}
                  </h4>
                  <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed">
                    {p.univ}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hubungi Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-12 max-w-5xl mx-auto text-center">
          <div className="bg-surface-container rounded-[2.5rem] p-10 flex flex-col items-center space-y-6 border border-dashed border-primary/30">
            <span className="material-symbols-outlined text-primary text-5xl">contact_support</span>
            <div className="space-y-2">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface">
                Ingin Berkolaborasi Bersama SEMADIKSI?
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
                Kami sangat terbuka untuk kerjasama penyelenggaraan seminar beasiswa, program kepedulian sosial, aksi kerrelawanan, maupun sponsor kemitraan.
              </p>
            </div>
            <button
              onClick={() => alert("Silakan email proposal kolaborasi Anda ke: humas@semadiksi.org")}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold text-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">mail</span> Ajukan Kerjasama
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl bg-surface-container-lowest border-t border-surface-container shadow-sm">
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
              className="text-primary font-bold font-body-md text-body-md"
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
