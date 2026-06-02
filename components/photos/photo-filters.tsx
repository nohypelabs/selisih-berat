'use client'

import { useState, useEffect } from 'react'
import { Search, RotateCcw, X } from 'lucide-react'

export interface PhotoFilters {
  startDate: string
  endDate: string
  search: string
}

interface PhotoFiltersProps {
  onFilterChange: (filters: PhotoFilters) => void
  onReset: () => void
}

export function PhotoFiltersComponent({ onFilterChange, onReset }: PhotoFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Trigger filter change when debounced search changes
  useEffect(() => {
    if (debouncedSearch.length === 0 || debouncedSearch.length >= 3) {
      handleApply()
    }
  }, [debouncedSearch])

  const handleApply = () => {
    onFilterChange({
      startDate,
      endDate,
      search: debouncedSearch,
    })
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setSearch('')
    setDebouncedSearch('')
    onReset()
  }

  const hasActiveFilters = startDate || endDate || debouncedSearch

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      {/* Row 1: Search */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama, no resi, filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Row 2: Date range + Reset */}
      <div className="flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 px-2 py-2 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          placeholder="Dari"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 px-2 py-2 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          placeholder="Sampai"
        />
        <button
          onClick={handleReset}
          className="px-2.5 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Reset Filter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
          {startDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700">
              Dari: {new Date(startDate).toLocaleDateString('id-ID')}
              <button onClick={() => setStartDate('')} className="hover:text-primary-900">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700">
              Sampai: {new Date(endDate).toLocaleDateString('id-ID')}
              <button onClick={() => setEndDate('')} className="hover:text-primary-900">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700">
              &quot;{debouncedSearch}&quot;
              <button onClick={() => { setSearch(''); setDebouncedSearch('') }} className="hover:text-primary-900">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
