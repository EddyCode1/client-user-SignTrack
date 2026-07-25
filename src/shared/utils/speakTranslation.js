export const speakTranslation = (text, lang = 'es') => {
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech synthesis no disponible
  }
}
