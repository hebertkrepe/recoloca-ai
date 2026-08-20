import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const protectedPaths = ['/dashboard', '/perfil', '/minhas-vagas', '/onboarding']
  const authPaths = ['/login', '/cadastro']

  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + '/'))
  const isAuthPage = authPaths.some((p) => path === p)

  // Se tentar acessar página protegida SEM estar logado -> vai pro /login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Se tentar acessar /login ou /cadastro JÁ ESTANDO logado -> vai pro /dashboard
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/perfil/:path*', '/minhas-vagas/:path*', '/onboarding/:path*', '/login', '/cadastro'],
}