'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const frameRef = useRef<number>(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const startValue = prevValueRef.current
    const diff = value - startValue

    if (diff === 0) return

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + diff * eased)

      setDisplayValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = value
        startRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      startRef.current = null
    }
  }, [value, duration])

  // Initialize on mount
  useEffect(() => {
    setDisplayValue(value)
    prevValueRef.current = value
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatted = new Intl.NumberFormat('id-ID').format(displayValue)

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
