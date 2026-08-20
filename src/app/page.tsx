import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Layout, Brain, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Sua recolocação{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                começa aqui
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              A plataforma que ajuda profissionais em layoff a se recolocarem no mercado com IA
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/cadastro">
                <Button size="lg" className="text-lg px-8 py-6">
                  Começar grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/vagas">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Ver vagas
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-400 pt-4">
              ✓ Sem cartão de crédito ✓ Setup em 2 minutos ✓ Cancelamento a qualquer momento
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Por que escolher a RecolocaAI?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Ferramentas poderosas para acelerar sua recolocação profissional
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Layout className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-white">Organize sua busca</CardTitle>
                <CardDescription className="text-gray-400">
                  Kanban pessoal para gerenciar suas candidaturas de forma visual e eficiente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Acompanhe cada etapa do processo: interesse, aplicação, entrevista e proposta
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-white">IA analisa seu perfil</CardTitle>
                <CardDescription className="text-gray-400">
                  Inteligência artificial que extrai e otimiza informações do seu currículo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Upload de currículo em PDF com análise automática e sugestões de melhoria
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-white">Comunidade de apoio</CardTitle>
                <CardDescription className="text-gray-400">
                  Conecte-se com outros profissionais em recolocação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Compartilhe experiências, dicas e oportunidades com a comunidade
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar sua recolocação?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já encontraram novas oportunidades
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="text-lg px-8 py-6">
              Começar agora gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}