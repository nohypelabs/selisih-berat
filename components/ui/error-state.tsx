'use client'

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  variant?: 'default' | 'offline'
  className?: string
}

export function ErrorState({
  message = 'Terjadi kesalahan. Coba lagi.',
  onRetry,
  variant = 'default',
  className = '',
}: ErrorStateProps) {
  const Icon = variant === 'offline' ? WifiOff : AlertCircle

  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm text-gray-600 text-center mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      )}
    </div>
  )
}
