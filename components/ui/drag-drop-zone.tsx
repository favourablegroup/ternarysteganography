"use client"

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface DragDropZoneProps {
  onFileAccepted: (file: File) => void
  acceptedFileTypes?: string[]
  className?: string
  children: React.ReactNode
}

export function DragDropZone({
  onFileAccepted,
  acceptedFileTypes = ['*'],
  className,
  children
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const file = files[0]
    if (acceptedFileTypes[0] === '*' || acceptedFileTypes.some(type => file.type.includes(type.replace('*', '')))) {
      onFileAccepted(file)
    }
  }, [onFileAccepted, acceptedFileTypes])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-lg transition-colors',
        isDragging && 'bg-cyan-500/10 border-cyan-500',
        className
      )}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
          <p className="text-cyan-400 text-lg font-semibold">Drop file here</p>
        </div>
      )}
      {children}
    </div>
  )
}
