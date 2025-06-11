// src/utils/firebaseErrors.js

const firebaseAuthErrorMessages = {
  // Erros de e-mail e senha existentes
  'auth/invalid-email': 'O formato do e-mail é inválido. Por favor, verifique.',
  'auth/user-disabled': 'Esta conta foi desativada. Por favor, entre em contato com o suporte.',
  'auth/email-already-in-use': 'Este e-mail já está em uso. Tente outro ou faça login.',
  'auth/weak-password': 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.',
  'auth/missing-password': 'Por favor, insira uma senha para cadastrar sua conta.', // <-- Certifique-se de que há uma vírgula aqui
  'auth/user-not-found': 'E-mail não encontrado ou senha incorreta.',
  'auth/wrong-password': 'E-mail não encontrado ou senha incorreta.',
  'auth/invalid-credential': 'E-mail não encontrado ou senha incorreta.', // Esta é a linha adicionada, sem o negrito

  // Erros de autenticação de terceiros (Google, etc.)
  'auth/account-exists-with-different-credential': 'Já existe uma conta com este e-mail, mas usando um método de login diferente (ex: e-mail/senha).',
  'auth/popup-blocked': 'O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.',
  'auth/cancelled-popup-request': 'O login foi cancelado ou o popup foi fechado antes da conclusão.',
  'auth/operation-not-allowed': 'O método de login não está ativado no Firebase. Verifique as configurações do seu projeto.',
  'auth/operation-not-supported-by-browser': 'Sua versão do navegador não suporta esta operação de autenticação.',
  'auth/credential-already-in-use': 'Esta credencial já está associada a outra conta de usuário.',

  // Erros de rede/genéricos
  'auth/network-request-failed': 'Erro de rede. Por favor, verifique sua conexão com a internet.',
  'auth/too-many-requests': 'Muitas tentativas de login. Por favor, tente novamente mais tarde.',

  // Erro padrão para qualquer coisa não mapeada
  'default': 'Ocorreu um erro inesperado. Por favor, tente novamente.'
};

export function getFriendlyErrorMessage(error) {
  if (error && error.code) {
    return firebaseAuthErrorMessages[error.code] || firebaseAuthErrorMessages['default'];
  }
  return firebaseAuthErrorMessages['default'];
}