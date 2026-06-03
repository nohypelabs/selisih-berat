import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auditService } from '@/lib/services/audit.service'

/**
 * GET /api/users/[username]/profile
 * Get user profile information
 */
export const GET = withAuth(async (request, { params, user }) => {
  try {
    const { username } = params

    // Only allow viewing own profile (or admin)
    if (user.username !== username && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - You can only view your own profile' },
        { status: 403 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('username, email, full_name, role, created_at, last_login, is_active, avatar_url')
      .eq('username', username)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile', error: error.message },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/users/[username]/profile
 * Update user profile (email, full_name only)
 */
export const PUT = withAuth(async (request, { params, user }) => {
  try {
    const { username } = params

    // Only allow editing own profile (or admin)
    if (user.username !== username && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - You can only edit your own profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, full_name } = body

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        email: email || null,
        full_name: full_name || null,
        updated_at: new Date().toISOString()
      })
      .eq('username', username)

    if (error) {
      console.error('Update profile error:', error)
      throw error
    }

    // Audit log
    await auditService.log({
      userId: user.username,
      action: 'profile.update',
      resource: username,
      details: {
        updated_fields: { email, full_name },
        updated_by: user.username
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile', error: error.message },
      { status: 500 }
    )
  }
})
