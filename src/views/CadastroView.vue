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
        <input v-model="confirmPassword" type="password" placeholder="Confirme a Senha" class="text-field"
          id="confirm-password-reg" />
        <label for="confirm-password-reg" class="label-text">Confirme a Senha</label>
      </div>

      <div class="button-group">
        <button @click="register" class="btn filled-button">Cadastrar</button>
        <button class="btn outlined-button" @click="voltarLogin">Já tem uma conta? Fazer login</button>
      </div>
      <p v-if="error" class="text-error mt-4">{{ error }}</p>
    </div>
  </div>
  <div v-if="sucesso" class="modal-success-overlay">
    <div class="modal-success-content">
      <span class="material-icons" style="font-size: 2.5em; color: #43a047;">check_circle</span>
      <div class="modal-success-text">
        🎉 Cadastro realizado com sucesso!<br>
        Você será redirecionado para a tela inicial.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { useRouter } from 'vue-router';
import { getFriendlyErrorMessage } from '@/utils/firebaseErrors.js';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const router = useRouter();
const sucesso = ref('');

watch(sucesso, (newValue, oldValue) => {
  console.log('Valor de "sucesso" mudou de:', oldValue, 'para:', newValue);
  if (newValue) {
    console.log('Variável "sucesso" foi definida:', newValue);
  }
});

function capitalizarNomeCompleto(nome) {
  return nome
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

const register = async () => {
  error.value = '';
  sucesso.value = '';

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.';
    return;
  }

  try {
    const nomeFormatado = capitalizarNomeCompleto(name.value);
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: nomeFormatado
    });

    await setDoc(doc(db, 'users', user.uid), {
      name: nomeFormatado,
      email: user.email,
      createdAt: new Date(),
    });

    console.log('Usuário registrado e perfil atualizado:', user);
    sucesso.value = 'Cadastro realizado com sucesso! Redirecionando...';

    setTimeout(() => {
      router.push('/home');
    }, 2000);
  } catch (err) {
    console.error('Erro no registro:', err);
    error.value = getFriendlyErrorMessage(err);
    sucesso.value = '';
  }
};

const voltarLogin = () => {
  router.push('/');
};
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  font-family: 'Roboto', sans-serif;
}

.logo {
  width: 100%;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: -1rem;
  margin-top: -15rem;
  display: block;
  user-select: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
  background: transparent;
  border-radius: 16px;
}

.auth-content {
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
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

.text-field:focus+.label-text,
.text-field:not(:placeholder-shown)+.label-text {
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

.text-error {
  color: var(--md-sys-color-error);
  margin-top: 1rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
}

.modal-success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-success-content {
  background: #fff;
  border-radius: 14px;
  padding: 2.2rem 2rem 1.5rem 2rem;
  box-shadow: 0 8px 32px rgba(67, 160, 71, 0.13);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 270px;
  max-width: 80vw;
}

.modal-success-text {
  color: #2e7d32;
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 1.1rem;
  text-align: center;
}

@media (max-width: 400px) {
  .auth-content {
    max-width: 100%;
    margin: 0 16px;
  }
}

nav {
  padding: 80px;
}
</style>