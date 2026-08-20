'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Edit,
  Save,
  X,
  Loader2,
  Camera,
} from 'lucide-react'
import type { ProfileData } from '@/lib/profile-types'
import { formatDateDisplay, formatDateForInput } from '@/lib/profile-types'

export default function PerfilPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState<ProfileData | null>(null)
  const [snapshot, setSnapshot] = useState<ProfileData | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/perfil')
      const result = await response.json().catch(() => ({}))

      // Sem login → vai pro login (corrige loading infinito)
      if (response.status === 401 || response.status === 403) {
        router.replace('/login')
        return
      }

      // Logado mas sem perfil → onboarding
      if (response.status === 404) {
        router.replace('/onboarding')
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar perfil')
      }

      setData(result.data)
      setSnapshot(result.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar perfil')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    if (!data) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          headline: data.profile.headline,
          summary: data.profile.summary,
          phone: data.profile.phone,
          location: data.profile.location,
          experiences: data.experiences.map((exp) => ({
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description,
          })),
          skills: data.skills,
          education: data.education,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (response.status === 401 || response.status === 403) {
        router.replace('/login')
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar perfil')
      }

      setData(result.data)
      setSnapshot(result.data)
      setIsEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (snapshot) setData(snapshot)
    setIsEditing(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem (JPG, PNG, WebP ou GIF)')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/perfil/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json().catch(() => ({}))

      if (response.status === 401 || response.status === 403) {
        router.replace('/login')
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar foto')
      }

      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, avatar: result.avatarUrl } } : prev
      )
      setSnapshot((prev) =>
        prev ? { ...prev, user: { ...prev.user, avatar: result.avatarUrl } } : prev
      )
      toast.success('Foto atualizada com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar foto')
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const updateUser = (field: 'name' | 'email', value: string) => {
    if (!data) return
    setData({ ...data, user: { ...data.user, [field]: value } })
  }

  const updateProfile = (field: keyof ProfileData['profile'], value: string) => {
    if (!data) return
    setData({ ...data, profile: { ...data.profile, [field]: value } })
  }

  const updateExperience = (index: number, field: string, value: string) => {
    if (!data) return
    const experiences = [...data.experiences]
    experiences[index] = { ...experiences[index], [field]: value }
    setData({ ...data, experiences })
  }

  const updateSkill = (index: number, field: 'name' | 'level', value: string) => {
    if (!data) return
    const skills = [...data.skills]
    skills[index] = { ...skills[index], [field]: value }
    setData({ ...data, skills })
  }

  const updateEducation = (
    index: number,
    field: 'institution' | 'course' | 'year' | 'description',
    value: string
  ) => {
    if (!data) return
    const education = [...data.education]
    education[index] = {
      ...education[index],
      [field]: field === 'year' ? (value ? parseInt(value, 10) : null) : value,
    }
    setData({ ...data, education })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        <p className="text-gray-400">Carregando seu perfil...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400 text-center">Não foi possível carregar o perfil.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Entrar
          </Button>
          <Button onClick={() => router.push('/onboarding')}>Ir para onboarding</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">Gerencie suas informações profissionais</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="min-h-[44px] w-full sm:w-auto shrink-0 relative z-10"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar perfil
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="min-h-[44px] flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-h-[44px] flex-1 sm:flex-none"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
          )}
        </div>

        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <label className="relative group cursor-pointer shrink-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
                <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                  {isUploadingAvatar ? (
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  ) : data.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.user.avatar}
                      alt={data.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-purple-500" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </label>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Nome</Label>
                      <Input
                        value={data.user.name}
                        onChange={(e) => updateUser('name', e.target.value)}
                        className="bg-gray-800/50"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Email</Label>
                      <Input
                        value={data.user.email}
                        onChange={(e) => updateUser('email', e.target.value)}
                        className="bg-gray-800/50"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Cargo / Título</Label>
                      <Input
                        value={data.profile.headline}
                        onChange={(e) => updateProfile('headline', e.target.value)}
                        className="bg-gray-800/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white">{data.user.name || 'Sem nome'}</h2>
                    <p className="text-gray-400 flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 shrink-0" />
                      {data.user.email}
                    </p>
                    {data.profile.headline && (
                      <p className="text-purple-400 font-medium mt-2">{data.profile.headline}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Informações de contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Telefone</Label>
                  <Input
                    value={data.profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    className="bg-gray-800/50"
                  />
                </div>
                <div>
                  <Label className="text-white">Localização</Label>
                  <Input
                    value={data.profile.location}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    className="bg-gray-800/50"
                  />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{data.profile.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{data.profile.location || '—'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Resumo profissional</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={data.profile.summary}
                onChange={(e) => updateProfile('summary', e.target.value)}
                className="w-full min-h-[120px] rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-100"
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">
                {data.profile.summary || 'Nenhum resumo cadastrado.'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experiência profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.experiences.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma experiência cadastrada.</p>
            ) : (
              data.experiences.map((exp, index) => (
                <div key={exp.id ?? index} className="border-l-2 border-purple-500/30 pl-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={exp.role}
                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                        placeholder="Cargo"
                        className="bg-gray-800/50"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Empresa"
                        className="bg-gray-800/50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={formatDateForInput(exp.startDate)}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="bg-gray-800/50"
                        />
                        <Input
                          type="date"
                          value={formatDateForInput(exp.endDate)}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value || '')}
                          className="bg-gray-800/50"
                        />
                      </div>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Descrição"
                        className="w-full min-h-[80px] rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-100"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-white">{exp.role}</h3>
                      <p className="text-purple-400 text-sm">{exp.company}</p>
                      <p className="text-gray-400 text-sm">
                        {formatDateDisplay(exp.startDate)} — {formatDateDisplay(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.skills.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma skill cadastrada.</p>
            ) : isEditing ? (
              <div className="space-y-3">
                {data.skills.map((skill, index) => (
                  <div key={skill.id ?? index} className="flex gap-2">
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="Skill"
                      className="bg-gray-800/50 flex-1"
                    />
                    <Input
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                      placeholder="Nível"
                      className="bg-gray-800/50 w-36"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill.name}
                    <span className="text-xs text-purple-400/60">({skill.level})</span>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Formação acadêmica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.education.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma formação cadastrada.</p>
            ) : (
              data.education.map((edu, index) => (
                <div key={edu.id ?? index} className="border-l-2 border-blue-500/30 pl-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={edu.course}
                        onChange={(e) => updateEducation(index, 'course', e.target.value)}
                        placeholder="Curso"
                        className="bg-gray-800/50"
                      />
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="Instituição"
                        className="bg-gray-800/50"
                      />
                      <Input
                        type="number"
                        value={edu.year ?? ''}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        placeholder="Ano"
                        className="bg-gray-800/50 w-32"
                      />
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="Descrição"
                        className="w-full min-h-[60px] rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-100"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-white">{edu.course}</h3>
                      <p className="text-blue-400 text-sm">{edu.institution}</p>
                      {edu.year && <p className="text-gray-400 text-sm">{edu.year}</p>}
                      {edu.description && (
                        <p className="text-gray-300 text-sm mt-2">{edu.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}