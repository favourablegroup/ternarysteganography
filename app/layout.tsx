import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/header'
import { MatrixRain } from '@/components/ui/matrix-rain'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ternary Image Steganography',
  description: 'Quantum-resistant steganography using ternary encryption and image-based data hiding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MatrixRain />
        <Header />
        <main className="min-h-screen pt-16 pb-16">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-cyan-500/20 p-4">
          <div className="container mx-auto text-center text-sm text-cyan-500">
            <a 
              href="https://fractal.investments" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition"
            >
              &copy; 2024 Fractal Technology Corporation
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
