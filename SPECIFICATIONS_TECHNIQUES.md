# Spécifications Techniques - Carnet Numérique Sport

## 🎨 Design System

### Palette de Couleurs

```typescript
// tailwind.config.ts
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Bleu principal
    600: '#0284c7',
    700: '#0369a1',
  },
  success: {
    500: '#22c55e',  // Vert pour positif
  },
  warning: {
    500: '#f59e0b',  // Orange pour neutre
  },
  danger: {
    500: '#ef4444',  // Rouge pour négatif/blessure
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    800: '#262626',
    900: '#171717',
  }
}
```

### Typographie

- **Headings:** Inter (font-bold)
- **Body:** Inter (font-normal)
- **Mono:** JetBrains Mono (pour code/données)

---

## 🔧 API Routes

### Authentification

#### POST `/api/auth/register`
```typescript
Request:
{
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
}

Response:
{
  user: User;
  session: Session;
}
```

#### POST `/api/auth/login`
```typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  user: User;
  session: Session;
}
```

### Classes

#### GET `/api/classes`
```typescript
Response:
{
  classes: Class[];
}

interface Class {
  id: string;
  name: string;
  level: string;
  schoolYear: string;
  studentCount: number;
  createdAt: string;
}
```

#### POST `/api/classes`
```typescript
Request:
{
  name: string;
  level: string;
  schoolYear: string;
}

Response:
{
  class: Class;
}
```

#### GET `/api/classes/[id]`
```typescript
Response:
{
  class: Class;
  students: Student[];
}
```

### Élèves

#### GET `/api/classes/[classId]/students`
```typescript
Response:
{
  students: Student[];
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes?: string;
}
```

#### POST `/api/classes/[classId]/students`
```typescript
Request:
{
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes?: string;
}

Response:
{
  student: Student;
}
```

#### POST `/api/classes/[classId]/students/import`
```typescript
Request:
{
  file: File; // CSV
}

Response:
{
  imported: number;
  errors: string[];
}
```

### Sessions

#### POST `/api/sessions`
```typescript
Request:
{
  classId: string;
  sport: string;
  date: string;
  presentStudentIds: string[];
  weather?: string;
  location?: string;
}

Response:
{
  session: Session;
}

interface Session {
  id: string;
  classId: string;
  sport: string;
  date: string;
  startTime: string;
  status: 'in_progress' | 'completed' | 'cancelled';
}
```

#### PATCH `/api/sessions/[id]`
```typescript
Request:
{
  status?: 'in_progress' | 'completed' | 'cancelled';
  endTime?: string;
  generalNotes?: string;
}

Response:
{
  session: Session;
}
```

#### GET `/api/sessions/[id]`
```typescript
Response:
{
  session: Session;
  attendance: Attendance[];
  observations: Observation[];
}
```

### Observations

#### POST `/api/sessions/[sessionId]/observations`
```typescript
Request:
{
  rawText: string;
  timestamp: string;
  audioUrl?: string;
}

Response:
{
  observation: Observation;
}

interface Observation {
  id: string;
  sessionId: string;
  studentId?: string;
  rawText: string;
  processedText: string;
  category: 'performance' | 'behavior' | 'progress' | 'difficulty' | 'injury' | 'general';
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}
```

### IA Gemini

#### POST `/api/gemini/process`
```typescript
Request:
{
  rawText: string;
  sessionId: string;
  students: Array<{id: string, firstName: string, lastName: string}>;
  sport: string;
}

Response:
{
  studentId?: string;
  studentName?: string;
  category: string;
  sentiment: string;
  processedText: string;
  keywords: string[];
  suggestions?: string[];
}
```

### Rapports

#### POST `/api/reports/generate`
```typescript
Request:
{
  sessionId: string;
  studentId?: string;
  reportType: 'session_summary' | 'student_progress' | 'class_report';
}

Response:
{
  report: Report;
}

interface Report {
  id: string;
  content: {
    title: string;
    summary: string;
    observations: Observation[];
    statistics: {
      totalObservations: number;
      positiveCount: number;
      neutralCount: number;
      negativeCount: number;
    };
    recommendations?: string[];
  };
}
```

### Exports

