'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, User, Lock, Eye, EyeOff, Mail, UserCircle, Loader2, UserPlus } from 'lucide-react'

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
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Kembali</span>
        </Link>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/icon-latest.png"
                alt="Selisih Berat"
                width={62}
                height={62}
                className="object-contain"
              />
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
                    <User className="w-4 h-4" />
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
                    <Mail className="w-4 h-4" />
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
                    <UserCircle className="w-4 h-4" />
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
                    <Lock className="w-4 h-4" />
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
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
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
                    <Loader2 className="animate-spin h-4 w-4" />
                    Mendaftar...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <UserPlus className="w-4 h-4" />
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
          <div className="mt-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <Link href="/" className="hover:text-gray-600 transition-colors">Beranda</Link>
              <span className="text-gray-300">•</span>
              <Link href="/login" className="hover:text-gray-600 transition-colors">Masuk</Link>
              <span className="text-gray-300">•</span>
              <span>Bantuan</span>
            </div>
            <p className="text-[10px] text-gray-400">
              © {new Date().getFullYear()} Audit Selisih Berat — J&T Express
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
