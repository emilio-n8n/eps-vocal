'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, Plus, Mic } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    sessions: 0,
    observations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserName(profile.full_name)
        }
      }

      // Get stats
      const [classesRes, studentsRes, sessionsRes, observationsRes] = await Promise.all([
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('sessions').select('id', { count: 'exact', head: true }),
        supabase.from('observations').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        classes: classesRes.count || 0,
        students: studentsRes.count || 0,
        sessions: sessionsRes.count || 0,
        observations: observationsRes.count || 0,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour {userName || 'Professeur'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <Link href="/sessions/new">
          <Button size="lg" className="gap-2">
            <Mic className="h-5 w-5" />
            Démarrer une session
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classes}</div>
            <p className="text-xs text-muted-foreground">
              Classes gérées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Élèves au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.observations}</div>
            <p className="text-xs text-muted-foreground">
              Observations prises
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/classes/new">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Créer une classe</span>
            </Button>
          </Link>
          <Link href="/sessions/new">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Mic className="h-6 w-6" />
              <span>Nouvelle session</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Voir les rapports</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {stats.classes === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>🎉 Bienvenue sur EPS Vocal !</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Pour commencer à utiliser l'application :</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Créez votre première classe</li>
              <li>Ajoutez vos élèves</li>
              <li>Démarrez une session et utilisez la reconnaissance vocale</li>
              <li>Générez des rapports automatiquement</li>
            </ol>
            <Link href="/classes/new">
              <Button className="mt-4">
                Créer ma première classe
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
