'use client'

import { useState, useRef, useEffect } from 'react'
import { addWatermarkToImage } from '@/lib/utils/watermark'
import { compressImage, validateImageFile } from '@/lib/utils/image-optimization'
import type { LocationInfo } from '@/lib/types/entry'
import Image from 'next/image'
import { Camera, Image as ImageIcon, FileText, X, CheckCircle, AlertTriangle, Lightbulb, Cloud, Loader2, MapPin } from 'lucide-react'

interface Props {
  onUpload: (urls: { foto_url_1: string; foto_url_2?: string }) => void
  location: LocationInfo | null
  required?: boolean
  noResi: string  // ← ADD: No Resi for auto-renaming photos
}

export function PhotoUpload({ onUpload, location, required = true, noResi }: Props) {
  const [uploading1, setUploading1] = useState(false)
  const [uploading2, setUploading2] = useState(false)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [compressionInfo1, setCompressionInfo1] = useState<string | null>(null)
  const [compressionInfo2, setCompressionInfo2] = useState<string | null>(null)
  const [uploadProgress1, setUploadProgress1] = useState<string>('')
  const [uploadProgress2, setUploadProgress2] = useState<string>('')
  const [filename1, setFilename1] = useState<string | null>(null)
  const [filename2, setFilename2] = useState<string | null>(null)

  const camera1Ref = useRef<HTMLInputElement>(null)
  const camera2Ref = useRef<HTMLInputElement>(null)
  const gallery1Ref = useRef<HTMLInputElement>(null)
  const gallery2Ref = useRef<HTMLInputElement>(null)
  const previousNoResiRef = useRef<string>(noResi)

  // Warn user if No Resi changes after photos uploaded
  useEffect(() => {
    if ((preview1 || preview2) && noResi !== previousNoResiRef.current && previousNoResiRef.current !== '') {
      setError('⚠️ No Resi berubah! Foto yang sudah diupload tetap menggunakan nama lama. Hapus dan upload ulang jika perlu.')
      setTimeout(() => setError(null), 5000)
    }
    previousNoResiRef.current = noResi
  }, [noResi, preview1, preview2])

  /**
   * Sanitize and format filename based on No Resi
   * Format: {NO_RESI}_foto{NUMBER}.{EXTENSION}
   */
  const sanitizeFilename = (str: string): string => {
    // Remove invalid filename characters: / \ : * ? " < > |
    return str.replace(/[/\\:*?"<>|]/g, '_').trim()
  }

  const createRenamedFilename = (originalFilename: string, photoNumber: 1 | 2): string => {
    if (!noResi || noResi.trim() === '') {
      return originalFilename
    }

    // Sanitize No Resi
    const sanitized = sanitizeFilename(noResi)

    // Limit No Resi length to keep filenames reasonable
    const maxNoResiLength = 50
    const truncated = sanitized.length > maxNoResiLength
      ? sanitized.substring(0, maxNoResiLength)
      : sanitized

    // Get original file extension
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg'

    // Create new filename: {NO_RESI}_foto{NUMBER}.{EXTENSION}
    return `${truncated}_foto${photoNumber}.${extension}`
  }

  const uploadToCloudinary = async (blob: Blob, filename?: string): Promise<string> => {
    const formData = new FormData()

    // If filename provided, create a File object with the custom name
    if (filename) {
      const file = new File([blob], filename, { type: blob.type })
      formData.append('file', file)
    } else {
      formData.append('file', blob)
    }

    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    formData.append('folder', process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER!)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Upload to Cloudinary failed')
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleFileChange = async (
    file: File | null,
    photoNumber: 1 | 2
  ) => {
    if (!file) return

    // VALIDATION 1: Check if No Resi is filled
    if (!noResi || noResi.trim() === '') {
      setError('⚠️ Harap isi No Resi terlebih dahulu sebelum upload foto!')
      // Clear the inputs
      if (photoNumber === 1) {
        if (camera1Ref.current) camera1Ref.current.value = ''
        if (gallery1Ref.current) gallery1Ref.current.value = ''
      } else if (photoNumber === 2) {
        if (camera2Ref.current) camera2Ref.current.value = ''
        if (gallery2Ref.current) gallery2Ref.current.value = ''
      }
      // Auto-focus No Resi input
      setTimeout(() => {
        const noResiInput = document.querySelector('input[type="text"]') as HTMLInputElement
        noResiInput?.focus()
      }, 100)
      return
    }

    // VALIDATION 2: Check if location is available
    if (!location) {
      setError('Lokasi GPS belum tersedia. Mohon tunggu sebentar.')
      return
    }

    const setUploading = photoNumber === 1 ? setUploading1 : setUploading2
    const setPreview = photoNumber === 1 ? setPreview1 : setPreview2
    const setProgress = photoNumber === 1 ? setUploadProgress1 : setUploadProgress2
    const setCompressionInfo = photoNumber === 1 ? setCompressionInfo1 : setCompressionInfo2
    const setFilename = photoNumber === 1 ? setFilename1 : setFilename2

    // Generate renamed filename
    const renamedFilename = createRenamedFilename(file.name, photoNumber)
    setFilename(renamedFilename)

    try {
      setError(null)
      setUploading(true)
      setProgress('Memulai...')

      // Step 1: Validate file (5%)
      setProgress('Validasi file... (5%)')
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'File tidak valid')
        return
      }

      // Step 2: Compress image (15%)
      setProgress('Kompresi gambar... (15%)')
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      // Use adaptive compression (no hardcoded options to allow adaptive logic to work)
      const compressedFile = await compressImage(file)
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
      const reduction = Math.round(((file.size - compressedFile.size) / file.size) * 100)

      setCompressionInfo(`${originalSize}MB → ${compressedSize}MB (${reduction}% lebih kecil)`)

      // Step 3: Add watermark (40%)
      setProgress('Menambahkan watermark... (40%)')
      const watermarkedBlob = await addWatermarkToImage(compressedFile, {
        location,
        timestamp: new Date(),
      })

      // Step 4: Create preview (60%)
      setProgress('Membuat preview... (60%)')
      const previewUrl = URL.createObjectURL(watermarkedBlob)
      setPreview(previewUrl)

      // Step 5: Upload to Cloudinary (80%)
      setProgress('Upload ke cloud... (80%)')
      const cloudinaryUrl = await uploadToCloudinary(watermarkedBlob, renamedFilename)

      // Step 6: Finalize (100%)
      setProgress('Selesai! (100%)')

      // Call parent callback
      if (photoNumber === 1) {
        onUpload({ foto_url_1: cloudinaryUrl, foto_url_2: preview2 || undefined })
      } else {
        onUpload({ foto_url_1: preview1 || '', foto_url_2: cloudinaryUrl })
      }

      setError(null)

      // Clear progress after 2 seconds
      setTimeout(() => setProgress(''), 2000)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Gagal upload foto ${photoNumber}: ${err.message}`)
      setPreview(null)
      setCompressionInfo(null)
      setFilename(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Info about auto-rename */}
      {noResi && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-start gap-1.5">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Foto akan dinamai otomatis: <span className="font-mono font-semibold">{sanitizeFilename(noResi)}_foto1.jpg</span> dan <span className="font-mono font-semibold">{sanitizeFilename(noResi)}_foto2.jpg</span></span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Photo 1 */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700 flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> Foto 1 {required && <span className="text-red-500">*</span>}
        </label>

        {/* Hidden file inputs */}
        <input
          ref={camera1Ref}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 1)}
          className="hidden"
        />
        <input
          ref={gallery1Ref}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 1)}
          className="hidden"
        />

        {!preview1 ? (
          <div className="space-y-3">
            {uploading1 ? (
              <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  <span className="font-semibold">{uploadProgress1}</span>
                  {compressionInfo1 && (
                    <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {compressionInfo1}</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Side-by-side buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => camera1Ref.current?.click()}
                    disabled={!location || !noResi || noResi.trim() === ''}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="font-medium text-sm">Kamera</span>
                  </button>

                  {/* Gallery button */}
                  <button
                    type="button"
                    onClick={() => gallery1Ref.current?.click()}
                    disabled={!location || !noResi || noResi.trim() === ''}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span className="font-medium text-sm">Galeri</span>
                  </button>
                </div>

                {/* Warning messages */}
                {!noResi || noResi.trim() === '' ? (
                  <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Isi No Resi terlebih dahulu</p>
                ) : !location ? (
                  <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Tunggu GPS tersedia</p>
                ) : (
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" /> Pilih kamera untuk foto baru atau galeri untuk foto yang sudah ada</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="photo-preview relative">
            <Image
              src={preview1}
              alt="Preview foto 1"
              width={400}
              height={300}
              className="rounded-lg"
            />
            {filename1 && (
              <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <FileText className="w-3 h-3" /> {filename1}
              </div>
            )}
            {compressionInfo1 && (
              <div className="absolute bottom-2 left-2 right-2 bg-green-600 bg-opacity-90 text-white text-xs p-2 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Terkompresi: {compressionInfo1}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setPreview1(null)
                setCompressionInfo1(null)
                setFilename1(null)
                if (camera1Ref.current) camera1Ref.current.value = ''
                if (gallery1Ref.current) gallery1Ref.current.value = ''
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Photo 2 (Optional) */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700 flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> Foto 2 (Opsional)
        </label>

        {/* Hidden file inputs */}
        <input
          ref={camera2Ref}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 2)}
          className="hidden"
        />
        <input
          ref={gallery2Ref}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, 2)}
          className="hidden"
        />

        {!preview2 ? (
          <div className="space-y-3">
            {uploading2 ? (
              <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  <span className="font-semibold">{uploadProgress2}</span>
                  {compressionInfo2 && (
                    <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {compressionInfo2}</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Side-by-side buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => camera2Ref.current?.click()}
                    disabled={!location || !noResi || noResi.trim() === ''}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="font-medium text-sm">Kamera</span>
                  </button>

                  {/* Gallery button */}
                  <button
                    type="button"
                    onClick={() => gallery2Ref.current?.click()}
                    disabled={!location || !noResi || noResi.trim() === ''}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span className="font-medium text-sm">Galeri</span>
                  </button>
                </div>

                {/* Warning messages */}
                {!noResi || noResi.trim() === '' ? (
                  <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Isi No Resi terlebih dahulu</p>
                ) : !location ? (
                  <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" /> Tunggu GPS tersedia</p>
                ) : (
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3" /> Pilih kamera untuk foto baru atau galeri untuk foto yang sudah ada</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="photo-preview relative">
            <Image
              src={preview2}
              alt="Preview foto 2"
              width={400}
              height={300}
              className="rounded-lg"
            />
            {filename2 && (
              <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <FileText className="w-3 h-3" /> {filename2}
              </div>
            )}
            {compressionInfo2 && (
              <div className="absolute bottom-2 left-2 right-2 bg-green-600 bg-opacity-90 text-white text-xs p-2 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Terkompresi: {compressionInfo2}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setPreview2(null)
                setCompressionInfo2(null)
                setFilename2(null)
                if (camera2Ref.current) camera2Ref.current.value = ''
                if (gallery2Ref.current) gallery2Ref.current.value = ''
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Foto dinamai otomatis berdasarkan No Resi untuk tracking mudah</p>
        <p className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Foto otomatis dikompresi 80-90% (4MB → ~500KB) untuk upload cepat</p>
        <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Watermark GPS dan timestamp ditambahkan otomatis</p>
        <p className="flex items-center gap-1.5"><Camera className="w-3 h-3" /> Bisa ambil foto baru atau pilih dari galeri</p>
        <p className="flex items-center gap-1.5"><Cloud className="w-3 h-3" /> Upload langsung ke Cloudinary (hemat bandwidth)</p>
      </div>
    </div>
  )
}
