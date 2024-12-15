"use client"

import { useEffect, useRef } from 'react'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / 15)
    const drops: number[] = new Array(columns).fill(1)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴ'

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const opacity = Math.random() * 0.5 + 0.5
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`
        ctx.font = '12px monospace'
        ctx.fillText(text, i * 15, drops[i] * 15)

        if (drops[i] * 15 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 25)
    const resizeHandler = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drops.length = Math.floor(canvas.width / 15)
      while (drops.length < Math.floor(canvas.width / 15)) {
        drops.push(1)
      }
    }

    window.addEventListener('resize', resizeHandler)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-20 bg-black"
    />
  )
}
