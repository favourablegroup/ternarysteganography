"use client"

import { ChangeEvent, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  label: string
}

export function FileUpload({ onFileSelect, accept = "image/*", label }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload" className="text-cyan-400">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500 border border-cyan-500/30"
        >
          <Upload className="w-4 h-4 mr-2" />
          {fileName || 'Choose File'}
        </Button>
      </div>
    </div>
  )
}