#### POST `/api/export/pdf`
```typescript
Request:
{
  reportId: string;
}

Response:
{
  pdfUrl: string;
}
```

#### POST `/api/export/excel`
```typescript
Request:
{
  sessionId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
}

Response:
{
  excelUrl: string;
}
```

---

## 🧩 Composants Principaux

### VoiceRecognition Component

```typescript
// components/voice/VoiceButton.tsx
interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
  language?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  onError,
  continuous = false,
  language = 'fr-FR'
}) => {
  // Implementation
}
```

### useVoiceRecognition Hook

```typescript
// lib/hooks/useVoiceRecognition.ts
interface UseVoiceRecognitionOptions {
  continuous?: boolean;
  language?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

const useVoiceRecognition = (
  options: UseVoiceRecognitionOptions
): UseVoiceRecognitionReturn => {
  // Implementation using Web Speech API
}
```

### SessionActive Component

```typescript
// components/sessions/SessionActive.tsx
interface SessionActiveProps {
  sessionId: string;
  students: Student[];
  sport: string;
  onObservationAdded: (observation: Observation) => void;
}

const SessionActive: React.FC<SessionActiveProps> = ({
  sessionId,
  students,
  sport,
  onObservationAdded
}) => {
  // Real-time observation interface
  // Voice button
  // Student grid
  // Observation feed
}
```

### ObservationCard Component

```typescript
// components/sessions/ObservationCard.tsx
interface ObservationCardProps {
  observation: Observation;
  student?: Student;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ObservationCard: React.FC<ObservationCardProps> = ({
  observation,
  student,
  onEdit,
  onDelete
}) => {
  // Display observation with:
  // - Student name
  // - Category badge
  // - Sentiment indicator
  // - Timestamp
  // - Text content
  // - Actions (edit, delete)
}
```

---

## 🔄 Flux de Données

### Flux de Création d'Observation

```
1. Professeur appuie sur bouton micro
   ↓
2. Web Speech API capture audio
   ↓
3. Transcription en temps réel
   ↓
4. Professeur valide la transcription
   ↓
5. POST /api/sessions/[id]/observations
   ↓
6. Sauvegarde rawText en DB
   ↓
7. POST /api/gemini/process (async)
   ↓
8. Gemini analyse et extrait infos
   ↓
9. Update observation avec données traitées
   ↓
10. Real-time update via Supabase Realtime
   ↓
11. UI affiche observation enrichie
```

### Flux de Génération de Rapport

```
1. Professeur demande rapport
   ↓
2. POST /api/reports/generate
   ↓
3. Récupération des observations de la session
   ↓
4. Groupement par élève
   ↓
5. Calcul des statistiques
   ↓
6. Génération du contenu structuré
   ↓
7. Sauvegarde en DB
   ↓
8. POST /api/export/pdf (optionnel)
   ↓
9. Génération PDF avec template
   ↓
10. Upload vers Supabase Storage
   ↓
11. Retour URL du PDF
```

---

## 🗄️ Modèles de Données TypeScript

```typescript
// types/index.ts

export interface User {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  teacherId: string;
  name: string;
  level: string;
  schoolYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  classId: string;
  teacherId: string;
  sport: string;
  date: string;
  startTime: string;
  endTime?: string;
  generalNotes?: string;
  weather?: string;
  location?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  isPresent: boolean;
  absenceReason?: string;
  createdAt: string;
}

export type ObservationCategory = 
  | 'performance' 
  | 'behavior' 
  | 'progress' 
  | 'difficulty' 
  | 'injury' 
  | 'general';

export type ObservationSentiment = 
  | 'positive' 
  | 'neutral' 
  | 'negative';

export interface Observation {
  id: string;
  sessionId: string;
  studentId?: string;
  rawText: string;
  processedText: string;
  category: ObservationCategory;
  sentiment: ObservationSentiment;
  timestamp: string;
  audioUrl?: string;
  createdAt: string;
}

export type ReportType = 
  | 'session_summary' 
  | 'student_progress' 
  | 'class_report';

export interface Report {
  id: string;
  sessionId: string;
  studentId?: string;
  reportType: ReportType;
  content: ReportContent;
  pdfUrl?: string;
  generatedAt: string;
  createdAt: string;
}

export interface ReportContent {
  title: string;
  summary: string;
  observations: Observation[];
  statistics: {
    totalObservations: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    byCategory: Record<ObservationCategory, number>;
  };
  recommendations?: string[];
  studentProgress?: {
    studentId: string;
    studentName: string;
    strengths: string[];
    areasForImprovement: string[];
    overallProgress: string;
  }[];
}
```

