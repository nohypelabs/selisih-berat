import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { deleteCloudinaryPhotos, extractPublicId, optimizeCloudinaryUrl } from '@/lib/utils/cloudinary'

/**
 * GET /api/photos - List photos with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let userId: number
    let userRole: string

    try {
      const payload = verifyAccessToken(token)
      userId = payload.id
      userRole = payload.role
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Only admin can access this endpoint
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '500')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('entries')
      .select(
        `
        id,
        nama,
        no_resi,
        foto_url_1,
        foto_url_2,
        created_at,
        created_by
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString())
    }

    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      query = query.lte('created_at', endDateTime.toISOString())
    }

    if (search && search.length >= 3) {
      query = query.or(
        `nama.ilike.%${search}%,no_resi.ilike.%${search}%,created_by.ilike.%${search}%`
      )
    }

    // Execute query with pagination
    const { data: entries, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching entries:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch photos' },
        { status: 500 }
      )
    }

    // Extract photos from entries
    const photos: any[] = []
    entries?.forEach((entry) => {
      // Add foto_url_1
      if (entry.foto_url_1) {
        photos.push({
          id: `${entry.id}_1`,
          url: entry.foto_url_1,
          thumbnail_url: generateThumbnailUrl(entry.foto_url_1),
          nama: entry.nama,
          no_resi: entry.no_resi,
          created_at: entry.created_at,
          created_by: entry.created_by,
          entry_id: entry.id,
          photo_field: 'foto_url_1',
        })
      }

      // Add foto_url_2
      if (entry.foto_url_2) {
        photos.push({
          id: `${entry.id}_2`,
          url: entry.foto_url_2,
          thumbnail_url: generateThumbnailUrl(entry.foto_url_2),
          nama: entry.nama,
          no_resi: entry.no_resi,
          created_at: entry.created_at,
          created_by: entry.created_by,
          entry_id: entry.id,
          photo_field: 'foto_url_2',
        })
      }
    })

    // Get stats
    const totalPhotos = photos.length

    // Get today's count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayCount } = await supabaseAdmin
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    return NextResponse.json({
      success: true,
      data: {
        photos,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats: {
          totalPhotos: (count || 0) * 2, // Estimate (each entry has 2 photos)
          uploadedToday: (todayCount || 0) * 2,
        },
      },
    })
  } catch (error: any) {
    console.error('Photos API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/photos - Delete photos
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let userId: number
    let userRole: string

    try {
      const payload = verifyAccessToken(token)
      userId = payload.id
      userRole = payload.role
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Only admin can delete photos
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { photoIds } = body

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No photos specified for deletion' },
        { status: 400 }
      )
    }

    // Parse photo IDs to get entry IDs and field names
    const updates: { entryId: number; field: 'foto_url_1' | 'foto_url_2'; url: string }[] = []
    const photoUrls: string[] = []

    for (const photoId of photoIds) {
      const [entryId, photoNum] = photoId.split('_')
      const field = photoNum === '1' ? 'foto_url_1' : 'foto_url_2'

      // Get the photo URL from database
      const { data: entry } = await supabaseAdmin
        .from('entries')
        .select(field)
        .eq('id', parseInt(entryId))
        .single()

      if (entry && entry[field as keyof typeof entry]) {
        const url = entry[field as keyof typeof entry]
        if (url) {
          updates.push({
            entryId: parseInt(entryId),
            field,
            url,
          })
          photoUrls.push(url)
        }
      }
    }

    // Extract Cloudinary public IDs
    const publicIds = photoUrls
      .map((url) => extractPublicId(url))
      .filter((id): id is string => id !== null)

    // Delete from Cloudinary
    let cloudinaryResult = { deleted: [] as string[], failed: [] as string[] }
    if (publicIds.length > 0) {
      try {
        cloudinaryResult = await deleteCloudinaryPhotos(publicIds)
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error)
        // Continue even if Cloudinary deletion fails
      }
    }

    // Update database (set photo URLs to null)
    const dbUpdates = await Promise.all(
      updates.map(async (update) => {
        try {
          const { error } = await supabaseAdmin
            .from('entries')
            .update({ [update.field]: null })
            .eq('id', update.entryId)

          return { success: !error, entryId: update.entryId, field: update.field }
        } catch (error) {
          console.error('Error updating entry:', error)
          return { success: false, entryId: update.entryId, field: update.field }
        }
      })
    )

    const successCount = dbUpdates.filter((u) => u.success).length
    const failCount = dbUpdates.filter((u) => !u.success).length

    return NextResponse.json({
      success: true,
      data: {
        deleted: successCount,
        failed: failCount,
        cloudinary: {
          deleted: cloudinaryResult.deleted.length,
          failed: cloudinaryResult.failed.length,
        },
      },
      message: `Successfully deleted ${successCount} photos${
        failCount > 0 ? `, ${failCount} failed` : ''
      }`,
    })
  } catch (error: any) {
    console.error('Photos API DELETE error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Generate thumbnail URL with Cloudinary transformations
 * Uses optimized settings for better quality and performance
 */
function generateThumbnailUrl(url: string): string {
  if (!url) return ''

  // Use the optimized Cloudinary utility with aggressive compression for thumbnails
  return optimizeCloudinaryUrl(url, {
    width: 300,
    height: 300,
    quality: 'auto:eco', // Most aggressive compression for thumbnails
    format: 'auto' // Auto WebP/AVIF for better compression
  })
}
