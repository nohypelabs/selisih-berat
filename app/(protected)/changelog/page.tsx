'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Palette, Layout, Navigation, Image as ImageIcon,
  MapPin, Shield, BarChart3, Clock, Smartphone,
  AlertTriangle, RefreshCw, Zap, TrendingUp,
  Camera, LogIn, Users, Timer
} from 'lucide-react'

interface ChangeItem {
  icon: React.ReactNode
  title: string
  description: string
  category: 'ui' | 'ux' | 'feature' | 'fix'
}

interface TimelineEntry {
  date: string
  label: string
  changes: ChangeItem[]
}

const timeline: TimelineEntry[] = [
  {
    date: '2026-06-04',
    label: '4 Juni 2026',
    changes: [
      {
        icon: <Camera className="w-4 h-4" />,
        title: 'Foto Profil',
        description: 'Upload foto profil dari galeri. Auto compress ke 100KB, simpan di Supabase Storage. 1 user = 1 foto, foto lama otomatis terhapus.',
        category: 'feature'
      },
      {
        icon: <LogIn className="w-4 h-4" />,
        title: 'Session Expired Modal',
        description: 'Modal otomatis muncul saat sesi habis. Auto refresh token sebelumnya. Pilihan "Login Kembali" atau "Logout".',
        category: 'feature'
      },
      {
        icon: <Shield className="w-4 h-4" />,
        title: 'Auto Token Refresh',
        description: 'Semua API call pakai authFetch — token expired auto refresh diam-diam. Tidak perlu logout manual lagi.',
        category: 'feature'
      },
      {
        icon: <Timer className="w-4 h-4" />,
        title: 'Leaderboard 12 Jam',
        description: 'Tab "12 Jam" di leaderboard — filter sesi aktif (06:00-18:00 / 18:00-06:00 WIB). Tab "Daily" (24 jam) dihapus karena tidak relevan untuk shift 12 jam.',
        category: 'feature'
      },
      {
        icon: <Users className="w-4 h-4" />,
        title: 'Avatar di Leaderboard & Sidebar',
        description: 'Foto profil tampil di leaderboard, sidebar desktop, dan mobile sidebar. Fallback ke inisial kalau belum upload foto.',
        category: 'ui'
      },
      {
        icon: <Trophy className="w-4 h-4" />,
        title: 'Leaderboard Polish',
        description: 'Ganti emoji dengan Lucide icons. Earnings lebih prominent dengan font hijau tebal. Tab pakai ikon (Clock, Crown). Badge level dengan ikon. Layout lebih clean.',
        category: 'ui'
      },
    ]
  },
  {
    date: '2026-06-03',
    label: '3 Juni 2026',
    changes: [
      {
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Confirmation Modal',
        description: 'Native alert() dan confirm() diganti modal cantik dengan framer-motion. Ada 3 variant: danger, warning, info.',
        category: 'ux'
      },
      {
        icon: <RefreshCw className="w-4 h-4" />,
        title: 'Error State + Retry',
        description: 'Semua page sekarang punya error state inline dengan tombol "Coba Lagi". User tidak lagi lihat halaman kosong saat error.',
        category: 'ux'
      },
      {
        icon: <Smartphone className="w-4 h-4" />,
        title: 'Pull-to-Refresh',
        description: 'Tarik ke bawah di mobile untuk refresh data. Ada indikator spinner dan teks "Tarik untuk refresh".',
        category: 'ux'
      },
      {
        icon: <Zap className="w-4 h-4" />,
        title: 'Haptic Feedback',
        description: 'Getaran ringan saat navigasi, submit entry, dan notifikasi. Membuat app terasa lebih responsif di mobile.',
        category: 'ux'
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Count-Up Animation',
        description: 'Angka statistik di dashboard animasi naik dari 0 saat pertama kali dimuat.',
        category: 'ui'
      },
      {
        icon: <Palette className="w-4 h-4" />,
        title: 'Gradient Accent Header',
        description: 'Header dashboard dengan gradient subtle dari primary ke hijau, plus decorative orb.',
        category: 'ui'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Shimmer Skeleton',
        description: 'Loading skeleton sekarang pakai efek shimmer gradient yang lebih smooth dari pulse biasa.',
        category: 'ui'
      },
      {
        icon: <Clock className="w-4 h-4" />,
        title: '12 Jam Period Reset',
        description: 'Total earnings direset tiap 12 jam (06:00 & 18:00 WIB). Default period di dashboard berubah ke "12 Jam".',
        category: 'feature'
      },
      {
        icon: <Navigation className="w-4 h-4" />,
        title: 'Page Transition',
        description: 'Animasi fade + slide saat pindah halaman. Berlaku untuk sidebar, bottom nav, dan link.',
        category: 'ui'
      },
    ]
  },
  {
    date: '2026-06-02',
    label: '2 Juni 2026',
    changes: [
      {
        icon: <Navigation className="w-4 h-4" />,
        title: 'Top Bar Mobile',
        description: 'Header baru dengan icon app, page title, dan settings icon. Ganti hamburger menu.',
        category: 'ui'
      },
      {
        icon: <Navigation className="w-4 h-4" />,
        title: 'Bottom Nav Glass Effect',
        description: 'Efek glassmorphism transparan, rounded corners, dan width dikurangi.',
        category: 'ui'
      },
      {
        icon: <Navigation className="w-4 h-4" />,
        title: 'Sidebar Glassmorphism',
        description: 'Sidebar dengan efek glass transparan, logout dipindah ke kanan atas, X button dihapus.',
        category: 'ui'
      },
      {
        icon: <Palette className="w-4 h-4" />,
        title: 'Lucide Icons',
        description: 'Semua emoji diganti Lucide React icons di halaman Entry, Location, Photo, Barcode.',
        category: 'ui'
      },
      {
        icon: <ImageIcon className="w-4 h-4" />,
        title: 'Icon App ke Sidebar',
        description: 'Icon SB diganti dengan icon-latest.png di desktop dan mobile sidebar.',
        category: 'ui'
      },
      {
        icon: <ImageIcon className="w-4 h-4" />,
        title: 'Login & Signup Icon',
        description: 'Icon tanpa frame, ukuran +300%, guidance text, dan proper footer.',
        category: 'ui'
      },
      {
        icon: <Shield className="w-4 h-4" />,
        title: 'GPS Auto-Retry',
        description: 'Ketika izin lokasi ditolak, system otomatis minta izin lagi 2x. User tidak perlu hapus data browser.',
        category: 'feature'
      },
      {
        icon: <MapPin className="w-4 h-4" />,
        title: 'Location di Bawah Submit',
        description: 'Detail lokasi GPS dipindah ke bawah tombol Simpan Entry agar form lebih clean.',
        category: 'ux'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Profile Page Polish',
        description: 'UI/UX diimprove: avatar besar, card-based info, security section, logout button dipindah ke sini.',
        category: 'ui'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Settings Page Polish',
        description: 'Toggle switch modern, Lucide icons, card layout lebih clean.',
        category: 'ui'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Data Management Compact',
        description: 'Filter section dibuat compact: single row search + status + date. Stats & export inline.',
        category: 'ux'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Foto Management Compact',
        description: 'Filter dan bulk actions dibuat compact. Stats cards tetap, hanya filter yang dirapikan.',
        category: 'ux'
      },
      {
        icon: <Layout className="w-4 h-4" />,
        title: 'Entry Detail Modal',
        description: 'Bottom sheet style, layout compact, weight details 3 kolom, foto grid 2 kolom.',
        category: 'ui'
      },
      {
        icon: <BarChart3 className="w-4 h-4" />,
        title: 'Earnings Period Filter',
        description: 'Filter 1D, 7D, 30D, All Time. Default 1D. API support period filtering.',
        category: 'feature'
      },
      {
        icon: <BarChart3 className="w-4 h-4" />,
        title: 'Earnings Chart',
        description: 'Area chart ala crypto portfolio (Binance style). Gradient fill, smooth curve, tooltip.',
        category: 'feature'
      },
      {
        icon: <Clock className="w-4 h-4" />,
        title: 'Recent Entries + Jam',
        description: 'Entry terbaru sekarang menampilkan jam:menit selain tanggal.',
        category: 'feature'
      },
    ]
  },
]

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  ui: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'UI' },
  ux: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'UX' },
  feature: { bg: 'bg-green-50', text: 'text-green-600', label: 'Feature' },
  fix: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Fix' },
}

