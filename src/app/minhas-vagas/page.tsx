'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  loadKanbanApplications,
  saveKanbanApplications,
  getJobById,
  addCustomJobToKanban,
  type KanbanApplication,
  type KanbanStatus,
} from '@/lib/kanban-storage'
import { Plus, Clock, Building2, MapPin, DollarSign, Edit2, Trash2, GripVertical, X, ExternalLink } from 'lucide-react'

const COLUMNS: { id: KanbanStatus; title: string; color: string }[] = [
  { id: 'INTEREST', title: 'Interesse', color: 'border-yellow-500/30' },
  { id: 'APPLIED', title: 'Aplicado', color: 'border-blue-500/30' },
  { id: 'INTERVIEW', title: 'Entrevista', color: 'border-purple-500/30' },
  { id: 'OFFER', title: 'Proposta', color: 'border-green-500/30' },
  { id: 'FINISHED', title: 'Finalizado', color: 'border-gray-500/30' },
]

export default function MinhasVagasPage() {
  const [applications, setApplications] = useState<KanbanApplication[]>([])
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    url: '',
    salaryRange: '',
    location: '',
  })

  useEffect(() => {
    setApplications(loadKanbanApplications())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveKanbanApplications(applications)
    }
  }, [applications, isLoaded])

  const applicationsByStatus = COLUMNS.reduce(
    (acc, column) => {
      acc[column.id] = applications.filter((app) => app.status === column.id)
      return acc
    },
    {} as Record<string, KanbanApplication[]>
  )

  const getJobDetails = (jobId: string) => getJobById(jobId)

  const updateApplications = useCallback(
    (updater: (prev: KanbanApplication[]) => KanbanApplication[]) => {
      setApplications(updater)
    },
    []
  )

  const handleStatusChange = (applicationId: string, newStatus: KanbanStatus) => {
    updateApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
    )
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return
    }

    const newStatus = destination.droppableId as KanbanStatus
    const application = applications.find((app) => app.id === draggableId)

    if (application) {
      handleStatusChange(draggableId, newStatus)
      const job = getJobDetails(application.jobId)
      toast.success(`Vaga movida para ${COLUMNS.find((col) => col.id === newStatus)?.title}`, {
        description: job?.title || 'Vaga',
      })
    }
  }

  const handleNotesEdit = (applicationId: string, currentNotes: string) => {
    setEditingNotes(applicationId)
    setNoteText(currentNotes || '')
  }

  const handleNotesSave = (applicationId: string) => {
    updateApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, notes: noteText } : app))
    )
    setEditingNotes(null)
    setNoteText('')
    toast.success('Nota salva')
  }

  const handleNotesCancel = () => {
    setEditingNotes(null)
    setNoteText('')
  }

  const handleDelete = (applicationId: string) => {
    if (confirm('Tem certeza que deseja remover esta candidatura?')) {
      updateApplications((prev) => prev.filter((app) => app.id !== applicationId))
      toast.success('Candidatura removida')
    }
  }

  const handleAddCustomJob = () => {
    if (!newJob.title || !newJob.company) {
      toast.error('Preencha ao menos título e empresa')
      return
    }

    addCustomJobToKanban({
      title: newJob.title,
      company: newJob.company,
      url: newJob.url,
      salaryRange: newJob.salaryRange,
      location: newJob.location,
    })

    setApplications(loadKanbanApplications())
    setShowAddModal(false)
    setNewJob({ title: '', company: '', url: '', salaryRange: '', location: '' })
    toast.success('Vaga adicionada com sucesso!')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Carregando kanban...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minhas Vagas</h1>
            <p className="text-gray-400">Acompanhe suas candidaturas em um Kanban pessoal</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar vaga
          </Button>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="border-gray-800 bg-gray-900 max-w-md w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Adicionar vaga manual</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Título *</Label>
                  <Input
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="Ex: Desenvolvedor Frontend"
                  />
                </div>
                <div>
                  <Label className="text-white">Empresa *</Label>
                  <Input
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    placeholder="Ex: Google"
                  />
                </div>
                <div>
                  <Label className="text-white">URL da vaga</Label>
                  <Input
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-white">Faixa Salarial</Label>
                  <Input
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                    placeholder="R$ 10.000 - R$ 15.000"
                  />
                </div>
                <div>
                  <Label className="text-white">Localização</Label>
                  <Input
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="São Paulo, SP ou Remoto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCustomJob} className="flex-1">
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col">
                <div
                  className={`flex items-center justify-between mb-4 p-3 rounded-lg border-l-4 ${column.color} bg-gray-900/50`}
                >
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                    {applicationsByStatus[column.id]?.length || 0}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-purple-500/5 rounded-lg p-2' : ''
                      }`}
                    >
                      {applicationsByStatus[column.id]?.map((application, index) => {
                        const job = getJobDetails(application.jobId)
                        if (!job) return null

                        return (
                          <Draggable
                            key={application.id}
                            draggableId={application.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`transition-all ${
                                  snapshot.isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
                                }`}
                              >
                                <Card className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-colors">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <CardTitle className="text-white text-sm">
                                          {job.title}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                                          <Building2 className="h-3 w-3" />
                                          {job.company}
                                        </CardDescription>
                                      </div>
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="space-y-1 text-xs text-gray-300">
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-gray-400" />
                                        <span>{job.location}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                        <span>{job.salaryRange}</span>
                                      </div>
                                    </div>

                                    {editingNotes === application.id ? (
                                      <div className="space-y-2">
                                        <Label className="text-white text-xs">Notas</Label>
                                        <Input
                                          value={noteText}
                                          onChange={(e) => setNoteText(e.target.value)}
                                          className="bg-gray-800/50 text-xs h-8"
                                          placeholder="Adicione notas..."
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-7 text-xs"
                                            onClick={() => handleNotesSave(application.id)}
                                          >
                                            Salvar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1 h-7 text-xs"
                                            onClick={handleNotesCancel}
                                          >
                                            Cancelar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        {application.notes ? (
                                          <p className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded">
                                            {application.notes}
                                          </p>
                                        ) : (
                                          <p className="text-xs text-gray-500 italic">Sem notas</p>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 text-xs mt-1 text-purple-400"
                                          onClick={() =>
                                            handleNotesEdit(application.id, application.notes || '')
                                          }
                                        >
                                          <Edit2 className="h-3 w-3 mr-1" />
                                          {application.notes ? 'Editar' : 'Adicionar'} nota
                                        </Button>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(application.appliedAt)}
                                      </div>
                                      <div className="flex gap-1">
                                        <div className="flex gap-1">
                                          {COLUMNS.map((col) => (
                                            <button
                                              key={col.id}
                                              onClick={() =>
                                                handleStatusChange(application.id, col.id)
                                              }
                                              className={`w-2 h-2 rounded-full ${
                                                application.status === col.id
                                                  ? 'bg-purple-500'
                                                  : 'bg-gray-700 hover:bg-gray-600'
                                              }`}
                                              title={col.title}
                                            />
                                          ))}
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                          onClick={() => handleDelete(application.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                      {applicationsByStatus[column.id]?.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          Nenhuma vaga nesta coluna
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        <Card className="border-gray-800 bg-gray-900/50 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {COLUMNS.map((column) => (
                <div key={column.id} className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {applicationsByStatus[column.id]?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">{column.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}