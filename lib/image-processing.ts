export async function embedAudioInImage(coverImage: File, audioData: AudioBuffer): Promise<string> {
  const img = await createImageBitmap(coverImage)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  const audioArray = new Float32Array(audioData.length)
  audioData.copyFromChannel(audioArray, 0)

  // Embed audio data in the least significant bits of the image
  for (let i = 0; i < audioArray.length; i++) {
    const audioSample = Math.floor((audioArray[i] + 1) * 127.5) // Convert -1 to 1 range to 0 to 255
    pixels[i * 4] = (pixels[i * 4] & 0xFC) | (audioSample >> 6) // Red channel
    pixels[i * 4 + 1] = (pixels[i * 4 + 1] & 0xFC) | ((audioSample >> 4) & 0x03) // Green channel
    pixels[i * 4 + 2] = (pixels[i * 4 + 2] & 0xFC) | ((audioSample >> 2) & 0x03) // Blue channel
    pixels[i * 4 + 3] = (pixels[i * 4 + 3] & 0xFC) | (audioSample & 0x03) // Alpha channel
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

export async function extractAudioFromImage(stegoImage: string): Promise<AudioBuffer> {
  const img = await createImageBitmap(await (await fetch(stegoImage)).blob())
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const audioBuffer = audioContext.createBuffer(1, pixels.length / 4, audioContext.sampleRate)
  const channelData = audioBuffer.getChannelData(0)

  for (let i = 0; i < channelData.length; i++) {
    const r = pixels[i * 4] & 0x03
    const g = pixels[i * 4 + 1] & 0x03
    const b = pixels[i * 4 + 2] & 0x03
    const a = pixels[i * 4 + 3] & 0x03
    const sample = (r << 6) | (g << 4) | (b << 2) | a
    channelData[i] = (sample / 127.5) - 1 // Convert 0 to 255 range back to -1 to 1
  }

  return audioBuffer
}

