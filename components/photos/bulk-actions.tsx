'use client'

import { CheckSquare, XSquare, Download, Trash2, Loader2 } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onUnselectAll: () => void
  onDownloadZip: () => void
  onDeleteSelected: () => void
  isProcessing?: boolean
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onUnselectAll,
  onDownloadZip,
  onDeleteSelected,
  isProcessing = false,
}: BulkActionsProps) {
  // Only show when photos exist
  if (totalCount === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Select toggle + count */}
        <div className="flex items-center gap-2">
          <button
            onClick={selectedCount < totalCount ? onSelectAll : onUnselectAll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {selectedCount < totalCount ? (
              <>
                <CheckSquare className="w-3.5 h-3.5" />
                Pilih Semua
              </>
            ) : (
              <>
                <XSquare className="w-3.5 h-3.5" />
                Batal
              </>
            )}
          </button>
          <span className="text-xs text-gray-400">
            {selectedCount > 0 ? (
              <><span className="font-semibold text-primary-600">{selectedCount}</span>/{totalCount}</>
            ) : (
              <>{totalCount} foto</>
            )}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDownloadZip}
            disabled={selectedCount === 0 || isProcessing}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            ZIP {selectedCount > 0 && `(${selectedCount})`}
          </button>
          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || isProcessing}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            Hapus {selectedCount > 0 && `(${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  )
}
