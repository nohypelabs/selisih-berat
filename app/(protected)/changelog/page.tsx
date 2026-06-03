'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Palette, Layout, Navigation, Image as ImageIcon,
  MapPin, Shield, BarChart3, ChevronRight, Clock, Smartphone,
  AlertTriangle, RefreshCw, Zap, TrendingUp
} from 'lucide-react'

interface ChangeItem {
  icon: React.ReactNode
  title: string
  description: string
  category: 'ui' | 'ux' | 'feature' | 'fix'
}

const changes: ChangeItem[] = [
  // UI/UX Polish — Latest
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

  // UI/UX Updates
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

  // Feature Updates
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

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  ui: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'UI' },
  ux: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'UX' },
  feature: { bg: 'bg-green-50', text: 'text-green-600', label: 'Feature' },
  fix: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Fix' },
}

export default function ChangelogPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) router.push('/login')
  }, [router])

  const groupedChanges = changes.reduce((acc, change) => {
    if (!acc[change.category]) acc[change.category] = []
    acc[change.category].push(change)
    return acc
  }, {} as Record<string, ChangeItem[]>)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-bold text-gray-900">Update Hari Ini</h1>
          </div>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-900">{changes.length} Update</p>
              <p className="text-xs text-primary-600">
                {groupedChanges.ui?.length || 0} UI • {groupedChanges.ux?.length || 0} UX • {groupedChanges.feature?.length || 0} Feature
              </p>
            </div>
          </div>
        </div>

        {/* Changes by Category */}
        {Object.entries(groupedChanges).map(([category, items]) => {
          const cat = categoryColors[category]
          return (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-gray-400">{items.length} perubahan</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      idx < items.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0 ${cat.text}`}>
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

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-400">
            Audit Selisih Berat • Update v1.1
          </p>
        </div>
      </div>
    </div>
  )
}
