'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LocationDisplay } from '@/components/entry/location-display'
import { BarcodeScanner } from '@/components/entry/barcode-scanner'
import { PhotoUpload } from '@/components/entry/photo-upload'
import { useToast } from '@/components/ui/toast'
import { haptics } from '@/lib/utils/haptics'
import { authFetch } from '@/lib/utils/api'
import { calculateSelisih } from '@/lib/utils/helpers'
import { formatRupiah } from '@/lib/utils/earnings'
import { Plus, ScanBarcode, User, CheckCircle, AlertTriangle, XCircle, Coins, Loader2, Check, Camera, Lightbulb } from 'lucide-react'
import type { LocationInfo } from '@/lib/types/entry'

export default function EntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [ratePerEntry, setRatePerEntry] = useState(500)
  const [dailyBonus, setDailyBonus] = useState(50000)
  const [userName, setUserName] = useState('')

  // Get pre-filled no_resi from URL params (from scanner)
  const prefilledNoResi = searchParams.get('no_resi') || ''

  const [formData, setFormData] = useState({
    nama: '',
    no_resi: prefilledNoResi, // AUTO-FILL from scanner
    berat_resi: '',
    berat_aktual: '',
    foto_url_1: '',
    foto_url_2: '',
    catatan: '',
  })

  const selisih = formData.berat_resi && formData.berat_aktual
    ? calculateSelisih(parseFloat(formData.berat_resi), parseFloat(formData.berat_aktual))
    : 0

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Get user data and set nama field
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const displayName = user.full_name || user.username
        setUserName(displayName)
        setFormData((prev) => ({ ...prev, nama: displayName }))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // If no_resi was pre-filled from scanner, show success toast
    if (prefilledNoResi) {
      showToast('Barcode berhasil di-scan! ✅', 'success')
    }

    // Fetch earnings settings
    fetchEarningsSettings()
  }, [router])

  // Update no_resi when URL param changes
  useEffect(() => {
    if (prefilledNoResi && prefilledNoResi !== formData.no_resi) {
      setFormData((prev) => ({ ...prev, no_resi: prefilledNoResi }))
    }
  }, [prefilledNoResi])

  const fetchEarningsSettings = async () => {
    try {
      const response = await authFetch('/api/settings')

      if (!response.ok) return

      const data = await response.json()

      if (data.success && data.data) {
        setRatePerEntry(data.data.rate_per_entry)
        setDailyBonus(data.data.daily_bonus)
      }
    } catch (error) {
      console.error('Error fetching earnings settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    haptics.medium()

    if (!formData.foto_url_1) {
      showToast('Foto 1 wajib diisi', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await authFetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          berat_resi: parseFloat(formData.berat_resi),
          berat_aktual: parseFloat(formData.berat_aktual),
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast('Entry berhasil dibuat!', 'success')

        // Reset form but keep nama (user name)
        setFormData({
          nama: userName,
          no_resi: '',
          berat_resi: '',
          berat_aktual: '',
          foto_url_1: '',
          foto_url_2: '',
          catatan: '',
        })
      } else {
        showToast(result.message || 'Entry gagal dibuat', 'error')
      }
    } catch (error) {
      console.error('Submit error:', error)
      showToast('Terjadi kesalahan saat membuat entry', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getSelisihColor = (value: number) => {
    const abs = Math.abs(value)
    if (abs < 0.5) return 'text-green-600'
    if (abs < 1) return 'text-amber-600'
    return 'text-red-600'
  }

  const getSelisihBg = (value: number) => {
    const abs = Math.abs(value)
    if (abs < 0.5) return 'bg-green-50 border-green-200'
    if (abs < 1) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 pb-24">
      <div className="container mx-auto px-3 max-w-lg">

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Entry Baru</h1>
            <p className="text-[10px] text-gray-400">Isi data resi dan upload foto</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-600" />
          </div>
        </div>

        {/* ─── Form ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* No Resi with Scanner */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                No Resi <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ScanBarcode className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.no_resi}
                    onChange={(e) => setFormData({ ...formData, no_resi: e.target.value })}
                    placeholder="Scan atau ketik no resi"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 ${
                      prefilledNoResi ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanner(!showScanner)}
                  className={`px-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                    showScanner
                      ? 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {prefilledNoResi && (
                <p className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Dari hasil scan barcode
                </p>
              )}

              {showScanner && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                  <BarcodeScanner
                    onScan={(code) => {
                      setFormData({ ...formData, no_resi: code })
                      setShowScanner(false)
                      showToast('Barcode berhasil di-scan!', 'success')
                    }}
                    onError={(error) => showToast(error, 'error')}
                  />
                </div>
              )}
            </div>

            {/* Nama Peng-Entry */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Peng-Entry
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  readOnly
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Nama peng-entry"
                />
              </div>
            </div>

            {/* Berat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Berat Resi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.berat_resi}
                    onChange={(e) => setFormData({ ...formData, berat_resi: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 text-right pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Berat Aktual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.berat_aktual}
                    onChange={(e) => setFormData({ ...formData, berat_aktual: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 text-right pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">kg</span>
                </div>
              </div>
            </div>

            {/* Selisih Display */}
            {formData.berat_resi && formData.berat_aktual && (
              <div className={`p-3 rounded-xl border ${getSelisihBg(selisih)} transition-colors`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Selisih</p>
                    <p className={`text-2xl font-bold ${getSelisihColor(selisih)} mt-0.5`}>
                      {selisih >= 0 ? '+' : ''}{selisih} kg
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    Math.abs(selisih) < 0.5 ? 'bg-green-100' :
                    Math.abs(selisih) < 1 ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    {Math.abs(selisih) < 0.5 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : Math.abs(selisih) < 1 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Preview */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Estimasi Reward</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Per Entry</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(ratePerEntry)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Daily Bonus</span>
                  <span className="text-gray-600">{formatRupiah(dailyBonus)}</span>
                </div>
                <p className="text-[10px] text-green-600 pt-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Entry setiap hari buat dapet daily bonus!
                </p>
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              location={location}
              noResi={formData.no_resi}
              onUpload={(urls) => {
                setFormData({
                  ...formData,
                  foto_url_1: urls.foto_url_1,
                  foto_url_2: urls.foto_url_2 || '',
                })
              }}
            />

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Catatan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 resize-none"
                placeholder="Catatan tambahan..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg elevated-button"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Simpan Entry
                </>
              )}
            </button>

            {/* Location Display — below submit for cleaner top section */}
            <LocationDisplay onLocationFetched={setLocation} />
          </form>
        </div>
      </div>
    </div>
  )
}
