import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSessionSummary } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type } = await request.json()

    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (type === 'session' && sessionId) {
      // Generate session summary
      const { data: observations } = await supabase
        .from('observations')
        .select('*')
        .eq('session_id', sessionId)

      const { data: session } = await supabase
        .from('sessions')
        .select('class_id')
        .eq('id', sessionId)
        .single()

      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', session?.class_id)

      const summary = await generateSessionSummary(observations || [], students || [])

      // Save summary
      await supabase
        .from('sessions')
        .update({ ai_summary: summary })
        .eq('id', sessionId)

      return NextResponse.json({ summary })
    }

    if (type === 'student') {
      // TODO: Generate student progress report
      return NextResponse.json({ 
        message: 'Rapport élève à implémenter' 
      })
    }

    if (type === 'class') {
      // TODO: Generate class report
      return NextResponse.json({ 
        message: 'Rapport classe à implémenter' 
      })
    }

    return NextResponse.json(
      { error: 'Type de rapport non supporté' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    )
  }
}
