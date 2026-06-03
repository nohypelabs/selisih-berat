'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatNumber, getEarningsColor } from '@/lib/utils/earnings'
import { authFetch } from '@/lib/utils/api'
import { DollarSign, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  period?: string
}

interface ChartPoint {
  date: string
  earnings: number
  entries: number
}

type Period = '12h' | '1d' | '7d' | '30d' | 'all'

const periodOptions: { key: Period; label: string }[] = [
  { key: '12h', label: '12 Jam' },
  { key: '1d', label: '1D' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'all', label: 'All' },
]

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

const getWIBSessionLabel = (): string => {
  const now = new Date()
  const wibHour = (now.getUTCHours() + 7) % 24
  if (wibHour >= 6 && wibHour < 18) {
    return 'Sesi Pagi (06:00-18:00 WIB)'
  }
  return 'Sesi Malam (18:00-06:00 WIB)'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="font-semibold">{formatRupiah(payload[0].value)}</p>
        <p className="text-gray-400 text-[10px]">{formatDate(payload[0].payload.date)}</p>
      </div>
    )
  }
  return null
}

export function EarningsCard({ username, showBreakdown = false, className = '' }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('12h')

  useEffect(() => {
    fetchEarnings()
  }, [username, period])

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await authFetch(`/api/earnings/${username}?period=${period}`)

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch earnings')
        setLoading(false)
        return
      }

      setEarnings(data.data)
      setChartData(data.chart || [])
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
          <div className="h-2 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
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
        <div className="flex items-center justify-between mb-2">
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
        {period === '12h' && (
          <p className="text-[10px] text-green-600 font-medium mt-0.5">
            {getWIBSessionLabel()}
          </p>
        )}
      </div>

      {/* Chart — only show for 1d+ */}
      {period !== '12h' && period !== '1d' && chartData.length > 1 && (
        <div className="px-2 pb-2">
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {showBreakdown && (
        <div className="px-4 pb-2 space-y-1">
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
