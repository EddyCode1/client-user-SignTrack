import { RECOGNITION_URL } from '../config/env'

export const recognitionClient = {
  predictLetter: async (formData) => {
    const response = await fetch(`${RECOGNITION_URL}/predict-letter`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  translate: async (text) => {
    const response = await fetch(`${RECOGNITION_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return response.json()
  },

  textToSign: async (text) => {
    const response = await fetch(`${RECOGNITION_URL}/text-to-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return response.json()
  },

  health: async () => {
    const response = await fetch(`${RECOGNITION_URL}/health`)
    return response.json()
  },
}
