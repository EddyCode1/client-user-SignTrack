import { recognitionClient } from '../recognitionClient'

export const translateSignLanguage = async (videoUri) => {
  try {
    const response = await fetch(videoUri)
    const blob = await response.blob()
    const result = await recognitionClient.translateSign(blob)
    return result
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const textToSignLanguage = async (text) => {
  try {
    const result = await recognitionClient.textToSign(text)
    return result
  } catch (error) {
    return { success: false, error: error.message }
  }
}
