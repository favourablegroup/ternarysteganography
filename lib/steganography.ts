import { AudioContext } from 'standardized-audio-context'

type ProgressCallback = (progress: number) => void
type StageCallback = (stage: string) => void

export async function encryptAndEmbed(
  message: string,
  key: string,
  coverImage: File,
  onProgress: ProgressCallback,
  onStage: StageCallback
): Promise<{ encryptedText: string; stegoImage: string }> {
  try {
    // Step 1: Convert to ternary
    onStage('Converting to ternary')
    onProgress(10)
    const ternaryData = textToTernary(message)

    // Step 2: Apply ternary encryption
    onStage('Applying ternary encryption')
    onProgress(20)
    const encryptedTernary = ternaryData
      .split('')
      .map((bit, i) => {
        const keyBit = key[i % key.length]
        const keyValue = keyBit === '-' ? -1 : parseInt(keyBit)
        const bitValue = parseInt(bit)
        return ((bitValue + keyValue + 3) % 3).toString()
      })
      .join('')

    // Step 3: Prepare cover image
    onStage('Processing cover image')
    onProgress(40)
    const img = await createImageBitmap(coverImage)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Step 4: Embed data in image
    onStage('Embedding encrypted data')
    onProgress(60)
    const stegoImage = await embedDataInImage(imageData, encryptedTernary)

    // Step 5: Generate encrypted text format
    onStage('Generating encrypted format')
    onProgress(80)
    const encryptedText = `BEGIN_ENCRYPTED_DATA${encryptedTernary}END_ENCRYPTED_DATA`

    onStage('Encryption complete')
    onProgress(100)

    return {
      encryptedText,
      stegoImage
    }
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function extractAndDecrypt(
  encryptedData: string | File,
  key: string,
  onProgress: ProgressCallback,
  onStage: StageCallback
): Promise<string> {
  try {
    let extractedTernary: string;

    if (encryptedData instanceof File) {
      // Handle image file
      onStage('Reading encrypted image')
      onProgress(20)
      const img = await createImageBitmap(encryptedData)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get 2D context')

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      onStage('Extracting embedded data')
      onProgress(40)
      extractedTernary = await extractDataFromImage(imageData)
    } else {
      // Handle text-based encrypted data
      onStage('Extracting encrypted data')
      onProgress(20)
      const header = 'BEGIN_ENCRYPTED_DATA'
      const footer = 'END_ENCRYPTED_DATA'
      const start = encryptedData.indexOf(header) + header.length
      const end = encryptedData.indexOf(footer)
      extractedTernary = encryptedData.slice(start, end)
      onProgress(40)
    }

    // Validate hash key
    if (!isValidHashKey(key)) {
      throw new Error('Invalid hash key format')
    }

    onStage('Decrypting ternary data')
    onProgress(60)
    const decryptedTernary = extractedTernary
      .split('')
      .map((bit, i) => {
        const keyBit = key[i % key.length]
        const keyValue = keyBit === '-' ? -1 : parseInt(keyBit)
        const bitValue = parseInt(bit)
        return ((bitValue - keyValue + 3) % 3).toString()
      })
      .join('')

    onStage('Converting to text')
    onProgress(80)
    const decryptedText = ternaryToText(decryptedTernary)

    onStage('Decryption complete')
    onProgress(100)

    return decryptedText
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function textToTernary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(3).padStart(7, '0'))
    .join('')
}

function ternaryToText(ternary: string): string {
  const chars = []
  for (let i = 0; i < ternary.length; i += 7) {
    const chunk = ternary.substr(i, 7)
    if (chunk.length === 7) { // Only process complete chunks
      chars.push(String.fromCharCode(parseInt(chunk, 3)))
    }
  }
  return chars.join('')
}

async function embedDataInImage(imageData: ImageData, data: string): Promise<string> {
  const pixels = imageData.data
  
  // Embed data length first (in ternary)
  const lengthTernary = data.length.toString(3).padStart(32, '0')
  for (let i = 0; i < 32; i++) {
    const value = parseInt(lengthTernary[i])
    // Use 2 bits to store each ternary digit (00=0, 01=1, 10=2)
    pixels[i * 4] = (pixels[i * 4] & 0xFC) | (value & 0x03)
  }

  // Embed ternary data
  for (let i = 0; i < data.length; i++) {
    const pixelIndex = (i + 32) * 4
    const value = parseInt(data[i])
    // Store ternary value (0, 1, or 2) in 2 LSBs
    pixels[pixelIndex] = (pixels[pixelIndex] & 0xFC) | value
  }

  // Create canvas and get data URL
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')
  
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

async function extractDataFromImage(imageData: ImageData): Promise<string> {
  const pixels = imageData.data

  // Extract data length from ternary
  let lengthTernary = ''
  for (let i = 0; i < 32; i++) {
    lengthTernary += (pixels[i * 4] & 0x03).toString()
  }
  const dataLength = parseInt(lengthTernary, 3)

  // Extract ternary data
  let data = ''
  for (let i = 0; i < dataLength; i++) {
    const pixelIndex = (i + 32) * 4
    data += (pixels[pixelIndex] & 0x03).toString()
  }

  return data
}

export function isValidHashKey(key: string): boolean {
  if (!key) return false
  // Check if key contains only -1, 0, 1 (as '-', '0', '1')
  return /^[-01]+$/.test(key) && key.length === 2187
}

export function generateHashKey(input: string): string {
  return Array.from({ length: 2187 }, (_, i) => {
    const charCode = input.charCodeAt(i % input.length)
    const value = ((charCode + i) % 3) - 1
    return value === -1 ? '-' : value.toString()
  }).join('')
}

export function decryptHashKey(encryptedData: string, key: string): string {
  if (!isValidHashKey(key)) {
    throw new Error('Invalid hash key format')
  }

  try {
    const { metadata, content } = JSON.parse(encryptedData)
    const blockSize = metadata.blockSize || 16

    const decryptedBlocks = []
    for (let i = 0; i < content.length; i += blockSize) {
      const block = content.slice(i, i + blockSize)
      const decryptedBlock = block
        .split('')
        .map((char: string, j: number) => {
          const keyChar = key[(i + j) % key.length] === '-' ? -1 : parseInt(key[(i + j) % key.length])
          return String.fromCharCode((char.charCodeAt(0) - keyChar + 256) % 256)
        })
        .join('')
      decryptedBlocks.push(decryptedBlock)
    }

    const decrypted = decryptedBlocks.join('').replace(/\0+$/, '')
    return decodeURIComponent(decrypted)
  } catch (error) {
    throw new Error(`Hash key decryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export function encryptHashKey(text: string, key: string): string {
  if (!isValidHashKey(key)) {
    throw new Error('Invalid hash key format')
  }

  try {
    const metadata = {
      version: '1.0.0',
      blockSize: 16,
      originalLength: text.length,
      timestamp: Date.now()
    }

    const encodedInput = encodeURIComponent(text)
    const paddedInput = encodedInput.padEnd(Math.ceil(encodedInput.length / metadata.blockSize) * metadata.blockSize, '\0')

    const encryptedBlocks = []
    for (let i = 0; i < paddedInput.length; i += metadata.blockSize) {
      const block = paddedInput.slice(i, i + metadata.blockSize)
      const encryptedBlock = block
        .split('')
        .map((char, j) => {
          const keyChar = key[(i + j) % key.length] === '-' ? -1 : parseInt(key[(i + j) % key.length])
          return String.fromCharCode((char.charCodeAt(0) + keyChar + 256) % 256)
        })
        .join('')
      encryptedBlocks.push(encryptedBlock)
    }

    return JSON.stringify({
      metadata,
      content: encryptedBlocks.join('')
    })
  } catch (error) {
    throw new Error(`Hash key encryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
