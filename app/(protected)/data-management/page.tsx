'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EntriesTable } from '@/components/tables/entries-table'
import { exportToExcel, exportToCSV, generateExportFilename } from '@/lib/utils/export'
import type { Entry } from '@/lib/types/entry'
import type { ExportEntry } from '@/lib/utils/export'
import {
  Database, FileText, Filter, Download, CheckCircle, XCircle, Trash2,
  RotateCcw, Search, Calendar, Loader2, Sheet, FileSpreadsheet
} from 'lucide-react'

export default function DataManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    // Check auth and admin role
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Admin only check
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }

    fetchEntries()
  }, [router])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [entries, searchQuery, statusFilter, dateFrom, dateTo])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      // Build query params
      const params = new URLSearchParams()
      params.append('limit', '10000') // Get all entries for filtering

      const response = await fetch(`/api/entries?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setEntries(data.data || [])
      } else {
        console.error('Failed to fetch entries:', data.message)
      }
    } catch (error) {
      console.error('Fetch error:', error)
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

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setEntries(entries.filter((e) => e.id !== id))
        alert('Entry berhasil dihapus!')
      } else {
        alert(`Gagal menghapus entry: ${data.message}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Terjadi kesalahan saat menghapus entry')
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const exportData: ExportEntry[] = filteredEntries.map((entry) => ({
        id: entry.id,
        no_resi: entry.no_resi,
        nama: entry.nama,
        berat_resi: entry.berat_resi,
        berat_aktual: entry.berat_aktual,
        selisih: entry.selisih,
        status: entry.status || 'pending',
        foto_url_1: entry.foto_url_1 || undefined,
        foto_url_2: entry.foto_url_2 || undefined,
        catatan: entry.catatan || undefined,
        created_by: entry.created_by || 'Unknown',
        created_at: entry.created_at || new Date().toISOString(),
      }))

      await exportToExcel(exportData, generateExportFilename('entries', 'xlsx'))
      alert('Data berhasil diexport ke Excel!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data ke Excel')
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const exportData: ExportEntry[] = filteredEntries.map((entry) => ({
        id: entry.id,
        no_resi: entry.no_resi,
        nama: entry.nama,
        berat_resi: entry.berat_resi,
        berat_aktual: entry.berat_aktual,
        selisih: entry.selisih,
        status: entry.status || 'pending',
        foto_url_1: entry.foto_url_1 || undefined,
        foto_url_2: entry.foto_url_2 || undefined,
        catatan: entry.catatan || undefined,
        created_by: entry.created_by || 'Unknown',
        created_at: entry.created_at || new Date().toISOString(),
      }))

      await exportToCSV(exportData, generateExportFilename('entries', 'csv'))
      alert('Data berhasil diexport ke CSV!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data ke CSV')
    } finally {
      setExporting(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const handleBulkUpdate = async (status: 'approved' | 'rejected' | 'pending') => {
    if (selectedEntries.size === 0) {
      alert('Pilih minimal 1 entry untuk bulk update')
      return
    }

    if (!confirm(`Yakin ingin mengubah ${selectedEntries.size} entries menjadi ${status}?`)) {
      return
    }

    try {
      setBulkActionLoading(true)
      const token = localStorage.getItem('accessToken')

      const response = await fetch('/api/entries/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(selectedEntries),
          status
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Berhasil update ${selectedEntries.size} entries!`)
        setSelectedEntries(new Set())
        fetchEntries() // Refresh data
      } else {
        alert(`Gagal update entries: ${data.message}`)
      }
    } catch (error) {
      console.error('Bulk update error:', error)
      alert('Terjadi kesalahan saat bulk update')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEntries.size === 0) {
      alert('Pilih minimal 1 entry untuk bulk delete')
      return
    }

    if (!confirm(`PERINGATAN: Yakin ingin menghapus ${selectedEntries.size} entries? Tindakan ini tidak dapat dibatalkan!`)) {
      return
    }

    try {
      setBulkActionLoading(true)
      const token = localStorage.getItem('accessToken')

      const response = await fetch('/api/entries/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(selectedEntries)
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Berhasil menghapus ${selectedEntries.size} entries!`)
        setSelectedEntries(new Set())
        fetchEntries() // Refresh data
      } else {
        alert(`Gagal menghapus entries: ${data.message}`)
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Terjadi kesalahan saat bulk delete')
    } finally {
      setBulkActionLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-1">Access Denied</h1>
          <p className="text-sm text-gray-500">Halaman ini khusus untuk admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            Data Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola dan export data entry</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Total Entries</p>
                <p className="text-xl font-bold text-gray-900">{entries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Filtered</p>
                <p className="text-xl font-bold text-gray-900">{filteredEntries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              Filter
            </h2>
          </div>

          <div className="p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau no resi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  Dari
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  Sampai
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="w-full py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEntries.size > 0 && (
          <div className="bg-white rounded-2xl border border-primary-200 shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-primary-50 bg-primary-50/50">
              <h2 className="text-sm font-semibold text-primary-900">
                Bulk Actions ({selectedEntries.size} dipilih)
              </h2>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleBulkUpdate('approved')}
                disabled={bulkActionLoading}
                className="py-2.5 rounded-xl text-xs font-medium text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                disabled={bulkActionLoading}
                className="py-2.5 rounded-xl text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Reject
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="py-2.5 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Hapus
              </button>
              <button
                onClick={() => setSelectedEntries(new Set())}
                disabled={bulkActionLoading}
                className="py-2.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-gray-400" />
              Export Data
            </h2>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting || filteredEntries.length === 0}
              className="py-2.5 rounded-xl text-xs font-medium text-white bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sheet className="w-3.5 h-3.5" />}
              Excel
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exporting || filteredEntries.length === 0}
              className="py-2.5 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              CSV
            </button>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Data Entries
            </h2>
          </div>

          <div className="overflow-x-auto">
            <EntriesTable
              entries={filteredEntries}
              loading={loading}
              onDelete={handleDelete}
              isAdmin={true}
              selectedEntries={selectedEntries}
              onSelectionChange={setSelectedEntries}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
