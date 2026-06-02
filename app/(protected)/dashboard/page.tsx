'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EarningsCard } from '@/components/earnings/earnings-card'
import { formatDate, formatNumber } from '@/lib/utils/helpers'
import { Package, Camera, Clock, Scale, RefreshCw, FileText } from 'lucide-react'
import type { EntryStats } from '@/lib/types/entry'
import type { Entry } from '@/lib/types/entry'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<EntryStats | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Get username
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUsername(user.username)
    }

    // initial fetch
    fetchData()

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [router])

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)

      const token = localStorage.getItem('accessToken')

      const statsRes = await fetch('/api/entries/stats')
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      const entriesRes = await fetch('/api/entries?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const entriesData = await entriesRes.json()
      if (entriesData.success) {
        setEntries(entriesData.data || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-xs text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 pb-24">
      <div className="container mx-auto px-3 max-w-4xl">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-[10px] text-gray-400">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ─── Stats Grid ─── */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Total Entries */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">Total Resi</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.totalEntries)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">All time</p>
            </div>

            {/* Total Photos */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">Total Foto</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.totalPhotos)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Terdokumentasi</p>
            </div>

            {/* Today */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">Hari Ini</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(stats.todayEntries)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Entry hari ini</p>
            </div>

            {/* Avg Selisih */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">Avg Selisih</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.avgSelisih} <span className="text-sm font-medium text-gray-400">kg</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">Rata-rata</p>
            </div>
          </div>
        )}

        {/* ─── Earnings ─── */}
        {username && (
          <div className="mb-4">
            <EarningsCard username={username} showBreakdown={true} />
          </div>
        )}

        {/* ─── Recent Entries ─── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">Entry Terbaru</h2>
            <span className="text-[10px] text-gray-400">{entries.length} terakhir</span>
          </div>

          {entries.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Belum ada entry</p>
              <p className="text-[10px] text-gray-400 mt-1">Mulai scan barcode untuk entry pertama</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {entries.map((entry) => (
                <div key={entry.id} className="px-4 py-3 hover:bg-gray-50/50 active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{entry.nama}</p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">{entry.no_resi}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        entry.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        entry.status === 'approved' ? 'bg-green-50 text-green-700' :
                        entry.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span>Resi: <span className="font-medium text-gray-700">{entry.berat_resi}</span></span>
                      <span>Aktual: <span className="font-medium text-gray-700">{entry.berat_aktual}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        Math.abs(entry.selisih) < 0.5 ? 'text-green-600' :
                        Math.abs(entry.selisih) < 1 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {entry.selisih >= 0 ? '+' : ''}{entry.selisih} kg
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
