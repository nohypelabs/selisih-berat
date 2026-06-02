'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EarningsCalculator } from '@/components/earnings/earnings-calculator'
import { useToast } from '@/components/ui/toast'
import { formatRupiah } from '@/lib/utils/earnings'

interface EarningsSettings {
  rate_per_entry: number
  daily_bonus: number
  enabled: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<EarningsSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [ratePerEntry, setRatePerEntry] = useState(500)
  const [dailyBonus, setDailyBonus] = useState(50000)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Check if user is admin
      if (parsedUser.role !== 'admin') {
        showToast('Access denied: Admin only', 'error')
        router.push('/dashboard')
        return
      }

      fetchSettings()
    } else {
      router.push('/login')
    }
  }, [])

  const fetchSettings = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message || 'Failed to fetch settings', 'error')
        return
      }

      setSettings(data.data)
      setRatePerEntry(data.data.rate_per_entry)
      setDailyBonus(data.data.daily_bonus)
      setEnabled(data.data.enabled)
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      showToast(error.message || 'Failed to fetch settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rate_per_entry: ratePerEntry,
          daily_bonus: dailyBonus,
          enabled,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message || 'Failed to update settings', 'error')
        return
      }

      setSettings(data.data)
      showToast('Settings updated successfully! User earnings will be recalculated.', 'success')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      showToast(error.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (settings) {
      setRatePerEntry(settings.rate_per_entry)
      setDailyBonus(settings.daily_bonus)
      setEnabled(settings.enabled)
      showToast('Settings reset to saved values', 'info')
    }
  }

  if (loading) {
    return (
      <div className="p-3 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="card-mobile mb-3">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">⚙️ Settings</h1>
          <p className="text-xs text-gray-600 mt-0.5">Configure earnings rates</p>
        </div>

        {/* Earnings Settings */}
        <div className="card-mobile mb-3">
          <h2 className="text-base font-semibold text-gray-800 mb-3">💰 Earnings Configuration</h2>

          <div className="space-y-3">
            {/* Rate per Entry */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Rate per Entry (Rp.)
              </label>
              <input
                type="number"
                min="0"
                value={ratePerEntry}
                onChange={(e) => setRatePerEntry(parseInt(e.target.value) || 0)}
                className="input-mobile"
                placeholder="500"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                Current: {formatRupiah(ratePerEntry)}
              </p>
            </div>

            {/* Daily Bonus */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Daily Bonus (Rp.)
              </label>
              <input
                type="number"
                min="0"
                value={dailyBonus}
                onChange={(e) => setDailyBonus(parseInt(e.target.value) || 0)}
                className="input-mobile"
                placeholder="50000"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                Current: {formatRupiah(dailyBonus)}
              </p>
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="enabled" className="text-xs font-medium text-gray-700">
                Enable earnings system
              </label>
            </div>

            {/* Info Box */}
            <div className="mt-3 p-2 bg-blue-50 border-l-2 border-blue-500 rounded">
              <div className="flex items-start">
                <svg className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-2">
                  <h3 className="text-xs font-medium text-blue-800">Formula</h3>
                  <div className="mt-1 text-[10px] text-blue-700">
                    <p>Total = (Entries × Rate) + (Days × Bonus)</p>
                    <p className="mt-0.5">Ex: 100 entries in 5 days = {formatRupiah((100 * ratePerEntry) + (5 * dailyBonus))}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 text-sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={saving}
                className="text-sm"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Earnings Calculator */}
        <EarningsCalculator defaultRate={ratePerEntry} defaultBonus={dailyBonus} />

        {/* Warning */}
        <div className="mt-3 p-2 bg-yellow-50 border-l-2 border-yellow-500 rounded">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-yellow-800">Important</h3>
              <p className="mt-0.5 text-[10px] text-yellow-700">
                Changing settings will recalculate all user earnings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
