'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { User, Mail, Shield, Calendar, Edit3, LogOut, ChevronRight, Lock } from 'lucide-react'

interface UserProfile {
  username: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
  last_login: string | null
  is_active: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) {
        showToast('Username tidak ditemukan', 'error')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/users/${username}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()
      if (result.success) {
        setProfile(result.data)
        setFormData({
          email: result.data.email || '',
          full_name: result.data.full_name || ''
        })
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      showToast('Gagal memuat profil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) {
        showToast('Username tidak ditemukan', 'error')
        return
      }

      const response = await fetch(`/api/users/${username}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        showToast('Profil berhasil diupdate!', 'success')
        setEditMode(false)
        fetchProfile()
      } else {
        showToast(result.message || 'Update gagal', 'error')
      }
    } catch (error) {
      console.error('Update error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const initial = (profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-4 max-w-lg mx-auto">

        {/* Profile Header Card */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{initial}</span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-sm text-gray-500 truncate">@{profile.username}</p>
                <span className={`inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                  profile.role === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {profile.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>

              {/* Edit Button */}
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editMode && profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Edit Profil</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              {/* Username (read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Nama lengkap"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false)
                    setFormData({
                      email: profile.email || '',
                      full_name: profile.full_name || ''
                    })
                  }}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Cards */}
        {profile && !editMode && (
          <div className="space-y-3">
            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Informasi Akun</h2>
              </div>

              <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Username</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{profile.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Bergabung</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Keamanan</h2>
              </div>

              <button
                onClick={() => router.push('/profile/change-password')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Ubah Password</p>
                  <p className="text-[10px] text-gray-400">Update password akun Anda</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 bg-white border border-red-100 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
