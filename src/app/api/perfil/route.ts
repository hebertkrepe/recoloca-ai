import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { parseDate, type ProfileUpdatePayload } from '@/lib/profile-types'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            experiences: { orderBy: { startDate: 'desc' } },
            skills: { orderBy: { name: 'asc' } },
            education: { orderBy: { year: 'desc' } },
          },
        },
      },
    })

    if (!dbUser?.profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const { profile } = dbUser

    return NextResponse.json({
      data: {
        user: {
          id: dbUser.id,
          name: dbUser.name || user.user_metadata?.name || '',
          email: dbUser.email,
          avatar: dbUser.avatar || user.user_metadata?.avatar_url || '',
        },
        profile: {
          id: profile.id,
          headline: profile.headline || '',
          summary: profile.summary || '',
          phone: profile.phone || '',
          location: profile.location || '',
        },
        experiences: profile.experiences.map((exp) => ({
          id: exp.id,
          company: exp.company,
          role: exp.role,
          startDate: exp.startDate.toISOString(),
          endDate: exp.endDate?.toISOString() ?? null,
          description: exp.description,
        })),
        skills: profile.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
        })),
        education: profile.education.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          course: edu.course,
          year: edu.year,
          description: edu.description,
        })),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
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

    const body = (await request.json()) as ProfileUpdatePayload

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        email: body.email,
      },
    })

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        headline: body.headline,
        summary: body.summary,
        phone: body.phone,
        location: body.location,
      },
    })

    await prisma.experience.deleteMany({ where: { profileId: profile.id } })
    await prisma.skill.deleteMany({ where: { profileId: profile.id } })
    await prisma.education.deleteMany({ where: { profileId: profile.id } })

    if (body.experiences?.length) {
      await prisma.experience.createMany({
        data: body.experiences.map((exp) => ({
          profileId: profile.id,
          company: exp.company,
          role: exp.role,
          startDate: parseDate(exp.startDate),
          endDate: exp.endDate ? parseDate(exp.endDate) : null,
          description: exp.description,
        })),
      })
    }

    if (body.skills?.length) {
      await prisma.skill.createMany({
        data: body.skills.map((skill) => ({
          profileId: profile.id,
          name: skill.name,
          level: skill.level || 'PLENO',
        })),
      })
    }

    if (body.education?.length) {
      await prisma.education.createMany({
        data: body.education.map((edu) => ({
          profileId: profile.id,
          institution: edu.institution,
          course: edu.course,
          year: edu.year ?? null,
          description: edu.description,
        })),
      })
    }

    return GET()
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
