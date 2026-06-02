'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatNumber, getEarningsColor } from '@/lib/utils/earnings'
import { DollarSign, TrendingUp } from 'lucide-react'

interface EarningsCardProps {
  username: string
  showBreakdown?: boolean
  className?: string
}

interface EarningsData {
  total_entries: number
  days_with_entries: number
  rate_per_entry: number
  daily_bonus: number
  entries_earnings: number
  bonus_earnings: number
  total_earnings: number
}

type Period = '1d' | '7d' | '30d' | 'all'

const periodOptions: { key: Period; label: string }[] = [
  { key: '1d', label: '1D' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'all', label: 'All' },
]

export function EarningsCard({ username, showBreakdown = false, className = '' }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('1d')

  useEffect(() => {
    fetchEarnings()
  }, [username, period])

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/earnings/${username}?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch earnings')
        setLoading(false)
        return
      }

      setEarnings(data.data)
    } catch (err: any) {
      console.error('Error fetching earnings:', err)
      setError(err.message || 'Failed to fetch earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${className}`}>
        <div className="text-red-500 text-xs">{error}</div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${className}`}>
        <div className="text-gray-400 text-xs">No earnings data</div>
      </div>
    )
  }

  const earningsColor = getEarningsColor(earnings.total_earnings)

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header + Period Tabs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-800">Total Earnings</h3>
          </div>
          <div className="flex bg-white/60 rounded-lg p-0.5">
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                  period === opt.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className={`text-2xl font-bold ${earningsColor}`}>
          {formatRupiah(earnings.total_earnings)}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatNumber(earnings.total_entries)} entries • {earnings.days_with_entries} hari
        </p>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="px-4 pb-3 pt-1 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Entries ({formatNumber(earnings.total_entries)} × {formatRupiah(earnings.rate_per_entry)})</span>
            <span className="font-medium text-gray-700">{formatRupiah(earnings.entries_earnings)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Daily Bonus ({earnings.days_with_entries} × {formatRupiah(earnings.daily_bonus)})</span>
            <span className="font-medium text-gray-700">{formatRupiah(earnings.bonus_earnings)}</span>
          </div>
        </div>
      )}

      {/* Daily Average */}
      {earnings.days_with_entries > 0 && (
        <div className="mx-4 mb-3 p-2.5 bg-white/80 rounded-xl">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-500">Daily Average</span>
          </div>
          <div className="text-base font-bold text-gray-800 mt-0.5">
            {formatRupiah(Math.round(earnings.total_earnings / earnings.days_with_entries))}
          </div>
        </div>
      )}
    </div>
  )
}
