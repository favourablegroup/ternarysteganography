// This is a simplified implementation for demonstration purposes
// In a real-world scenario, you'd use a more robust ternary encryption algorithm

function stringToTernary(str: string): string {
  return str.split('').map(char => char.charCodeAt(0).toString(3).padStart(7, '0')).join('')
}

function ternaryToString(ternary: string): string {
  const chars = []
  for (let i = 0; i < ternary.length; i += 7) {
    chars.push(String.fromCharCode(parseInt(ternary.substr(i, 7), 3)))
  }
  return chars.join('')
}

export function encryptTernary(message: string, key: string): string {
  const ternaryMessage = stringToTernary(message)
  const ternaryKey = stringToTernary(key)
  let encrypted = ''

  for (let i = 0; i < ternaryMessage.length; i++) {
    const messageDigit = parseInt(ternaryMessage[i])
    const keyDigit = parseInt(ternaryKey[i % ternaryKey.length])
    encrypted += ((messageDigit + keyDigit) % 3).toString()
  }

  return encrypted
}

export function decryptTernary(encryptedTernary: string, key: string): string {
  const ternaryKey = stringToTernary(key)
  let decrypted = ''

  for (let i = 0; i < encryptedTernary.length; i++) {
    const encryptedDigit = parseInt(encryptedTernary[i])
    const keyDigit = parseInt(ternaryKey[i % ternaryKey.length])
    decrypted += ((encryptedDigit - keyDigit + 3) % 3).toString()
  }

  return ternaryToString(decrypted)
}

