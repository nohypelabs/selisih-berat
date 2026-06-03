import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'

const BUCKET = 'avatars'
const MAX_SIZE = 100 * 1024 // 100KB

/**
 * POST /api/users/[username]/avatar — Upload avatar
 * Expects: multipart/form-data with 'file' field (JPEG blob)
 */
export const POST = withAuth(async (request, { params, user }) => {
  try {
    const { username } = params

    // Only allow users to upload their own avatar (or admin)
    if (user.username !== username && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate file size (after compression, should be ~100KB)
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: `Ukuran file terlalu besar (maks ${MAX_SIZE / 1024}KB)` },
        { status: 400 }
      )
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak didukung' },
        { status: 400 }
      )
    }

    const filePath = `${username}.jpg`

    // Delete old avatar if exists (ignore errors)
    await supabaseAdmin.storage.from(BUCKET).remove([filePath])

    // Upload new avatar
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Gagal mengupload foto' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update user record in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('username', username)

    if (updateError) {
      console.error('DB update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan foto profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diupdate',
      data: { avatar_url: avatarUrl },
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan', error: error.message },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/users/[username]/avatar — Delete avatar
 */
export const DELETE = withAuth(async (request, { params, user }) => {
  try {
    const { username } = params

    // Only allow users to delete their own avatar (or admin)
    if (user.username !== username && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const filePath = `${username}.jpg`

    // Delete from storage
    await supabaseAdmin.storage.from(BUCKET).remove([filePath])

    // Clear avatar_url in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: null })
      .eq('username', username)

    if (updateError) {
      console.error('DB update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan', error: error.message },
      { status: 500 }
    )
  }
})