const totalChanges = timeline.reduce((sum, t) => sum + t.changes.length, 0)

export default function ChangelogPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-bold text-gray-900">Riwayat Update</h1>
          </div>
          <p className="text-xs text-gray-500">
            {totalChanges} update • {timeline.length} hari pengembangan
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {timeline.map((entry, timelineIdx) => {
            const grouped = entry.changes.reduce((acc, change) => {
              if (!acc[change.category]) acc[change.category] = []
              acc[change.category].push(change)
              return acc
            }, {} as Record<string, ChangeItem[]>)

            return (
              <div key={entry.date} className="relative mb-6 last:mb-0">
                {/* Date dot */}
                <div className="absolute left-4 top-3 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow-sm -translate-x-1/2 z-10" />

                {/* Date label */}
                <div className="ml-10 mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900">{entry.label}</h2>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-50 text-primary-600">
                      {entry.changes.length} update
                    </span>
                  </div>
                </div>

                {/* Changes grouped by category */}
                <div className="ml-10 space-y-3">
                  {Object.entries(grouped).map(([category, items]) => {
                    const cat = categoryColors[category]
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${cat.bg} ${cat.text}`}>
                            {cat.label}
                          </span>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 px-3 py-2.5 ${
                                idx < items.length - 1 ? 'border-b border-gray-50' : ''
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0 ${cat.text}`}>
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] text-gray-400">
            Audit Selisih Berat • v1.1
          </p>
        </div>
      </div>
    </div>
  )
}
