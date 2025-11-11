# 🚀 Guide de Déploiement

## Déploiement sur Netlify

### ✅ Corrections Appliquées

Les erreurs de déploiement Netlify ont été corrigées :

1. **Configuration Next.js** ✅
   - Suppression de `experimental.serverActions` (obsolète dans Next.js 14)
   - Configuration ESLint mise à jour

2. **Erreurs ESLint** ✅
   - Toutes les apostrophes échappées (`&apos;`)
   - Tous les guillemets échappés (`&quot;`)
   - Warnings React Hooks transformés en warnings (non-bloquants)

3. **Export Supabase Server** ✅
   - Fonction `createClient` correctement exportée pour les API routes

### 📋 Configuration Netlify

**Build Settings:**
```
Build command: npm run build
Publish directory: .next
```

**Environment Variables à configurer:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://gdhplppplmyrsyrzldmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=votre_clé_gemini_api
NEXT_PUBLIC_APP_URL=https://votre-site.netlify.app
```

### 🔄 Redéploiement

Le code a été poussé sur GitHub avec les corrections. Netlify devrait automatiquement redéployer.

Si le déploiement automatique ne se lance pas :
1. Aller sur Netlify Dashboard
2. Cliquer sur "Trigger deploy" → "Deploy site"

### ⚠️ Variables d'Environnement Importantes

**À configurer dans Netlify:**

1. **Supabase** (obligatoire)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Gemini API** (obligatoire pour IA)
   - `GEMINI_API_KEY`
   - Obtenir une clé sur: https://makersuite.google.com/app/apikey

3. **App URL** (recommandé)
   - `NEXT_PUBLIC_APP_URL`
   - Ex: `https://eps-vocal.netlify.app`

### 📝 Étapes de Configuration Netlify

1. **Aller dans Site settings → Build & deploy → Environment**
2. **Ajouter les variables d'environnement**
3. **Redéployer le site**

### ✅ Vérifications Post-Déploiement

Après le déploiement, vérifier :
- [ ] Page d'accueil accessible
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard accessible après connexion
- [ ] Création de classe fonctionne
- [ ] Reconnaissance vocale fonctionne (nécessite HTTPS)

### 🔧 Dépannage

**Si le build échoue encore:**

1. Vérifier les logs Netlify
2. S'assurer que toutes les variables d'environnement sont configurées
3. Vérifier que le projet utilise Node.js 18+ (configuré dans Netlify)

**Si la reconnaissance vocale ne fonctionne pas:**
- La Web Speech API nécessite HTTPS
- Vérifier que le site est bien en HTTPS (Netlify fournit HTTPS automatiquement)
- Tester dans Chrome ou Edge (meilleur support)

**Si l'IA ne fonctionne pas:**
- Vérifier que `GEMINI_API_KEY` est configurée
- Vérifier les quotas de l'API Gemini
- Consulter les logs dans Netlify Functions

### 🎯 Résultat Attendu

Après un déploiement réussi, vous devriez voir :
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 📚 Ressources

- [Documentation Netlify Next.js](https://docs.netlify.com/frameworks/next-js/overview/)
- [Supabase avec Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Gemini API](https://ai.google.dev/docs)

---

**Dernière mise à jour:** 9 novembre 2025  
**Statut:** ✅ Prêt pour déploiement