---

## 🤖 Prompts Gemini

### Prompt Principal - Traitement d'Observation

```typescript
const OBSERVATION_PROCESSING_PROMPT = `
Tu es un assistant IA spécialisé dans l'analyse d'observations sportives pour professeurs d'EPS.

CONTEXTE:
- Sport: {sport}
- Élèves présents: {studentList}
- Observation brute: "{rawText}"

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
- Sois précis dans l'identification de l'élève (nom complet)
- Le processedText doit être professionnel et adapté à un bulletin
- Garde le ton positif même pour les difficultés (formulation constructive)

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire.
`;
```

### Prompt - Génération de Résumé de Session

```typescript
const SESSION_SUMMARY_PROMPT = `
Tu es un assistant IA pour professeurs d'EPS.

CONTEXTE:
- Sport: {sport}
- Date: {date}
- Nombre d'élèves: {studentCount}
- Observations: {observations}

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
`;
```

### Prompt - Rapport de Progression Élève

```typescript
const STUDENT_PROGRESS_PROMPT = `
Tu es un assistant IA pour professeurs d'EPS.

CONTEXTE:
- Élève: {studentName}
- Période: {startDate} à {endDate}
- Observations: {observations}

TÂCHE:
Génère un rapport de progression pour cet élève au format JSON:

{
  "overallProgress": "Appréciation générale (2-3 phrases)",
  "strengths": [
    "Point fort 1",
    "Point fort 2",
    "Point fort 3"
  ],
  "areasForImprovement": [
    "Axe de progression 1",
    "Axe de progression 2"
  ],
  "recommendations": [
    "Conseil personnalisé 1",
    "Conseil personnalisé 2"
  ],
  "evolutionNote": "Note sur l'évolution constatée"
}

RÈGLES:
- Ton encourageant et bienveillant
- Base-toi uniquement sur les observations fournies
- Sois spécifique et concret
- Adapté pour être partagé avec les parents
`;
```

---

## 🎯 Gestion d'État

### Zustand Store Structure

```typescript
// lib/store/useStore.ts
import { create } from 'zustand';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Active Session
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  
  // Observations (real-time)
  observations: Observation[];
  addObservation: (observation: Observation) => void;
  updateObservation: (id: string, data: Partial<Observation>) => void;
  clearObservations: () => void;
  
  // Voice Recognition
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  currentTranscript: string;
  setCurrentTranscript: (transcript: string) => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state and actions
}));
```

---

## 🔐 Sécurité

### Row Level Security (RLS) Policies

```sql
-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Classes: Teachers can only access their own classes
CREATE POLICY "Teachers can view own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes"
  ON classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- Students: Access via class ownership
CREATE POLICY "Teachers can view students in their classes"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Similar policies for sessions, observations, reports
```

### API Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

---

## 📱 Progressive Web App

### Manifest

```json
// public/manifest.json
{
  "name": "Carnet Numérique Sport",
  "short_name": "EPS Vocal",
  "description": "Assistant vocal pour professeurs d'EPS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Tests

### Test Structure

```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── integration/
│   ├── api/
│   └── flows/
└── e2e/
    ├── auth.spec.ts
    ├── session.spec.ts
    └── reports.spec.ts
```

### Example E2E Test

```typescript
// __tests__/e2e/session.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Session Flow', () => {
  test('should create and complete a session', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Create session
    await page.goto('/sessions/new');
    await page.selectOption('[name="classId"]', 'class-id');
    await page.fill('[name="sport"]', 'Basketball');
    await page.click('button[type="submit"]');
    
    // Add observation
    await page.click('[data-testid="voice-button"]');
    // ... voice interaction simulation
    
    // Complete session
    await page.click('[data-testid="end-session"]');
    
    // Verify
    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible();
  });
});
```

---

*Document de référence technique pour le développement de l'application.*
