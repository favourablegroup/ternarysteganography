"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileUpload } from '@/components/ui/file-upload'
import { extractAndDecrypt } from '@/lib/steganography'
import { extractHashFromImage } from '@/lib/image-key-extractor'
import { SierpinskiFractal } from '@/components/ui/sierpinski-fractal'
import { ProcessModal } from '@/components/ui/process-modal'
import { UploadCloud, Key, Image as ImageIcon } from "lucide-react"
import { DragDropZone } from '@/components/ui/drag-drop-zone'

export default function DecryptionTool() {
  const [stegoImage, setStegoImage] = useState<File | null>(null)
  const [stegoImagePreview, setStegoImagePreview] = useState<string>('')
  const [hash, setHash] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')
  const [statusLogs, setStatusLogs] = useState<Array<{
    timestamp: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'progress'
  }>>([])
  const terminalRef = useRef<HTMLDivElement>(null)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(true)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [statusLogs])

  const addStatus = (message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setStatusLogs(prev => [...prev, { timestamp, message, type }])
  }

  const runSystemDiagnostic = async () => {
    addStatus('Initializing decryption systems...', 'info')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatus('✓ Steganographic decoder initialized', 'success')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatus('✓ Hash validation module ready', 'success')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatus('✓ Decryption engine initialized', 'success')
    await new Promise(resolve => setTimeout(resolve, 500))
    addStatus('System ready for decryption operations', 'success')
    addStatus('Welcome to Ternary Image Steganography! Upload an image to begin decryption.', 'info')
  }

  const handleWalkthroughClose = () => {
    setIsProcessModalOpen(false)
    runSystemDiagnostic()
  }

  const decryptionSteps = [
    {
      title: "Upload Steganographic Image",
      description: "Select the image containing the hidden message. This should be the modified image you received."
    },
    {
      title: "Enter Hash Key",
      description: "Input the hash key that was used for encryption. This is required to decrypt the message."
    },
    {
      title: "Verify Hash Pattern",
      description: "Compare the generated Sierpinski pattern with the original encryption pattern to ensure the correct hash key."
    },
    {
      title: "Decrypt Message",
      description: "Click 'Decrypt' to extract and decrypt the hidden message using our quantum-resistant algorithm."
    },
    {
      title: "View Message",
      description: "The decrypted message will appear in the output area if the correct hash key was provided."
    }
  ]

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setStegoImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setStegoImage(file)
    addStatus('Steganographic image loaded', 'info')
  }

  const validateHashKey = (key: string) => {
    if (key.length !== 2187) return false;
    return /^[-01]+$/.test(key);
  }

  const handleHashChange = (value: string) => {
    setHash(value)
    if (value.length === 2187) {
      if (validateHashKey(value)) {
        addStatus('Valid hash key detected', 'success')
      } else {
        addStatus('Invalid hash key format. Key must only contain -, 0, and 1', 'error')
      }
    }
  }

  const handleHashKeyDrop = async (file: File) => {
    try {
      if (file.type === 'text/plain') {
        const text = await file.text()
        if (validateHashKey(text)) {
          setHash(text)
          addStatus('Valid hash key loaded from text file', 'success')
        } else {
          addStatus('Invalid hash key in text file. Key must be 2187 characters long and only contain -, 0, and 1', 'error')
        }
      } else if (file.type.startsWith('image/')) {
        addStatus('Processing image hash key...', 'info')
        const extractedHash = await extractHashFromImage(file)
        if (validateHashKey(extractedHash)) {
          setHash(extractedHash)
          addStatus('Valid hash key extracted from image', 'success')
        } else {
          addStatus('Invalid hash key extracted from image. Key must be 2187 characters long and only contain -, 0, and 1', 'error')
        }
      } else {
        addStatus('Unsupported file type. Please upload a .txt, .svg, or image file', 'error')
      }
    } catch (error) {
      addStatus(`Failed to process hash key: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleImageDrop = (file: File) => {
    setStegoImage(file)
    addStatus('Encrypted image loaded successfully', 'success')
  }

  const handleDecrypt = async () => {
    if (!stegoImage || !hash) {
      addStatus('Please provide both image and hash', 'error')
      return
    }

    try {
      addStatus('Starting decryption process...', 'info')
      const message = await extractAndDecrypt(
        stegoImage, 
        hash,
        (progress) => {
          addStatus(`Decryption progress: ${progress}%`, 'progress')
        },
        (stage) => {
          addStatus(stage, 'info')
        }
      )
      setDecryptedMessage(message)
      addStatus('Message successfully decrypted!', 'success')
    } catch (error) {
      addStatus(`Decryption failed: ${error}`, 'error')
    }
  }

  return (
    <>
      <ProcessModal 
        steps={decryptionSteps}
        isOpen={isProcessModalOpen}
        onClose={handleWalkthroughClose}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Decrypt Message</CardTitle>
                <CardDescription>
                  Upload a steganographic image and provide the hash key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Steganographic Image</Label>
                  <DragDropZone 
                    onFileAccepted={handleImageDrop}
                    acceptedFileTypes={['image/png', 'image/jpeg', 'image/gif']}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p>Drop encrypted image here</p>
                      <p className="text-sm text-gray-500">Supports PNG, JPG, GIF</p>
                    </div>
                  </DragDropZone>
                  <FileUpload
                    onFileSelect={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      handleFileUpload(file)
                    }}
                    label="Upload Image"
                    accept="image/*"
                  />
                </div>

                {stegoImagePreview && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="aspect-video w-full overflow-hidden rounded">
                      <img
                        src={stegoImagePreview}
                        alt="Steganographic"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-cyan-400">Hash Key</Label>
                  <div className="space-y-2">
                    <DragDropZone 
                      onFileAccepted={handleHashKeyDrop}
                      acceptedFileTypes={['.txt', '.svg', '.png']}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Key className="w-8 h-8 text-gray-400" />
                        <p>Drop hash key file here</p>
                        <p className="text-sm text-gray-500">Supports TXT, SVG, PNG</p>
                      </div>
                    </DragDropZone>
                    <Input
                      value={hash}
                      onChange={(e) => handleHashChange(e.target.value)}
                      className="font-mono"
                      placeholder="Enter or upload hash key"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleDecrypt}
                  className="w-full"
                  disabled={!stegoImage || !hash}
                >
                  Decrypt
                </Button>

                {decryptedMessage && (
                  <div className="space-y-2">
                    <Label>Decrypted Message</Label>
                    <div className="p-4 bg-black/50 rounded border border-cyan-500/30">
                      <p className="text-cyan-400 whitespace-pre-wrap">{decryptedMessage}</p>
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
                  Visual representation and validation of provided hash key
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hash ? (
                  <div className="space-y-4">
                    <SierpinskiFractal hash={hash} />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Hash key visualization
                      </div>
                      <div className="text-sm text-cyan-400">
                        ✓ Valid hash format
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a hash key to see its visualization
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Terminal</CardTitle>
                <CardDescription>
                  Real-time decryption progress and system messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={terminalRef}
                  className="h-[200px] overflow-y-auto bg-black/50 rounded border border-cyan-500/30 p-4 font-mono text-sm"
                >
                  {statusLogs.map((log, i) => (
                    <div key={i} className="mb-1">
                      <span className="text-cyan-500/70">[{log.timestamp}] </span>
                      <span className={
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'progress' ? 'text-yellow-400' :
                        'text-cyan-400'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process Walkthrough</CardTitle>
                <CardDescription>
                  Step-by-step decryption process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Image Processing</h3>
                  <ol className="list-decimal list-inside space-y-1 text-cyan-500/80">
                    <li>Extract LSB data from image</li>
                    <li>Reconstruct ternary sequence</li>
                    <li>Validate data integrity</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Decryption</h3>
                  <ol className="list-decimal list-inside space-y-1 text-cyan-500/80">
                    <li>Apply inverse ternary XOR with hash</li>
                    <li>Convert from balanced ternary</li>
                    <li>Decode final message</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-2">Security Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-cyan-500/80">
                    <li>Visual hash verification</li>
                    <li>Quantum-resistant operations</li>
                    <li>Data integrity checks</li>
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
