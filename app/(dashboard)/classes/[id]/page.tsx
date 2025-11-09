'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Loader2, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import type { Class, Student } from '@/types'

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
  })

  useEffect(() => {
    loadClassData()
  }, [classId])

  const loadClassData = async () => {
    try {
      const supabase = createClient()
      
      // Load class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      if (classError) throw classError
      setClassData(classData)

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('last_name', { ascending: true })

      if (studentsError) throw studentsError
      setStudents(studentsData || [])
    } catch (error) {
      console.error('Error loading class:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('students')
        .insert({
          ...studentForm,
          class_id: classId,
        })

      if (error) throw error

      setStudentForm({ first_name: '', last_name: '', date_of_birth: '' })
      setShowAddStudent(false)
      loadClassData()
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error
      loadClassData()
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Classe non trouvée</p>
        <Link href="/classes">
          <Button className="mt-4">Retour aux classes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground mt-1">
            {classData.level} • {classData.school_year}
          </p>
        </div>
        <Link href={`/sessions/new?classId=${classId}`}>
          <Button>Démarrer une session</Button>
        </Link>
      </div>

      {/* Class Info */}
      {classData.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{classData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Students */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Élèves ({students.length})</CardTitle>
              <CardDescription>Liste des élèves de cette classe</CardDescription>
            </div>
            <Button onClick={() => setShowAddStudent(!showAddStudent)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un élève
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Student Form */}
          {showAddStudent && (
            <form onSubmit={handleAddStudent} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={studentForm.first_name}
                    onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={studentForm.last_name}
                    onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date de naissance</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          )}

          {/* Students List */}
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élève dans cette classe
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {student.first_name} {student.last_name}
                    </p>
                    {student.date_of_birth && (
                      <p className="text-sm text-muted-foreground">
                        Né(e) le {new Date(student.date_of_birth).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
