'use client'

import { useEffect, useRef, useState } from 'react'
import Quagga from '@ericblade/quagga2'
import { validateJNTBarcode } from '@/lib/utils/barcode'
import { X, AlertTriangle, ScanBarcode, Zap, Camera } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (code: string) => void
}

export function ScannerModal({ isOpen, onClose, onScanSuccess }: Props) {
  const videoRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const lastDetectedRef = useRef<string>('')
  const detectionBufferRef = useRef<string[]>([])
  const isProcessingRef = useRef<boolean>(false)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning()
    }
    return () => {
      stopScanning()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const startScanning = () => {
    if (!videoRef.current) return

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        },
        decoder: {
          readers: [
            'code_128_reader',
            'ean_reader',
            'ean_8_reader',
            'code_39_reader',
            'upc_reader',
            'codabar_reader',
          ],
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err)
          setError('Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.')
          return
        }
        Quagga.start()
        setIsScanning(true)
        setError('')
      }
    )

    Quagga.onDetected((result) => {
      const code = result.codeResult.code
      if (!code) return
      if (isProcessingRef.current) return
      if (lastDetectedRef.current === code) return

      detectionBufferRef.current.push(code)
      if (detectionBufferRef.current.length > 10) {
        detectionBufferRef.current.shift()
      }

      const occurrences = detectionBufferRef.current.filter((c) => c === code).length

      if (occurrences >= 3) {
        isProcessingRef.current = true
        lastDetectedRef.current = code

        if ('vibrate' in navigator) {
          navigator.vibrate(200)
        }

        stopScanning()
        onScanSuccess(code)
      }
    })
  }

  const stopScanning = () => {
    if (isScanning) {
      try {
        Quagga.stop()
        Quagga.offDetected()
        Quagga.offProcessed()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      setIsScanning(false)
      detectionBufferRef.current = []
      lastDetectedRef.current = ''
      isProcessingRef.current = false
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 flex items-center justify-center">
            <ScanBarcode className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Scan Barcode</h3>
            <p className="text-[10px] text-gray-400">Arahkan kamera ke barcode resi</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-95"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-white font-medium mb-1">Kamera Tidak Tersedia</p>
              <p className="text-xs text-gray-400 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-5 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Video Stream */}
            <div ref={videoRef} className="w-full h-full" />

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Dark vignette */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Scan zone — center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-[4/3]">
                  {/* Clear window in center */}
                  <div className="w-full h-full rounded-xl border-2 border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />

                  {/* Corner accents */}
                  <div className="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-[3px] border-l-[3px] border-red-500 rounded-tl-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-[3px] border-r-[3px] border-red-500 rounded-tr-xl" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-[3px] border-l-[3px] border-red-500 rounded-bl-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-[3px] border-r-[3px] border-red-500 rounded-br-xl" />

                  {/* Scanning line */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-scan" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom instructions */}
      <div className="px-4 py-4 pb-6 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[11px]">Posisikan di dalam kotak</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[11px]">Deteksi otomatis</span>
          </div>
        </div>
      </div>
    </div>
  )
}
