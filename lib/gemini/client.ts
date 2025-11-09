import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GeminiProcessedObservation, Student } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-pro',
})

export async function processObservation(
  rawText: string,
  students: Student[],
  sport: string
): Promise<GeminiProcessedObservation> {
  const studentList = students
    .map((s) => `${s.id}: ${s.first_name} ${s.last_name}`)
    .join('\n')

  const prompt = `
Tu es un assistant IA spécialisé dans l'analyse d'observations sportives pour professeurs d'EPS.

CONTEXTE:
- Sport: ${sport}
- Élèves présents:
${studentList}
- Observation brute: "${rawText}"

TÂCHE:
Analyse cette observation et extrais les informations suivantes au format JSON:

1. **studentId**: L'ID de l'élève mentionné (ou null si observation générale)
2. **studentName**: Le nom complet de l'élève identifié
3. **category**: Catégorise l'observation parmi:
   - "performance": Actions techniques, réussites sportives
   - "behavior": Comportement, attitude, esprit d'équipe
   - "progress": Amélioration, progression constatée
   - "difficulty": Difficulté technique ou physique
   - "injury": Blessure ou problème de santé
   - "general": Observation générale sur la classe/séance

4. **sentiment**: Évalue le ton de l'observation:
   - "positive": Encouragement, réussite, progrès
   - "neutral": Constat factuel
   - "negative": Difficulté, problème, point d'attention

5. **processedText**: Reformule l'observation de manière claire et professionnelle (1-2 phrases)

6. **keywords**: Liste de 3-5 mots-clés pertinents

7. **suggestions**: (optionnel) Suggestions pédagogiques si pertinent

RÈGLES:
- Si plusieurs élèves sont mentionnés, choisis le principal
- Sois précis dans l'identification de l'élève (utilise l'ID exact)
- Le processedText doit être professionnel et adapté à un bulletin
- Garde le ton positif même pour les difficultés (formulation constructive)

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire.
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      studentId: parsed.studentId || undefined,
      studentName: parsed.studentName || undefined,
      category: parsed.category || 'general',
      sentiment: parsed.sentiment || 'neutral',
      processedText: parsed.processedText || rawText,
      keywords: parsed.keywords || [],
      suggestions: parsed.suggestions || undefined,
    }
  } catch (error) {
    console.error('Error processing observation with Gemini:', error)
    // Fallback to basic processing
    return {
      category: 'general',
      sentiment: 'neutral',
      processedText: rawText,
      keywords: [],
    }
  }
}

export async function generateSessionSummary(
  sport: string,
  date: string,
  studentCount: number,
  observations: Array<{ raw_text: string; category: string; sentiment: string }>
): Promise<{
  summary: string
  highlights: string[]
  areasForImprovement: string[]
  recommendations: string[]
}> {
  const observationsText = observations
    .map((o) => `- [${o.category}/${o.sentiment}] ${o.raw_text}`)
    .join('\n')

  const prompt = `
Tu es un assistant IA pour professeurs d'EPS.

CONTEXTE:
- Sport: ${sport}
- Date: ${date}
- Nombre d'élèves: ${studentCount}
- Observations:
${observationsText}

TÂCHE:
Génère un résumé professionnel de cette séance d'EPS au format JSON:

{
  "summary": "Résumé général de la séance (2-3 phrases)",
  "highlights": [
    "Point positif 1",
    "Point positif 2",
    "Point positif 3"
  ],
  "areasForImprovement": [
    "Point d'attention 1",
    "Point d'attention 2"
  ],
  "recommendations": [
    "Recommandation pédagogique 1",
    "Recommandation pédagogique 2"
  ]
}

RÈGLES:
- Ton professionnel et constructif
- Mets en avant les réussites
- Formule les difficultés de manière positive
- Suggestions concrètes et applicables

Réponds UNIQUEMENT avec un objet JSON valide.
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating session summary:', error)
    return {
      summary: 'Séance de ' + sport + ' effectuée avec succès.',
      highlights: ['Bonne participation générale'],
      areasForImprovement: [],
      recommendations: [],
    }
  }
}
