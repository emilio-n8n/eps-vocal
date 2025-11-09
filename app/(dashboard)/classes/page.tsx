'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { ClassWithStats } from '@/types'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          students:students(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to include counts
      const classesWithStats = data?.map(c => ({
        ...c,
        student_count: c.students?.[0]?.count || 0,
        session_count: 0
      })) || []

      setClasses(classesWithStats)
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
    }
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
          <h1 className="text-3xl font-bold">Mes Classes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos classes et vos élèves
          </p>
        </div>
        <Link href="/classes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle classe
          </Button>
        </Link>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune classe</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par créer votre première classe
            </p>
            <Link href="/classes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une classe
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
                <CardDescription>
                  {classItem.level} • {classItem.school_year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{classItem.student_count} élèves</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{classItem.session_count} sessions</span>
                  </div>
                </div>
                {classItem.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classItem.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link href={`/classes/${classItem.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Voir détails
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(classItem.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
