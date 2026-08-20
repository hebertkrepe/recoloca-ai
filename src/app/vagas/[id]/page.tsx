'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockJobs } from '@/lib/mock-data'
import { ArrowLeft, MapPin, DollarSign, Clock, Building2, Bookmark, CheckCircle } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { 
  addOrUpdateJob, 
  isJobApplied, 
  isJobBookmarked,
  removeFromKanban
} from '@/lib/kanban-storage'

export default function VagaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const [refreshKey, setRefreshKey] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const job = mockJobs.find(j => j.id === jobId)

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-950 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Vaga não encontrada</h1>
            <Button onClick={() => router.push('/vagas')}>
              Voltar para vagas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isSaved = mounted && isJobBookmarked(job.id)
  const isApplied = mounted && isJobApplied(job.id)

  const handleApply = () => {
    if (isJobApplied(job.id)) {
      toast.info('Você já aplicou nessa vaga!')
      return
    }

    addOrUpdateJob({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange,
      status: 'APPLIED',
    })

    setRefreshKey(k => k + 1)
    toast.success(`Aplicação para "${job.title}" enviada!`, {
      description: 'Adicionada em Aplicado'
    })
  }

  const handleSave = () => {
    if (isJobApplied(job.id)) {
      toast.info('Você já aplicou nessa vaga!')
      return
    }

    if (isJobBookmarked(job.id)) {
      removeFromKanban(job.id)
      setRefreshKey(k => k + 1)
      toast.info(`"${job.title}" removida dos favoritos`)
      return
    }

    addOrUpdateJob({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange,
      status: 'INTEREST',
    })

    setRefreshKey(k => k + 1)
    toast.success(`Vaga "${job.title}" salva!`, {
      description: 'Adicionada em Interesse'
    })
  }

  const handleBack = () => {
    router.push('/vagas')
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para vagas
        </Button>

        {/* Job Header */}
        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-gray-400 flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  {job.company}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isApplied}
                className={isSaved ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}
              >
                <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                {job.seniority}
              </span>
              {job.remote && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                  Remoto
                </span>
              )}
              {isApplied && (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                  ✓ Aplicado
                </span>
              )}
              {isSaved && !isApplied && (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">
                  ★ Salva
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>{job.salaryRange}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Postado há {formatRelativeDate(job.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Descrição da vaga</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed mb-6">{job.description}</p>
            
            <h3 className="text-white font-semibold mb-3">Responsabilidades</h3>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Desenvolver e manter aplicações web escaláveis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Colaborar com equipe de design e produto</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Participar de code reviews e melhorias de código</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Implementar testes e garantir qualidade do software</span>
              </li>
            </ul>

            <h3 className="text-white font-semibold mb-3">Requisitos</h3>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Experiência sólida com React e Next.js</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Conhecimento em TypeScript</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Experiência com banco de dados SQL</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Capacidade de trabalhar em equipe ágil</span>
              </li>
            </ul>

            <h3 className="text-white font-semibold mb-3">Benefícios</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Salário competitivo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Trabalho remoto híbrido</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Plano de saúde e odontológico</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Orçamento para aprendizado e desenvolvimento</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Sobre a empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              {job.company} é uma empresa inovadora que está transformando o mercado com soluções tecnológicas de ponta. 
              Buscamos talentos que queiram fazer parte de uma equipe dinâmica e colaborativa, onde cada contribuição é valorizada.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSave}
            disabled={isApplied}
          >
            <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Salva' : 'Salvar vaga'}
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={isApplied}
          >
            {isApplied ? '✓ Aplicado' : 'Aplicar agora'}
          </Button>
        </div>
      </div>
    </div>
  )
}