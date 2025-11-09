# 🏃‍♂️ Carnet Numérique Sport

Application web progressive pour les professeurs d'EPS permettant la prise de notes vocales automatisées avec traitement IA et génération de rapports.

## 📋 Description

Cette application aide les professeurs d'EPS à suivre et évaluer leurs élèves pendant les cours de sport en utilisant l'intelligence artificielle pour prendre des notes automatiquement via reconnaissance vocale.

### Fonctionnalités principales

- 🎤 **Reconnaissance vocale en temps réel** - Prise de notes mains-libres pendant les cours
- 🤖 **Traitement IA avec Gemini** - Analyse et catégorisation automatique des observations
- 👥 **Gestion des classes et élèves** - Organisation complète des données scolaires
- 📊 **Rapports automatiques** - Génération de résumés et bulletins
- 📱 **Interface responsive** - Optimisée pour mobile, tablette et desktop
- 🔐 **Sécurité et confidentialité** - Données privées et conformes RGPD

## 🛠️ Stack Technique

- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **IA:** Google Gemini API
- **Reconnaissance vocale:** Web Speech API
- **Export:** jsPDF, xlsx

## 📁 Structure du Projet

```
eps-vocal/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Pages d'authentification
│   ├── (dashboard)/         # Pages du dashboard
│   ├── api/                 # API Routes
│   └── layout.tsx
├── components/              # Composants React
│   ├── ui/                  # Composants shadcn/ui
│   ├── auth/               # Composants d'authentification
│   ├── classes/            # Composants de gestion des classes
│   ├── sessions/           # Composants de sessions
│   ├── voice/              # Composants de reconnaissance vocale
│   └── reports/            # Composants de rapports
├── lib/                     # Utilitaires et configurations
│   ├── supabase/           # Client Supabase
│   ├── gemini/             # Client Gemini
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Fonctions utilitaires
├── types/                   # Définitions TypeScript
├── public/                  # Assets statiques
├── supabase/               # Migrations et config Supabase
└── __tests__/              # Tests
```

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ et npm/yarn/pnpm
- Compte Supabase
- Clé API Google Gemini

### 1. Cloner et installer les dépendances

```bash
# Cloner le repository
git clone <repository-url>
cd eps-vocal

# Installer les dépendances
npm install
# ou
yarn install
# ou
pnpm install
```

### 2. Configuration Supabase

1. Créer un nouveau projet sur [Supabase](https://supabase.com)
2. Exécuter le schéma SQL:
   ```bash
   # Copier le contenu de SUPABASE_SCHEMA.sql
   # et l'exécuter dans le SQL Editor de Supabase
   ```
3. Créer les buckets de storage:
   - `audio-recordings` (privé, 10MB max)
   - `reports` (privé, 5MB max)
   - `exports` (privé, 10MB max)

4. Récupérer les clés API:
   - Project URL
   - Anon/Public key
   - Service role key (pour le backend)

### 3. Configuration Gemini

1. Obtenir une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Activer l'API Gemini

### 4. Variables d'environnement

Créer un fichier `.env.local` à la racine:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Lancer l'application

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📖 Guide d'Utilisation

### Pour les Professeurs

#### 1. Créer un compte
- Aller sur `/register`
- Renseigner email, mot de passe, nom complet et établissement
- Valider l'email

#### 2. Créer une classe
- Aller dans "Classes"
- Cliquer sur "Nouvelle classe"
- Renseigner: nom (ex: "3ème B"), niveau, année scolaire
- Ajouter les élèves manuellement ou via import CSV

#### 3. Démarrer une session
- Sélectionner une classe
- Cliquer sur "Nouvelle session"
- Choisir le sport et les élèves présents
- Démarrer la session

#### 4. Prendre des notes vocales
- Pendant la session, cliquer sur le bouton micro
- Parler naturellement: "Léa fait une excellente passe"
- L'IA identifie automatiquement l'élève et catégorise l'observation
- Les observations s'affichent en temps réel

#### 5. Terminer et consulter
- Cliquer sur "Terminer la session"
- Consulter le résumé automatique
- Générer des rapports PDF ou Excel
- Partager avec les parents ou l'administration

## 🎯 Exemples d'Observations Vocales

```
✅ "Jules marque un panier à 3 points, excellent tir !"
→ Élève: Jules | Catégorie: Performance | Sentiment: Positif

✅ "Marie aide ses coéquipiers, bon esprit d'équipe"
→ Élève: Marie | Catégorie: Comportement | Sentiment: Positif

✅ "Thomas a du mal avec les dribbles, il faudra travailler ça"
→ Élève: Thomas | Catégorie: Difficulté | Sentiment: Neutre

✅ "Attention, Sophie se fait mal au genou"
→ Élève: Sophie | Catégorie: Blessure | Sentiment: Négatif

✅ "Super match aujourd'hui, l'ambiance était excellente"
→ Observation générale | Catégorie: Général | Sentiment: Positif
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Lancer en mode développement
npm run build        # Build pour production
npm run start        # Lancer en production
npm run lint         # Linter le code
npm run format       # Formatter le code avec Prettier
npm run test         # Lancer les tests
npm run test:e2e     # Tests end-to-end
npm run type-check   # Vérifier les types TypeScript
```

## 🔐 Sécurité

- **Authentification:** Supabase Auth avec JWT
- **Autorisation:** Row Level Security (RLS) sur toutes les tables
- **Données:** Chiffrement en transit (HTTPS) et au repos
- **RGPD:** Conformité avec les règles de protection des données
- **API:** Rate limiting et validation des entrées

## 📱 Progressive Web App

L'application peut être installée sur mobile/tablette:

1. Ouvrir l'application dans le navigateur
2. Cliquer sur "Ajouter à l'écran d'accueil"
3. L'icône apparaît comme une application native
4. Fonctionne en mode hors ligne (fonctionnalités limitées)

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Configuration Vercel

1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement à chaque push

## 📊 Monitoring et Analytics

- **Vercel Analytics:** Performance et usage
- **Supabase Dashboard:** Logs et métriques DB
- **Sentry:** (optionnel) Tracking des erreurs

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

### Version 1.0 (MVP) ✅
- [x] Authentification
- [x] Gestion classes/élèves
- [x] Sessions avec reconnaissance vocale
- [x] Traitement IA basique
- [x] Rapports PDF

### Version 1.1
- [ ] Export Excel avancé
- [ ] Graphiques de progression
- [ ] Mode hors ligne complet
- [ ] Notifications push
- [ ] Import CSV élèves

### Version 2.0
- [ ] Application mobile native (React Native)
- [ ] Partage de rapports avec parents (portail)
- [ ] Intégration avec ENT (Espaces Numériques de Travail)
- [ ] Analytics et tableaux de bord avancés
- [ ] Multi-langue (anglais, espagnol)

## 🐛 Problèmes Connus

- La reconnaissance vocale nécessite une connexion internet
- Fonctionne mieux sur Chrome/Edge (Web Speech API)
- Safari iOS peut avoir des limitations sur la reconnaissance vocale

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails

## 👥 Auteurs

- **Développeur Principal** - [Votre Nom]

## 🙏 Remerciements

- [Next.js](https://nextjs.org) - Framework React
- [Supabase](https://supabase.com) - Backend as a Service
- [Google Gemini](https://ai.google.dev) - Intelligence Artificielle
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Vercel](https://vercel.com) - Hébergement

## 📞 Support

Pour toute question ou problème:
- Ouvrir une issue sur GitHub
- Email: support@example.com
- Documentation: [docs.example.com](https://docs.example.com)

---

**Fait avec ❤️ pour les professeurs d'EPS**
