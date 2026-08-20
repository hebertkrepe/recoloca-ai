'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Upload, FileText, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import type { ParsedResume } from '@/lib/groq'

const emptyData: ParsedResume = {
  name: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  summary: '',
  experiences: [],
  skills: [],
  education: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [extractedData, setExtractedData] = useState<ParsedResume>(emptyData)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      toast.error('Por favor, selecione um arquivo PDF')
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setStep(2)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao analisar currículo')
      }

      setExtractedData(result.data)
      setStep(3)
      toast.success('Currículo analisado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao analisar currículo')
      setStep(1)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirm = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar perfil')
      }

      toast.success('Perfil salvo com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = <K extends keyof ParsedResume>(field: K, value: ParsedResume[K]) => {
    setExtractedData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">RecolocaAI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Configure seu perfil</h1>
          <p className="text-gray-400">
            {step === 1 && 'Faça upload do seu currículo para que nossa IA possa extrair suas informações'}
            {step === 2 && 'Analisando seu currículo com IA...'}
            {step === 3 && 'Confirme as informações extraídas do seu currículo'}
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center">
                {i > 0 && <div className={`w-12 h-0.5 ${step >= s ? 'bg-purple-500' : 'bg-gray-800'}`} />}
                <div className={`flex items-center ${step >= s ? 'text-purple-500' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm font-medium">{s}</span>}
                  </div>
                  <span className="ml-2 text-sm hidden sm:inline">
                    {s === 1 ? 'Upload' : s === 2 ? 'Análise' : 'Confirmação'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Upload do Currículo</CardTitle>
              <CardDescription className="text-gray-400">
                Envie seu currículo em PDF para análise automática com Groq AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">Arraste seu currículo aqui ou clique para selecionar</p>
                <Input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Selecionar arquivo PDF</span>
                  </Button>
                </Label>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="min-w-[120px]">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      Analisar currículo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-purple-500 mx-auto mb-6 animate-spin" />
                <h3 className="text-xl font-semibold text-white mb-2">Analisando seu currículo com IA</h3>
                <p className="text-gray-400">
                  Nossa IA está extraindo suas habilidades, experiências e informações pessoais...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Confirme suas informações</CardTitle>
              <CardDescription className="text-gray-400">
                Revise os dados extraídos do seu currículo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {(['name', 'email', 'phone', 'location', 'headline'] as const).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-white capitalize">
                      {field === 'headline' ? 'Cargo/Título' : field === 'location' ? 'Cidade/Estado' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input
                      value={extractedData[field]}
                      readOnly={!isEditing}
                      onChange={(e) => updateField(field, e.target.value)}
                      className={isEditing ? '' : 'bg-gray-800/50'}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Resumo profissional</Label>
                <textarea
                  value={extractedData.summary}
                  readOnly={!isEditing}
                  onChange={(e) => updateField('summary', e.target.value)}
                  className={`w-full min-h-[100px] rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-100 ${isEditing ? 'bg-gray-900' : 'bg-gray-800/50'}`}
                />
              </div>

              {extractedData.experiences.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Experiências</Label>
                  <div className="space-y-2">
                    {extractedData.experiences.map((exp, i) => (
                      <div key={i} className="p-3 bg-gray-800/30 rounded-lg text-sm">
                        <p className="text-white font-medium">{exp.role} — {exp.company}</p>
                        <p className="text-gray-400">{exp.startDate} — {exp.endDate || 'Atual'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white">Skills identificadas</Label>
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </div>

              {extractedData.education.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Formação acadêmica</Label>
                  <div className="space-y-2">
                    {extractedData.education.map((edu, i) => (
                      <div key={i} className="p-3 bg-gray-800/30 rounded-lg text-sm">
                        <p className="text-white font-medium">{edu.course}</p>
                        <p className="text-gray-400">{edu.institution} {edu.year ? `— ${edu.year}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Bloquear edição' : 'Editar informações'}
                </Button>
                <Button onClick={handleConfirm} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Confirmar e continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
