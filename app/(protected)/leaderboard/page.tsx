'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { authFetch } from '@/lib/utils/api'

type LeaderboardType = 'daily' | 'alltime'

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
  const [activeTab, setActiveTab] = useState<LeaderboardType>('alltime')
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

    fetchLeaderboard('alltime')
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-gray-100 text-gray-700'
      case 'Bronze':
        return 'bg-orange-100 text-orange-700'
      case 'Silver':
        return 'bg-gray-200 text-gray-700'
      case 'Gold':
        return 'bg-yellow-100 text-yellow-700'
      case 'Diamond':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <span className="text-2xl">🥇</span>
    } else if (rank === 2) {
      return <span className="text-2xl">🥈</span>
    } else if (rank === 3) {
      return <span className="text-2xl">🥉</span>
    } else {
      return <span className="text-base font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBackground = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
    } else {
      return 'bg-white border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-3 pb-16">
        <div className="container mx-auto px-3 max-w-4xl">
          <h1 className="text-lg font-bold text-gray-900 mb-3">🏆 Leaderboard</h1>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-3">
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Leaderboard Skeleton */}
          <div className="card-mobile space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-3 pb-16">
        <div className="container mx-auto px-3 max-w-4xl">
          <h1 className="text-lg font-bold text-gray-900 mb-3">🏆 Leaderboard</h1>
          {error ? (
            <ErrorState message={error} onRetry={() => fetchLeaderboard(activeTab)} />
          ) : (
            <div className="card-mobile text-center py-8">
              <p className="text-4xl mb-3">😔</p>
              <p className="text-base font-semibold text-gray-700">No Data Available</p>
              <p className="text-xs text-gray-500 mt-1">Belum ada data leaderboard</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 pb-16">
      <div className="container mx-auto px-3 max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">🏆 Leaderboard</h1>
          <div className="text-xs text-gray-500">
            Rank: <span className="font-bold text-primary-600">#{data.currentUser.rank}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => handleTabChange('daily')}
            className={`flex-1 text-sm ${
              activeTab === 'daily'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            🌟 Daily
          </Button>
          <Button
            onClick={() => handleTabChange('alltime')}
            className={`flex-1 text-sm ${
              activeTab === 'alltime'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            👑 All Time
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="card-mobile">
          {data.leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-base font-semibold text-gray-700">No Entries Yet</p>
              <p className="text-xs text-gray-500 mt-1">
                {activeTab === 'daily' ? 'Belum ada entries hari ini' : 'Belum ada entries'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-300 ${getRankBackground(
                    entry.rank
                  )} ${
                    entry.username === currentUsername ? 'ring-2 ring-primary-400 shadow-lg' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards',
                  }}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {getRankBadge(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {getInitials(entry.username)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{entry.username}</h3>
                      {entry.username === currentUsername && (
                        <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${getLevelColor(
                        entry.level
                      )}`}
                    >
                      {entry.level}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="font-bold text-xs text-gray-900">{entry.entries}</div>
                    <div className="text-[10px] text-green-600 font-semibold">
                      {formatCurrency(entry.earnings)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Current User (if not in top 10) */}
              {data.currentUser.rank > 10 && (
                <>
                  <div className="text-center py-1">
                    <span className="text-gray-400 text-xs">...</span>
                  </div>
                  <div
                    className="flex items-center gap-2 p-2 rounded-lg border-2 bg-white border-primary-400 ring-2 ring-primary-200 shadow-lg"
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-base font-bold text-gray-500">
                        #{data.currentUser.rank}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getInitials(data.currentUser.username)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-gray-900 truncate">{data.currentUser.username}</h3>
                        <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${getLevelColor(
                          data.currentUser.level
                        )}`}
                      >
                        {data.currentUser.level}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="font-bold text-xs text-gray-900">
                        {data.currentUser.entries}
                      </div>
                      <div className="text-[10px] text-green-600 font-semibold">
                        {formatCurrency(data.currentUser.earnings)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="card-mobile mt-3">
          <h3 className="font-bold text-sm text-gray-900 mb-2">📊 Leaderboard Info</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>
              • <strong>Daily:</strong> Peringkat entries hari ini
            </p>
            <p>
              • <strong>All Time:</strong> Peringkat total entries
            </p>
            <p>
              • <strong>Levels:</strong> Beginner (0-99) → Bronze (100-499) → Silver (500-999) → Gold (1000-4999) → Diamond (5000+)
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
