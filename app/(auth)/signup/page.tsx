'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

type PasswordStrength = 'weak' | 'medium' | 'strong' | null

export default function SignupPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
  })

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(null)
      return
    }
    const p = formData.password
    if (p.length < 6) {
      setPasswordStrength('weak')
    } else if (p.length < 10 && !/[A-Z]/.test(p)) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('strong')
    }
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.username.length < 3) {
      showToast('Username minimal 3 karakter', 'error')
      return
    }
    if (formData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success && result.data) {
        localStorage.setItem('accessToken', result.data.accessToken)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        showToast('Registrasi berhasil! Selamat datang', 'success')
        router.push('/entry')
      } else {
        showToast(result.message || 'Registrasi gagal. Coba username lain', 'error')
      }
    } catch (error) {
      console.error('Signup error:', error)
      showToast('Terjadi kesalahan saat registrasi. Silakan coba lagi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const strengthConfig = {
    weak: { color: 'bg-red-500', text: 'Lemah', textColor: 'text-red-600', width: '33%' },
    medium: { color: 'bg-amber-500', text: 'Sedang', textColor: 'text-amber-600', width: '66%' },
    strong: { color: 'bg-green-500', text: 'Kuat', textColor: 'text-green-600', width: '100%' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/40 to-white flex flex-col">
      {/* ─── Top Bar ─── */}
      <div className="w-full px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium">Kembali</span>
        </Link>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg elevated-button">
                <Image
                  src="/icon-latest.png"
                  alt="Selisih Berat"
                  width={56}
                  height={56}
                  className="object-contain rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-gray-500">
              Bergabung dengan Audit Selisih Berat J&T
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Pilih username"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 disabled:bg-gray-50"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Huruf, angka, dan underscore. Min 3 karakter.</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nama lengkap Anda"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Buat password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {passwordStrength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color}`}
                        style={{ width: strengthConfig[passwordStrength].width }}
                      />
                    </div>
                    <span className={`text-[10px] font-semibold ${strengthConfig[passwordStrength].textColor}`}>
                      {strengthConfig[passwordStrength].text}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg elevated-button"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mendaftar...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Masuk
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-gray-400 text-center mt-8">
            Audit Selisih Berat — J&T Express
          </p>
        </div>
      </div>
    </div>
  )
}
