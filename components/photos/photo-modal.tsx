'use client'

import { useEffect, useState } from 'react'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  metadata?: {
    nama?: string
    no_resi?: string
    created_at?: string
    created_by?: string
  }
}

export function PhotoModal({ isOpen, onClose, photoUrl, metadata }: PhotoModalProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Reset states when modal opens
      setImageError(false)
      setImageLoading(true)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Photo */}
        <div
          className="flex items-center justify-center min-h-[60vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                <p className="text-white text-sm">Loading photo...</p>
              </div>
            </div>
          )}

          {imageError ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-white text-xl font-semibold mb-2">Failed to load image</h3>
              <p className="text-gray-400 mb-4">The photo could not be loaded. It might be deleted or the URL is invalid.</p>
              <p className="text-gray-500 text-sm break-all">{photoUrl}</p>
            </div>
          ) : (
            <img
              src={photoUrl}
              alt="Full size photo"
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          )}
        </div>

        {/* Metadata */}
        {metadata && (
          <div
            className="mt-4 bg-white rounded-lg p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {metadata.nama && (
                <div>
                  <span className="font-semibold text-gray-700">Nama:</span>
                  <p className="text-gray-900">{metadata.nama}</p>
                </div>
              )}
              {metadata.no_resi && (
                <div>
                  <span className="font-semibold text-gray-700">No Resi:</span>
                  <p className="text-gray-900">{metadata.no_resi}</p>
                </div>
              )}
              {metadata.created_at && (
                <div>
                  <span className="font-semibold text-gray-700">Tanggal:</span>
                  <p className="text-gray-900">
                    {new Date(metadata.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
              {metadata.created_by && (
                <div>
                  <span className="font-semibold text-gray-700">Dibuat oleh:</span>
                  <p className="text-gray-900">{metadata.created_by}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
