'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseVoiceRecognitionOptions {
  continuous?: boolean
  language?: string
  onTranscript?: (text: string) => void
  onError?: (error: Error) => void
}

interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    continuous = false,
    language = 'fr-FR',
    onTranscript,
    onError,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = continuous
        recognition.interimResults = true
        recognition.lang = language
        recognition.maxAlternatives = 1

        recognition.onresult = (event: any) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcriptPart + ' '
            } else {
              interim += transcriptPart
            }
          }

          if (interim) {
            setInterimTranscript(interim)
          }

          if (final) {
            const newTranscript = transcript + final
            setTranscript(newTranscript)
            setInterimTranscript('')
            if (onTranscript) {
              onTranscript(newTranscript.trim())
            }
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (onError) {
            onError(new Error(event.error))
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, language, onTranscript, onError, transcript])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  }
}
