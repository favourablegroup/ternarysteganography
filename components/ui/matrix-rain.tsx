"use client"

import { useEffect, useRef } from 'react'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const dropsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    ctxRef.current = canvas.getContext('2d')
    if (!ctxRef.current) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / 15)
    dropsRef.current = new Array(columns).fill(1)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンヴ'

    const ctx = ctxRef.current
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    function draw() {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!ctx || !canvas) return

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = '12px monospace'

      for (let i = 0; i < dropsRef.current.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const opacity = Math.random() * 0.5 + 0.5
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`
        ctx.fillText(text, i * 15, dropsRef.current[i] * 15)

        if (dropsRef.current[i] * 15 > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0
        }
        dropsRef.current[i]++
      }
    }

    const interval = setInterval(draw, 25)
    const resizeHandler = () => {
      if (!canvas || !ctxRef.current) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      dropsRef.current = new Array(Math.floor(canvas.width / 15)).fill(1)
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
