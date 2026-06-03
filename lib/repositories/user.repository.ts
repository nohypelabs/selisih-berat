import { supabaseAdmin } from '@/lib/supabase/server'
import type { User, UserInsert, UserUpdate } from '@/lib/types/auth'
import bcrypt from 'bcryptjs'

export class UserRepository {
  async create(userData: UserInsert): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'user',
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      console.error('Error finding user by username:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error finding user by id:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findAll(
    filter?: { search?: string; role?: string; is_active?: boolean },
    limit: number = 50,
    offset: number = 0
  ): Promise<Omit<User, 'password'>[]> {
    let query = supabaseAdmin
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1)

    if (filter?.search) {
      query = query.or(`username.ilike.%${filter.search}%,email.ilike.%${filter.search}%,full_name.ilike.%${filter.search}%`)
    }

    if (filter?.role) {
      query = query.eq('role', filter.role)
    }

    if (filter?.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error finding all users:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  async update(id: number, updateData: UserUpdate): Promise<User> {
    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw new Error(error.message)
    }

    return data
  }

  async updateLastLogin(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating last login:', error)
      throw new Error(error.message)
    }
  }

  async count(filter?: { search?: string; role?: string; is_active?: boolean }): Promise<number> {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (filter?.search) {
      query = query.or(`username.ilike.%${filter.search}%,email.ilike.%${filter.search}%,full_name.ilike.%${filter.search}%`)
    }

    if (filter?.role) {
      query = query.eq('role', filter.role)
    }

    if (filter?.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting users:', error)
      throw new Error(error.message)
    }

    return count || 0
  }

  async getDailyLeaderboard(limit: number = 10) {
    const { data, error } = await supabaseAdmin
      .from('user_statistics')
      .select('username, daily_entries, daily_earnings, total_entries')
      .order('daily_entries', { ascending: false })
      .order('daily_earnings', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching daily leaderboard:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  async getAllTimeLeaderboard(limit: number = 10) {
    const { data, error } = await supabaseAdmin
      .from('user_statistics')
      .select('username, total_entries, total_earnings')
      .order('total_entries', { ascending: false })
      .order('total_earnings', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching all-time leaderboard:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  async getUserRank(username: string, type: 'daily' | 'alltime' = 'alltime'): Promise<number> {
    try {
      if (type === 'daily') {
        // Get all users ordered by daily entries
        const { data, error } = await supabaseAdmin
          .from('user_statistics')
          .select('username, daily_entries')
          .order('daily_entries', { ascending: false })

        if (error) throw new Error(error.message)

        // Find the user's position
        const position = data?.findIndex(u => u.username === username)
        return position !== undefined && position !== -1 ? position + 1 : 0
      } else {
        // Get all users ordered by total entries
        const { data, error } = await supabaseAdmin
          .from('user_statistics')
          .select('username, total_entries')
          .order('total_entries', { ascending: false })

        if (error) throw new Error(error.message)

        // Find the user's position
        const position = data?.findIndex(u => u.username === username)
        return position !== undefined && position !== -1 ? position + 1 : 0
      }
    } catch (error: any) {
      console.error('Error getting user rank:', error)
      return 0
    }
  }

  /**
   * Calculate earnings for a specific user using database function
   */
  async calculateUserEarnings(username: string): Promise<{
    total_entries: number
    days_with_entries: number
    rate_per_entry: number
    daily_bonus: number
    entries_earnings: number
    bonus_earnings: number
    total_earnings: number
  } | null> {
    try {
      const { data, error } = await supabaseAdmin.rpc('calculate_user_earnings', {
        p_username: username,
      })

      if (error) {
        console.error('Error calculating user earnings:', error)
        return null
      }

      return data && data.length > 0 ? data[0] : null
    } catch (error: any) {
      console.error('Error in calculateUserEarnings:', error)
      return null
    }
  }

  /**
   * Get user statistics including earnings
   */
  async getUserStatistics(username: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_statistics')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching user statistics:', error)
        return null
      }

      return data
    } catch (error: any) {
      console.error('Error in getUserStatistics:', error)
      return null
    }
  }

  /**
   * Update user statistics earnings (batch update for all users)
   */
  async updateAllUserEarnings(): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.rpc('update_user_statistics_earnings')

      if (error) {
        console.error('Error updating all user earnings:', error)
        return false
      }

      return true
    } catch (error: any) {
      console.error('Error in updateAllUserEarnings:', error)
      return false
    }
  }
}

export const userRepository = new UserRepository()
