import * as React from "react"
import { Button } from "./button"

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  variant?: "default" | "outline"
}

export function FileUpload({
  onFileSelect,
  label,
  variant = "default",
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        type="file"
        onChange={onFileSelect}
        className="hidden"
        ref={inputRef}
        {...props}
      />
      <Button
        type="button"
        variant={variant}
        onClick={() => inputRef.current?.click()}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
      >
        {label}
      </Button>
    </div>
  )
}
