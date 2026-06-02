'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PublicStats {
  totalEntries: number
  totalPhotos: number
  activeUsers: number
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    const val = n / 1000
    return val % 1 === 0 ? `${val}K+` : `${val.toFixed(1)}K+`
  }
  return `${n}+`
}

export default function HomePage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<PublicStats | null>(null)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('accessToken')
    if (token) {
      router.push('/entry')
    }
    // Trigger animations
    setIsVisible(true)

    // Fetch public stats
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setStats(result.data)
        }
      })
      .catch(() => {
        // Silently fail — landing page still works without stats
      })
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/30 to-white">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Selisih Berat</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-white gradient-primary rounded-lg hover:opacity-90 transition-opacity active:scale-98"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-24 pb-8 px-4">
        <div
          className={`max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
              <span className="text-xs font-medium text-primary-700">Sistem Audit Logistik</span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Audit Selisih Berat
              <span className="block text-primary-600">J&T Express</span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed">
              Entry resi, dokumentasi foto, dan tracking selisih berat — semua dalam satu platform.
              Dipercaya kurir di seluruh Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-98 elevated-button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Masuk ke Akun
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-white border-2 border-primary-200 hover:border-primary-300 hover:bg-red-50 transition-all active:scale-98"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Daftar Gratis
              </Link>
            </div>
          </div>

          {/* Right: App Preview Card */}
          <div className="flex-1 w-full max-w-sm lg:max-w-md">
            <div className="relative">
              {/* Phone frame */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Status bar mock */}
                <div className="gradient-primary px-4 py-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs opacity-80">Selamat Datang 👋</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xs font-bold">SB</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold">Audit Selisih Berat</p>
                  <p className="text-xs opacity-80 mt-1">J&T Express Indonesia</p>
                </div>

                {/* Mock stats */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Total Resi</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats ? stats.totalEntries.toLocaleString('id-ID') : '—'}
                      </p>
                      <p className="text-[10px] text-green-600 font-medium">↑ Aktif</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Foto Terupload</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats ? stats.totalPhotos.toLocaleString('id-ID') : '—'}
                      </p>
                      <p className="text-[10px] text-green-600 font-medium">↑ Aktif</p>
                    </div>
                  </div>

                  {/* Mock entry card */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">Scan Barcode</p>
                        <p className="text-[10px] text-gray-500">Tap untuk mulai entry</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Live Production</p>
                  <p className="text-[10px] text-gray-500">
                    {stats ? formatNumber(stats.totalEntries) : '—'} resi diproses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-primary rounded-2xl p-6 md:p-8 text-white">
            <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
              <div>
                <p className="text-2xl md:text-3xl font-extrabold">
                  {stats ? formatNumber(stats.totalEntries) : '—'}
                </p>
                <p className="text-[10px] md:text-xs opacity-80 mt-1">Resi Diproses</p>
              </div>
              <div className="border-x border-white/20">
                <p className="text-2xl md:text-3xl font-extrabold">
                  {stats ? formatNumber(stats.totalPhotos) : '—'}
                </p>
                <p className="text-[10px] md:text-xs opacity-80 mt-1">Foto Terdokumentasi</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold">
                  {stats ? `${stats.activeUsers}+` : '—'}
                </p>
                <p className="text-[10px] md:text-xs opacity-80 mt-1">User Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
              Semua yang lu butuhin, ada di sini
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Fitur lengkap buat audit selisih berat yang akurat dan efisien
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Scan Barcode</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Scan resi cepat pake kamera HP, auto-fill data entry</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Dokumentasi Foto</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Upload foto otomatis di-rename, GPS watermark, tersimpan aman</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">GPS Tracking</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Lokasi auto-capture setiap entry, akurat dan transparan</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Dashboard lengkap, statistik real-time, export laporan</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Reward System</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Earn 500-1500 Rupiah per entry, tergantung akurasi</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">PWA Ready</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Install di HP, jalan offline, performa kayak native app</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
              Cara kerjanya simpel banget
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              3 langkah aja, langsung jalan
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-3 text-lg md:text-2xl font-extrabold shadow-lg">
                1
              </div>
              <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1">Scan Resi</h3>
              <p className="text-[10px] md:text-xs text-gray-500">Arahin kamera ke barcode, auto-detect</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-3 text-lg md:text-2xl font-extrabold shadow-lg">
                2
              </div>
              <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1">Upload Foto</h3>
              <p className="text-[10px] md:text-xs text-gray-500">Foto paket, auto-rename + GPS tag</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-3 text-lg md:text-2xl font-extrabold shadow-lg">
                3
              </div>
              <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1">Submit & Earn</h3>
              <p className="text-[10px] md:text-xs text-gray-500">Data tersimpan, reward otomatis masuk</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-10">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
              Siap mulai audit?
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Daftar gratis, langsung bisa entry resi dan earn reward dari hari pertama.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-98 elevated-button"
              >
                Daftar Sekarang — Gratis
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-98"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-6 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">SB</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">Audit Selisih Berat</span>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2025 J&T Express — Sistem Audit Selisih Berat
          </p>
        </div>
      </footer>
    </div>
  )
}
