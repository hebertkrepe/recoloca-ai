import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const BUCKET = 'avatars'
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Storage não configurado (SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use JPG, PNG, WebP ou GIF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx. 2MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Erro upload Supabase:', uploadError)
      return NextResponse.json(
        {
          error:
            uploadError.message.includes('Bucket not found')
              ? 'Bucket "avatars" não encontrado. Crie no Supabase Storage.'
              : 'Erro ao fazer upload da foto',
        },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(filePath)

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: publicUrl },
    })

    return NextResponse.json({ avatarUrl: publicUrl })
  } catch (error) {
    console.error('Erro ao upload avatar:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
