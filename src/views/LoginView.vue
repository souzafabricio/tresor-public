<template>
  <div class="dark-theme flex flex-col items-center justify-center min-h-screen p-4">
    <nav></nav>
    <img src="@/assets/logofundobranco.png" alt="Logo" class="logo mb-4" />
    <div class="login-content surface-container-high">
      <h1 class="text-on-surface">Bem vindo à sua melhor escolha!</h1>
      <div class="input-container">
        <input v-model="email" type="email" placeholder="Email" class="text-field" />
        <label for="email" class="label-text">Email</label>
      </div>
      <div class="input-container">
        <input v-model="password" type="password" placeholder="Senha" class="text-field" />
        <label for="password" class="label-text">Senha</label>
      </div>

      <div class="button-group">
        <button @click="loginEmail" class="btn filled-button">Acessar</button>
        <button class="btn outlined-button" @click="irParaCadastro">Cadastre-se</button>
        <!-- <button @click="loginGoogle" class="btn filled-button google-button">
          <img src="@/assets/google_logo.svg" alt="Google Logo" class="google-icon" />
          Entrar com Google
        </button> -->
      </div>

      <p v-if="error" class="text-error mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { signInWithEmailAndPassword, /* GoogleAuthProvider, signInWithRedirect, */ getRedirectResult } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { auth } from '../firebase.js';
import { getFriendlyErrorMessage } from '@/utils/firebaseErrors.js';

console.log(auth.app.options);

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();


const loginEmail = async () => {
  console.log('Função login com e-mail chamada');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log('Login com sucesso:', userCredential);
    error.value = '';
    router.push('/home');
  } catch (err) {
    console.error('Erro no login (Email):', err);
    error.value = getFriendlyErrorMessage(err);
  }
};


/*
 --- FUNÇÃO DE LOGIN COM GOOGLE ---
const loginGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect em vez de signInWithPopup
    await signInWithRedirect(auth, provider);
    // Nota: O código abaixo deste ponto NÃO será executado imediatamente,
    // pois a página será redirecionada. A lógica de pós-login
    // precisa estar no onMounted, como mostrado abaixo.
  } catch (err) {
    // Erros que ocorrem ANTES do redirecionamento (ex: rede offline)
    console.error("Erro ao iniciar login com Google (redirecionamento):", err);
    error.value = err.message;
  }
}; */

const irParaCadastro = () => {
  router.push('/cadastro');
};

onMounted(async () => {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      const user = result.user;
      console.log("Login com Google bem-sucedido via redirecionamento!", user);
      router.push('/home');
    }

  } catch (err) {
    console.error("Erro após redirecionamento de login:", err);
    error.value = "Falha no login com Google. Por favor, tente novamente.";
  }
});
</script>

<style scoped>
body, html, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
}

.dark-theme {
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  font-family: 'Roboto', sans-serif;
}

.logo {
  width: 100%;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
  margin-top: -10rem;
  display: block;
  user-select: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
  background: transparent;
  border-radius: 16px;
}

.login-content {
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  background-color: var(--md-sys-color-surface-container-high);
}

.flex {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 1rem;
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

.input-container {
  position: relative;
  margin-bottom: 24px;
}

.text-field {
  width: 100%;
  max-width: 280px;
  padding: 16px 16px 8px 16px;
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid var(--md-sys-color-outline);
  border-radius: 4px 4px 0 0;
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  transition: border-color 0.2s ease, background-color 0.2s ease;
  outline: none;
}

.text-field::placeholder {
  color: transparent;
}

.text-field:focus {
  border-bottom: 2px solid var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface-container-highest);
}

.label-text {
  position: absolute;
  left: 16px;
  top: 16px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px;
  font-size: 0.75rem;
  color: var(--md-sys-color-primary);
}

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
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
}

.filled-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary);
  box-shadow: none;
}

.outlined-button {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.outlined-button:hover {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.08);
  border-color: var(--md-sys-color-primary);
}

.outlined-button:active {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.12);
  border-color: var(--md-sys-color-primary);
}

.google-button {
  background-color: #4285F4;
  color: white;
}

.google-button:hover {
  background-color: #357AE8;
}

.google-button:active {
  background-color: #2D6AD2;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.text-error {
  color: var(--md-sys-color-error);
  margin-top: 1rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
}

nav {
  padding: 60px;
}
</style>