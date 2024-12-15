"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './button'
import { MobileMenu } from './mobile-menu'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/Asset 6.svg" alt="Logo" width={150} height={150} priority className="w-[150px] h-auto" />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
                Encrypt
              </Link>
              <Link href="/decrypt" className="text-cyan-400 hover:text-cyan-300 transition">
                Decrypt
              </Link>
              <Link
                href="https://twitter.com/@fractaltechcorp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                Follow @fractaltechcorp
              </Link>
            </nav>

            <Button
              variant="ghost"
              className="md:hidden text-cyan-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/30 bg-black/50 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
                Encrypt
              </Link>
              <Link href="/decrypt" className="text-cyan-400 hover:text-cyan-300 transition">
                Decrypt
              </Link>
              <Link
                href="https://twitter.com/@fractaltechcorp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                Follow @fractaltechcorp
              </Link>
            </nav>
          </div>
        )}
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}
