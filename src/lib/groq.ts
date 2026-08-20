import Groq from 'groq-sdk'

const GROQ_MODEL = 'groq/compound-mini'

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY não configurada')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export interface ResumeExperience {
  company: string
  role: string
  startDate: string
  endDate: string | null
  description?: string
}

export interface ResumeSkill {
  name: string
  level: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA'
}

export interface ResumeEducation {
  institution: string
  course: string
  year: number | null
  description?: string
}

export interface ParsedResume {
  name: string
  email: string
  phone: string
  location: string
  headline: string
  summary: string
  experiences: ResumeExperience[]
  skills: ResumeSkill[]
  education: ResumeEducation[]
}

export async function callGroq(
  messages: Groq.Chat.Completions.ChatCompletionMessageParam[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getGroqClient()

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 4096,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('Resposta vazia da IA')
  }

  return content
}

export async function analyzeResumeText(resumeText: string): Promise<ParsedResume> {
  const systemPrompt = `Você é um especialista em RH e análise de currículos.
Extraia informações do currículo e retorne APENAS um JSON válido com esta estrutura:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "Cidade/Estado",
  "headline": "cargo ou título profissional",
  "summary": "resumo profissional em 2-4 frases",
  "experiences": [
    {
      "company": "string",
      "role": "string",
      "startDate": "YYYY-MM-DD ou YYYY-MM",
      "endDate": "YYYY-MM-DD, YYYY-MM ou null se atual",
      "description": "string opcional"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "JUNIOR | PLENO | SENIOR | ESPECIALISTA"
    }
  ],
  "education": [
    {
      "institution": "string",
      "course": "string",
      "year": 2020,
      "description": "string opcional"
    }
  ]
}
Use strings vazias quando não encontrar um campo. Inferir nível de skill com base no contexto do currículo.`

  const response = await callGroq([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Analise este currículo e extraia os dados:\n\n${resumeText.slice(0, 12000)}`,
    },
  ])

  try {
    return JSON.parse(response) as ParsedResume
  } catch {
    throw new Error('Falha ao interpretar resposta da IA')
  }
}

export { GROQ_MODEL }
