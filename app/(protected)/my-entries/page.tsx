'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EntriesTable } from '@/components/tables/entries-table'
import { ErrorState } from '@/components/ui/error-state'
import type { Entry } from '@/lib/types/entry'
import {
  FileText, Filter, Search, Calendar, RotateCcw, Info
} from 'lucide-react'

export default function MyEntriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    fetchMyEntries()
  }, [router])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [entries, searchQuery, statusFilter, dateFrom, dateTo])

  const fetchMyEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')

      if (!userData) return

      const user = JSON.parse(userData)

      // Fetch only current user's entries
      const params = new URLSearchParams()
      params.append('limit', '10000')
      params.append('created_by', user.username)

      const response = await fetch(`/api/entries?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setEntries(data.data || [])
      } else {
        setError(data.message || 'Gagal memuat data')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Gagal memuat data. Periksa koneksi internet.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...entries]

    // Search filter (nama or no_resi)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.nama.toLowerCase().includes(query) ||
          entry.no_resi.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((entry) => entry.status === statusFilter)
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((entry) => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate >= fromDate
      })
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((entry) => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate <= toDate
      })
    }

    setFilteredEntries(filtered)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            My Entries
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Riwayat entry yang sudah dibuat</p>
        </div>

        {/* Compact Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-3">
          {/* Row 1: Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau no resi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Row 2: Status + Date + Reset */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-2 py-2 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder="Dari"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-2 py-2 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder="Sampai"
            />
            <button
              onClick={resetFilters}
              className="px-2.5 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 3: Stats inline */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-700">{entries.length}</span> total
              </span>
              <span className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-700">{filteredEntries.length}</span> filter
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-relaxed">
            Klik row untuk melihat detail entry. Hubungi admin jika perlu mengubah atau menghapus entry.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-3">
            <ErrorState message={error} onRetry={fetchMyEntries} />
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Riwayat Entry
            </h2>
          </div>

          <div className="overflow-x-auto">
            <EntriesTable
              entries={filteredEntries}
              loading={loading}
              isAdmin={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
