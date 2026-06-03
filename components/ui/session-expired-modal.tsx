'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, Clock } from 'lucide-react'
import { haptics } from '@/lib/utils/haptics'
import { useEffect } from 'react'

interface SessionExpiredModalProps {
  isOpen: boolean
  onLogin: () => void
  onLogout: () => void
}

export function SessionExpiredModal({ isOpen, onLogin, onLogout }: SessionExpiredModalProps) {
  useEffect(() => {
    if (isOpen) {
      haptics.error()
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop — tidak bisa di-dismiss */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-amber-500 to-red-500" />

            {/* Content */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center ring-4 ring-amber-100">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Sesi Berakhir
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Sesi login Anda sudah habis. Silakan login kembali untuk melanjutkan menggunakan aplikasi.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-2">
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-primary-200"
              >
                <LogIn className="w-4 h-4" />
                Login Kembali
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl active:scale-[0.98] transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
