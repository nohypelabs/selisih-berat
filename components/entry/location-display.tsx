'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getCurrentLocation, formatCoordinates, type GPSError } from '@/lib/utils/gps'
import type { LocationInfo } from '@/lib/types/entry'
import { MapPin, AlertTriangle, Globe, RefreshCw, Check, Loader2, ShieldAlert } from 'lucide-react'

interface Props {
  onLocationFetched: (location: LocationInfo) => void
}

const MAX_AUTO_RETRY = 2
const RETRY_DELAY_MS = 1500

export function LocationDisplay({ onLocationFetched }: Props) {
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPermissionDenied, setIsPermissionDenied] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Prevent React Strict Mode double-fetch in development
  const hasFetchedRef = useRef(false)

  const fetchLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsPermissionDenied(false)

    try {
      const loc = await getCurrentLocation()
      setLocation(loc)
      onLocationFetched(loc)
      setRetryCount(0)
    } catch (err: any) {
      console.error('Location error:', err)

      const gpsError = err as GPSError
      const errorMessage = gpsError.userMessage || err.message || 'Gagal mendapatkan lokasi'
      setError(errorMessage)

      // If permission denied, auto-retry
      if (gpsError.code === 1) {
        setIsPermissionDenied(true)

        if (retryCount < MAX_AUTO_RETRY) {
          // Auto-retry after delay to re-trigger permission prompt
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            fetchLocation()
          }, RETRY_DELAY_MS)
          return
        }
      }
    } finally {
      setLoading(false)
    }
  }, [onLocationFetched, retryCount])

  useEffect(() => {
    if (hasFetchedRef.current) {
      return
    }
    hasFetchedRef.current = true
    fetchLocation()
  }, [])

  const handleRetry = () => {
    setRetryCount(0)
    hasFetchedRef.current = false
    fetchLocation()
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <div>
            <span className="text-blue-700 font-medium">
              {retryCount > 0
                ? `Minta izin lokasi lagi... (${retryCount}/${MAX_AUTO_RETRY})`
                : 'Mengambil lokasi GPS...'}
            </span>
            {retryCount > 0 && (
              <p className="text-xs text-blue-500 mt-0.5">
                Mohon izinkan akses lokasi di popup browser
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{error}</p>

              {isPermissionDenied && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-600 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Izin lokasi ditolak oleh browser
                  </p>
                  <p>Cara mengaktifkan:</p>
                  <ol className="list-decimal ml-4 space-y-0.5">
                    <li>Klik ikon 🔒 atau ⚠️ di address bar (sebelah URL)</li>
                    <li>Pilih "Izinkan" untuk Lokasi / Location</li>
                    <li>Atau masuk Settings → Privacy → Site Settings → Location</li>
                    <li>Refresh halaman ini setelah mengubah izin</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi / Minta Izin Ulang
          </button>
        </div>
      </div>
    )
  }

  if (!location) {
    return null
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <span className="text-green-700 font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Lokasi GPS:
          </span>
          <div className="flex-1">
            <p className="text-green-800 font-mono text-sm">
              {formatCoordinates(location.latitude, location.longitude)}
            </p>
            <p className="text-green-600 text-xs mt-1">
              Akurasi: ±{Math.round(location.accuracy)}m
            </p>
          </div>
        </div>

        {location.address && (
          <div className="mt-2 pt-2 border-t border-green-300">
            <p className="text-green-700 text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> {location.address}
            </p>
          </div>
        )}

        {location.city && (
          <div className="text-green-600 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location.city}, {location.country}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-green-300 flex items-center justify-between">
          <span className="text-green-600 text-xs flex items-center gap-1">
            <Check className="w-3 h-3" /> Lokasi GPS berhasil
          </span>
          <button
            onClick={handleRetry}
            className="text-green-700 text-xs hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh GPS
          </button>
        </div>
      </div>
    </div>
  )
}
