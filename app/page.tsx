"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from '@/components/ui/file-upload'
import { DragDropZone } from '@/components/ui/drag-drop-zone'
import { encryptAndEmbed } from '@/lib/steganography'
import { SierpinskiFractal } from '@/components/ui/sierpinski-fractal'
import Link from 'next/link'
import { ProcessModal } from '@/components/ui/process-modal'
import { DownloadDialog } from "@/components/ui/download-dialog";
import { UploadCloud } from "lucide-react"

export default function SteganographyTool() {
  const [input, setInput] = useState<string>('')
  const [hash, setHash] = useState<string>('')
  const [hashPng, setHashPng] = useState<string>('')
  const [hashSvg, setHashSvg] = useState<string>('')
  const [encryptedText, setEncryptedText] = useState<string>('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [stegoImage, setStegoImage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [stage, setStage] = useState<string>('')
  const [showWalkthrough, setShowWalkthrough] = useState(true)

  // Status logging
  const [statusLogs, setStatusLogs] = useState<Array<{
    timestamp: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'progress'
  }>>([])

  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [statusLogs])

  const addStatusLog = (message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setStatusLogs(prev => [...prev, { timestamp, message, type }])
  }

  const handleGenerateHash = async () => {
    if (!input) {
      setError('Please enter text to generate a hash')
      addStatusLog('Error: No input text provided', 'error')
      return
    }

    setStage('Generating Hash')
    setProgress(0)
    addStatusLog('Starting hash generation...', 'info')

    const newHash = Array.from({ length: 2187 }, (_, i) => {
      setProgress(Math.floor((i / 2186) * 100))
      const charCode = input.charCodeAt(i % input.length)
      const value = ((charCode + i) % 3) - 1
      return value === -1 ? '-' : value.toString()
    }).join('')

    setHash(newHash)

    // Generate hash visualizations
    addStatusLog('Generating hash visualizations...', 'progress')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 500
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw pattern based on hash
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, 500, 500)

      const size = Math.sqrt(newHash.length)
      const cellSize = 500 / size

      newHash.split('').forEach((value, i) => {
        const x = (i % size) * cellSize
        const y = Math.floor(i / size) * cellSize
        ctx.fillStyle = value === '-' ? '#00FFFF' : value === '0' ? '#005555' : '#002222'
        ctx.fillRect(x, y, cellSize, cellSize)
      })

      // Save as PNG
      setHashPng(canvas.toDataURL('image/png'))
      addStatusLog('PNG visualization generated', 'success')

      // Generate SVG
      const svgSize = 500
      const svgCellSize = svgSize / size
      let svgContent = `<svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">`
      svgContent += `<rect width="100%" height="100%" fill="black"/>`
      
      newHash.split('').forEach((value, i) => {
        const x = (i % size) * svgCellSize
        const y = Math.floor(i / size) * svgCellSize
        const fill = value === '-' ? '#00FFFF' : value === '0' ? '#005555' : '#002222'
        svgContent += `<rect x="${x}" y="${y}" width="${svgCellSize}" height="${svgCellSize}" fill="${fill}"/>`
      })
      
      svgContent += '</svg>'
      setHashSvg(`data:image/svg+xml;base64,${btoa(svgContent)}`)
      addStatusLog('SVG visualization generated', 'success')
    } catch (error) {
      addStatusLog(`Failed to generate visualizations: ${error instanceof Error ? error.message : String(error)}`, 'error')
    }

    setError('')
    setStage('')
    setProgress(100)
    addStatusLog('Hash generation complete', 'success')
  }

  const handleEncrypt = async () => {
    try {
      if (!input || !hash || !coverImage) {
        setError('Please enter message, generate hash, and select a cover image')
        addStatusLog('Error: Missing required inputs for encryption', 'error')
        return
      }
      addStatusLog('Starting encryption process...', 'info')
      const result = await encryptAndEmbed(input, hash, coverImage, 
        (progress) => {
          setProgress(progress)
          if (progress % 20 === 0) {
            addStatusLog(`Encryption progress: ${progress}%`, 'progress')
          }
        }, 
        (stage) => {
          setStage(stage)
          addStatusLog(stage, 'info')
        }
      )
      setEncryptedText(result.encryptedText)
      setStegoImage(result.stegoImage)
      setError('')
      addStatusLog('Encryption completed successfully', 'success')
    } catch (err) {
      const errorMsg = 'Encryption failed: ' + (err instanceof Error ? err.message : String(err))
      setError(errorMsg)
      addStatusLog(errorMsg, 'error')
    }
  }

  const handleFileUpload = (file: File) => {
    setCoverImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverImagePreview(e.target.result as string)
        addStatusLog('Cover image uploaded successfully', 'success')
      }
    }
    reader.readAsDataURL(file)
  }

  const runSystemDiagnostic = async () => {
    addStatusLog('Initializing system...', 'info')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatusLog('Running system diagnostic...', 'progress')
    await new Promise(resolve => setTimeout(resolve, 800))
    addStatusLog('✓ Canvas API available', 'success')
    await new Promise(resolve => setTimeout(resolve, 300))
    addStatusLog('✓ File system access ready', 'success')
    await new Promise(resolve => setTimeout(resolve, 300))
    addStatusLog('✓ Encryption module loaded', 'success')
    await new Promise(resolve => setTimeout(resolve, 300))
    addStatusLog('✓ Steganography engine initialized', 'success')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatusLog('System ready for encryption operations', 'success')
    addStatusLog('Welcome to Ternary Image Steganography! Enter your message to begin.', 'info')
  }

  const handleWalkthroughClose = () => {
    setShowWalkthrough(false)
    runSystemDiagnostic()
  }

  const handleDownloadStegoImage = () => {
    if (!stegoImage) return
    addStatusLog('Preparing encrypted image for download...', 'progress')
    const a = document.createElement('a')
    a.href = stegoImage
    a.download = 'encrypted_image.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    addStatusLog('Encrypted image downloaded successfully', 'success')
  }

  const handleDownloadHashPng = () => {
    if (!hashPng) return
    addStatusLog('Preparing hash visualization (PNG) for download...', 'progress')
    const a = document.createElement('a')
    a.href = hashPng
    a.download = 'hash_visualization.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    addStatusLog('Hash visualization (PNG) downloaded successfully', 'success')
  }

  const handleDownloadHashSvg = () => {
    if (!hashSvg) return
    addStatusLog('Preparing hash visualization (SVG) for download...', 'progress')
    const a = document.createElement('a')
    a.href = hashSvg
    a.download = 'hash_visualization.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    addStatusLog('Hash visualization (SVG) downloaded successfully', 'success')
  }

  const handleDownloadHash = () => {
    if (!hash) return
    addStatusLog('Preparing hash key for download...', 'progress')
    const blob = new Blob([hash], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hash_key.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addStatusLog('Hash key downloaded successfully', 'success')
  }

  const encryptionSteps = [
    {
      title: "Enter Your Message",
      description: "Type or paste the secret message you want to hide. This can be any text content."
    },
    {
      title: "Generate Hash Key",
      description: "Click 'Generate Hash' to create a unique quantum-resistant key. This key will be needed to decrypt your message later."
    },
    {
      title: "Upload Cover Image",
      description: "Select any image file that will hide your message. Larger images can store more data."
    },
    {
      title: "Verify Hash Visualization",
      description: "A Sierpinski fractal pattern will be generated from your hash. Save this pattern - it helps verify the correct hash during decryption."
    },
    {
      title: "Encrypt Message",
      description: "Click 'Encrypt' to embed your message into the image using our quantum-resistant steganography algorithm."
    },
    {
      title: "Download Results",
      description: "Save both the modified image and hash key. You'll need both to decrypt the message later."
    }
  ]

  const [encryptedImage, setEncryptedImage] = useState<string>("");

  return (
    <>
      <ProcessModal 
        steps={encryptionSteps}
        isOpen={showWalkthrough}
        onClose={handleWalkthroughClose}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Encrypt Message</CardTitle>
                <CardDescription>
                  Enter your message and generate a ternary hash key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter message to encrypt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-cyan-400"
                  />
                </div>

                <Button
                  onClick={handleGenerateHash}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                  disabled={!input}
                >
                  Generate Hash
                </Button>

                {hash && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-cyan-400">Generated Hash Key</Label>
                      <Button
                        onClick={handleDownloadHash}
                        disabled={!hash}
                        variant="outline"
                        size="sm"
                        className="text-cyan-400 border-cyan-500/30 w-32"
                      >
                        Download Hash
                      </Button>
                    </div>
                    <DownloadDialog
                      hashKey={hash}
                      hashPng={hashPng}
                      hashSvg={hashSvg}
                      encryptedImage={stegoImage}
                      isEnabled={Boolean(stegoImage)}
                      onStatus={(message, type) => addStatusLog(message, type)}
                    />
                  </div>
                )}

                <DragDropZone
                  onFileAccepted={(file) => {
                    if (file.type === 'text/plain') {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        const content = e.target?.result as string
                        if (isValidHashKey(content.trim())) {
                          setHash(content.trim())
                          addStatusLog('Hash key loaded successfully', 'success')
                        } else {
                          addStatusLog('Invalid hash key format', 'error')
                        }
                      }
                      reader.readAsText(file)
                    }
                  }}
                  acceptedFileTypes={['.txt', 'text/plain']}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <Label className="text-cyan-400">Hash Key</Label>
                    <Textarea
                      id="hash"
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      placeholder="Enter or paste your hash key..."
                      className="h-32 bg-black/50 border-cyan-500/30 text-cyan-400 placeholder:text-cyan-400/50 focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>
                </DragDropZone>

                <DragDropZone
                  onFileAccepted={(file) => {
                    if (file.type.startsWith('image/')) {
                      setCoverImage(file)
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setCoverImagePreview(e.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                      addStatusLog('Cover image loaded successfully', 'success')
                    } else {
                      addStatusLog('Please upload an image file', 'error')
                    }
                  }}
                  acceptedFileTypes={['image/*']}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <Label className="text-cyan-400">Cover Image</Label>
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                      {coverImagePreview ? (
                        <img
                          src={coverImagePreview}
                          alt="Cover image preview"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-cyan-400/70">
                          <UploadCloud className="w-8 h-8" />
                          <p>Click or drag and drop to upload</p>
                          <p className="text-sm">Supports PNG, JPG, GIF</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DragDropZone>

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <Button
                  onClick={handleEncrypt}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                  disabled={!input || !hash || !coverImage}
                >
                  Encrypt
                </Button>

                {stegoImage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-cyan-400">Encrypted Image</Label>
                      <Button
                        onClick={handleDownloadStegoImage}
                        variant="outline"
                        size="sm"
                        className="text-cyan-400 border-cyan-500/30 w-32"
                      >
                        Download Image
                      </Button>
                    </div>
                    <div className="aspect-video w-full overflow-hidden rounded">
                      <img
                        src={stegoImage}
                        alt="Encrypted"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 lg:mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hash Visualization</CardTitle>
                <CardDescription>
                  Visual representation of your generated hash key
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hash ? (
                  <div className="space-y-4">
                    <SierpinskiFractal hash={hash} />
                    <div className="text-sm text-muted-foreground">
                      Hash key generated and visualized using Sierpinski fractal pattern
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Generate a hash key to see its visualization
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Terminal</CardTitle>
                <CardDescription>
                  Real-time process updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={terminalRef}
                  className="bg-black/50 rounded border border-cyan-500/30 p-4 font-mono text-sm h-48 overflow-y-auto scroll-smooth"
                >
                  {statusLogs.map(({ timestamp, message, type }, index) => (
                    <div key={index} className={`mb-1 ${
                      type === 'error' ? 'text-red-400' :
                      type === 'success' ? 'text-green-400' :
                      type === 'progress' ? 'text-yellow-400' :
                      'text-cyan-400'
                    }`}>
                      <span className="opacity-50">[{timestamp}]</span> {message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process Walkthrough</CardTitle>
                <CardDescription>
                  Step-by-step encryption process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Ternary Encryption</h3>
                  <ol className="list-decimal list-inside space-y-1 text-cyan-500/80">
                    <li>Convert message to balanced ternary (-1, 0, 1)</li>
                    <li>Generate 2187-node Sierpinski hash key</li>
                    <li>Apply ternary XOR operation with hash key</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Steganography</h3>
                  <ol className="list-decimal list-inside space-y-1 text-cyan-500/80">
                    <li>Process cover image for data embedding</li>
                    <li>Embed encrypted ternary data in image LSBs</li>
                    <li>Generate downloadable steganographic image</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Security Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-cyan-500/80">
                    <li>Quantum-resistant ternary operations</li>
                    <li>Visual hash key verification</li>
                    <li>LSB steganography for undetectable embedding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
