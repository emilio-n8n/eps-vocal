import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processObservation } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const { text, sessionId } = await request.json()

    if (!text || !sessionId) {
      return NextResponse.json(
        { error: 'Texte et ID de session requis' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get session and students
    const { data: session } = await supabase
      .from('sessions')
      .select('class_id, sport')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', session.class_id)

    // Process with AI
    const processed = await processObservation(text, students || [], session.sport)

    return NextResponse.json(processed)
  } catch (error) {
    console.error('Error processing observation:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de l\'observation' },
      { status: 500 }
    )
  }
}
