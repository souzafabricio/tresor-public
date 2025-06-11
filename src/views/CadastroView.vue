<template>
  <div class="main-layout">
    <nav></nav>
    <img src="@/assets/logofundobranco.png" alt="Logo" class="logo mb-4" />
    <div class="auth-content surface-container-high">
      <h1 class="text-on-surface">Crie sua conta gratuitamente</h1>

      <div class="input-container">
        <input v-model="name" type="text" placeholder="Nome Completo" class="text-field" id="name-reg" />
        <label for="name-reg" class="label-text">Nome Completo</label>
      </div>
      <div class="input-container">
        <input v-model="email" type="email" placeholder="Email" class="text-field" id="email-reg" />
        <label for="email-reg" class="label-text">Email</label>
      </div>
      <div class="input-container">
        <input v-model="password" type="password" placeholder="Senha" class="text-field" id="password-reg" />
        <label for="password-reg" class="label-text">Senha</label>
      </div>
      <div class="input-container">
        <input v-model="confirmPassword" type="password" placeholder="Confirme a Senha" class="text-field" id="confirm-password-reg" />
        <label for="confirm-password-reg" class="label-text">Confirme a Senha</label>
      </div>

      <div class="button-group">
        <button @click="register" class="btn filled-button">Cadastrar</button>
        <button class="btn outlined-button" @click="voltarLogin">Já tem uma conta? Fazer login</button>
      </div>
      <p v-if="error" class="text-error mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importar Firestore
import { auth, db } from '../firebase.js'; // Certifique-se de que 'db' é exportado aqui
import { useRouter } from 'vue-router';
import { getFriendlyErrorMessage } from '@/utils/firebaseErrors.js';

const name = ref(''); // Novo ref para o nome
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const router = useRouter();


function capitalizarNomeCompleto(nome) {
  return nome
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

const register = async () => {
  error.value = ''; // Limpa erros anteriores

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.';
    return;
  }

  try {
    // Capitaliza o nome antes de cadastrar
    const nomeFormatado = capitalizarNomeCompleto(name.value);

    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // 1. Atribuir o nome de exibição no Firebase Authentication
    await updateProfile(user, {
      displayName: nomeFormatado
    });

    // 2. Salvar dados adicionais do usuário (nome, email) no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: nomeFormatado,
      email: user.email,
      createdAt: new Date(),
      // Você pode adicionar mais campos aqui, como tema preferido, etc.
    });

    console.log('Usuário registrado e perfil atualizado:', user);
    router.push('/home');
  } catch (err) {
    console.error('Erro no registro:', err);
    error.value = getFriendlyErrorMessage(err);
  }
};

const voltarLogin = () => {
  router.push('/');
};
</script>

<style scoped>
/*
 * IMPORTANTE:
 * Os estilos globais de tema (:root, html.dark-mode, body, #app)
 * foram removidos daqui. Eles devem estar em um arquivo CSS global
 * (ex: `src/assets/main.css`) e importados no seu `main.js` ou `App.vue`.
 * Apenas os estilos específicos deste componente devem permanecer aqui.
 */

.main-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Garante que o layout ocupe a altura total da viewport */
  padding: 16px; /* Padding geral para o layout */
  box-sizing: border-box;
  background-color: var(--md-sys-color-background); /* Usa a variável global do tema */
  color: var(--md-sys-color-on-background); /* Usa a variável global do tema */
  font-family: 'Roboto', sans-serif;
}

.logo {
  width: 100%;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
  margin-top: -10rem; /* Mantenha se quiser a logo bem alta */
  display: block;
  user-select: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
  background: transparent;
  border-radius: 16px;
}

.auth-content { /* Renomeado de .login-content para ser mais genérico para auth */
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  background-color: var(--md-sys-color-surface-container-high); /* Usa a variável global do tema */
  color: var(--md-sys-color-on-surface); /* Garante que o texto dentro do card mude */
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2.4rem;
  margin-top: 0;
  color: var(--md-sys-color-on-surface);
  user-select: none;
  text-align: center;
}

/* Material Design 3 Text Field */
.input-container {
  position: relative;
  margin-bottom: 24px;
}

.text-field {
  width: 100%;
  padding: 16px 16px 8px 16px;
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid var(--md-sys-color-outline); /* Usa a variável global do tema */
  border-radius: 4px 4px 0 0;
  background-color: var(--md-sys-color-surface-container); /* Usa a variável global do tema */
  color: var(--md-sys-color-on-surface); /* Cor do texto no input */
  transition: border-color 0.2s ease, background-color 0.2s ease;
  outline: none;
}

.text-field::placeholder {
  color: transparent;
}

.text-field:focus {
  border-bottom: 2px solid var(--md-sys-color-primary); /* Usa a variável global do tema */
  background-color: var(--md-sys-color-surface-container-highest); /* Usa a variável global do tema */
}

.label-text {
  position: absolute;
  left: 16px;
  top: 16px;
  color: var(--md-sys-color-on-surface-variant); /* Usa a variável global do tema */
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px;
  font-size: 0.75rem;
  color: var(--md-sys-color-primary); /* Usa a variável global do tema */
}

/* Material Design 3 Buttons */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  width: 100%;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.filled-button {
  background-color: var(--md-sys-color-primary); /* Usa a variável global do tema */
  color: var(--md-sys-color-on-primary); /* Usa a variável global do tema */
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
}

.filled-button:hover {
  background-color: var(--md-sys-color-primary-container); /* Usa a variável global do tema */
  color: var(--md-sys-color-on-primary-container); /* Usa a variável global do tema */
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary); /* Usa a variável global do tema */
  box-shadow: none;
}

.outlined-button {
  background-color: transparent;
  color: var(--md-sys-color-primary); /* Usa a variável global do tema */
  border: 1px solid var(--md-sys-color-outline); /* Usa a variável global do tema */
}

.outlined-button:hover {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.08); /* Usa a variável global do tema */
  border-color: var(--md-sys-color-primary); /* Usa a variável global do tema */
}

.outlined-button:active {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.12); /* Usa a variável global do tema */
  border-color: var(--md-sys-color-primary); /* Usa a variável global do tema */
}

.text-error {
  color: var(--md-sys-color-error); /* Usa a variável global do tema */
  margin-top: 1rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
}

/* Media query adjustments for smaller screens */
@media (max-width: 400px) {
  .auth-content {
    max-width: 100%;
    margin: 0 16px;
  }
}

nav {
  padding: 80px; /* Isso parece ser um espaçamento para o topo. Se não houver nav, pode ser ajustado. */
}
</style>
