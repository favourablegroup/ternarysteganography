"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from './button'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-2/3 max-w-sm bg-black border-l border-cyan-500/20 p-6 shadow-xl">
        <div className="flex flex-col space-y-6">
          <Link 
            href="/" 
            className="text-cyan-500 hover:text-cyan-400 transition"
            onClick={onClose}
          >
            Encrypt
          </Link>
          <Link 
            href="/decrypt" 
            className="text-cyan-500 hover:text-cyan-400 transition"
            onClick={onClose}
          >
            Decrypt
          </Link>
          <a 
            href="https://x.com/fractaltechcorp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400 transition"
            onClick={onClose}
          >
            Follow @fractaltechcorp
          </a>
        </div>
      </div>
    </div>
  )
}
