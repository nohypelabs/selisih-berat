import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { NetworkStatus } from '@/components/ui/network-status'
import { QueryProvider } from '@/lib/providers/query-provider'

export const metadata: Metadata = {
  title: 'Audit Selisih Berat J&T Express',
  description: 'Aplikasi audit dan tracking selisih berat untuk operasional logistik J&T Express.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Audit Selisih Berat',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-latest.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#dc2626',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* PWA primary color */}
        <meta name="theme-color" content="#dc2626" />

        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Audit Selisih Berat" />
        <link rel="apple-touch-icon" href="/apple-icon" />

        {/* Android specific */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* suppressHydrationWarning is added to prevent warnings from browser extensions
            (e.g., ad blockers, Bing extensions) that inject attributes like bis_skin_checked */}
        <NetworkStatus />
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
