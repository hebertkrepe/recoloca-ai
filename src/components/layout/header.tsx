'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, Brain, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoadingAuth(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoadingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Trava scroll do body quando o menu está aberto
  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  // Fecha com ESC
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)
  const toggleMenu = () => setMobileMenuOpen((v) => !v)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    closeMenu()
    toast.success('Logout realizado com sucesso')
    router.push('/')
    router.refresh()
  }

  const displayName = user?.user_metadata?.name || user?.email || ''

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Brain className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-bold text-white">RecolocaAI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/vagas" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
              Vagas
            </Link>
            {user && (
              <>
                <Link href="/minhas-vagas" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                  Minhas Vagas
                </Link>
                <Link href="/dashboard" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/perfil" className="text-sm text-gray-300 hover:text-purple-400 transition-colors">
                  Perfil
                </Link>
              </>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoadingAuth &&
              (user ? (
                <>
                  <span className="text-sm text-gray-400 hidden lg:inline truncate max-w-[180px]">
                    {displayName}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/cadastro">
                    <Button size="sm">Começar grátis</Button>
                  </Link>
                </>
              ))}
          </div>

          {/* Botão hambúrguer mobile */}
          <button
            type="button"
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-900"
            onClick={toggleMenu}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* MENU MOBILE FORA DO <header> — evita bug sticky no celular */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200]">
          {/* Fundo escuro */}
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fechar menu"
            onClick={closeMenu}
          />

          {/* Painel do menu */}
          <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-gray-950 border-b border-gray-800 shadow-2xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                <Brain className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold text-white">RecolocaAI</span>
              </Link>
              <button
                type="button"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-900"
                onClick={closeMenu}
                aria-label="Fechar menu"
              >
                <X className="h-6 w-6 text-gray-300" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-1">
              <Link
                href="/vagas"
                onClick={closeMenu}
                className="text-base text-gray-200 py-3 px-3 rounded-lg hover:bg-gray-900 hover:text-purple-400"
              >
                Vagas
              </Link>

              {user && (
                <>
                  <Link
                    href="/minhas-vagas"
                    onClick={closeMenu}
                    className="text-base text-gray-200 py-3 px-3 rounded-lg hover:bg-gray-900 hover:text-purple-400"
                  >
                    Minhas Vagas
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="text-base text-gray-200 py-3 px-3 rounded-lg hover:bg-gray-900 hover:text-purple-400"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/perfil"
                    onClick={closeMenu}
                    className="text-base text-gray-200 py-3 px-3 rounded-lg hover:bg-gray-900 hover:text-purple-400"
                  >
                    Perfil
                  </Link>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
                {isLoadingAuth ? (
                  <p className="text-sm text-gray-500 px-3 py-2">Carregando...</p>
                ) : user ? (
                  <>
                    <p className="text-xs text-gray-500 px-3 truncate">{displayName}</p>
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px]"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="w-full">
                      <Button variant="ghost" className="w-full min-h-[44px]">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/cadastro" onClick={closeMenu} className="w-full">
                      <Button className="w-full min-h-[44px]">Começar grátis</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}