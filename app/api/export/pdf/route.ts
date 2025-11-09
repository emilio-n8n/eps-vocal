import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Load session data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, class:classes(name, level)')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Load observations
    const { data: observations } = await supabase
      .from('observations')
      .select('*, student:students(first_name, last_name)')
      .eq('session_id', sessionId)
      .order('timestamp')

    // Create PDF
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Rapport de Session EPS', 20, 20)
    
    // Session info
    doc.setFontSize(12)
    doc.text(`Sport: ${session.sport}`, 20, 35)
    doc.text(`Classe: ${session.class?.name} - ${session.class?.level}`, 20, 42)
    doc.text(`Date: ${new Date(session.date).toLocaleDateString('fr-FR')}`, 20, 49)
    
    if (session.location) {
      doc.text(`Lieu: ${session.location}`, 20, 56)
    }

    // Observations
    doc.setFontSize(14)
    doc.text('Observations', 20, 70)
    
    let yPos = 80
    doc.setFontSize(10)
    
    observations?.forEach((obs, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      const studentName = obs.student 
        ? `${obs.student.first_name} ${obs.student.last_name}`
        : 'Non identifié'
      
      doc.text(`${index + 1}. ${studentName}`, 20, yPos)
      yPos += 5
      
      const text = obs.processed_text || obs.raw_text || ''
      const lines = doc.splitTextToSize(text, 170)
      doc.text(lines, 25, yPos)
      yPos += lines.length * 5 + 5
      
      if (obs.category) {
        doc.text(`Catégorie: ${obs.category}`, 25, yPos)
        yPos += 5
      }
      
      yPos += 5
    })

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-${session.sport}-${session.date}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
