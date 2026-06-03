'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Camera, LogIn, Shield, Timer, Users, Trophy,
  AlertTriangle, RefreshCw, Smartphone, Zap, TrendingUp,
  Palette, Layout, Clock, Navigation
} from 'lucide-react'
import { haptics } from '@/lib/utils/haptics'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
}

const updates = [
  { icon: <Camera className="w-4 h-4" />, title: 'Foto Profil', desc: 'Upload foto, auto compress 100KB' },
  { icon: <LogIn className="w-4 h-4" />, title: 'Session Modal', desc: 'Auto refresh token, notif sesi habis' },
  { icon: <Shield className="w-4 h-4" />, title: 'Auto Token Refresh', desc: 'Tidak perlu logout manual lagi' },
  { icon: <Timer className="w-4 h-4" />, title: 'Leaderboard 12 Jam', desc: 'Filter sesi aktif shift' },
  { icon: <Trophy className="w-4 h-4" />, title: 'Leaderboard Polish', desc: 'Lucide icons, earnings prominent' },
  { icon: <AlertTriangle className="w-4 h-4" />, title: 'Confirmation Modal', desc: 'Ganti native alert/confirm' },
  { icon: <RefreshCw className="w-4 h-4" />, title: 'Error + Retry', desc: 'Error state dengan tombol coba lagi' },
  { icon: <Smartphone className="w-4 h-4" />, title: 'Pull-to-Refresh', desc: 'Tarik ke bawah untuk refresh' },
  { icon: <Zap className="w-4 h-4" />, title: 'Haptic Feedback', desc: 'Getaran di navigasi & submit' },
  { icon: <TrendingUp className="w-4 h-4" />, title: 'Count-Up', desc: 'Angka statistik animasi' },
  { icon: <Palette className="w-4 h-4" />, title: 'Gradient Header', desc: 'Dashboard header lebih fresh' },
  { icon: <Clock className="w-4 h-4" />, title: '12 Jam Reset', desc: 'Earnings reset tiap 12 jam WIB' },
  { icon: <Navigation className="w-4 h-4" />, title: 'Page Transition', desc: 'Animasi antar halaman' },
]

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  useEffect(() => {
    if (isOpen) {
      haptics.light()
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          {/* Modal — Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 bg-white/[0.75] backdrop-blur-2xl border border-white/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary-500 via-green-500 to-blue-500" />

            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Apa yang Baru?</h2>
                </div>
                <p className="text-xs text-gray-500 ml-10">Update terbaru aplikasi</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Update list */}
            <div className="px-5 pb-2 max-h-[50vh] overflow-y-auto">
              <div className="space-y-1.5">
                {updates.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-200"
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
