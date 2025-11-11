# Plan de Construction - Carnet Numérique Sport

## 📋 Vue d'ensemble

Application web progressive (PWA) pour les professeurs d'EPS permettant la prise de notes vocales automatisées avec traitement IA et génération de rapports.

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS
- **Composants UI:** shadcn/ui
- **Icônes:** Lucide React
- **Reconnaissance vocale:** Web Speech API
- **État global:** React Context / Zustand

**Backend:**
- **BaaS:** Supabase
  - PostgreSQL (base de données)
  - Auth (authentification)
  - Storage (fichiers audio/exports)
  - Edge Functions (traitement IA)
- **IA:** Google Gemini API
- **Export PDF:** jsPDF / react-pdf
- **Export Excel:** xlsx

**Déploiement:**
- **Hosting:** netlify
- **Base de données:** Supabase Cloud
- **CI/CD:** GitHub Actions

---

## 📊 Schéma de Base de Données

### Tables Principales

#### `profiles`
```sql
- id (uuid, PK, ref: auth.users)
- email (text)
- full_name (text)
- school_name (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `classes`
```sql
- id (uuid, PK)
- teacher_id (uuid, FK: profiles.id)
- name (text) -- ex: "3ème B"
- level (text) -- ex: "3ème", "4ème"
- school_year (text) -- ex: "2024-2025"
- created_at (timestamp)
- updated_at (timestamp)
```

#### `students`
```sql
- id (uuid, PK)
- class_id (uuid, FK: classes.id)
- first_name (text)
- last_name (text)
- date_of_birth (date)
- notes (text) -- notes générales sur l'élève
- created_at (timestamp)
- updated_at (timestamp)
```

#### `sessions`
```sql
- id (uuid, PK)
- class_id (uuid, FK: classes.id)
- teacher_id (uuid, FK: profiles.id)
- sport (text) -- ex: "Basketball", "Volley-ball"
- date (date)
- start_time (timestamp)
- end_time (timestamp)
- general_notes (text) -- notes générales de la session
- weather (text) -- optionnel
- location (text) -- optionnel
- status (enum: 'in_progress', 'completed', 'cancelled')
- created_at (timestamp)
- updated_at (timestamp)
```

#### `session_attendance`
```sql
- id (uuid, PK)
- session_id (uuid, FK: sessions.id)
- student_id (uuid, FK: students.id)
- is_present (boolean)
- absence_reason (text) -- optionnel
- created_at (timestamp)
```

#### `observations`
```sql
- id (uuid, PK)
- session_id (uuid, FK: sessions.id)
- student_id (uuid, FK: students.id, nullable) -- null si observation générale
- raw_text (text) -- texte brut de la reconnaissance vocale
- processed_text (text) -- texte traité par l'IA
- category (enum: 'performance', 'behavior', 'progress', 'difficulty', 'injury', 'general')
- sentiment (enum: 'positive', 'neutral', 'negative')
- timestamp (timestamp) -- moment de l'observation
- audio_url (text) -- optionnel: lien vers l'audio original
- created_at (timestamp)
```

#### `reports`
```sql
- id (uuid, PK)
- session_id (uuid, FK: sessions.id)
- student_id (uuid, FK: students.id, nullable) -- null si rapport de classe
- report_type (enum: 'session_summary', 'student_progress', 'class_report')
- content (jsonb) -- contenu structuré du rapport
- pdf_url (text) -- lien vers le PDF généré
- generated_at (timestamp)
- created_at (timestamp)
```

### Politiques de Sécurité (RLS)

Toutes les tables auront des Row Level Security policies:
- Les professeurs ne peuvent accéder qu'à leurs propres données
- Les données sont isolées par `teacher_id`
- Lecture/écriture basée sur l'authentification

---

## 🎯 Phases de Développement

### Phase 1: Fondations (Semaine 1)

#### 1.1 Configuration Projet
- [ ] Initialiser Next.js avec TypeScript
- [ ] Configurer Tailwind CSS
- [ ] Installer shadcn/ui
- [ ] Setup ESLint et Prettier
- [ ] Configurer structure de dossiers

**Structure de dossiers:**
```
eps-vocal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── classes/
│   │   ├── sessions/
│   │   ├── students/
│   │   └── reports/
│   ├── api/
│   │   ├── gemini/
│   │   └── export/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn)
│   ├── auth/
│   ├── classes/
│   ├── sessions/
│   ├── voice/
│   └── reports/
├── lib/
│   ├── supabase/
│   ├── gemini/
│   ├── hooks/
│   └── utils/
├── types/
└── public/
```

#### 1.2 Configuration Supabase
- [ ] Créer projet Supabase
- [ ] Créer schéma de base de données
- [ ] Configurer RLS policies
- [ ] Setup Supabase client
- [ ] Configurer variables d'environnement

**Fichiers à créer:**
- `lib/supabase/client.ts` - Client Supabase
- `lib/supabase/server.ts` - Server-side Supabase
- `supabase/migrations/` - Migrations SQL

---

### Phase 2: Authentification (Semaine 1)

#### 2.1 Pages d'authentification
- [ ] Page de connexion (`/login`)
- [ ] Page d'inscription (`/register`)
- [ ] Page de réinitialisation mot de passe
- [ ] Middleware de protection des routes

#### 2.2 Composants Auth
- [ ] Formulaire de connexion
- [ ] Formulaire d'inscription
- [ ] Gestion des erreurs
- [ ] Redirection après connexion

**Composants:**
- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx`
- `components/auth/AuthProvider.tsx`

