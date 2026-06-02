'use client'

import { useEffect, useState, useRef } from 'react'
import { getCurrentLocation, formatCoordinates, type GPSError } from '@/lib/utils/gps'
import type { LocationInfo } from '@/lib/types/entry'
import { MapPin, AlertTriangle, Globe, RefreshCw, Check, Loader2 } from 'lucide-react'

interface Props {
  onLocationFetched: (location: LocationInfo) => void
}

export function LocationDisplay({ onLocationFetched }: Props) {
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  // Prevent React Strict Mode double-fetch in development
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Prevent double-fetch from React Strict Mode
    if (hasFetchedRef.current) {
      return
    }
    hasFetchedRef.current = true

    // Check if user previously denied permission
    const denied = localStorage.getItem('gps-permission-denied')
    if (denied === 'true') {
      setPermissionDenied(true)
      setLoading(false)
    } else {
      fetchLocation()
    }
  }, [])

  const fetchLocation = async () => {
    // Allow refetch when explicitly called (e.g., "Coba Lagi" button)
    hasFetchedRef.current = true

    setLoading(true)
    setError(null)
    setPermissionDenied(false)

    try {
      const loc = await getCurrentLocation()
      setLocation(loc)
      onLocationFetched(loc)
      // Clear permission denied flag on success
      localStorage.removeItem('gps-permission-denied')
    } catch (err: any) {
      console.error('Location error:', err)

      // Use enhanced error message if available
      const errorMessage = (err as GPSError).userMessage || err.message || 'Gagal mendapatkan lokasi'
      setError(errorMessage)

      // If permission denied, remember it
      if (err.code === 1) {
        setPermissionDenied(true)
        localStorage.setItem('gps-permission-denied', 'true')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <span className="text-blue-700">Mengambil lokasi GPS...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-red-700 flex-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </span>
            <button
              onClick={fetchLocation}
              className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
          {permissionDenied && (
            <div className="p-2 bg-red-100 rounded text-xs text-red-600">
              <p>Izin lokasi ditolak. Aktifkan di pengaturan browser:</p>
              <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                <li>Klik ikon 🔒/⚠️ di address bar</li>
                <li>Pilih "Izinkan" untuk Lokasi</li>
                <li>Klik "Coba Lagi" di atas</li>
              </ol>
            </div>
          )}
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
            onClick={fetchLocation}
            className="text-green-700 text-xs hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh GPS
          </button>
        </div>
      </div>
    </div>
  )
}
