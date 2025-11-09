'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateSessionSummary } from '@/lib/gemini/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Download, FileText, Loader2, TrendingUp, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDuration, getInitials, getCategoryColor, getSentimentColor } from '@/lib/utils'
import type { Session, Student, Observation } from '@/types'

export default function SessionSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [aiSummary, setAiSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generatingSummary, setGeneratingSummary] = useState(false)

  useEffect(() => {
    loadSessionData()
  }, [sessionId])

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

      if (studentsError) throw studentsError
      setStudents(studentsData || [])

      // Load observations
      const { data: observationsData, error: observationsError } = await supabase
        .from('observations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp')

      if (observationsError) throw observationsError
      setObservations(observationsData || [])

      // Load AI summary if exists
      if (sessionData.ai_summary) {
        setAiSummary(sessionData.ai_summary)
      }
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    try {
      const summary = await generateSessionSummary(observations, students)
      setAiSummary(summary)

      // Save to database
      const supabase = createClient()
      await supabase
        .from('sessions')
        .update({ ai_summary: summary })
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-${session?.sport}-${session?.date}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Erreur lors de l\'export PDF')
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-${sessionId}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Erreur lors de l\'export Excel')
    }
  }

  const getSessionStats = () => {
    const duration = session?.end_time
      ? Math.floor(
          (new Date(session.end_time).getTime() -
            new Date(session.start_time).getTime()) /
            1000
        )
      : 0

    const byCategory = observations.reduce((acc, obs) => {
      if (obs.category) {
        acc[obs.category] = (acc[obs.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const bySentiment = observations.reduce((acc, obs) => {
      if (obs.sentiment) {
        acc[obs.sentiment] = (acc[obs.sentiment] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const studentsWithObs = new Set(
      observations.filter((o) => o.student_id).map((o) => o.student_id)
    ).size

    return {
      duration,
      totalObservations: observations.length,
      studentsWithObs,
      byCategory,
      bySentiment,
    }
  }

  const getStudentObservations = (studentId: string) => {
    return observations.filter((obs) => obs.student_id === studentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session non trouvée</p>
      </div>
    )
  }

  const stats = getSessionStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sessions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{session.sport}</h1>
          <p className="text-muted-foreground">
            {session.class?.name} • {formatDate(session.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.duration)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalObservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Élèves observés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.studentsWithObs}/{students.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sentiment général
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {stats.bySentiment.positive && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  😊 {stats.bySentiment.positive}
                </Badge>
              )}
              {stats.bySentiment.neutral && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  😐 {stats.bySentiment.neutral}
                </Badge>
              )}
              {stats.bySentiment.negative && (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  😟 {stats.bySentiment.negative}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Résumé IA de la session
              </CardTitle>
              <CardDescription>
                Analyse automatique générée par l'intelligence artificielle
              </CardDescription>
            </div>
            {!aiSummary && (
              <Button onClick={handleGenerateSummary} disabled={generatingSummary}>
                {generatingSummary ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer le résumé
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {aiSummary ? (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{aiSummary}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Cliquez sur &quot;Générer le résumé&quot; pour obtenir une analyse IA</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Distribution */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Répartition par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`${getCategoryColor(category)} text-base py-2 px-4`}
                >
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Observations par élève
          </CardTitle>
          <CardDescription>
            Détail des observations pour chaque élève
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => {
              const studentObs = getStudentObservations(student.id)
              if (studentObs.length === 0) return null

              return (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(student.first_name, student.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {studentObs.length} observation{studentObs.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {studentObs.map((obs) => (
                      <div key={obs.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm flex-1">
                            {obs.processed_text || obs.raw_text}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(obs.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
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
                          {obs.keywords?.slice(0, 3).map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Notes */}
      {session.general_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes générales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{session.general_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
