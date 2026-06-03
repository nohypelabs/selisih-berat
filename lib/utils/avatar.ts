/**
 * Avatar Utilities
 * Client-side image compression and avatar management
 */

const MAX_SIZE_KB = 100
const MAX_DIMENSION = 256  // 256x256 max
const QUALITY = 0.8

/**
 * Compress and resize an image file for avatar use
 * Target: ~100KB, max 256x256px, JPEG format
 */
export async function compressAvatar(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // Draw to canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Compress with decreasing quality until under target size
      let quality = QUALITY
      let blob: Blob | null = null

      const tryCompress = () => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error('Gagal mengkompres gambar'))
              return
            }

            blob = result

            // If still too large and quality can be reduced further
            if (blob.size > MAX_SIZE_KB * 1024 && quality > 0.3) {
              quality -= 0.1
              tryCompress()
            } else {
              resolve(blob!)
            }
          },
          'image/jpeg',
          quality
        )
      }

      tryCompress()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat gambar'))
    }

    img.src = url
  })
}

/**
 * Generate avatar file path for Supabase Storage
 * Pattern: {username}.jpg (inside avatars bucket)
 */
export function getAvatarPath(username: string): string {
  return `${username}.jpg`
}

/**
 * Get the public URL for an avatar in Supabase Storage
 */
export function getAvatarPublicUrl(supabaseUrl: string, username: string): string {
  return `${supabaseUrl}/storage/v1/object/public/avatars/${username}.jpg`
}

/**
 * Validate file type for avatar upload
 */
export function validateAvatarFile(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.'
  }
  // Max 5MB before compression (we'll compress it down)
  if (file.size > 5 * 1024 * 1024) {
    return 'Ukuran file terlalu besar. Maksimal 5MB.'
  }
  return null
}
