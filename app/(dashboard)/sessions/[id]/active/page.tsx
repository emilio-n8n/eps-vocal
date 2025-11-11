'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition'
import { processObservation } from '@/lib/gemini/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mic, MicOff, Square, Clock, Users, AlertCircle } from 'lucide-react'
import { getInitials, getCategoryColor, getSentimentColor, formatElapsedTime } from '@/lib/utils'
import type { Session, Student, Observation } from '@/types'

type SessionWithClass = Session & {
  class?: { name: string; level: string } | null
}

export default function ActiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<SessionWithClass | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [processingAI, setProcessingAI] = useState(false)

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition()

  useEffect(() => {
    loadSessionData()
    subscribeToObservations()
  }, [sessionId])

  // Timer
  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      const start = new Date(session.start_time).getTime()
      const now = Date.now()
      setElapsedTime(Math.floor((now - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [session])

  // Process transcript when it changes
  useEffect(() => {
    if (transcript && !isListening) {
      handleTranscriptComplete(transcript)
      resetTranscript()
    }
  }, [transcript, isListening])

  const loadSessionData = async () => {
    try {
      const supabase = createClient()
      
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*, class:classes(name, level)')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      setSession(sessionData)

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', sessionData.class_id)
        .order('last_name')

      if (studentsError) throw studentsError
      setStudents(studentsData || [])

      // Load observations
      const { data: observationsData, error: observationsError } = await supabase
        .from('observations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })

      if (observationsError) throw observationsError
      setObservations(observationsData || [])
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToObservations = () => {
    const supabase = createClient()
    const channel = supabase
      .channel('observations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'observations',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          loadSessionData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleTranscriptComplete = async (text: string) => {
    if (!text.trim()) return

    setProcessingAI(true)
    try {
      const supabase = createClient()

      // Save raw observation first
      const { data: rawObs, error: insertError } = await supabase
        .from('observations')
        .insert({
          session_id: sessionId,
          raw_text: text,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Process with AI
      const processed = await processObservation(text, students, session?.sport || '')

      // Update observation with AI results
      const { error: updateError } = await supabase
        .from('observations')
        .update({
          student_id: processed.studentId,
          processed_text: processed.processedText,
          category: processed.category,
          sentiment: processed.sentiment,
          keywords: processed.keywords,
        })
        .eq('id', rawObs.id)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error processing observation:', error)
    } finally {
      setProcessingAI(false)
    }
  }

  const handleEndSession = async () => {
    if (!confirm('Êtes-vous sûr de vouloir terminer cette session ?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', sessionId)

      if (error) throw error
      router.push(`/sessions/${sessionId}/summary`)
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const getStudentObservations = (studentId: string) => {
    return observations.filter((obs) => obs.student_id === studentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg">Session non trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{session.sport}</h1>
            <p className="text-muted-foreground">
              {session.class?.name} • Session en cours
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>
            <Button variant="destructive" onClick={handleEndSession}>
              <Square className="mr-2 h-4 w-4" />
              Terminer la session
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Students Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Élèves ({students.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {students.map((student) => {
              const studentObs = getStudentObservations(student.id)
              const lastObs = studentObs[0]
              
              return (
                <Card
                  key={student.id}
                  className={`hover:shadow-lg transition-shadow ${
                    lastObs ? 'border-primary' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {getInitials(student.first_name, student.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {studentObs.length} observation{studentObs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {lastObs && (
                        <div className="flex gap-1">
                          {lastObs.category && (
                            <Badge
                              variant="outline"
                              className={getCategoryColor(lastObs.category)}
                            >
                              {lastObs.category}
                            </Badge>
                          )}
                          {lastObs.sentiment && (
                            <Badge
                              variant="outline"
                              className={getSentimentColor(lastObs.sentiment)}
                            >
                              {lastObs.sentiment === 'positive' ? '😊' : lastObs.sentiment === 'negative' ? '😟' : '😐'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Observations Panel */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Observations en temps réel</h2>
            <p className="text-sm text-muted-foreground">
              {observations.length} observation{observations.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Voice Control */}
          <div className="p-4 border-b bg-gray-50">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`w-full h-16 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-primary'
              }`}
              size="lg"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-6 w-6" />
                  Arrêter l&apos;enregistrement
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-6 w-6" />
                  Commencer à parler
                </>
              )}
            </Button>

            {(isListening || interimTranscript) && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">
                  {isListening ? '🎤 En écoute...' : 'Traitement...'}
                </p>
                <p className="text-sm">
                  {interimTranscript || transcript || 'Parlez maintenant...'}
                </p>
              </div>
            )}

            {processingAI && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-600 text-center">
                🤖 Traitement IA en cours...
              </div>
            )}
          </div>

          {/* Observations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {observations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune observation pour le moment</p>
                <p className="text-sm">Cliquez sur le micro pour commencer</p>
              </div>
            ) : (
              observations.map((obs) => {
                const student = students.find((s) => s.id === obs.student_id)
                return (
                  <Card key={obs.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        {student && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(student.first_name, student.last_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {student
                              ? `${student.first_name} ${student.last_name}`
                              : 'Élève non identifié'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(obs.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">
                        {obs.processed_text || obs.raw_text}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {obs.category && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(obs.category)}`}
                          >
                            {obs.category}
                          </Badge>
                        )}
                        {obs.sentiment && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSentimentColor(obs.sentiment)}`}
                          >
                            {obs.sentiment}
                          </Badge>
                        )}
                        {obs.keywords?.slice(0, 2).map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
