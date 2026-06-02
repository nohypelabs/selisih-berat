'use client'

import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              Developed by{' '}
              <a
                href="https://nohypelabs.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                NoHypeLabs
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Audit Selisih Berat — J&T Express
            </p>
          </div>
          <p className="text-[10px] text-gray-600">
            v1.1
          </p>
        </div>
      </div>
    </footer>
  )
}
