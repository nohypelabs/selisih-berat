'use client'

import { useEffect, useRef, useState } from 'react'
import { initBarcodeScanner, stopBarcodeScanner, validateJNTBarcode } from '@/lib/utils/barcode'
import { Camera, Square } from 'lucide-react'

interface Props {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export function BarcodeScanner({ onScan, onError }: Props) {
  const videoRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastScannedRef = useRef<string | null>(null) // Use ref for synchronous updates
  const isProcessingRef = useRef<boolean>(false) // Prevent concurrent processing

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isScanning) {
        stopBarcodeScanner()
      }
    }
  }, [isScanning])

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      setIsScanning(true)

      await initBarcodeScanner(
        videoRef.current,
        (code) => {
          // Prevent concurrent processing (race condition fix)
          if (isProcessingRef.current) return

          // Prevent duplicate scans (synchronous check with ref)
          if (code === lastScannedRef.current) return

          // Mark as processing
          isProcessingRef.current = true
          lastScannedRef.current = code

          // Validate JNT barcode
          if (validateJNTBarcode(code)) {
            onScan(code)
            stopScanning()
          } else {
            setError('Format barcode tidak valid untuk JNT')
            if (onError) onError('Format barcode tidak valid')
            // Reset processing flag on error so user can try again
            isProcessingRef.current = false
          }
        },
        (err) => {
          setError('Error scanning: ' + err.message)
          if (onError) onError(err.message)
        }
      )
    } catch (err: any) {
      setError(err.message || 'Gagal memulai scanner')
      if (onError) onError(err.message)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    stopBarcodeScanner()
    setIsScanning(false)
    lastScannedRef.current = null
    isProcessingRef.current = false
  }

  return (
    <div className="barcode-scanner-container">
      <div
        ref={videoRef}
        className={`relative w-full h-64 bg-black rounded-lg overflow-hidden ${
          isScanning ? 'border-4 border-green-500' : 'border-2 border-gray-300'
        }`}
      >
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800 bg-opacity-75">
            <div className="text-center">
              <p className="mb-4">Kamera akan aktif saat scanning</p>
              <button
                onClick={startScanning}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Mulai Scan Barcode
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="barcode-scanner-overlay">
            <div className="barcode-scanner-line" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isScanning && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={stopScanning}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            Stop Scanning
          </button>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-600">
        <p>• Arahkan kamera ke barcode pada paket</p>
        <p>• Pastikan barcode dalam fokus yang jelas</p>
        <p>• Scanner akan otomatis mendeteksi barcode</p>
      </div>
    </div>
  )
}
