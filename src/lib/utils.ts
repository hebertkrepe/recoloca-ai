// Utilitários gerais - cn para classes CSS
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar data
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Formatar salário
export function formatSalary(salary: string): string {
  return salary.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Gerar iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Formatar data relativa (ex: "Há 2 dias", "Há 1 semana")
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  if (diffDays < 14) return 'Há 1 semana'
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 60) return 'Há 1 mês'
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`
  return `Há ${Math.floor(diffDays / 365)} anos`
}