'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogIn, UserPlus, ScanBarcode, Camera, MapPin, BarChart3,
  Coins, Smartphone, CheckCircle, Zap, ArrowRight
} from 'lucide-react'

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
                <LogIn className="w-4 h-4" />
                Masuk ke Akun
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-white border-2 border-primary-200 hover:border-primary-300 hover:bg-red-50 transition-all active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
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
                        <ScanBarcode className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">Scan Barcode</p>
                        <p className="text-[10px] text-gray-500">Tap untuk mulai entry</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
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
                <ScanBarcode className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Scan Barcode</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Scan resi cepat pake kamera HP, auto-fill data entry</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Dokumentasi Foto</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Upload foto otomatis di-rename, GPS watermark, tersimpan aman</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">GPS Tracking</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Lokasi auto-capture setiap entry, akurat dan transparan</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Dashboard lengkap, statistik real-time, export laporan</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <Coins className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Reward System</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">Earn 500-1500 Rupiah per entry, tergantung akurasi</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:border-red-100 transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
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
              <Zap className="w-7 h-7 text-white" />
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
