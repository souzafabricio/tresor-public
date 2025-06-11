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
import { ref, onMounted } from 'vue'; // Importe onMounted
import { signInWithEmailAndPassword, /* GoogleAuthProvider, signInWithRedirect, */ getRedirectResult } from 'firebase/auth'; // Remova signInWithPopup
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
    // Limpa a mensagem de erro se o login for bem-sucedido
    error.value = '';
    router.push('/home');
  } catch (err) {
    console.error('Erro no login (Email):', err);
    // **AQUI ESTÁ A MUDANÇA:**
    // Use a função getFriendlyErrorMessage para obter a mensagem amigável
    // e atribua-a ao seu ref 'error'
    error.value = getFriendlyErrorMessage(err);
  }
};

/* // --- FUNÇÃO DE LOGIN COM GOOGLE MODIFICADA ---
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

// --- NOVO: Lógica para lidar com o resultado do redirecionamento ---
onMounted(async () => {
  try {
    // Tenta obter o resultado do redirecionamento de autenticação.
    // Isso será executado quando o usuário for redirecionado de volta para sua página.
    const result = await getRedirectResult(auth);

    if (result) {
      // Se 'result' não for nulo, significa que o usuário acabou de logar
      // e foi redirecionado de volta para esta página com sucesso.
      const user = result.user;
      console.log("Login com Google bem-sucedido via redirecionamento!", user);
      // Redirecione para a página inicial ou para onde o usuário deve ir após o login.
      router.push('/home'); // Ou '/' se essa for sua página de dashboard
    }
    // Se 'result' for nulo, a página não foi carregada como resultado de um redirecionamento de login.
    // Isso é o comportamento normal quando a página é acessada diretamente ou via navegação interna.

  } catch (err) {
    // Lida com erros que podem ocorrer APÓS o redirecionamento (ex: usuário cancelou, ou erro do provedor)
    console.error("Erro após redirecionamento de login:", err);
    // Você pode definir uma mensagem de erro visível ao usuário ou redirecioná-lo de volta à tela de login
    error.value = "Falha no login com Google. Por favor, tente novamente.";
    // Opcional: Redirecionar para a página de login se o erro for fatal e não quiser que o usuário fique na tela de login vazia
    // router.push('/');
  }
});
</script>

<style scoped>
/* Base Dark Theme Setup */
:root {
  --md-sys-color-primary: #D0BCFF;
  --md-sys-color-on-primary: #4F378B;
  --md-sys-color-primary-container: #6750A4;
  --md-sys-color-on-primary-container: #EADDFF;
  --md-sys-color-secondary: #CCC2DC;
  --md-sys-color-on-secondary: #332D41;
  --md-sys-color-secondary-container: #4A4458;
  --md-sys-color-on-secondary-container: #E8DEF8;
  --md-sys-color-tertiary: #EFB8C8;
  --md-sys-color-on-tertiary: #492532;
  --md-sys-color-tertiary-container: #633B48;
  --md-sys-color-on-tertiary-container: #FFD8E4;
  --md-sys-color-error: #F2B8B5;
  --md-sys-color-on-error: #601410;
  --md-sys-color-error-container: #8C1D18;
  --md-sys-color-on-error-container: #F9DEDC;
  --md-sys-color-background: #1C1B1F;
  --md-sys-color-on-background: #E6E1E5;
  --md-sys-color-surface: #1C1B1F;
  --md-sys-color-on-surface: #E6E1E5;
  --md-sys-color-surface-variant: #49454F;
  --md-sys-color-on-surface-variant: #CAC4D0;
  --md-sys-color-outline: #938F99;
  --md-sys-color-outline-variant: #49454F;
  --md-sys-color-shadow: #000000;
  --md-sys-color-scrim: #000000;
  --md-sys-color-inverse-surface: #E6E1E5;
  --md-sys-color-inverse-on-surface: #313033;
  --md-sys-color-inverse-primary: #6750A4;
  --md-sys-color-surface-dim: #1C1B1F;
  --md-sys-color-surface-bright: #3B383F;
  --md-sys-color-surface-container-lowest: #141218;
  --md-sys-color-surface-container-low: #201D24;
  --md-sys-color-surface-container: #27252B;
  --md-sys-color-surface-container-high: #312F36;
  --md-sys-color-surface-container-highest: #3B383F;
}

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
  font-family: 'Roboto', sans-serif; /* Recommended Material Design font */
}

.logo {
  width: 100%;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 1rem;
  margin-top: -10rem;
  display: block;
  user-select: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4)); /* Adjusted for dark theme */
  background: transparent;
  border-radius: 16px;
}

.login-content {
  width: 100%;
  max-width: 360px; /* Slightly wider for Material Design feel */
  box-sizing: border-box;
  padding: 24px; /* Material Design standard padding */
  border-radius: 12px; /* Softened corners */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  background-color: var(--md-sys-color-surface-container-high); /* Elevated surface */
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
  margin-top: 0; /* Reset margin top */
  color: var(--md-sys-color-on-surface);
  user-select: none;
  text-align: center;
}

/* Material Design 3 Text Field */
.input-container {
  position: relative;
  margin-bottom: 24px; /* Standard spacing for fields */
}

.text-field {
  width: 100%;
  max-width: 280px;
  padding: 16px 16px 8px 16px; /* Optimized padding for filled look */
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid var(--md-sys-color-outline); /* Underline style */
  border-radius: 4px 4px 0 0; /* Soft top corners */
  background-color: var(--md-sys-color-surface-container); /* Subtle background */
  color: var(--md-sys-color-on-surface);
  transition: border-color 0.2s ease, background-color 0.2s ease;
  outline: none;
}

.text-field::placeholder {
  color: transparent; /* Hide placeholder as label acts as it */
}

.text-field:focus {
  border-bottom: 2px solid var(--md-sys-color-primary); /* Accent on focus */
  background-color: var(--md-sys-color-surface-container-highest); /* More elevated on focus */
}

.label-text {
  position: absolute;
  left: 16px;
  top: 16px; /* Align with input content */
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px; /* Move label up */
  font-size: 0.75rem; /* Shrink label */
  color: var(--md-sys-color-primary); /* Accent color for label */
}

/* Material Design 3 Buttons */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Consistent spacing between buttons */
  margin-top: 24px;
}

.btn {
  width: 100%;
  padding: 10px 24px; /* Material Design standard padding */
  font-size: 1rem;
  font-weight: 500; /* Regular weight for text */
  border: none;
  border-radius: 10px; /* Fully rounded corners for pill shape */
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Space for icons */
}

.filled-button {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2); /* Subtle shadow */
}

.filled-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary); /* Deeper shade on press */
  box-shadow: none;
}

.outlined-button {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.outlined-button:hover {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.08); /* Subtle hover effect */
  border-color: var(--md-sys-color-primary);
}

.outlined-button:active {
  background-color: rgba(var(--md-sys-color-primary-rgb), 0.12); /* More pronounced on press */
  border-color: var(--md-sys-color-primary);
}

.google-button {
  background-color: #4285F4; /* Google Blue */
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