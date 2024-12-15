export async function extractHashFromImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let hash = ''

      // Process pixels in groups of 4 (RGBA)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Red indicates '-'
        if (r > 200 && g < 100 && b < 100) {
          hash += '-'
        }
        // Orange indicates '0'
        else if (r > 200 && g > 150 && b < 100) {
          hash += '0'
        }
        // Green indicates '1'
        else if (r < 100 && g > 200 && b < 100) {
          hash += '1'
        }
      }

      // Clean up the hash by removing any non-ternary characters
      const cleanHash = hash.replace(/[^-01]/g, '')
      
      if (cleanHash.length === 0) {
        reject(new Error('No valid hash key found in image'))
        return
      }

      resolve(cleanHash)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.readAsDataURL(file)
  })
}
