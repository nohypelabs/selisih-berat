import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserLevel } from '@/lib/utils/constants'
import { verifyAccessToken } from '@/lib/utils/jwt'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let currentUsername: string

    try {
      const payload = verifyAccessToken(token)
      currentUsername = payload.username
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'alltime' // '12h', 'daily', or 'alltime'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === '12h') {
      // 12-hour period leaderboard — query entries directly with WIB time window
      const nowUTC = new Date()
      const wibHour = (nowUTC.getUTCHours() + 7) % 24

      const periodStartUTC = new Date(nowUTC)
      if (wibHour >= 6 && wibHour < 18) {
        periodStartUTC.setUTCDate(periodStartUTC.getUTCDate() - 1)
        periodStartUTC.setUTCHours(23, 0, 0, 0)
      } else if (wibHour >= 18) {
        periodStartUTC.setUTCHours(11, 0, 0, 0)
      } else {
        periodStartUTC.setUTCDate(periodStartUTC.getUTCDate() - 1)
        periodStartUTC.setUTCHours(11, 0, 0, 0)
      }
      const startDate = periodStartUTC.toISOString()

      // Fetch entries in the 12h window
      const { data: entriesData, error: entriesError } = await supabaseAdmin
        .from('entries')
        .select('created_by, created_at, berat_resi, berat_aktual, selisih')
        .gte('created_at', startDate)
        .not('created_by', 'is', null)

      if (entriesError) {
        console.error('12h leaderboard entries error:', entriesError)
      }

      // Aggregate by user
      const userMap = new Map<string, { entries: number; earnings: number }>()
      const settingsRes = await supabaseAdmin
        .from('settings')
        .select('key, value')
        .in('key', ['rate_per_entry', 'daily_bonus'])

      const settingsMap = (settingsRes.data || []).reduce((acc, s) => {
        acc[s.key] = s.value
        return acc
      }, {} as Record<string, string>)

      const rate = parseInt(settingsMap.rate_per_entry) || 500
      const bonus = parseInt(settingsMap.daily_bonus) || 50000

      // Group entries by user and count unique WIB dates
      const userDates = new Map<string, Set<string>>()
      ;(entriesData || []).forEach(entry => {
        const user = entry.created_by!
        const existing = userMap.get(user) || { entries: 0, earnings: 0 }
        existing.entries += 1
        userMap.set(user, existing)

        // Track unique WIB dates for daily bonus
        const d = new Date(entry.created_at || '')
        const wibMs = d.getTime() + 7 * 60 * 60 * 1000
        const wibDate = new Date(wibMs).toISOString().split('T')[0]
        if (!userDates.has(user)) userDates.set(user, new Set())
        userDates.get(user)!.add(wibDate)
      })

      // Calculate earnings per user
      userMap.forEach((stats, username) => {
        const days = userDates.get(username)?.size || 1
        stats.earnings = (stats.entries * rate) + (days * bonus)
      })

      // Sort by entries desc and assign ranks
      const sorted = Array.from(userMap.entries())
        .sort((a, b) => b[1].entries - a[1].entries)
        .slice(0, limit)

      // Get total_entries for level calculation
      const usernames = sorted.map(([u]) => u)
      const { data: statsData } = await supabaseAdmin
        .from('user_statistics')
        .select('username, total_entries')
        .in('username', usernames)

      const statsMap = new Map((statsData || []).map(s => [s.username, s.total_entries || 0]))

      const leaderboard = sorted.map(([username, stats], index) => ({
        rank: index + 1,
        username,
        entries: stats.entries,
        earnings: stats.earnings,
        level: getUserLevel(statsMap.get(username) || 0).name,
      }))

      // Current user stats for this 12h period
      const currentUserEntries = userMap.get(currentUsername)
      const currentUserRank = sorted.findIndex(([u]) => u === currentUsername) + 1

      const { data: userStat } = await supabaseAdmin
        .from('user_statistics')
        .select('total_entries')
        .eq('username', currentUsername)
        .single()

      const currentUserStats = {
        rank: currentUserRank || null,
        username: currentUsername,
        entries: currentUserEntries?.entries || 0,
        earnings: currentUserEntries?.earnings || 0,
        level: getUserLevel(userStat?.total_entries || 0).name,
      }

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          currentUser: currentUserStats,
        },
      })
    } else if (type === 'daily') {
      // Try to use database function for daily leaderboard (OPTIMIZED!)
      let leaderboardData: any[] = []

      const { data: rpcData, error: leaderboardError } = await supabaseAdmin.rpc(
        'get_daily_top_performers',
        { limit_count: limit }
      )

      if (leaderboardError) {
        console.error('Daily leaderboard RPC error:', leaderboardError)
        console.log('Falling back to direct query...')

        // FALLBACK: Direct query if RPC function doesn't exist
        const today = new Date().toISOString().split('T')[0]
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('user_statistics')
          .select('username, daily_entries, daily_earnings, total_entries, last_entry_date')
          .gte('last_entry_date', today)
          .order('daily_entries', { ascending: false })
          .limit(limit)

        if (fallbackError) {
          console.error('Fallback query error:', fallbackError)
          // Return empty leaderboard instead of crashing
          leaderboardData = []
        } else {
          // Format fallback data to match RPC format
          leaderboardData = (fallbackData || []).map((user, index) => ({
            rank: index + 1,
            username: user.username,
            daily_entries: user.daily_entries || 0,
            daily_earnings: user.daily_earnings || 0,
            total_entries: user.total_entries || 0,
            avg_selisih: 0, // Not available in fallback
          }))
        }
      } else {
        leaderboardData = rpcData || []
      }

      // Get current user stats
      const { data: userStat } = await supabaseAdmin
        .from('user_statistics')
        .select('daily_entries, daily_earnings, total_entries')
        .eq('username', currentUsername)
        .single()

      // Find user's rank in leaderboard
      const currentUserData = leaderboardData?.find((u: any) => u.username === currentUsername)
      const userRank = currentUserData?.rank || null

      const currentUserStats = {
        rank: userRank,
        username: currentUsername,
        entries: userStat?.daily_entries || 0,
        earnings: userStat?.daily_earnings || 0,
        level: getUserLevel(userStat?.total_entries || 0).name,
      }

      // Format leaderboard
      const leaderboard = (leaderboardData || []).map((user: any) => ({
        rank: user.rank,
        username: user.username,
        entries: user.daily_entries,
        earnings: user.daily_earnings,
        avgSelisih: user.avg_selisih,
        level: getUserLevel(user.total_entries || 0).name,
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          currentUser: currentUserStats,
        },
      })
    } else {
      // Try to use database function for all-time leaderboard (OPTIMIZED!)
      let leaderboardData: any[] = []

      const { data: rpcData, error: leaderboardError } = await supabaseAdmin.rpc(
        'get_total_top_performers',
        { limit_count: limit }
      )

      if (leaderboardError) {
        console.error('All-time leaderboard RPC error:', leaderboardError)
        console.log('Falling back to direct query...')

        // FALLBACK: Direct query if RPC function doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('user_statistics')
          .select('username, total_entries, total_earnings, avg_selisih, created_at, last_entry_date')
          .gt('total_entries', 0)
          .order('total_entries', { ascending: false })
          .limit(limit)

        if (fallbackError) {
          console.error('Fallback query error:', fallbackError)
          // Return empty leaderboard instead of crashing
          leaderboardData = []
        } else {
          // Format fallback data to match RPC format
          leaderboardData = (fallbackData || []).map((user, index) => ({
            rank: index + 1,
            username: user.username,
            total_entries: user.total_entries || 0,
            total_earnings: user.total_earnings || 0,
            first_entry: user.created_at, // Use created_at as first_entry
            last_entry: user.last_entry_date, // Use last_entry_date as last_entry
            avg_selisih: user.avg_selisih || 0,
          }))
        }
      } else {
        leaderboardData = rpcData || []
      }

      // Get current user stats
      const { data: userStat } = await supabaseAdmin
        .from('user_statistics')
        .select('total_entries, total_earnings')
        .eq('username', currentUsername)
        .single()

      // Find user's rank in leaderboard
      const currentUserData = leaderboardData?.find((u: any) => u.username === currentUsername)
      const userRank = currentUserData?.rank || null

      const currentUserStats = {
        rank: userRank,
        username: currentUsername,
        entries: userStat?.total_entries || 0,
        earnings: userStat?.total_earnings || 0,
        level: getUserLevel(userStat?.total_entries || 0).name,
      }

      // Format leaderboard
      const leaderboard = (leaderboardData || []).map((user: any) => ({
        rank: user.rank,
        username: user.username,
        entries: user.total_entries,
        earnings: user.total_earnings,
        avgSelisih: user.avg_selisih,
        firstEntry: user.first_entry,
        lastEntry: user.last_entry,
        level: getUserLevel(user.total_entries || 0).name,
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          currentUser: currentUserStats,
        },
      })
    }
  } catch (error: any) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
