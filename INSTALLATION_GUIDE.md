# 🚀 Guide d'Installation - EPS Vocal

## ✅ Ce qui a été créé

### 1. Frontend Complet (Next.js + TypeScript)
- ✅ Configuration (package.json, tsconfig, tailwind, next.config)
- ✅ Types TypeScript complets
- ✅ Composants UI (shadcn/ui)
- ✅ Hooks personnalisés (reconnaissance vocale, store)
- ✅ Client Gemini configuré
- ✅ Pages d'authentification (login, register)
- ✅ Landing page
- ✅ Middleware de protection des routes

### 2. Backend Supabase 100% Configuré
- ✅ Projet créé: `gdhplppplmyrsyrzldmh`
- ✅ 7 tables créées avec RLS
- ✅ Index et optimisations
- ✅ Triggers et fonctions
- ✅ Vues pour statistiques
- ✅ Realtime activé

---

## 📦 Installation

### Étape 1: Cloner et Installer les Dépendances

```bash
cd /Users/emiliomoreau/my-projects/eps-vocal

# Installer toutes les dépendances
npm install
```

**Note:** Cette commande va installer ~50 packages et peut prendre 2-3 minutes.

### Étape 2: Configurer les Variables d'Environnement

Créez le fichier `.env.local` à la racine du projet :

```bash
# Créer le fichier
touch .env.local
```

Copiez-y ce contenu (voir SUPABASE_CONFIG.md pour les valeurs) :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gdhplppplmyrsyrzldmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHBscHBwbG15cnN5cnpsZG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTY1MzgsImV4cCI6MjA3NzkzMjUzOH0.2-oUumQ-CONoBfnhKLvYIXg0xNUaciJzxI2GLRQJg-A

# Gemini (à configurer plus tard)
GEMINI_API_KEY=your_gemini_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 3: Lancer l'Application

```bash
# Mode développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🧪 Tester l'Application

### 1. Créer un Compte
1. Aller sur http://localhost:3000
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire:
   - Nom: Marie Dupont
   - Établissement: Collège Victor Hugo
   - Email: test@example.com
   - Mot de passe: test123456
4. Cliquer sur "Créer mon compte"

### 2. Se Connecter
- Email: test@example.com
- Mot de passe: test123456

### 3. Vérifier la Connexion
- Vous devriez être redirigé vers `/dashboard`
- Le profil devrait être créé dans Supabase

---

## 📋 Pages Créées

### ✅ Pages Fonctionnelles
- `/` - Landing page
- `/login` - Connexion
- `/register` - Inscription

### ⏳ Pages à Créer (Prochaine Étape)
- `/dashboard` - Dashboard principal
- `/classes` - Gestion des classes
- `/classes/[id]` - Détail d'une classe
- `/sessions/new` - Créer une session
- `/sessions/[id]/active` - Session active (CŒUR DE L'APP)
- `/sessions/[id]/summary` - Résumé de session
- `/sessions` - Historique
- `/reports` - Rapports

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Lancer le serveur de dev
npm run build            # Build pour production
npm run start            # Lancer en production

# Code Quality
npm run lint             # Linter
npm run format           # Formatter avec Prettier
npm run type-check       # Vérifier les types TypeScript
```

---

## 🗂️ Structure du Projet

```
eps-vocal/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ✅ Créé
│   │   ├── register/page.tsx       ✅ Créé
│   │   └── layout.tsx              ✅ Créé
│   ├── (dashboard)/                ⏳ À créer
│   │   ├── dashboard/
│   │   ├── classes/
│   │   ├── sessions/
│   │   └── reports/
│   ├── api/                        ⏳ À créer
│   ├── layout.tsx                  ✅ Créé
│   ├── page.tsx                    ✅ Créé
│   └── globals.css                 ✅ Créé
├── components/
│   ├── ui/                         ✅ Créé (9 composants)
│   ├── auth/                       ⏳ À créer
│   ├── classes/                    ⏳ À créer
│   ├── sessions/                   ⏳ À créer
│   └── voice/                      ⏳ À créer
├── lib/
│   ├── supabase/                   ✅ Créé
│   ├── gemini/                     ✅ Créé
│   ├── hooks/                      ✅ Créé
│   ├── store/                      ✅ Créé
│   └── utils.ts                    ✅ Créé
├── types/                          ✅ Créé
├── middleware.ts                   ✅ Créé
├── package.json                    ✅ Créé
├── tsconfig.json                   ✅ Créé
├── tailwind.config.ts              ✅ Créé
└── next.config.js                  ✅ Créé
```

---

## 🎯 Prochaines Étapes de Développement

### Phase 1: Dashboard et Navigation (2-3 jours)
1. Créer le layout du dashboard avec sidebar
2. Créer la page dashboard avec statistiques
3. Implémenter la navigation

### Phase 2: Gestion des Classes (2-3 jours)
1. Liste des classes
2. Formulaire de création/édition
3. Détail d'une classe
4. Gestion des élèves

### Phase 3: Sessions (3-4 jours) ⭐ PRIORITÉ
1. Formulaire de création de session
2. **Interface de session active** (reconnaissance vocale)
3. Affichage temps réel des observations
4. Résumé de session

### Phase 4: IA et Traitement (2-3 jours)
1. Intégration complète Gemini
2. Traitement automatique des observations
3. Catégorisation et sentiment

### Phase 5: Rapports et Exports (2-3 jours)
1. Génération de rapports
2. Export PDF
3. Export Excel

---

## 🐛 Résolution de Problèmes

### Erreur: "Cannot find module"
**Cause:** Les dépendances ne sont pas installées
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Supabase connection failed"
**Cause:** Variables d'environnement incorrectes
**Solution:**
1. Vérifier `.env.local`
2. Vérifier que les valeurs correspondent à `SUPABASE_CONFIG.md`
3. Redémarrer le serveur: `npm run dev`

### Erreur TypeScript
**Cause:** Types manquants
**Solution:**
```bash
npm run type-check
```

### Page blanche après login
**Cause:** La page `/dashboard` n'existe pas encore
**Solution:** Créer la page dashboard (prochaine étape)

---

## 📚 Documentation

- **PLAN_CONSTRUCTION.md** - Plan détaillé complet
- **SPECIFICATIONS_TECHNIQUES.md** - Spécifications techniques
- **SUPABASE_CONFIG.md** - Configuration Supabase
- **SUPABASE_SCHEMA.sql** - Schéma de base de données
- **README.md** - Guide utilisateur
- **QUICK_START.md** - Démarrage rapide
- **FRONTEND_STATUS.md** - État du frontend

---

## ✅ Checklist de Vérification

### Configuration
- [ ] npm install exécuté
- [ ] .env.local créé avec les bonnes valeurs
- [ ] npm run dev fonctionne
- [ ] http://localhost:3000 accessible

### Tests de Base
- [ ] Landing page s'affiche
- [ ] Page de register accessible
- [ ] Création de compte fonctionne
- [ ] Login fonctionne
- [ ] Redirection vers /dashboard (même si page vide)

### Supabase
- [ ] Projet actif sur Supabase
- [ ] Tables visibles dans le dashboard
- [ ] Profil créé après inscription

---

## 🎉 Félicitations !

Si tous les tests passent, votre application est **prête pour le développement** des pages restantes !

**Prochaine étape:** Créer le dashboard et la navigation.

---

**Besoin d'aide ?**
- Consulter les fichiers de documentation
- Vérifier les logs dans la console
- Vérifier le dashboard Supabase

**Bon développement ! 🚀**
