import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  if (next === '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  })

  const redirectPath = profile ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}
