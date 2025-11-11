'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'
import type { Session } from '@/types'

type SessionWithClass = Session & {
  class?: { name: string; level: string } | null
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          class:classes(name, level)
        `)
        .order('date', { ascending: false })
        .limit(20)

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      in_progress: { variant: 'default', label: 'En cours' },
      completed: { variant: 'secondary', label: 'Terminée' },
      cancelled: { variant: 'destructive', label: 'Annulée' },
    }
    const config = variants[status] || variants.completed
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Historique de vos sessions d&apos;EPS
          </p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle session
          </Button>
        </Link>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune session</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par créer votre première session
            </p>
            <Link href="/sessions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une session
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{session.sport}</CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <CardDescription>
                      {session.class?.name} • {formatDate(session.date)}
                    </CardDescription>
                  </div>
                  <Link href={`/sessions/${session.id}/summary`}>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(session.start_time).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {session.end_time && (
                        <> - {new Date(session.end_time).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</>
                      )}
                    </span>
                  </div>
                  {session.location && (
                    <div className="flex items-center gap-2">
                      <span>📍 {session.location}</span>
                    </div>
                  )}
                  {session.weather && (
                    <div className="flex items-center gap-2">
                      <span>🌤️ {session.weather}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
