"use client"

import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'

interface SierpinskiFractalProps {
  hash: string
  onSave?: () => void
}

export function SierpinskiFractal({ hash, onSave }: SierpinskiFractalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !hash) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 512
    canvas.width = size
    canvas.height = size

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, size, size)

    const drawTriangle = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, value: string) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.closePath()
      
      // Map -1, 0, 1 to red, yellow, green
      ctx.fillStyle = value === '-' ? '#FF0000' : value === '0' ? '#FFFF00' : '#00FF00'
      ctx.fill()
    }

    const sierpinski = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, depth: number, index: number): number => {
      if (depth === 0 || index >= hash.length) {
        drawTriangle(x1, y1, x2, y2, x3, y3, hash[index])
        return index + 1
      }

      const x12 = (x1 + x2) / 2
      const y12 = (y1 + y2) / 2
      const x23 = (x2 + x3) / 2
      const y23 = (y2 + y3) / 2
      const x31 = (x3 + x1) / 2
      const y31 = (y3 + y1) / 2

      index = sierpinski(x1, y1, x12, y12, x31, y31, depth - 1, index)
      index = sierpinski(x12, y12, x2, y2, x23, y23, depth - 1, index)
      index = sierpinski(x31, y31, x23, y23, x3, y3, depth - 1, index)

      return index
    }

    sierpinski(size/2, 0, size, size, 0, size, 7, 0)
  }, [hash])

  const handleSave = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'hash-key.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-md mx-auto bg-black border border-cyan-500/30"
      />
      <Button
        onClick={handleSave}
        className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500 border border-cyan-500/30"
      >
        <Download className="w-4 h-4 mr-2" />
        Save Hash Key
      </Button>
    </div>
  )
}

