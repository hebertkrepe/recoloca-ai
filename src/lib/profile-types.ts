export type ProfileExperience = {
  id?: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  description?: string | null
}

export type ProfileSkill = {
  id?: string
  name: string
  level: string
}

export type ProfileEducation = {
  id?: string
  institution: string
  course: string
  year: number | null
  description?: string | null
}

export type ProfileData = {
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
  profile: {
    id: string
    headline: string
    summary: string
    phone: string
    location: string
  }
  experiences: ProfileExperience[]
  skills: ProfileSkill[]
  education: ProfileEducation[]
}

export type ProfileUpdatePayload = {
  name: string
  email: string
  headline: string
  summary: string
  phone: string
  location: string
  experiences: ProfileExperience[]
  skills: ProfileSkill[]
  education: ProfileEducation[]
}

export function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}-01`)
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function formatDateDisplay(date: Date | string | null | undefined): string {
  if (!date) return 'Atual'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}
