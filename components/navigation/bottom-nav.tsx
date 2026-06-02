'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, Plus, Database, FileText, User, Camera, ScanBarcode } from 'lucide-react'
import { ScannerModal } from '@/components/navigation/scanner-modal'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
  userOnly?: boolean
}

export function BottomNav({ userRole }: { userRole: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showScanner, setShowScanner] = useState(false)

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Home', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/entry', label: 'Entry', icon: <Plus className="w-5 h-5" />, userOnly: true },
    { href: '/data-management', label: 'Data', icon: <Database className="w-5 h-5" />, adminOnly: true },
    { href: '/my-entries', label: 'Riwayat', icon: <FileText className="w-5 h-5" />, userOnly: true },
    { href: '/foto-management', label: 'Foto', icon: <Camera className="w-5 h-5" />, adminOnly: true },
    { href: '/profile', label: 'Profil', icon: <User className="w-5 h-5" /> },
  ]

  const visibleItems = navItems.filter((item) => {
    if (item.userOnly) return userRole !== 'admin'
    if (item.adminOnly) return userRole === 'admin'
    return true
  })

  const leftItems = visibleItems.slice(0, 2)
  const rightItems = visibleItems.slice(2)

  const handleScanSuccess = (code: string) => {
    setShowScanner(false)
    router.push(`/entry?no_resi=${encodeURIComponent(code)}`)
  }

  return (
    <>
      <nav className="fixed bottom-4 left-5 right-5 md:hidden z-50 safe-area-bottom bg-white/[0.34] backdrop-blur-2xl border border-white/25 rounded-[34px] shadow-xl shadow-black/10">
        <div className="flex items-end justify-around h-14 px-1">
          {leftItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-gray-400 active:text-gray-600'
              }`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          ))}

          {/* CENTER SCAN BUTTON */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowScanner(true)}
              className="relative -top-5 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Scan Barcode"
            >
              <ScanBarcode className="w-6 h-6 text-white" />
            </button>
          </div>

          {rightItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-gray-400 active:text-gray-600'
              }`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  )
}
