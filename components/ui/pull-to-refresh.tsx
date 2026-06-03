'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
  disabled?: boolean
}

const THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({
  onRefresh,
  children,
  threshold = THRESHOLD,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || refreshing) return
      // Only activate when scrolled to top
      if (containerRef.current && containerRef.current.scrollTop > 0) return
      startYRef.current = e.touches[0].clientY
    },
    [disabled, refreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || refreshing || startYRef.current === null) return
      if (containerRef.current && containerRef.current.scrollTop > 0) {
        startYRef.current = null
        setPullDistance(0)
        return
      }

      const diff = e.touches[0].clientY - startYRef.current
      if (diff > 0) {
        // Dampen the pull — diminishing returns past threshold
        const dampened = Math.min(diff * 0.5, MAX_PULL)
        setPullDistance(dampened)
      }
    },
    [disabled, refreshing]
  )

  const handleTouchEnd = useCallback(async () => {
    if (disabled || refreshing || startYRef.current === null) return

    if (pullDistance >= threshold) {
      setRefreshing(true)
      setPullDistance(40) // Hold at refresh position
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }

    startYRef.current = null
  }, [disabled, refreshing, pullDistance, threshold, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const shouldShow = pullDistance > 10 || refreshing

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: shouldShow ? Math.max(pullDistance, 40) : 0 }}
      >
        <div
          className="flex items-center gap-2 text-gray-400 transition-transform duration-200"
          style={{
            transform: refreshing ? 'none' : `rotate(${progress * 360}deg)`,
            opacity: progress,
          }}
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
          />
          <span className="text-xs font-medium">
            {refreshing
              ? 'Memperbarui...'
              : pullDistance >= threshold
                ? 'Lepas untuk refresh'
                : 'Tarik ke bawah'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: shouldShow && !refreshing ? `translateY(${pullDistance * 0.1}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
