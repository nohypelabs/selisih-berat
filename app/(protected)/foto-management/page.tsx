'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoGrid, Photo } from '@/components/photos/photo-grid'
import { PhotoModal } from '@/components/photos/photo-modal'
import { PhotoFiltersComponent, PhotoFilters } from '@/components/photos/photo-filters'
import { BulkActions } from '@/components/photos/bulk-actions'
import { downloadPhotosAsZipBatched, formatBytes } from '@/lib/utils/zip'
import { useToast } from '@/components/ui/toast'
import {
  Camera, Image as ImageIcon, CheckSquare, Upload, HardDrive,
  ChevronLeft, ChevronRight, XCircle, Loader2, Download
} from 'lucide-react'

interface Stats {
  totalPhotos: number
  uploadedToday: number
  estimatedSize: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function FotoManagementPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<Stats>({
    totalPhotos: 0,
    uploadedToday: 0,
    estimatedSize: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 500,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<PhotoFilters>({
    startDate: '',
    endDate: '',
    search: '',
  })
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{
    show: boolean
    current: number
    total: number
    percentage: number
    message: string
  }>({
    show: false,
    current: 0,
    total: 0,
    percentage: 0,
    message: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    // Check if user is admin
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== 'admin') {
        showToast('Access denied: Admin only', 'error')
        router.push('/dashboard')
        return
      }
    }

    fetchPhotos()
  }, [router, pagination.page, pagination.limit])

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/photos?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setPhotos(result.data.photos)
        setPagination(result.data.pagination)
        setStats({
          totalPhotos: result.data.stats.totalPhotos,
          uploadedToday: result.data.stats.uploadedToday,
          estimatedSize: result.data.stats.totalPhotos * 500000, // Estimate 500KB per photo
        })
      } else {
        showToast(result.message || 'Failed to fetch photos', 'error')
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      showToast('Failed to fetch photos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: PhotoFilters) => {
    setFilters(newFilters)
    setPagination({ ...pagination, page: 1 })
    // Trigger fetch in useEffect
    setTimeout(() => fetchPhotos(), 100)
  }

  const handleFilterReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      search: '',
    })
    setPagination({ ...pagination, page: 1 })
    setTimeout(() => fetchPhotos(), 100)
  }

  const handlePhotoSelect = (photoId: string, selected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    if (selected) {
      newSelected.add(photoId)
    } else {
      newSelected.delete(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAll = () => {
    const allIds = new Set(photos.map((p) => p.id))
    setSelectedPhotos(allIds)
  }

  const handleUnselectAll = () => {
    setSelectedPhotos(new Set())
  }

  const handleDownloadZip = async () => {
    const selectedPhotosList = photos.filter((p) => selectedPhotos.has(p.id))

    if (selectedPhotosList.length === 0) {
      showToast('No photos selected', 'error')
      return
    }

    setIsProcessing(true)
    setDownloadProgress({
      show: true,
      current: 0,
      total: selectedPhotosList.length,
      percentage: 0,
      message: 'Starting download...',
    })

    try {
      const photoUrls = selectedPhotosList.map((p) => p.url)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `photos_${timestamp}.zip`

      await downloadPhotosAsZipBatched(photoUrls, filename, 100, (progress) => {
        setDownloadProgress({
          show: true,
          current: progress.current,
          total: progress.total,
          percentage: progress.percentage,
          message: progress.currentFile,
        })
      })

      showToast('Photos downloaded successfully!', 'success')
      setDownloadProgress({ show: false, current: 0, total: 0, percentage: 0, message: '' })
    } catch (error: any) {
      console.error('Error downloading photos:', error)
      showToast(`Failed to download photos: ${error.message}`, 'error')
      setDownloadProgress({ show: false, current: 0, total: 0, percentage: 0, message: '' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSelected = async () => {
    const selectedCount = selectedPhotos.size

    if (selectedCount === 0) {
      showToast('No photos selected', 'error')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCount} photo(s)? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsProcessing(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/photos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast(result.message || 'Photos deleted successfully!', 'success')
        setSelectedPhotos(new Set())
        fetchPhotos()
      } else {
        showToast(result.message || 'Failed to delete photos', 'error')
      }
    } catch (error: any) {
      console.error('Error deleting photos:', error)
      showToast(`Failed to delete photos: ${error.message}`, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination({ ...pagination, page: newPage })
  }

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-gray-600" />
            Foto Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola foto yang sudah diupload</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Total Foto</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalPhotos.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Dipilih</p>
                <p className="text-xl font-bold text-primary-600">{selectedPhotos.size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Upload Hari Ini</p>
                <p className="text-xl font-bold text-green-600">{stats.uploadedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <HardDrive className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Estimasi Size</p>
                <p className="text-xl font-bold text-amber-600">{formatBytes(stats.estimatedSize)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <PhotoFiltersComponent onFilterChange={handleFilterChange} onReset={handleFilterReset} />
        </div>

        {/* Bulk Actions */}
        <div className="mb-4">
          <BulkActions
            selectedCount={selectedPhotos.size}
            totalCount={photos.length}
            onSelectAll={handleSelectAll}
            onUnselectAll={handleUnselectAll}
            onDownloadZip={handleDownloadZip}
            onDeleteSelected={handleDeleteSelected}
            isProcessing={isProcessing}
          />
        </div>

        {/* Photo Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="p-3">
            <PhotoGrid
              photos={photos}
              selectedPhotos={selectedPhotos}
              onPhotoClick={(photo) => setSelectedPhoto(photo)}
              onPhotoSelect={handlePhotoSelect}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto.url}
          metadata={{
            nama: selectedPhoto.nama,
            no_resi: selectedPhoto.no_resi,
            created_at: selectedPhoto.created_at,
            created_by: selectedPhoto.created_by,
          }}
        />
      )}

      {/* Download Progress Modal */}
      {downloadProgress.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Downloading...</h3>
                  <p className="text-xs text-gray-500">
                    {downloadProgress.current} / {downloadProgress.total} foto
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium">{downloadProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percentage}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 truncate">{downloadProgress.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
