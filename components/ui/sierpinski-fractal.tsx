"use client"

import { useEffect, useRef } from 'react'
import { Button } from './button'

interface SierpinskiFractalProps {
  hash: string
  className?: string
}

export function SierpinskiFractal({ hash, className = '' }: SierpinskiFractalProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const downloadSVG = () => {
    if (!svgRef.current || !hash) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(svgBlob)
    link.download = 'hash-visualization.svg'
    link.click()
  }

  const downloadPNG = () => {
    if (!svgRef.current || !hash) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = 1200  // High resolution
      canvas.height = 1200
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const link = document.createElement('a')
      link.download = 'hash-visualization.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const generateTriangles = () => {
    if (!hash) return []
    const triangles: JSX.Element[] = []
    const size = 300
    const centerX = size / 2
    const centerY = size / 2
    const height = size * Math.sin(Math.PI / 3)

    const points = [
      { x: centerX, y: centerY - height / 2 },  // Top
      { x: centerX - size / 2, y: centerY + height / 2 },  // Bottom Left
      { x: centerX + size / 2, y: centerY + height / 2 }   // Bottom Right
    ]

    const getColor = (value: string) => {
      switch (value) {
        case '-':
          return '#FF0000' // Red
        case '0':
          return '#FFA500' // Orange
        case '1':
          return '#00FF00' // Green
        default:
          return '#808080' // Gray for unknown values
      }
    }

    function addTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, depth: number, hashIndex: number) {
      if (depth === 0 || hashIndex >= hash.length) {
        const value = hash[hashIndex]
        const color = getColor(value)
        triangles.push(
          <path
            key={`${x1},${y1}-${x2},${y2}-${x3},${y3}`}
            d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`}
            fill={color}
          />
        )
        return
      }

      const x12 = (x1 + x2) / 2
      const y12 = (y1 + y2) / 2
      const x23 = (x2 + x3) / 2
      const y23 = (y2 + y3) / 2
      const x31 = (x3 + x1) / 2
      const y31 = (y3 + y1) / 2

      addTriangle(x1, y1, x12, y12, x31, y31, depth - 1, hashIndex * 3)
      addTriangle(x12, y12, x2, y2, x23, y23, depth - 1, hashIndex * 3 + 1)
      addTriangle(x31, y31, x23, y23, x3, y3, depth - 1, hashIndex * 3 + 2)
    }

    addTriangle(
      points[0].x, points[0].y,
      points[1].x, points[1].y,
      points[2].x, points[2].y,
      7,
      0
    )

    return triangles
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        className="w-full h-full bg-black rounded-lg"
      >
        {generateTriangles()}
      </svg>
      {hash && (
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={downloadSVG}>
            Download SVG
          </Button>
          <Button variant="outline" onClick={downloadPNG}>
            Download PNG
          </Button>
        </div>
      )}
    </div>
  )
}
