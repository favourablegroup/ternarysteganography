export async function textToAudio(text: string): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const sampleRate = audioContext.sampleRate
  const duration = 0.1 // Duration of each "trit" in seconds
  const buffer = audioContext.createBuffer(1, text.length * sampleRate * duration, sampleRate)
  const channelData = buffer.getChannelData(0)

  for (let i = 0; i < text.length; i++) {
    const trit = parseInt(text[i])
    const frequency = 440 * Math.pow(2, (trit - 1) / 12) // Map 0, 1, 2 to different frequencies
    for (let j = 0; j < sampleRate * duration; j++) {
      const t = j / sampleRate
      channelData[i * sampleRate * duration + j] = Math.sin(2 * Math.PI * frequency * t)
    }
  }

  return buffer
}

export async function audioToText(audioBuffer: AudioBuffer): Promise<string> {
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const duration = 0.1
  let text = ''

  for (let i = 0; i < audioBuffer.length; i += sampleRate * duration) {
    const slice = channelData.slice(i, i + sampleRate * duration)
    const frequency = detectFrequency(slice, sampleRate)
    const trit = Math.round(12 * Math.log2(frequency / 440)) + 1
    text += trit.toString()
  }

  return text
}

function detectFrequency(buffer: Float32Array, sampleRate: number): number {
  const fft = new FFT(buffer.length, sampleRate)
  const spectrum = fft.forward(buffer)
  const max = Math.max(...spectrum)
  const index = spectrum.indexOf(max)
  return index * sampleRate / buffer.length
}

// Simple FFT implementation (you might want to use a more optimized library in production)
class FFT {
  size: number
  sampleRate: number

  constructor(size: number, sampleRate: number) {
    this.size = size
    this.sampleRate = sampleRate
  }

  forward(buffer: Float32Array): number[] {
    const real = new Float32Array(this.size)
    const imag = new Float32Array(this.size)
    for (let i = 0; i < this.size; i++) {
      real[i] = buffer[i]
    }
    this.transform(real, imag)
    const magnitudes = new Array(this.size / 2)
    for (let i = 0; i < this.size / 2; i++) {
      magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i])
    }
    return magnitudes
  }

  transform(real: Float32Array, imag: Float32Array) {
    // Cooley-Tukey FFT algorithm
    const n = real.length
    if (n <= 1) return

    const halfN = n / 2
    const evenReal = new Float32Array(halfN)
    const evenImag = new Float32Array(halfN)
    const oddReal = new Float32Array(halfN)
    const oddImag = new Float32Array(halfN)

    for (let i = 0; i < halfN; i++) {
      evenReal[i] = real[2 * i]
      evenImag[i] = imag[2 * i]
      oddReal[i] = real[2 * i + 1]
      oddImag[i] = imag[2 * i + 1]
    }

    this.transform(evenReal, evenImag)
    this.transform(oddReal, oddImag)

    for (let k = 0; k < halfN; k++) {
      const theta = -2 * Math.PI * k / n
      const re = Math.cos(theta)
      const im = Math.sin(theta)
      const tpre = oddReal[k] * re - oddImag[k] * im
      const tpim = oddReal[k] * im + oddImag[k] * re
      real[k] = evenReal[k] + tpre
      imag[k] = evenImag[k] + tpim
      real[k + halfN] = evenReal[k] - tpre
      imag[k + halfN] = evenImag[k] - tpim
    }
  }
}

