# 🚀 Quick Start Guide - Carnet Numérique Sport

Guide de démarrage rapide pour commencer le développement immédiatement.

## ⚡ Démarrage Express (5 minutes)

### 1. Initialiser le projet Next.js

```bash
# Créer l'application Next.js avec TypeScript
npx create-next-app@latest . --typescript --tailwind --app --use-npm

# Répondre aux prompts:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use `src/` directory? … No
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to customize the default import alias? … No
```

### 2. Installer les dépendances essentielles

```bash
# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs
npm install lucide-react class-variance-authority clsx tailwind-merge

# State Management
npm install zustand

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns

# AI & Processing
npm install @google/generative-ai

# Export
npm install jspdf xlsx

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### 3. Setup shadcn/ui

```bash
# Initialiser shadcn/ui
npx shadcn-ui@latest init

# Installer les composants de base
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
```

### 4. Créer la structure de dossiers

```bash
# Créer les dossiers principaux
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/\(dashboard\)/classes
mkdir -p app/\(dashboard\)/sessions
mkdir -p app/\(dashboard\)/students
mkdir -p app/\(dashboard\)/reports
mkdir -p app/api/gemini
mkdir -p app/api/export
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/classes
mkdir -p components/sessions
mkdir -p components/voice
mkdir -p components/reports
mkdir -p lib/supabase
mkdir -p lib/gemini
mkdir -p lib/hooks
mkdir -p lib/utils
mkdir -p types
mkdir -p supabase/migrations
```

### 5. Configurer les variables d'environnement

```bash
# Créer le fichier .env.local
cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Ajouter au .gitignore
echo ".env.local" >> .gitignore
```

## 📝 Fichiers de Configuration Essentiels

### 1. Supabase Client (`lib/supabase/client.ts`)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const createClient = () => createClientComponentClient<Database>();
```

### 2. Supabase Server (`lib/supabase/server.ts`)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
```

### 3. Gemini Client (`lib/gemini/client.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-pro' 
});

export async function processObservation(
  rawText: string,
  students: Array<{ id: string; firstName: string; lastName: string }>,
  sport: string
) {
  // Implementation
}
```

### 4. Voice Recognition Hook (`lib/hooks/useVoiceRecognition.ts`)

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fr-FR';

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognition,
  };
}
```

### 5. Types Database (`types/database.ts`)

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          school_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          school_name?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          school_name?: string | null
        }
      }
      // ... autres tables
    }
  }
}
```

## 🎨 Configuration Tailwind

Mettre à jour `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... autres couleurs
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

## 🔧 Scripts Package.json

Ajouter dans `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

## 📋 Checklist de Démarrage

### Configuration Initiale
- [ ] Projet Next.js créé
- [ ] Dépendances installées
- [ ] shadcn/ui configuré
- [ ] Structure de dossiers créée
- [ ] Variables d'environnement configurées

### Supabase
- [ ] Projet Supabase créé
- [ ] Schéma SQL exécuté
- [ ] Buckets de storage créés
- [ ] RLS policies activées
- [ ] Clés API récupérées

### Gemini
- [ ] Clé API obtenue
- [ ] API activée
- [ ] Client configuré

### Premier Développement
- [ ] Page d'accueil fonctionnelle
- [ ] Authentification basique
- [ ] Connexion Supabase testée
- [ ] Premier composant UI créé

## 🎯 Ordre de Développement Recommandé

### Semaine 1: Fondations
1. ✅ Setup projet et configuration
2. ✅ Authentification (login/register)
3. ✅ Layout principal et navigation
4. ✅ Page dashboard basique

### Semaine 2: Gestion des Données
5. Gestion des classes (CRUD)
6. Gestion des élèves (CRUD)
7. Import CSV élèves
8. Vues détaillées

### Semaine 3: Sessions et Vocal
9. Création de session
10. Interface session active
11. Reconnaissance vocale
12. Affichage observations temps réel

### Semaine 4: IA et Traitement
13. Intégration Gemini
14. Traitement automatique observations
15. Catégorisation et sentiment
16. Amélioration des prompts

### Semaine 5: Rapports
17. Historique des sessions
18. Génération de rapports
19. Export PDF
20. Export Excel

### Semaine 6: Finitions
21. UI/UX polish
22. Responsive design
23. Tests
24. Documentation

## 🚀 Commandes Utiles

```bash
# Développement
npm run dev                    # Lancer le serveur de dev
npm run build                  # Build production
npm run start                  # Lancer en production

# Code Quality
npm run lint                   # Linter
npm run format                 # Formatter
npm run type-check            # Vérifier les types

# Supabase (si CLI installée)
supabase start                # Démarrer Supabase local
supabase db reset             # Reset DB locale
supabase db push              # Push migrations

# Git
git add .
git commit -m "feat: initial setup"
git push origin main
```

## 📚 Ressources Rapides

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Gemini API](https://ai.google.dev/docs)

## 🆘 Problèmes Courants

### Erreur: Module not found
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: Supabase connection
```bash
# Vérifier les variables d'environnement
cat .env.local
# Redémarrer le serveur
npm run dev
```

### Erreur: TypeScript
```bash
# Vérifier les types
npm run type-check
# Régénérer les types Supabase
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

## ✅ Validation du Setup

Pour vérifier que tout fonctionne:

1. Le serveur démarre sans erreur: `npm run dev`
2. La page d'accueil s'affiche: `http://localhost:3000`
3. Pas d'erreurs dans la console navigateur
4. Les types TypeScript sont valides: `npm run type-check`

---

**Prêt à coder ! 🎉**

Suivez le [PLAN_CONSTRUCTION.md](./PLAN_CONSTRUCTION.md) pour les étapes détaillées.
