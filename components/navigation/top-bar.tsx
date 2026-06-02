'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

// Map pathname to page title
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/entry': 'Entry',
  '/leaderboard': 'Leaderboard',
  '/my-entries': 'My Entries',
  '/profile': 'Profile',
  '/data-management': 'Data Management',
  '/foto-management': 'Foto Management',
  '/settings': 'Settings',
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Get page title from pathname
  const pageTitle = pageTitles[pathname] || 'Selisih Berat'

  return (
    <header className="fixed top-0 left-0 right-0 z-30 md:hidden bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
      <div className="flex items-center justify-between h-14 px-3">
        {/* Left: App Icon → opens sidebar */}
        <button
          onClick={onMenuClick}
          className="w-11 h-11 rounded-full overflow-hidden active:scale-95 transition-transform"
          aria-label="Open menu"
        >
          <img
            src="/icon-latest.png"
            alt="Menu"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Center: Page Title */}
        <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>

        {/* Right: Settings */}
        <button
          onClick={() => router.push('/settings')}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  )
}
