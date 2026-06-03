'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EntriesTable } from '@/components/tables/entries-table'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/components/ui/toast'
import { authFetch } from '@/lib/utils/api'
import { exportToExcel, exportToCSV, generateExportFilename } from '@/lib/utils/export'
import type { Entry } from '@/lib/types/entry'
import type { ExportEntry } from '@/lib/utils/export'
import {
  Database, FileText, Filter, Download, CheckCircle, XCircle, Trash2,
  RotateCcw, Search, Calendar, Loader2, Sheet, FileSpreadsheet
} from 'lucide-react'

export default function DataManagementPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    confirmText: string
    onConfirm: () => Promise<void>
  }>({ isOpen: false, title: '', message: '', variant: 'danger', confirmText: 'Konfirmasi', onConfirm: async () => {} })

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
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      params.append('limit', '10000') // Get all entries for filtering

      const response = await authFetch(`/api/entries?${params.toString()}`)

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

  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Entry',
      message: 'Yakin ingin menghapus entry ini? Tindakan tidak dapat dibatalkan.',
      variant: 'danger',
      confirmText: 'Hapus',
      onConfirm: async () => {
        try {
          const response = await authFetch(`/api/entries/${id}`, {
            method: 'DELETE',
          })
          const data = await response.json()
          if (data.success) {
            setEntries(entries.filter((e) => e.id !== id))
            showToast('Entry berhasil dihapus', 'success')
          } else {
            showToast(data.message || 'Gagal menghapus entry', 'error')
          }
        } catch (err) {
          console.error('Delete error:', err)
          showToast('Terjadi kesalahan saat menghapus entry', 'error')
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      },
    })
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
      showToast('Data berhasil diexport ke Excel', 'success')
    } catch (error) {
      console.error('Export error:', error)
      showToast('Gagal export data ke Excel', 'error')
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
      showToast('Data berhasil diexport ke CSV', 'success')
    } catch (error) {
      console.error('Export error:', error)
      showToast('Gagal export data ke CSV', 'error')
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
      showToast('Pilih minimal 1 entry untuk bulk update', 'warning')
      return
    }

    setConfirmModal({
      isOpen: true,
      title: `Update ${selectedEntries.size} Entries`,
      message: `Yakin ingin mengubah ${selectedEntries.size} entries menjadi ${status}?`,
      variant: status === 'rejected' ? 'warning' : 'info',
      confirmText: 'Update',
      onConfirm: async () => {
        try {
          setBulkActionLoading(true)
          const response = await authFetch('/api/entries/bulk-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ids: Array.from(selectedEntries),
              status
            })
          })
          const data = await response.json()
          if (data.success) {
            showToast(`Berhasil update ${selectedEntries.size} entries`, 'success')
            setSelectedEntries(new Set())
            fetchEntries()
          } else {
            showToast(data.message || 'Gagal update entries', 'error')
          }
        } catch (err) {
          console.error('Bulk update error:', err)
          showToast('Terjadi kesalahan saat bulk update', 'error')
        } finally {
          setBulkActionLoading(false)
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleBulkDelete = async () => {
    if (selectedEntries.size === 0) {
      showToast('Pilih minimal 1 entry untuk bulk delete', 'warning')
      return
    }

    setConfirmModal({
      isOpen: true,
      title: `Hapus ${selectedEntries.size} Entries`,
      message: `PERINGATAN: Yakin ingin menghapus ${selectedEntries.size} entries? Tindakan ini tidak dapat dibatalkan!`,
      variant: 'danger',
      confirmText: 'Hapus Semua',
      onConfirm: async () => {
        try {
          setBulkActionLoading(true)
          const response = await authFetch('/api/entries/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ids: Array.from(selectedEntries)
            })
          })
          const data = await response.json()
          if (data.success) {
            showToast(`Berhasil menghapus ${selectedEntries.size} entries`, 'success')
            setSelectedEntries(new Set())
            fetchEntries()
          } else {
            showToast(data.message || 'Gagal menghapus entries', 'error')
          }
        } catch (err) {
          console.error('Bulk delete error:', err)
          showToast('Terjadi kesalahan saat bulk delete', 'error')
        } finally {
          setBulkActionLoading(false)
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      },
    })
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
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            Data Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola dan export data entry</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-3">
            <ErrorState message={error} onRetry={fetchEntries} />
          </div>
        )}

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

          {/* Row 3: Stats + Export inline */}
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
            <div className="flex gap-1.5">
              <button
                onClick={handleExportExcel}
                disabled={exporting || filteredEntries.length === 0}
                className="px-2.5 py-1.5 text-[10px] font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sheet className="w-3 h-3" />}
                Excel
              </button>
              <button
                onClick={handleExportCSV}
                disabled={exporting || filteredEntries.length === 0}
                className="px-2.5 py-1.5 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions — compact inline */}
        {selectedEntries.size > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-primary-700">
              {selectedEntries.size} dipilih
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleBulkUpdate('approved')}
                disabled={bulkActionLoading}
                className="px-2 py-1 text-[10px] font-medium text-white bg-green-600 rounded-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                disabled={bulkActionLoading}
                className="px-2 py-1 text-[10px] font-medium text-white bg-amber-600 rounded-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-2 py-1 text-[10px] font-medium text-white bg-red-600 rounded-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Hapus
              </button>
              <button
                onClick={() => setSelectedEntries(new Set())}
                disabled={bulkActionLoading}
                className="px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-200 rounded-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        loading={bulkActionLoading}
      />
    </div>
  )
}
