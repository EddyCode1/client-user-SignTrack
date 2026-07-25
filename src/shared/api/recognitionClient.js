const RECOGNITION_BASE = '/api/v1/recognition'

export const recognitionClient = {
  translateSign: async (videoBlob) => {
    const formData = new FormData()
    formData.append('video', videoBlob)
    const response = await fetch(`${RECOGNITION_BASE}/translate`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  textToSign: async (text) => {
    const response = await fetch(`${RECOGNITION_BASE}/text-to-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return response.json()
  },
}
