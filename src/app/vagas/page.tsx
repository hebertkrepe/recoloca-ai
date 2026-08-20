'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockJobs } from '@/lib/mock-data'
import { Search, MapPin, DollarSign, Clock, Building2, Bookmark, Filter } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { 
  addOrUpdateJob, 
  isJobApplied, 
  isJobBookmarked,
  toggleJobBookmark,
  removeFromKanban
} from '@/lib/kanban-storage'

export default function VagasPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSeniority, setSelectedSeniority] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [filter, setFilter] = useState<'all' | 'saved' | 'applied'>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleViewDetails = (jobId: string) => {
    router.push(`/vagas/${jobId}`)
  }

  const handleApply = (job: typeof mockJobs[0]) => {
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

  const handleToggleBookmark = (job: typeof mockJobs[0]) => {
    if (isJobApplied(job.id)) {
      toast.info('Você já aplicou nessa vaga!')
      return
    }

    if (isJobBookmarked(job.id)) {
      removeFromKanban(job.id)
      setRefreshKey(k => k + 1)
      toast.info(`"${job.title}" removida dos favoritos`)
    } else {
      addOrUpdateJob({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salaryRange: job.salaryRange,
        status: 'INTEREST',
      })
      setRefreshKey(k => k + 1)
      toast.success(`"${job.title}" salva!`, {
        description: 'Adicionada em Interesse'
      })
    }
  }

  const locations = Array.from(new Set(mockJobs.map(job => job.location)))
  const seniorities = Array.from(new Set(mockJobs.map(job => job.seniority)))

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !selectedLocation || job.location === selectedLocation
    const matchesSeniority = !selectedSeniority || job.seniority === selectedSeniority
    const matchesRemote = !remoteOnly || job.remote
    
    let matchesFilter = true
    if (filter === 'saved') matchesFilter = isJobBookmarked(job.id)
    if (filter === 'applied') matchesFilter = isJobApplied(job.id)

    return matchesSearch && matchesLocation && matchesSeniority && matchesRemote && matchesFilter
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLocation('')
    setSelectedSeniority('')
    setRemoteOnly(false)
    setFilter('all')
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vagas disponíveis</h1>
          <p className="text-gray-400">Encontre a oportunidade perfeita</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button 
            variant={filter === 'saved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('saved')}
          >
            ★ Favoritas
          </Button>
          <Button 
            variant={filter === 'applied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('applied')}
          >
            ✓ Aplicadas
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-gray-800 bg-gray-900/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cargo, empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Localização</Label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-100"
                  >
                    <option value="">Todas</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Senioridade</Label>
                  <select
                    value={selectedSeniority}
                    onChange={(e) => setSelectedSeniority(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-100"
                  >
                    <option value="">Todas</option>
                    {seniorities.map(seniority => (
                      <option key={seniority} value={seniority}>{seniority}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-800/50"
                  />
                  <Label htmlFor="remote" className="text-white cursor-pointer">
                    Apenas remoto
                  </Label>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-400">
                {filteredJobs.length} vaga{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const isSaved = isJobBookmarked(job.id)
                const isApplied = isJobApplied(job.id)
                
                return (
                  <Card key={job.id} className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-gray-400 flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleBookmark(job)}
                          className={isSaved ? 'text-purple-500' : 'text-gray-400'}
                          disabled={isApplied}
                        >
                          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm line-clamp-2">{job.description}</p>

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
                            ✓ Aplicado
                          </span>
                        )}
                        {isSaved && !isApplied && (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                            ★ Salva
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
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

                      <div className="flex gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleViewDetails(job.id)}
                        >
                          Ver detalhes
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleApply(job)}
                          disabled={isApplied}
                        >
                          {isApplied ? 'Já aplicado' : 'Aplicar agora'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredJobs.length === 0 && (
                <Card className="border-gray-800 bg-gray-900/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400 mb-4">
                      {filter === 'saved' ? 'Nenhuma vaga favoritada ainda' :
                       filter === 'applied' ? 'Nenhuma vaga aplicada ainda' :
                       'Nenhuma vaga encontrada'}
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}