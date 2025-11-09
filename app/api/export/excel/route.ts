import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, classId, startDate, endDate } = await request.json()

    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let query = supabase
      .from('observations')
      .select(`
        *,
        session:sessions(sport, date, class:classes(name, level)),
        student:students(first_name, last_name)
      `)
      .eq('sessions.teacher_id', user.id)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: observations, error } = await query.order('timestamp')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Prepare data for Excel
    const excelData = observations?.map((obs) => ({
      'Date': obs.session?.date ? new Date(obs.session.date).toLocaleDateString('fr-FR') : '',
      'Sport': obs.session?.sport || '',
      'Classe': obs.session?.class?.name || '',
      'Niveau': obs.session?.class?.level || '',
      'Élève': obs.student 
        ? `${obs.student.first_name} ${obs.student.last_name}`
        : 'Non identifié',
      'Heure': new Date(obs.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      'Observation': obs.processed_text || obs.raw_text || '',
      'Catégorie': obs.category || '',
      'Sentiment': obs.sentiment || '',
      'Mots-clés': obs.keywords?.join(', ') || '',
    })) || []

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Sport
      { wch: 15 }, // Classe
      { wch: 10 }, // Niveau
      { wch: 20 }, // Élève
      { wch: 8 },  // Heure
      { wch: 50 }, // Observation
      { wch: 15 }, // Catégorie
      { wch: 12 }, // Sentiment
      { wch: 30 }, // Mots-clés
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Observations')

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const filename = sessionId 
      ? `session-${sessionId}.xlsx`
      : `observations-${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du fichier Excel' },
      { status: 500 }
    )
  }
}
