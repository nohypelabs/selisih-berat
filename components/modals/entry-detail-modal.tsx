'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, User, Camera, FileText, Package, Scale, Copy, Check, ExternalLink } from 'lucide-react'
import type { Entry } from '@/lib/types/entry'
import { formatDateShort, formatTime } from '@/lib/utils/helpers'
import { PhotoViewerModal } from './photo-viewer-modal'
import { Badge } from '@/components/ui/badge'

interface EntryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  entry: Entry | null
}

const getSelisihColor = (selisih: number) => {
  const abs = Math.abs(selisih)
  if (abs < 0.5) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', gradient: 'from-emerald-500 to-green-600' }
  if (abs < 1) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-500' }
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-rose-500 to-red-600' }
}

export function EntryDetailModal({ isOpen, onClose, entry }: EntryDetailModalProps) {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  if (!isOpen || !entry) return null

  const colors = getSelisihColor(entry.selisih)

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl)
    setPhotoViewerOpen(true)
  }

  const handleCopyResi = async () => {
    try {
      await navigator.clipboard.writeText(entry.no_resi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Parse GPS data from catatan if exists
  let gpsData: { lat?: number; lng?: number; location?: string } | null = null
  try {
    if (entry.catatan) {
      const parsed = JSON.parse(entry.catatan)
      if (parsed.gps_lat && parsed.gps_lng) {
        gpsData = {
          lat: parsed.gps_lat,
          lng: parsed.gps_lng,
          location: parsed.location
        }
      }
    }
  } catch {
    // Not JSON, treat as regular catatan
  }

  const photos = [entry.foto_url_1, entry.foto_url_2].filter(Boolean) as string[]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal — Bottom Sheet Style for Mobile */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-12 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:max-h-[85vh] md:rounded-2xl z-[60]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
              {/* Drag Handle (mobile) */}
              <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className={`bg-gradient-to-r ${colors.gradient} px-5 py-4 text-white relative overflow-hidden flex-shrink-0`}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Resi + Selisih */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-white/80" />
                      <span className="text-xs text-white/80 font-medium">No. Resi</span>
                      <button
                        onClick={handleCopyResi}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="font-mono text-base font-bold truncate">{entry.no_resi}</p>
                    <p className="text-sm text-white/90 truncate">{entry.nama}</p>
                  </div>

                  {/* Selisih Badge */}
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-center flex-shrink-0">
                    <p className={`text-2xl font-extrabold ${colors.text}`}>
                      {entry.selisih >= 0 ? '+' : ''}{entry.selisih}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">kg selisih</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={
                      entry.status === 'approved' ? 'approved' :
                      entry.status === 'rejected' ? 'rejected' :
                      'pending'
                    }
                    size="sm"
                  >
                    {entry.status || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Content — Scrollable */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

                {/* Weight Details — Compact */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Berat Resi</p>
                      <p className="text-lg font-bold text-gray-900">{entry.berat_resi}</p>
                      <p className="text-[10px] text-gray-400">kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Berat Aktual</p>
                      <p className="text-lg font-bold text-gray-900">{entry.berat_aktual}</p>
                      <p className="text-[10px] text-gray-400">kg</p>
                    </div>
                    <div className={`text-center rounded-lg border p-1.5 ${colors.bg} ${colors.border}`}>
                      <p className="text-[10px] text-gray-500 mb-0.5">Selisih</p>
                      <p className={`text-lg font-bold ${colors.text}`}>
                        {entry.selisih >= 0 ? '+' : ''}{entry.selisih}
                      </p>
                      <p className="text-[10px] text-gray-400">kg</p>
                    </div>
                  </div>
                </div>

                {/* Info Row — Compact */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Date & Time */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-medium text-blue-600">Tanggal</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">
                      {entry.created_at ? formatDateShort(entry.created_at) : '-'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {entry.created_at ? formatTime(entry.created_at) : '-'}
                    </p>
                  </div>

                  {/* Creator */}
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-[10px] font-medium text-purple-600">Dibuat Oleh</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {entry.created_by || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-gray-500">ID: {entry.id}</p>
                  </div>
                </div>

                {/* GPS Location */}
                {gpsData && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[10px] font-medium text-green-600">Lokasi GPS</span>
                    </div>
                    {gpsData.location ? (
                      <p className="text-xs font-semibold text-gray-900">{gpsData.location}</p>
                    ) : (
                      <p className="font-mono text-xs text-gray-700">
                        {gpsData.lat?.toFixed(6)}, {gpsData.lng?.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Foto ({photos.length})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePhotoClick(url)}
                          className="relative aspect-square rounded-xl overflow-hidden group active:scale-[0.98] transition-transform"
                        >
                          <img
                            src={url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {entry.catatan && !gpsData && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-600">Catatan</span>
                    </div>
                    <p className="text-xs text-amber-800">{entry.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Photo Viewer Modal */}
          <PhotoViewerModal
            isOpen={photoViewerOpen}
            onClose={() => setPhotoViewerOpen(false)}
            photoUrl={selectedPhotoUrl}
            metadata={{
              no_resi: entry.no_resi,
              nama: entry.nama,
              created_at: entry.created_at || undefined,
              created_by: entry.created_by || undefined
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
