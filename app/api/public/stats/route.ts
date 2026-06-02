import { NextResponse } from 'next/server'
import { entryRepository } from '@/lib/repositories/entry.repository'
import { userRepository } from '@/lib/repositories/user.repository'

// Force dynamic rendering - always fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Fetch all stats in parallel
    const [entryStats, activeUsers] = await Promise.all([
      entryRepository.getStats(),
      userRepository.count({ is_active: true }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalEntries: entryStats.totalEntries,
        totalPhotos: entryStats.totalPhotos,
        activeUsers,
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Public stats API error:', error)
    return NextResponse.json({
      success: true,
      data: {
        totalEntries: 0,
        totalPhotos: 0,
        activeUsers: 0,
      },
    })
  }
}