---

### Phase 3: Gestion des Classes et Élèves (Semaine 2)

#### 3.1 Interface Classes
- [ ] Liste des classes (`/classes`)
- [ ] Création de classe (modal/page)
- [ ] Édition de classe
- [ ] Suppression de classe
- [ ] Vue détaillée d'une classe

#### 3.2 Interface Élèves
- [ ] Liste des élèves par classe
- [ ] Ajout d'élève (formulaire)
- [ ] Import CSV d'élèves
- [ ] Édition d'élève
- [ ] Suppression d'élève
- [ ] Fiche détaillée élève

**Composants:**
- `components/classes/ClassList.tsx`
- `components/classes/ClassForm.tsx`
- `components/classes/ClassCard.tsx`
- `components/students/StudentList.tsx`
- `components/students/StudentForm.tsx`
- `components/students/StudentCard.tsx`

---

### Phase 4: Sessions d'Observation (Semaine 2-3)

#### 4.1 Création de Session
- [ ] Page de création de session
- [ ] Sélection de la classe
- [ ] Sélection du sport (liste prédéfinie + custom)
- [ ] Sélection des élèves présents
- [ ] Informations complémentaires (météo, lieu)

#### 4.2 Interface de Session Active
- [ ] Vue principale de session
- [ ] Liste des élèves présents
- [ ] Bouton d'enregistrement vocal
- [ ] Affichage temps réel des observations
- [ ] Pause/Reprise de session
- [ ] Fin de session

**Composants:**
- `components/sessions/SessionSetup.tsx`
- `components/sessions/SessionActive.tsx`
- `components/sessions/StudentGrid.tsx`
- `components/sessions/ObservationCard.tsx`

---

### Phase 5: Reconnaissance Vocale (Semaine 3)

#### 5.1 Intégration Web Speech API
- [ ] Hook personnalisé `useVoiceRecognition`
- [ ] Gestion des permissions micro
- [ ] Détection automatique de la langue
- [ ] Transcription en temps réel
- [ ] Gestion des erreurs de reconnaissance

#### 5.2 Interface Vocale
- [ ] Bouton micro avec animation
- [ ] Indicateur d'écoute active
- [ ] Affichage de la transcription en cours
- [ ] Bouton de validation/annulation
- [ ] Mode continu vs mode push-to-talk

**Fichiers:**
- `lib/hooks/useVoiceRecognition.ts`
- `components/voice/VoiceButton.tsx`
- `components/voice/VoiceTranscript.tsx`
- `components/voice/VoiceSettings.tsx`

---

### Phase 6: Traitement IA avec Gemini (Semaine 3-4)

#### 6.1 Configuration Gemini
- [ ] Setup API Gemini
- [ ] Création de prompts structurés
- [ ] Fonction d'extraction d'informations
- [ ] Gestion des erreurs API

#### 6.2 Traitement des Observations
- [ ] Identification automatique de l'élève
- [ ] Catégorisation de l'observation
- [ ] Analyse du sentiment
- [ ] Extraction des points clés
- [ ] Suggestions d'amélioration

**Prompts à créer:**
```typescript
// Exemple de prompt
const OBSERVATION_PROMPT = `
Tu es un assistant pour professeur d'EPS.
Analyse cette observation vocale et extrais:
1. Le nom de l'élève mentionné
2. La catégorie (performance/comportement/progrès/difficulté/blessure)
3. Le sentiment (positif/neutre/négatif)
4. Un résumé structuré

Observation: "{raw_text}"
Élèves de la classe: {student_names}
Sport: {sport}

Réponds en JSON.
`;
```

**Fichiers:**
- `lib/gemini/client.ts`
- `lib/gemini/prompts.ts`
- `lib/gemini/processor.ts`
- `app/api/gemini/process/route.ts`

---

### Phase 7: Tableau de Bord et Historique (Semaine 4)

#### 7.1 Dashboard Principal
- [ ] Vue d'ensemble des sessions récentes
- [ ] Statistiques (nombre de sessions, élèves, observations)
- [ ] Accès rapide aux classes
- [ ] Calendrier des sessions

#### 7.2 Historique des Sessions
- [ ] Liste des sessions passées
- [ ] Filtres (date, classe, sport)
- [ ] Vue détaillée d'une session
- [ ] Édition a posteriori des observations
- [ ] Recherche dans les observations

