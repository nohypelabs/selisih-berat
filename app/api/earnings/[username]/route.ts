import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/earnings/[username] - Get user earnings
 */
export const GET = withAuth(async (request, { params, user }) => {
  try {
    const { username } = params

    // Check if user requesting their own data or admin
    if (user.username !== username && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - You can only view your own earnings' },
        { status: 403 }
      )
    }

    // Get period filter from query params
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '7d' // 1d, 7d, 30d, all

    // Calculate date range based on period
    let startDate: string | null = null
    if (period !== 'all') {
      const now = new Date()
      const days = period === '1d' ? 1 : period === '7d' ? 7 : 30
      now.setDate(now.getDate() - days)
      startDate = now.toISOString()
    }

    // Try database function first (OPTIMIZED!)
    let earningsData = null
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('calculate_user_earnings', {
      p_username: username
    })

    if (rpcError) {
      console.error('Calculate earnings RPC error:', rpcError)
      console.log('Falling back to direct calculation...')

      // FALLBACK: Manual calculation from user_statistics table
      const { data: userStats, error: statsError } = await supabaseAdmin
        .from('user_statistics')
        .select('*')
        .eq('username', username)
        .single()

      if (statsError || !userStats) {
        console.error('User statistics error:', statsError)

        // Return default empty earnings
        return NextResponse.json({
          success: true,
          data: {
            total_entries: 0,
            days_with_entries: 0,
            rate_per_entry: 500,
            daily_bonus: 50000,
            entries_earnings: 0,
            bonus_earnings: 0,
            total_earnings: 0
          }
        })
      }

      // Get current settings for rates from settings table
      const { data: settingsData } = await supabaseAdmin
        .from('settings')
        .select('key, value')
        .in('key', ['rate_per_entry', 'daily_bonus'])

      // Parse settings into object
      const settingsMap = (settingsData || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      const ratePerEntry = settingsMap.rate_per_entry ? parseInt(settingsMap.rate_per_entry) : 500
      const dailyBonus = settingsMap.daily_bonus ? parseInt(settingsMap.daily_bonus) : 50000

      // Calculate earnings manually (with period filter)
      let totalEntries = userStats.total_entries || 0
      if (startDate) {
        // Count entries within period
        const { count } = await supabaseAdmin
          .from('entries')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', username)
          .gte('created_at', startDate)
        totalEntries = count || 0
      }

      // Count distinct days from entries table (with period filter)
      let entriesQuery = supabaseAdmin
        .from('entries')
        .select('created_at')
        .eq('created_by', username)

      if (startDate) {
        entriesQuery = entriesQuery.gte('created_at', startDate)
      }

      const { data: entriesData } = await entriesQuery

      // Count unique dates
      const uniqueDates = new Set(
        (entriesData || []).map(entry =>
          new Date(entry.created_at || '').toISOString().split('T')[0]
        )
      )
      const daysWithEntries = uniqueDates.size

      const entriesEarnings = totalEntries * ratePerEntry
      const bonusEarnings = daysWithEntries * dailyBonus
      const totalEarnings = entriesEarnings + bonusEarnings

      earningsData = {
        total_entries: totalEntries,
        days_with_entries: daysWithEntries,
        rate_per_entry: ratePerEntry,
        daily_bonus: dailyBonus,
        entries_earnings: entriesEarnings,
        bonus_earnings: bonusEarnings,
        total_earnings: totalEarnings
      }
    } else {
      // Use RPC data
      if (!rpcData || rpcData.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            total_entries: 0,
            days_with_entries: 0,
            rate_per_entry: 500,
            daily_bonus: 50000,
            entries_earnings: 0,
            bonus_earnings: 0,
            total_earnings: 0
          }
        })
      }

      const earnings = rpcData[0]
      earningsData = {
        total_entries: earnings.total_entries,
        days_with_entries: earnings.days_with_entries,
        rate_per_entry: earnings.rate_per_entry,
        daily_bonus: earnings.daily_bonus,
        entries_earnings: earnings.entries_earnings,
        bonus_earnings: earnings.bonus_earnings,
        total_earnings: earnings.total_earnings
      }
    }

    // Get chart data — daily earnings breakdown
    let chartData: { date: string; earnings: number; entries: number }[] = []
    try {
      let chartQuery = supabaseAdmin
        .from('entries')
        .select('created_at')
        .eq('created_by', username)
        .order('created_at', { ascending: true })

      if (startDate) {
        chartQuery = chartQuery.gte('created_at', startDate)
      }

      const { data: chartEntries } = await chartQuery

      if (chartEntries && chartEntries.length > 0) {
        // Group by date
        const dailyMap = new Map<string, number>()
        chartEntries.forEach(entry => {
          const date = new Date(entry.created_at || '').toISOString().split('T')[0]
          dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
        })

        // Get settings for rate
        const ratePerEntry = earningsData?.rate_per_entry || 500
        const dailyBonus = earningsData?.daily_bonus || 50000

        // Build chart data with cumulative earnings
        let cumulative = 0
        chartData = Array.from(dailyMap.entries()).map(([date, count]) => {
          const dayEarnings = (count * ratePerEntry) + dailyBonus
          cumulative += dayEarnings
          return {
            date,
            earnings: cumulative,
            entries: count
          }
        })
      }
    } catch (chartErr) {
      console.error('Chart data error:', chartErr)
    }

    return NextResponse.json({
      success: true,
      data: earningsData,
      chart: chartData
    })
  } catch (error: any) {
    console.error('Earnings calculation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to calculate earnings', error: error.message },
      { status: 500 }
    )
  }
})
