import { mockJobs } from '@/lib/mock-data'

export type KanbanStatus = 'INTEREST' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'FINISHED'

export type KanbanApplication = {
  id: string
  userId: string
  jobId: string
  status: KanbanStatus
  notes?: string
  appliedAt: string
}

export type KanbanJob = {
  id: string
  title: string
  company: string
  location: string
  salaryRange?: string
  url?: string
  description?: string
  seniority?: string
  remote?: boolean
  isCustom: boolean
}

export type CustomJobInput = {
  title: string
  company: string
  url?: string
  salaryRange?: string
  location: string
}

export type AddJobInput = {
  id: string
  title: string
  company: string
  location: string
  salaryRange?: string
  url?: string
  status: KanbanStatus
}

const APPLICATIONS_KEY = 'jobApplications_v2'
const CUSTOM_JOBS_KEY = 'kanbanCustomJobs_v2'

export function loadKanbanApplications(): KanbanApplication[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(APPLICATIONS_KEY)
    if (stored) return JSON.parse(stored) as KanbanApplication[]
  } catch {}
  return []
}

export function saveKanbanApplications(applications: KanbanApplication[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications))
}

export function loadCustomJobs(): KanbanJob[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CUSTOM_JOBS_KEY)
    if (stored) return JSON.parse(stored) as KanbanJob[]
  } catch {}
  return []
}

function saveCustomJobs(jobs: KanbanJob[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CUSTOM_JOBS_KEY, JSON.stringify(jobs))
}

export function getJobById(jobId: string): KanbanJob | undefined {
  const custom = loadCustomJobs().find((job) => job.id === jobId)
  if (custom) return custom

  const mock = mockJobs.find((job) => job.id === jobId)
  if (!mock) return undefined

  return {
    id: mock.id,
    title: mock.title,
    company: mock.company,
    location: mock.location,
    salaryRange: mock.salaryRange,
    description: mock.description,
    seniority: mock.seniority,
    remote: mock.remote,
    isCustom: false,
  }
}

export function isJobBookmarked(jobId: string): boolean {
  return loadKanbanApplications().some(
    (app) => app.jobId === jobId && app.status === 'INTEREST'
  )
}

export function isJobApplied(jobId: string): boolean {
  return loadKanbanApplications().some(
    (app) => app.jobId === jobId && 
    (app.status === 'APPLIED' || app.status === 'INTERVIEW' || 
     app.status === 'OFFER' || app.status === 'FINISHED')
  )
}

export function isJobInKanban(jobId: string): boolean {
  return loadKanbanApplications().some((app) => app.jobId === jobId)
}

export function getBookmarkedJobIds(): string[] {
  return loadKanbanApplications()
    .filter((app) => app.status === 'INTEREST')
    .map((app) => app.jobId)
}

export function getAppliedJobIds(): string[] {
  return loadKanbanApplications()
    .filter((app) => 
      app.status === 'APPLIED' || app.status === 'INTERVIEW' || 
      app.status === 'OFFER' || app.status === 'FINISHED'
    )
    .map((app) => app.jobId)
}

export function addJobToKanban(
  jobId: string,
  status: KanbanStatus,
  userId = 'local-user'
): KanbanApplication {
  const applications = loadKanbanApplications()
  const existing = applications.find((app) => app.jobId === jobId)

  if (existing) {
    const updated = applications.map((app) =>
      app.jobId === jobId ? { ...app, status } : app
    )
    saveKanbanApplications(updated)
    return { ...existing, status }
  }

  const newApp: KanbanApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    jobId,
    status,
    notes: '',
    appliedAt: new Date().toISOString(),
  }

  saveKanbanApplications([...applications, newApp])
  return newApp
}

export function addOrUpdateJob(input: AddJobInput, userId = 'local-user'): KanbanApplication {
  const applications = loadKanbanApplications()
  const existing = applications.find((app) => app.jobId === input.id)

  // Se já existe, só atualiza status
  if (existing) {
    const updated = applications.map((app) =>
      app.jobId === input.id ? { ...app, status: input.status } : app
    )
    saveKanbanApplications(updated)
    return { ...existing, status: input.status }
  }

  // Salva dados da vaga em customJobs se não for mock
  const isMock = mockJobs.some(m => m.id === input.id)
  if (!isMock) {
    const customs = loadCustomJobs()
    const customExists = customs.some(c => c.id === input.id)
    if (!customExists) {
      const job: KanbanJob = {
        id: input.id,
        title: input.title,
        company: input.company,
        location: input.location,
        salaryRange: input.salaryRange,
        url: input.url,
        isCustom: true,
      }
      saveCustomJobs([...customs, job])
    }
  }

  const newApp: KanbanApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    jobId: input.id,
    status: input.status,
    notes: '',
    appliedAt: new Date().toISOString(),
  }

  saveKanbanApplications([...applications, newApp])
  return newApp
}

export function toggleJobBookmark(jobId: string): boolean {
  const applications = loadKanbanApplications()
  const existing = applications.find((app) => app.jobId === jobId)

  if (existing?.status === 'INTEREST') {
    saveKanbanApplications(applications.filter((app) => app.id !== existing.id))
    return false
  }

  if (existing) {
    return false
  }

  addJobToKanban(jobId, 'INTEREST')
  return true
}

export function removeFromKanban(jobId: string): void {
  const applications = loadKanbanApplications()
  saveKanbanApplications(applications.filter((app) => app.jobId !== jobId))
}

export function addCustomJobToKanban(input: CustomJobInput): KanbanApplication {
  const jobId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const job: KanbanJob = {
    id: jobId,
    title: input.title,
    company: input.company,
    location: input.location,
    salaryRange: input.salaryRange,
    url: input.url,
    isCustom: true,
  }

  saveCustomJobs([...loadCustomJobs(), job])

  const application: KanbanApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'local-user',
    jobId,
    status: 'INTEREST',
    notes: input.url || '',
    appliedAt: new Date().toISOString(),
  }

  saveKanbanApplications([...loadKanbanApplications(), application])
  return application
}

export function getKanbanMetrics() {
  const applications = loadKanbanApplications()
  const savedJobs = applications.filter((app) => app.status === 'INTEREST').length
  const activeApplications = applications.filter((app) => app.status === 'APPLIED').length
  const scheduledInterviews = applications.filter((app) => app.status === 'INTERVIEW').length

  const responses = applications.filter((app) =>
    ['INTERVIEW', 'OFFER', 'FINISHED'].includes(app.status)
  ).length

  const totalActioned = applications.filter((app) =>
    ['APPLIED', 'INTERVIEW', 'OFFER', 'FINISHED'].includes(app.status)
  ).length

  const responseRate = totalActioned > 0 ? Math.round((responses / totalActioned) * 100) : 0

  return {
    savedJobs,
    activeApplications,
    scheduledInterviews,
    responseRate,
    totalApplications: applications.length,
  }
}