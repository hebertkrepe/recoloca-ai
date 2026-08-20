'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockJobs } from '@/lib/mock-data'
import { Briefcase, Send, Calendar, TrendingUp, ArrowRight, MapPin, DollarSign, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { 
  addOrUpdateJob, 
  isJobApplied, 
  isJobBookmarked,
  getKanbanMetrics 
} from '@/lib/kanban-storage'

export default function DashboardPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [metrics, setMetrics] = useState({
    savedJobs: 0,
    activeApplications: 0,
    scheduledInterviews: 0,
    responseRate: 0,
  })

  useEffect(() => {
    const loadData = () => {
      setMetrics(getKanbanMetrics())
    }
    loadData()
    window.addEventListener('focus', loadData)
    return () => window.removeEventListener('focus', loadData)
  }, [refreshKey])

  const handleSaveJob = (job: typeof mockJobs[0]) => {
    if (isJobBookmarked(job.id)) {
      toast.info(`Vaga "${job.title}" já está salva!`)
      return
    }

    if (isJobApplied(job.id)) {
      toast.info(`Você já aplicou nessa vaga!`)
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

  const handleApplyJob = (job: typeof mockJobs[0]) => {
    if (isJobApplied(job.id)) {
      toast.info(`Você já aplicou nessa vaga!`)
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

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral da sua recolocação profissional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Vagas salvas</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.savedJobs}</div>
              <p className="text-xs text-gray-400 mt-1">Em Interesse</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Aplicações ativas</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.activeApplications}</div>
              <p className="text-xs text-gray-400 mt-1">Aguardando resposta</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Entrevistas</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.scheduledInterviews}</div>
              <p className="text-xs text-gray-400 mt-1">Agendadas</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Taxa de resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.responseRate}%</div>
              <p className="text-xs text-gray-400 mt-1">Aplicações → Respostas</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Vagas recomendadas</h2>
            <Button variant="outline" size="sm" onClick={() => router.push('/vagas')}>
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockJobs.slice(0, 3).map((job) => {
              const isSaved = isJobBookmarked(job.id)
              const isApplied = isJobApplied(job.id)
              
              return (
                <Card key={job.id} className="border-gray-800 bg-gray-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{job.title}</CardTitle>
                    <CardDescription className="text-gray-400">{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
                        {job.seniority}
                      </span>
                      {job.remote && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                          Remoto
                        </span>
                      )}
                      {isApplied && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                          Aplicado
                        </span>
                      )}
                      {isSaved && !isApplied && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                          Salva
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-300">
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
                        <span>{formatRelativeDate(job.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSaveJob(job)}
                        disabled={isSaved || isApplied}
                      >
                        {isSaved ? 'Salva' : 'Salvar'}
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleApplyJob(job)}
                        disabled={isApplied}
                      >
                        {isApplied ? 'Aplicado' : 'Aplicar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Ações rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Acesse rapidamente as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/vagas')}>
                <Briefcase className="h-5 w-5" />
                <span className="text-sm">Ver vagas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/minhas-vagas')}>
                <Send className="h-5 w-5" />
                <span className="text-sm">Minhas vagas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/minhas-vagas')}>
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Entrevistas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info('Em breve!')}>
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">Estatísticas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}