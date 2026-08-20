import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dbProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        experiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        education: true,
      },
    })

    if (!dbProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        user: {
          id: dbProfile.user.id,
          email: dbProfile.user.email,
          name: dbProfile.user.name || '',
          avatar: dbProfile.user.avatar || '',
        },
        profile: {
          headline: dbProfile.headline || '',
          summary: dbProfile.summary || '',
          phone: dbProfile.phone || '',
          location: dbProfile.location || '',
        },
        experiences: dbProfile.experiences,
        skills: dbProfile.skills,
        education: dbProfile.education,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar perfil' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, headline, summary, phone, location, experiences, skills, education } =
      body

    // Atualiza o usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
      },
    })

    // Upsert no perfil
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline,
        summary,
        phone,
        location,
      },
      update: {
        headline,
        summary,
        phone,
        location,
      },
    })

    const profileId = profile.id

    // Atualiza experiências
    if (Array.isArray(experiences)) {
      await prisma.experience.deleteMany({ where: { profileId } })
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map(
            (exp: {
              company: string
              role: string
              startDate: string
              endDate?: string | null
              description?: string
            }) => ({
              profileId,
              company: exp.company || '',
              role: exp.role || '',
              startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description || '',
            })
          ),
        })
      }
    }

    // Atualiza skills
    if (Array.isArray(skills)) {
      await prisma.skill.deleteMany({ where: { profileId } })
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((sk: { name: string; level: string }) => ({
            profileId,
            name: sk.name || '',
            level: sk.level || 'Intermediário',
          })),
        })
      }
    }

    // Atualiza formação
    if (Array.isArray(education)) {
      await prisma.education.deleteMany({ where: { profileId } })
      if (education.length > 0) {
        await prisma.education.createMany({
          data: education.map(
            (edu: {
              institution: string
              course: string
              year?: number | null
              description?: string
            }) => ({
              profileId,
              institution: edu.institution || '',
              course: edu.course || '',
              year: edu.year ? parseInt(String(edu.year), 10) : null,
              description: edu.description || '',
            })
          ),
        })
      }
    }

    // Busca perfil atualizado completo
    const fullProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        experiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        education: true,
      },
    })

    return NextResponse.json({
      data: {
        user: {
          id: fullProfile!.user.id,
          email: fullProfile!.user.email,
          name: fullProfile!.user.name || '',
          avatar: fullProfile!.user.avatar || '',
        },
        profile: {
          headline: fullProfile!.headline || '',
          summary: fullProfile!.summary || '',
          phone: fullProfile!.phone || '',
          location: fullProfile!.location || '',
        },
        experiences: fullProfile!.experiences,
        skills: fullProfile!.skills,
        education: fullProfile!.education,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}