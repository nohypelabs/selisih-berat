'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { haptics } from '@/lib/utils/haptics'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => string
  removeToast: (id: string) => void
  updateToast: (id: string, message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const MAX_TOASTS = 3
const DEFAULT_DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast = { id, message, type, duration }

    setToasts((prev) => {
      // Enforce max toast queue
      const updated = [...prev, newToast]
      if (updated.length > MAX_TOASTS) {
        // Remove oldest toast
        return updated.slice(-MAX_TOASTS)
      }
      return updated
    })

    // Haptic feedback based on toast type
    if (type === 'success') haptics.success()
    else if (type === 'error') haptics.error()
    else if (type === 'warning') haptics.medium()
    else haptics.light()

    // Auto remove after duration (unless it's a loading toast)
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, message: string, type: ToastType) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, message, type } : toast
      )
    )

    // Auto remove updated toast (if not loading)
    if (type !== 'loading') {
      setTimeout(() => {
        removeToast(id)
      }, DEFAULT_DURATION)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onRemove,
  index,
}: {
  toast: Toast
  onRemove: (id: string) => void
  index: number
}) {
  const [isExiting, setIsExiting] = useState(false)

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // Match animation duration
  }

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    loading: (
      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  }

  const colors = {
    success: 'bg-green-600 text-white border-green-700',
    error: 'bg-red-600 text-white border-red-700',
    warning: 'bg-yellow-500 text-white border-yellow-600',
    info: 'bg-blue-600 text-white border-blue-700',
    loading: 'bg-gray-700 text-white border-gray-800',
  }

  return (
    <div
      className={`
        flex items-start space-x-3 px-4 py-3 rounded-lg shadow-xl border-2
        min-w-[320px] max-w-md
        transform transition-all duration-300 ease-out
        ${colors[toast.type]}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      {/* Message */}
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Close Button (only if not loading) */}
      {toast.type !== 'loading' && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
