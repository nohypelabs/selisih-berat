'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { InstallPrompt } from '@/components/ui/install-prompt'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { MobileSidebar } from '@/components/navigation/mobile-sidebar'
import { TopBar } from '@/components/navigation/top-bar'
import {
  Plus, BarChart3, Trophy, FileText, User, Camera, Settings,
  Database, LogOut, Sparkles
} from 'lucide-react'

const sidebarIconMap: Record<string, React.ReactNode> = {
  '➕': <Plus className="w-5 h-5" />,
  '📊': <BarChart3 className="w-5 h-5" />,
  '🏆': <Trophy className="w-5 h-5" />,
  '📝': <FileText className="w-5 h-5" />,
  '👤': <User className="w-5 h-5" />,
  '✨': <Sparkles className="w-5 h-5" />,
  '📋': <Database className="w-5 h-5" />,
  '📸': <Camera className="w-5 h-5" />,
  '⚙️': <Settings className="w-5 h-5" />,
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/')
    } else if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user', 'admin'] },
    { href: '/entry', label: 'Entry', icon: '➕', roles: ['user', 'admin'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['user', 'admin'] },
    { href: '/my-entries', label: 'My Entries', icon: '📝', roles: ['user'] },
    { href: '/profile', label: 'Profile', icon: '👤', roles: ['user', 'admin'] },
    { href: '/changelog', label: 'Updates', icon: '✨', roles: ['user', 'admin'] },
    { href: '/data-management', label: 'Data Management', icon: '📋', roles: ['admin'] },
    { href: '/foto-management', label: 'Foto Management', icon: '📸', roles: ['admin'] },
    { href: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ]

  const visibleNavItems = navItems.filter((item) => {
    if (!user) return true
    return item.roles.includes(user.role)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <TopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        user={user}
        navItems={navItems}
        onLogout={handleLogout}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-60 md:bg-white md:border-r md:border-gray-100 md:flex md:flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <img src="/icon-latest.png" alt="SB" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Selisih Berat</h1>
              <p className="text-[10px] text-gray-400">J&T Express</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const icon = sidebarIconMap[item.icon as string] || <BarChart3 className="w-5 h-5" />
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-400'}>{icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-3 border-t border-gray-100">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-700">
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.full_name || user.username}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-60 pt-14 md:pt-0">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      {user && <BottomNav userRole={user.role} />}

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20"></div>

      {/* Install prompt */}
      <InstallPrompt />
    </div>
  )
}
