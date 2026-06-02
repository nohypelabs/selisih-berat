'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import {
  BarChart3, Plus, FileText, User, Camera, Settings,
  Database, LogOut, Sparkles
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: string[]
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  user: any
  navItems: NavItem[]
  onLogout: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  '📊': <BarChart3 className="w-4 h-4" />,
  '➕': <Plus className="w-4 h-4" />,
  '📝': <FileText className="w-4 h-4" />,
  '👤': <User className="w-4 h-4" />,
  '✨': <Sparkles className="w-4 h-4" />,
  '📸': <Camera className="w-4 h-4" />,
  '⚙️': <Settings className="w-4 h-4" />,
  '📋': <Database className="w-4 h-4" />,
  '🏆': <BarChart3 className="w-4 h-4" />,
}

export function MobileSidebar({
  isOpen,
  onClose,
  user,
  navItems,
  onLogout,
}: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    onClose()
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const visibleNavItems = navItems.filter((item) => {
    if (!user) return true
    return item.roles.includes(user.role)
  })

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar — Glassmorphism */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 max-w-[80vw] z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col bg-white/[0.65] backdrop-blur-2xl border-r border-white/30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header — with Logout */}
        <div className="px-4 py-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src="/icon-latest.png" alt="SB" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Selisih Berat</h1>
                <p className="text-[10px] text-gray-400">J&T Express</p>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout()
                onClose()
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 active:scale-95 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const icon = iconMap[item.icon as string] || <BarChart3 className="w-4 h-4" />
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 mb-0.5 ${
                  isActive
                    ? 'bg-primary-600/90 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white/50 active:bg-white/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-400'}>{icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/20">
          <p className="text-[10px] text-gray-400 text-center">v1.0 • Audit Selisih Berat</p>
        </div>
      </aside>
    </>
  )
}
