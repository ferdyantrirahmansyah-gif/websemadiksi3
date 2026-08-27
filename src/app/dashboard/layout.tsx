"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Ahmad Fauzan",
    university: "Universitas Diponegoro",
    kipStatus: "KIP UNUSA",
    verificationStatus: "Verified"
  });

  useEffect(() => {
    const updateSession = () => {
      const userStr = localStorage.getItem("semadiksi_current_user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const storedUsers = localStorage.getItem("semadiksi_users");
          const usersList = storedUsers ? JSON.parse(storedUsers) : [];
          const updatedUser = usersList.find((usr: any) => usr.email.toLowerCase() === u.email.toLowerCase());
          
          if (updatedUser) {
            setCurrentUser({
              name: updatedUser.name,
              university: updatedUser.university,
              kipStatus: updatedUser.kipStatus,
              verificationStatus: updatedUser.verificationStatus
            });
            localStorage.setItem("semadiksi_current_user", JSON.stringify(updatedUser));
          } else {
            setCurrentUser({
              name: u.name,
              university: u.university,
              kipStatus: u.kipStatus,
              verificationStatus: u.verificationStatus
            });
          }
        } catch (e) {}
      }
    };

    updateSession();
    window.addEventListener("focus", updateSession);
    return () => window.removeEventListener("focus", updateSession);
  }, []);

  const navLinks = [
    {
      name: "Beranda",
      href: "/dashboard",
      icon: "home",
    },
    {
      name: "Profil Saya",
      href: "/dashboard/profil",
      icon: "person",
    },
    {
      name: "Kegiatan",
      href: "/dashboard/kegiatan",
      icon: "event_upcoming",
    },
    {
      name: "Kegiatan Saya",
      href: "/dashboard/kegiatan-saya",
      icon: "event_available",
    },
    {
      name: "Sertifikat",
      href: "/dashboard/sertifikat",
      icon: "workspace_premium",
    },
    {
      name: "Info Beasiswa",
      href: "/dashboard/info-beasiswa",
      icon: "school",
    },
    {
      name: "Berita Acara Kegiatan",
      href: "/dashboard/berita-acara",
      icon: "newspaper",
    },
  ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky shadow-[0px_4px_20px_0px_rgba(27,109,36,0.05)] bg-surface flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-40">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-surface-variant/10 rounded-full transition-colors active:scale-95 duration-200 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <span className="font-display text-headline-md font-extrabold text-primary">
            SEMADIKSI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md text-on-surface font-semibold">
              Halo, {currentUser.name}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {currentUser.kipStatus === "KIP UNUSA" ? "Mahasiswa KIP UNUSA" : "Umum"}
            </p>
          </div>
          <Link
            href="/dashboard/profil"
            className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden cursor-pointer hover:border-primary transition-all duration-200"
          >
            <img
              className="w-full h-full object-cover"
              alt="User profile avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByC13lRV-RXOv0wxz5CEddVyXFPn7mB78UwyO78hHTtw4oLda25cFIDyqFxXT2Ws2_cX6amMuQrpkkGD6wl5NvmOJsYF0GOSFS2fTiCDEo5Y5DUay0oKKExRn2MZzQfii3KkLuzsbFdtVFizHLSVi6mPtbSzi02TB9n3sh2r66X7yxUb4uochJZwj-CZNAe4RRqFxSFFNv7Vgrrobo0XFEQpFj2PKdh3MZs4QqcA6dfslUx7ijmZxWdQ"
            />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* NavigationDrawer (Sidebar) */}
        <aside
          className={`h-screen w-72 fixed left-0 top-0 bg-surface shadow-md z-50 transition-transform duration-300 ease-in-out flex flex-col pt-lg sidebar-scroll overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Header Area inside Drawer */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between lg:justify-start mb-6">
              <span className="font-display text-headline-md text-primary font-extrabold">
                SEMADIKSI
              </span>
              <button
                className="lg:hidden p-1 cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-primary-container/10 rounded-xl p-4 border border-primary/10">
              <p className="font-label-sm text-label-sm text-primary mb-1">
                Selamat Datang,
              </p>
              <p className="font-bold text-on-surface">{currentUser.name}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary-container rounded-full animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Status: {currentUser.verificationStatus === "Verified" ? "Terverifikasi" : 
                           currentUser.verificationStatus === "Pending" ? "Menunggu Verifikasi" : "Ditolak / Non-KIP"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1 px-2">
            {navLinks
              .filter((link) => {
                if (link.href === "/dashboard/pelaporan") {
                  return currentUser.kipStatus === "KIP UNUSA";
                }
                if (link.href === "/dashboard/info-beasiswa" || link.href === "/dashboard/berita-acara") {
                  return currentUser.kipStatus !== "KIP UNUSA";
                }
                return true;
              })
              .map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 ${
                    isActive
                      ? "bg-primary text-white font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {link.icon}
                  </span>
                  <span className="font-label-md text-label-md">
                    {link.name}
                  </span>
                </Link>
              );
            })}

            {/* Special Section for KIP - Only for KIP UNUSA students */}
            {currentUser.kipStatus === "KIP UNUSA" && (
              <>
                <div className="mt-6 mb-2 px-6">
                  <p className="font-label-sm text-label-sm text-outline-variant uppercase tracking-wider font-bold">
                    Informasi & Berita KIP-K
                  </p>
                </div>
                <Link
                  href="/dashboard/berita-acara"
                  onClick={handleLinkClick}
                  className={`group relative px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 mx-2 overflow-hidden ${
                    pathname === "/dashboard/berita-acara"
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className={`material-symbols-outlined ${pathname === "/dashboard/berita-acara" ? "text-white" : "text-tertiary"}`}>
                    newspaper
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    Berita Acara Kegiatan
                  </span>
                </Link>
                <Link
                  href="/dashboard/info-kip"
                  onClick={handleLinkClick}
                  className={`px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 mx-2 ${
                    pathname === "/dashboard/info-kip"
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className={`material-symbols-outlined ${pathname === "/dashboard/info-kip" ? "text-white" : "text-secondary"}`}>
                    verified_user
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    Informasi Terkait KIP UNUSA
                  </span>
                </Link>
                <Link
                  href="/dashboard/berkas-kipk"
                  onClick={handleLinkClick}
                  className={`px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 mx-2 ${
                    pathname === "/dashboard/berkas-kipk"
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className={`material-symbols-outlined ${pathname === "/dashboard/berkas-kipk" ? "text-white" : "text-blue-600"}`}>
                    folder_shared
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    Berkas KIP-K
                  </span>
                </Link>
                <Link
                  href="/dashboard/pengajuan-pencairan"
                  onClick={handleLinkClick}
                  className={`px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 mx-2 ${
                    pathname === "/dashboard/pengajuan-pencairan" || pathname === "/dashboard/pelaporan" || pathname === "/dashboard/monev-akademik"
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className={`material-symbols-outlined ${pathname === "/dashboard/pengajuan-pencairan" || pathname === "/dashboard/pelaporan" || pathname === "/dashboard/monev-akademik" ? "text-white" : "text-amber-600"}`}>
                    assignment_turned_in
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    Pelaporan Beasiswa KIP-K
                  </span>
                </Link>
                <Link
                  href="/dashboard/absensi"
                  onClick={handleLinkClick}
                  className={`px-4 py-3 flex items-center gap-4 rounded-full transition-all active:scale-98 duration-150 mx-2 ${
                    pathname === "/dashboard/absensi"
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className={`material-symbols-outlined ${pathname === "/dashboard/absensi" ? "text-white" : "text-emerald-700"}`}>
                    how_to_reg
                  </span>
                  <span className="font-label-md text-label-md font-bold">
                    Presensi Kegiatan
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* Bottom Sidebar Actions */}
          <div className="p-4 mt-auto border-t border-surface-variant/30">
            <Link
              href="/masuk"
              className="w-full flex items-center gap-4 px-4 py-3 text-error hover:bg-error-container/10 rounded-full transition-colors font-bold"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Keluar</span>
            </Link>
          </div>
        </aside>

        {/* Backdrop overlay for mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Canvas */}
        <main className="flex-1 lg:ml-72 bg-background min-h-screen relative overflow-hidden pb-12">
          {/* Subtle Background Shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Page contents rendering */}
          {children}
        </main>
      </div>
    </div>
  );
}
