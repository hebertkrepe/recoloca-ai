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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        experiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        education: true,
      },
    })

    if (!dbUser || !dbUser.profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || '',
          avatar: dbUser.avatar || '',
        },
        profile: {
          headline: dbUser.profile.headline || '',
          summary: dbUser.profile.summary || '',
          phone: dbUser.profile.phone || '',
          location: dbUser.profile.location || '',
        },
        experiences: dbUser.experiences,
        skills: dbUser.skills,
        education: dbUser.education,
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
    const { name, email, headline, summary, phone, location, experiences, skills, education } = body

    // Atualiza usuário e perfil
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        profile: {
          upsert: {
            create: { headline, summary, phone, location },
            update: { headline, summary, phone, location },
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Atualiza experiências
    if (Array.isArray(experiences)) {
      await prisma.experience.deleteMany({ where: { profileId: updatedUser.profile!.id } })
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map((exp: any) => ({
            profileId: updatedUser.profile!.id,
            company: exp.company || '',
            role: exp.role || '',
            startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description || '',
          })),
        }))
      }
    }

    // Atualiza skills
    if (Array.isArray(skills)) {
      await prisma.skill.deleteMany({ where: { profileId: updatedUser.profile!.id } })
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((sk: any) => ({
            profileId: updatedUser.profile!.id,
            name: sk.name || '',
            level: sk.level || 'Intermediário',
          })),
        }))
      }
    }

    // Atualiza formação
    if (Array.isArray(education)) {
      await prisma.education.deleteMany({ where: { profileId: updatedUser.profile!.id } })
      if (education.length > 0) {
        await prisma.education.createMany({
          data: education.map((edu: any) => ({
            profileId: updatedUser.profile!.id,
            institution: edu.institution || '',
            course: edu.course || '',
            year: edu.year ? parseInt(String(edu.year), 10) : null,
            description: edu.description || '',
          })),
        }))
      }
    }

    // Busca perfil atualizado completo
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        experiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        education: true,
      },
    })

    return NextResponse.json({
      data: {
        user: {
          id: fullUser!.id,
          email: fullUser!.email,
          name: fullUser!.name || '',
          avatar: fullUser!.avatar || '',
        },
        profile: {
          headline: fullUser!.profile?.headline || '',
          summary: fullUser!.profile?.summary || '',
          phone: fullUser!.profile?.phone || '',
          location: fullUser!.profile?.location || '',
        },
        experiences: fullUser!.experiences,
        skills: fullUser!.skills,
        education: fullUser!.education,
      },
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}