// Componente Footer
import Link from 'next/link'
import { Brain } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-lg font-bold text-white">RecolocaAI</span>
            </div>
            <p className="text-sm text-gray-400">
              A plataforma que ajuda profissionais em layoff a se recolocarem no mercado com IA.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/vagas" className="hover:text-purple-400 transition-colors">
                  Vagas
                </Link>
              </li>
              <li>
                <Link href="/minhas-vagas" className="hover:text-purple-400 transition-colors">
                  Minhas Vagas
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/perfil" className="hover:text-purple-400 transition-colors">
                  Perfil
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-purple-400 transition-colors">
                  Onboarding
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} RecolocaAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}