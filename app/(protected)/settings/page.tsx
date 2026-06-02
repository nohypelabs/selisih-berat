'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EarningsCalculator } from '@/components/earnings/earnings-calculator'
import { useToast } from '@/components/ui/toast'
import { formatRupiah } from '@/lib/utils/earnings'
import { Settings, DollarSign, Gift, ToggleLeft, Info, AlertTriangle, RotateCcw, Save, Loader2 } from 'lucide-react'

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
      showToast('Settings berhasil disimpan!', 'success')
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
      showToast('Settings direset ke nilai tersimpan', 'info')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Konfigurasi rate earnings</p>
        </div>

        {/* Earnings Configuration Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Earnings Configuration</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Rate per Entry */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                Rate per Entry (Rp.)
              </label>
              <input
                type="number"
                min="0"
                value={ratePerEntry}
                onChange={(e) => setRatePerEntry(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="500"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Saat ini: {formatRupiah(ratePerEntry)}
              </p>
            </div>

            {/* Daily Bonus */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Gift className="w-3.5 h-3.5 text-gray-400" />
                Daily Bonus (Rp.)
              </label>
              <input
                type="number"
                min="0"
                value={dailyBonus}
                onChange={(e) => setDailyBonus(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="50000"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Saat ini: {formatRupiah(dailyBonus)}
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Earnings System</span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-medium text-blue-800">Formula</h3>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    Total = (Entries × Rate) + (Days × Bonus)
                  </p>
                  <p className="text-[10px] text-blue-500 mt-0.5">
                    Contoh: 100 entries dalam 5 hari = {formatRupiah((100 * ratePerEntry) + (5 * dailyBonus))}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Calculator */}
        <EarningsCalculator defaultRate={ratePerEntry} defaultBonus={dailyBonus} />

        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-medium text-yellow-800">Perhatian</h3>
              <p className="text-[10px] text-yellow-600 mt-0.5">
                Mengubah settings akan menghitung ulang semua earnings user.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