**Composants:**
- `components/dashboard/DashboardStats.tsx`
- `components/dashboard/RecentSessions.tsx`
- `components/sessions/SessionHistory.tsx`
- `components/sessions/SessionDetail.tsx`

---

### Phase 8: Rapports et Exports (Semaine 5)

#### 8.1 Génération de Rapports
- [ ] Rapport de session (résumé global)
- [ ] Rapport par élève (progression)
- [ ] Rapport de classe (vue d'ensemble)
- [ ] Personnalisation des rapports

#### 8.2 Export PDF
- [ ] Template PDF professionnel
- [ ] En-tête avec logo école
- [ ] Mise en page structurée
- [ ] Graphiques de progression
- [ ] Téléchargement PDF

#### 8.3 Export Excel
- [ ] Export des observations
- [ ] Export des présences
- [ ] Export des notes par élève
- [ ] Format compatible bulletins

**Fichiers:**
- `lib/reports/generator.ts`
- `lib/reports/pdf-template.ts`
- `lib/reports/excel-exporter.ts`
- `app/api/export/pdf/route.ts`
- `app/api/export/excel/route.ts`

---

### Phase 9: UI/UX et Responsive (Semaine 5-6)

#### 9.1 Design System
- [ ] Palette de couleurs
- [ ] Typographie
- [ ] Composants shadcn/ui personnalisés
- [ ] Thème clair/sombre
- [ ] Animations et transitions

#### 9.2 Responsive Design
- [ ] Optimisation mobile (priorité)
- [ ] Optimisation tablette
- [ ] Optimisation desktop
- [ ] Navigation adaptative
- [ ] Gestes tactiles

#### 9.3 Progressive Web App
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Installation sur écran d'accueil
- [ ] Mode hors ligne (basique)
- [ ] Notifications push (optionnel)

**Fichiers:**
- `app/manifest.json`
- `public/sw.js`
- `components/ui/theme-provider.tsx`

---

### Phase 10: Tests et Optimisations (Semaine 6)

#### 10.1 Tests
- [ ] Tests unitaires (composants critiques)
- [ ] Tests d'intégration (flux principaux)
- [ ] Tests E2E (Playwright)
- [ ] Tests de reconnaissance vocale
- [ ] Tests d'API Gemini

#### 10.2 Optimisations
- [ ] Performance (Lighthouse)
- [ ] SEO
- [ ] Accessibilité (a11y)
- [ ] Optimisation des images
- [ ] Code splitting
- [ ] Lazy loading

#### 10.3 Documentation
- [ ] README complet
- [ ] Guide d'utilisation
- [ ] Documentation technique
- [ ] Guide de déploiement

---

## 🔑 Fonctionnalités Clés par Priorité

### P0 (Critique - MVP)
1. ✅ Authentification
2. ✅ Gestion classes/élèves
3. ✅ Création de session
4. ✅ Reconnaissance vocale
5. ✅ Traitement IA basique
6. ✅ Affichage observations

### P1 (Important)
7. ✅ Historique sessions
8. ✅ Export PDF
9. ✅ Responsive mobile
10. ✅ Catégorisation automatique

### P2 (Nice to have)
11. Export Excel
12. Graphiques de progression
13. Mode hors ligne
14. Thème sombre
15. Import CSV élèves

---

## 🚀 Déploiement

### Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### Étapes de Déploiement

1. **Supabase:**
   - Créer projet production
   - Appliquer migrations
   - Configurer RLS
   - Setup Storage buckets

2. **Vercel:**
   - Connecter repository GitHub
   - Configurer variables d'environnement
   - Déployer
   - Configurer domaine personnalisé

3. **Post-déploiement:**
   - Tests en production
   - Monitoring (Vercel Analytics)
   - Logs (Supabase Dashboard)

---

## 📈 Métriques de Succès

- **Performance:** < 2s temps de chargement
- **Précision IA:** > 90% identification élèves
- **Disponibilité:** 99.9% uptime
- **UX:** Score Lighthouse > 90
- **Adoption:** Feedback utilisateurs positif

---

## 🛡️ Sécurité et Conformité

- [ ] RGPD compliance
- [ ] Chiffrement des données
- [ ] Authentification sécurisée
- [ ] RLS Supabase
- [ ] Validation des entrées
- [ ] Protection CSRF
- [ ] Rate limiting API

---

## 📚 Ressources et Documentation

### Documentation Technique
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Design
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Radix UI](https://www.radix-ui.com)

---

## 🎯 Prochaines Étapes Immédiates

1. **Initialiser le projet Next.js**
2. **Configurer Supabase et créer le schéma**
3. **Implémenter l'authentification**
4. **Créer les premières pages (dashboard, classes)**

---

*Ce plan est un document vivant qui sera mis à jour au fur et à mesure du développement.*
