import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { analyzeResumeText } from '@/lib/groq'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Envie um arquivo PDF válido' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // pdf-parse v2+ exporta PDFParse como classe
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    const textResult = await parser.getText()
    const text = textResult.text?.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Não foi possível extrair texto do PDF' },
        { status: 422 }
      )
    }

    const parsed = await analyzeResumeText(text)

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('Erro ao analisar currículo:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: body.email || user.email!,
        name: body.name,
      },
      update: {
        email: body.email || user.email!,
        name: body.name,
      },
    })

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    const profile = existingProfile
      ? await prisma.profile.update({
          where: { userId: user.id },
          data: {
            headline: body.headline,
            summary: body.summary,
            phone: body.phone,
            location: body.location,
          },
        })
      : await prisma.profile.create({
          data: {
            userId: user.id,
            headline: body.headline,
            summary: body.summary,
            phone: body.phone,
            location: body.location,
          },
        })

    if (existingProfile) {
      await prisma.experience.deleteMany({ where: { profileId: profile.id } })
      await prisma.skill.deleteMany({ where: { profileId: profile.id } })
      await prisma.education.deleteMany({ where: { profileId: profile.id } })
    }

    if (body.experiences?.length) {
      await prisma.experience.createMany({
        data: body.experiences.map(
          (exp: {
            company: string
            role: string
            startDate: string
            endDate?: string | null
            description?: string
          }) => ({
            profileId: profile.id,
            company: exp.company,
            role: exp.role,
            startDate: parseDate(exp.startDate),
            endDate: exp.endDate ? parseDate(exp.endDate) : null,
            description: exp.description,
          })
        ),
      })
    }

    if (body.skills?.length) {
      await prisma.skill.createMany({
        data: body.skills.map(
          (skill: { name: string; level: string }) => ({
            profileId: profile.id,
            name: skill.name,
            level: skill.level || 'PLENO',
          })
        ),
      })
    }

    if (body.education?.length) {
      await prisma.education.createMany({
        data: body.education.map(
          (edu: {
            institution: string
            course: string
            year?: number | null
            description?: string
          }) => ({
            profileId: profile.id,
            institution: edu.institution,
            course: edu.course,
            year: edu.year ?? null,
            description: edu.description,
          })
        ),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}-01`)
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}
