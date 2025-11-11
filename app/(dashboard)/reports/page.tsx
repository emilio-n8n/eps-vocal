'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react'
import type { Class, Session } from '@/types'

type SessionWithClass = Session & {
  class?: { name: string } | null
}

export default function ReportsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [sessions, setSessions] = useState<SessionWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [filters, setFilters] = useState({
    classId: '',
    startDate: '',
    endDate: '',
    reportType: 'session',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Load classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('name')

      setClasses(classesData || [])

      // Load sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*, class:classes(name)')
        .order('date', { ascending: false })

      setSessions(sessionsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: filters.classId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateExcel = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: filters.classId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Erreur lors de la génération du fichier Excel')
    } finally {
      setGenerating(false)
    }
  }

  const getStats = () => {
    let filteredSessions = sessions

    if (filters.classId) {
      filteredSessions = filteredSessions.filter((s) => s.class_id === filters.classId)
    }

    if (filters.startDate) {
      filteredSessions = filteredSessions.filter(
        (s) => new Date(s.date) >= new Date(filters.startDate)
      )
    }

    if (filters.endDate) {
      filteredSessions = filteredSessions.filter(
        (s) => new Date(s.date) <= new Date(filters.endDate)
      )
    }

    return {
      totalSessions: filteredSessions.length,
      completedSessions: filteredSessions.filter((s) => s.status === 'completed').length,
      totalClasses: new Set(filteredSessions.map((s) => s.class_id)).size,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Rapports et Exports</h1>
        <p className="text-muted-foreground mt-1">
          Générez des rapports personnalisés et exportez vos données
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSessions} terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Dans la période</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total période</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Personnalisez votre rapport en sélectionnant les critères
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classId">Classe</Label>
              <select
                id="classId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              >
                <option value="">Toutes les classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.level}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Type de rapport</Label>
              <select
                id="reportType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
              >
                <option value="session">Rapport de session</option>
                <option value="student">Rapport par élève</option>
                <option value="class">Rapport par classe</option>
                <option value="period">Rapport de période</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options d&apos;export</CardTitle>
          <CardDescription>
            Choisissez le format d&apos;export de votre rapport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleGeneratePDF}
              disabled={generating}
              size="lg"
              className="h-24 flex-col gap-2"
            >
              {generating ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <FileText className="h-8 w-8" />
                  <span>Exporter en PDF</span>
                  <span className="text-xs opacity-70">
                    Format idéal pour l&apos;impression
                  </span>
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateExcel}
              disabled={generating}
              size="lg"
              variant="outline"
              className="h-24 flex-col gap-2"
            >
              {generating ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Download className="h-8 w-8" />
                  <span>Exporter en Excel</span>
                  <span className="text-xs opacity-70">
                    Format idéal pour l&apos;analyse
                  </span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions récentes</CardTitle>
          <CardDescription>
            Aperçu des sessions correspondant aux filtres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{session.sport}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.class?.name} • {new Date(session.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Voir détails
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
