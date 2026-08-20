export function getAuthErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'User already registered': 'Este email já está cadastrado',
    'Email not confirmed': 'Confirme seu email antes de entrar',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Signup requires a valid password': 'Informe uma senha válida',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
  }

  for (const [key, message] of Object.entries(messages)) {
    if (error.includes(key)) return message
  }

  return error || 'Ocorreu um erro. Tente novamente.'
}
