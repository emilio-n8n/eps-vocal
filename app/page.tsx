import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Users, FileText, TrendingUp, Clock, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EPS Vocal</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Carnet Numérique Sport
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          L&apos;assistant vocal intelligent pour les professeurs d&apos;EPS. 
          Prenez des notes automatiquement pendant vos cours et générez des rapports en un clic.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              <Mic className="h-5 w-5" />
              Commencer gratuitement
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Se connecter
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Comment ça marche ?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Parlez naturellement</CardTitle>
              <CardDescription>
                Pendant votre cours, parlez simplement à voix haute pour noter vos observations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>L&apos;IA analyse</CardTitle>
              <CardDescription>
                Simplifiez l&apos;évaluation de vos élèves en EPS grâce à l&apos;intelligence artificielle qui identifie automatiquement les élèves et catégorise vos observations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Rapports automatiques</CardTitle>
              <CardDescription>
                Générez des rapports PDF et Excel pour les parents et l&apos;administration en un clic
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Les avantages
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Gain de temps énorme</h4>
                <p className="text-muted-foreground">
                  Plus besoin de prendre des notes pendant le cours. Concentrez-vous sur l&#39;enseignement.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Suivi personnalisé</h4>
                <p className="text-muted-foreground">
                  Chaque élève bénéficie d&apos;un suivi détaillé de ses progrès et performances
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Rapports professionnels</h4>
                <p className="text-muted-foreground">
                  Documents clairs et structurés, prêts à être partagés avec les parents
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Sécurisé et confidentiel</h4>
                <p className="text-muted-foreground">
                  Vos données sont privées et conformes aux règles de protection des données scolaires
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">
          Prêt à simplifier votre travail ?
        </h3>
        <p className="text-xl text-muted-foreground mb-8">
          Rejoignez les professeurs d&apos;EPS qui utilisent déjà EPS Vocal
        </p>
        <Link href="/register">
          <Button size="lg" className="gap-2">
            <Mic className="h-5 w-5" />
            Créer mon compte gratuitement
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 EPS Vocal. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
