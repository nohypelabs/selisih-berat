'use client'

import { memo, useState } from 'react'

export interface Photo {
  id: string
  url: string
  thumbnail_url: string
  nama?: string
  no_resi?: string
  created_at?: string
  created_by?: string
}

interface PhotoGridProps {
  photos: Photo[]
  selectedPhotos: Set<string>
  onPhotoClick: (photo: Photo) => void
  onPhotoSelect: (photoId: string, selected: boolean) => void
}

const PhotoCard = memo(function PhotoCard({
  photo,
  isSelected,
  onPhotoClick,
  onPhotoSelect,
}: {
  photo: Photo
  isSelected: boolean
  onPhotoClick: (photo: Photo) => void
  onPhotoSelect: (photoId: string, selected: boolean) => void
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  return (
    <div
      className={`relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
        isSelected ? 'ring-4 ring-primary-500' : ''
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onPhotoSelect(photo.id, e.target.checked)
          }}
          className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Photo */}
      <div
        className="aspect-square cursor-pointer bg-gray-100 relative"
        onClick={() => !imageError && onPhotoClick(photo)}
      >
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        ) : (
          <img
            src={photo.thumbnail_url || photo.url}
            alt={photo.nama || 'Photo'}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {photo.nama && (
          <p className="text-sm font-semibold truncate" title={photo.nama}>
            {photo.nama}
          </p>
        )}
        {photo.no_resi && (
          <p className="text-xs truncate" title={photo.no_resi}>
            {photo.no_resi}
          </p>
        )}
        {photo.created_at && (
          <p className="text-xs text-gray-300">
            {new Date(photo.created_at).toLocaleDateString('id-ID')}
          </p>
        )}
      </div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
})

export function PhotoGrid({
  photos,
  selectedPhotos,
  onPhotoClick,
  onPhotoSelect,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Photos Found</h3>
        <p className="text-gray-500">Try adjusting your filters or upload some photos.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedPhotos.has(photo.id)}
          onPhotoClick={onPhotoClick}
          onPhotoSelect={onPhotoSelect}
        />
      ))}
    </div>
  )
}
