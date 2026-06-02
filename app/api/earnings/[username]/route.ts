import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/earnings/[username] - Get user earnings with period filter
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

    // Get settings for rates
    const { data: settingsData } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['rate_per_entry', 'daily_bonus'])

    const settingsMap = (settingsData || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    const ratePerEntry = settingsMap.rate_per_entry ? parseInt(settingsMap.rate_per_entry) : 500
    const dailyBonus = settingsMap.daily_bonus ? parseInt(settingsMap.daily_bonus) : 50000

    // Query entries with period filter
    let entriesQuery = supabaseAdmin
      .from('entries')
      .select('created_at')
      .eq('created_by', username)
      .order('created_at', { ascending: true })

    if (startDate) {
      entriesQuery = entriesQuery.gte('created_at', startDate)
    }

    const { data: entriesData, error: entriesError } = await entriesQuery

    if (entriesError) {
      console.error('Entries query error:', entriesError)
    }

    // Count entries
    const totalEntries = entriesData?.length || 0

    // Count unique days
    const uniqueDates = new Set(
      (entriesData || []).map(entry =>
        new Date(entry.created_at || '').toISOString().split('T')[0]
      )
    )
    const daysWithEntries = uniqueDates.size

    // Calculate earnings
    const entriesEarnings = totalEntries * ratePerEntry
    const bonusEarnings = daysWithEntries * dailyBonus
    const totalEarnings = entriesEarnings + bonusEarnings

    const earningsData = {
      total_entries: totalEntries,
      days_with_entries: daysWithEntries,
      rate_per_entry: ratePerEntry,
      daily_bonus: dailyBonus,
      entries_earnings: entriesEarnings,
      bonus_earnings: bonusEarnings,
      total_earnings: totalEarnings
    }

    // Build chart data — daily earnings breakdown
    let chartData: { date: string; earnings: number; entries: number }[] = []
    if (entriesData && entriesData.length > 0) {
      // Group by date
      const dailyMap = new Map<string, number>()
      entriesData.forEach(entry => {
        const date = new Date(entry.created_at || '').toISOString().split('T')[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })

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
