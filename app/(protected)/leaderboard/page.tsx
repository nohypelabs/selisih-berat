'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { authFetch } from '@/lib/utils/api'
import {
  Trophy, Clock, Crown, Medal, TrendingUp, BarChart3, Info,
  Award, ChevronUp
} from 'lucide-react'

type LeaderboardType = '12h' | 'alltime'

interface LeaderboardEntry {
  rank: number
  username: string
  entries: number
  earnings: number
  level: 'Beginner' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUser: LeaderboardEntry
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<LeaderboardType>('12h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (user) {
      const userData = JSON.parse(user)
      setCurrentUsername(userData.username)
    }

    fetchLeaderboard('12h')
  }, [router])

  const fetchLeaderboard = async (type: LeaderboardType) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(`/api/leaderboard?type=${type}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Gagal memuat leaderboard')
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Gagal memuat data. Periksa koneksi internet.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (type: LeaderboardType) => {
    setActiveTab(type)
    fetchLeaderboard(type)
  }

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'Beginner': return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <ChevronUp className="w-3 h-3" /> }
      case 'Bronze': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Award className="w-3 h-3" /> }
      case 'Silver': return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Award className="w-3 h-3" /> }
      case 'Gold': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Award className="w-3 h-3" /> }
      case 'Diamond': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Award className="w-3 h-3" /> }
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <ChevronUp className="w-3 h-3" /> }
    }
  }

  const getRankConfig = (rank: number) => {
    if (rank === 1) return {
      badge: <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-sm"><Trophy className="w-4 h-4 text-white" /></div>,
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
    }
    if (rank === 2) return {
      badge: <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow-sm"><Medal className="w-4 h-4 text-white" /></div>,
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
    }
    if (rank === 3) return {
      badge: <div className="w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center shadow-sm"><Medal className="w-4 h-4 text-white" /></div>,
      bg: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
    }
    return {
      badge: <span className="text-sm font-bold text-gray-400 w-8 text-center">{rank}</span>,
      bg: 'bg-white border-gray-100',
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`
    }
    if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`
    }
    return `Rp ${amount}`
  }

  const getInitials = (username: string) => username.charAt(0).toUpperCase()

  const getAvatarUrl = (username: string): string | null => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return null
    return `${supabaseUrl}/storage/v1/object/public/avatars/${username}.jpg`
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 pb-24">
        <div className="px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-10 flex-1 bg-gray-200 rounded-xl animate-shimmer" />
            <div className="h-10 flex-1 bg-gray-200 rounded-xl animate-shimmer" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Error / Empty State ───
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 pb-24">
        <div className="px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
          </div>
          {error ? (
            <ErrorState message={error} onRetry={() => fetchLeaderboard(activeTab)} />
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Belum Ada Data</p>
              <p className="text-xs text-gray-400 mt-1">Leaderboard akan muncul setelah ada entry</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 pb-24">
      <div className="px-4 max-w-lg mx-auto">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
          </div>
          {data.currentUser.rank && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full">
              <span className="text-[10px] text-primary-500 font-medium">Rank</span>
              <span className="text-sm font-bold text-primary-700">#{data.currentUser.rank}</span>
            </div>
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleTabChange('12h')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === '12h'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            12 Jam
          </button>
          <button
            onClick={() => handleTabChange('alltime')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'alltime'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Crown className="w-4 h-4" />
            All Time
          </button>
        </div>

        {/* ─── Leaderboard List ─── */}
        {data.leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Belum Ada Entry</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === '12h' ? 'Belum ada entry sesi ini' : 'Belum ada entry'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.leaderboard.map((entry, index) => {
              const rankConfig = getRankConfig(entry.rank)
              const levelConfig = getLevelConfig(entry.level)
              const isCurrentUser = entry.username === currentUsername

              return (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${rankConfig.bg} ${
                    isCurrentUser ? 'ring-2 ring-primary-400 shadow-md' : ''
                  }`}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 60}ms forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    {rankConfig.badge}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {getAvatarUrl(entry.username) ? (
                      <img
                        src={getAvatarUrl(entry.username)!}
                        alt={entry.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm"
                      style={{ display: getAvatarUrl(entry.username) ? 'none' : 'flex' }}
                    >
                      {getInitials(entry.username)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 truncate">{entry.username}</p>
                      {isCurrentUser && (
                        <span className="text-[9px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded">
                          KAMU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${levelConfig.bg} ${levelConfig.text}`}>
                        {levelConfig.icon}
                        {entry.level}
                      </span>
                      <span className="text-[10px] text-gray-400">{entry.entries} entry</span>
                    </div>
                  </div>

                  {/* Earnings — Prominent */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-green-700">{formatCurrency(entry.earnings)}</p>
                    <p className="text-[9px] text-green-500 font-medium">penghasilan</p>
                  </div>
                </div>
              )
            })}

            {/* Current User (if not in top 10) */}
            {data.currentUser.rank > 10 && (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-medium">Posisi Kamu</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border-2 bg-white border-primary-300 ring-2 ring-primary-100 shadow-md">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600 w-8 text-center block">
                      #{data.currentUser.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {getAvatarUrl(data.currentUser.username) ? (
                      <img
                        src={getAvatarUrl(data.currentUser.username)!}
                        alt={data.currentUser.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm"
                      style={{ display: getAvatarUrl(data.currentUser.username) ? 'none' : 'flex' }}
                    >
                      {getInitials(data.currentUser.username)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 truncate">{data.currentUser.username}</p>
                      <span className="text-[9px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded">
                        KAMU
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${getLevelConfig(data.currentUser.level).bg} ${getLevelConfig(data.currentUser.level).text}`}>
                        {getLevelConfig(data.currentUser.level).icon}
                        {data.currentUser.level}
                      </span>
                      <span className="text-[10px] text-gray-400">{data.currentUser.entries} entry</span>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-green-700">{formatCurrency(data.currentUser.earnings)}</p>
                    <p className="text-[9px] text-green-500 font-medium">penghasilan</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Info Card ─── */}
        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-700">Info Leaderboard</h3>
          </div>
          <div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p><strong className="text-gray-700">12 Jam:</strong> Peringkat sesi aktif (06:00-18:00 / 18:00-06:00 WIB)</p>
            </div>
            <div className="flex items-start gap-2">
              <Crown className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p><strong className="text-gray-700">All Time:</strong> Peringkat total entries sepanjang masa</p>
            </div>
            <div className="flex items-start gap-2">
              <Award className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p><strong className="text-gray-700">Level:</strong> Beginner (0-99) → Bronze (100-499) → Silver (500-999) → Gold (1000-4999) → Diamond (5000+)</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
