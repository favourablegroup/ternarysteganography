'use client'

import { useEffect, useState, useMemo } from 'react'

export function MatrixRain() {
  const [columns, setColumns] = useState<number[]>([])
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      const numColumns = Math.floor(width / 20)
      const columnData = Array.from({ length: numColumns }, (_, i) => ({
        id: i,
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 8
      }))
      setColumns(columnData)
    }
    
    updateColumns()
    const resizeHandler = () => {
      requestAnimationFrame(updateColumns)
    }
    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  const characters = useMemo(() => '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴ', [])

  const generateColumn = useMemo(() => () => {
    return Array.from({ length: 30 }, () => 
      characters[Math.floor(Math.random() * characters.length)]
    ).join('\n')
  }, [characters])

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black overflow-hidden will-change-transform">
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute top-0 text-[#00FEFE] text-opacity-50 animate-matrix-rain whitespace-pre will-change-transform"
          style={{
            left: `${col.id * 20}px`,
            animationDelay: `${col.delay}s`,
            animationDuration: `${col.duration}s`,
            transform: 'translateY(-100%)'
          }}
        >
          {generateColumn()}
        </div>
      ))}
    </div>
  )
}
