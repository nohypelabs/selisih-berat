'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { authFetch } from '@/lib/utils/api'
import { compressAvatar, validateAvatarFile } from '@/lib/utils/avatar'
import { User, Mail, Shield, Calendar, Edit3, LogOut, ChevronRight, Lock, Camera, Trash2 } from 'lucide-react'
import { haptics } from '@/lib/utils/haptics'

interface UserProfile {
  username: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
  last_login: string | null
  is_active: boolean
  avatar_url: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
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
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) {
        showToast('Username tidak ditemukan', 'error')
        router.push('/login')
        return
      }

      const response = await authFetch(`/api/users/${username}/profile`)

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

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be selected again
    e.target.value = ''

    // Validate file
    const validationError = validateAvatarFile(file)
    if (validationError) {
      showToast(validationError, 'error')
      return
    }

    haptics.medium()
    setUploadingAvatar(true)

    try {
      // Compress image
      const compressed = await compressAvatar(file)
      const compressedFile = new File([compressed], 'avatar.jpg', { type: 'image/jpeg' })

      // Upload via API
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) {
        showToast('Username tidak ditemukan', 'error')
        return
      }

      const formData = new FormData()
      formData.append('file', compressedFile)

      const response = await authFetch(`/api/users/${username}/avatar`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        showToast('Foto profil berhasil diupdate!', 'success')
        haptics.success()
        // Refresh profile to get new avatar URL
        fetchProfile()
      } else {
        showToast(result.message || 'Gagal upload foto', 'error')
        haptics.error()
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      showToast('Terjadi kesalahan saat upload', 'error')
      haptics.error()
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!profile?.avatar_url) return

    haptics.medium()
    setUploadingAvatar(true)

    try {
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) return

      const response = await authFetch(`/api/users/${username}/avatar`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        showToast('Foto profil dihapus', 'info')
        fetchProfile()
      } else {
        showToast(result.message || 'Gagal menghapus foto', 'error')
      }
    } catch (error) {
      console.error('Avatar delete error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const userData = localStorage.getItem('user')
      const username = userData ? JSON.parse(userData).username : null

      if (!username) {
        showToast('Username tidak ditemukan', 'error')
        return
      }

      const response = await authFetch(`/api/users/${username}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    router.push('/login')
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
              {/* Avatar with upload overlay */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors disabled:opacity-50"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{initial}</span>
                    </div>
                  )}
                </button>

                {/* Camera overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </button>

                {/* Delete button (only if avatar exists) */}
                {profile.avatar_url && !uploadingAvatar && (
                  <button
                    onClick={handleAvatarDelete}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
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
