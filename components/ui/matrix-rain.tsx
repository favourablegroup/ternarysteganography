"use client"

import { useEffect, useState } from 'react'

export function MatrixRain() {
  const [columns, setColumns] = useState<number[]>([])
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      const numColumns = Math.floor(width / 20)
      setColumns(Array.from({ length: numColumns }, (_, i) => i))
    }
    
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black overflow-hidden">
      {columns.map((i) => (
        <div
          key={i}
          className="absolute top-0 text-[#00FEFE] text-opacity-50 animate-matrix-rain whitespace-pre"
          style={{
            left: `${i * 20}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 5 + 8}s`
          }}
        >
          {Array.from({ length: 30 }, () => 
            '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴ'[
              Math.floor(Math.random() * 75)
            ]
          ).join('\n')}
        </div>
      ))}
    </div>
  )
}
