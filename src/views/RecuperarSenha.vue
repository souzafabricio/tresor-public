<template>
  <div class="main-layout">
    <div class="login-card">
      <img src="@/assets/logofundobranco.png" alt="Logo" class="logo mb-6" />
      <h2 class="title">Recuperar Senha</h2>
      <form @submit.prevent="recuperarSenha">
        <div class="input-container">
          <input v-model="email" type="email" id="email" class="text-field" placeholder=" " required
            autocomplete="email" />
          <label for="email" class="label-text">E-mail</label>
        </div>
        <p v-if="mensagem" class="mensagem">{{ mensagem }}</p>
        <button type="submit" class="btn filled-button">Enviar link de recuperação</button>
        <button type="button" class="btn text-button" @click="voltarLogin">Voltar ao login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const mensagem = ref('')
const router = useRouter()

const recuperarSenha = async () => {
  mensagem.value = ''
  try {
    await sendPasswordResetEmail(getAuth(), email.value)
    mensagem.value = 'E-mail de recuperação enviado! Verifique sua caixa de entrada.'
  } catch (e) {
    mensagem.value = 'Erro ao enviar e-mail. Verifique o endereço digitado.'
  }
}

const voltarLogin = () => {
  router.push('/')
}
</script>

<style scoped>
.main-layout {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
}

.logo {
  width: 300px;
  height: 300px;
  margin-bottom: -4rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #333;
}

.input-container {
  margin-bottom: 1.2rem;
  position: relative;
}

.text-field {
  width: 100%;
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: #fafafa;
}

.label-text {
  position: absolute;
  left: 12px;
  top: 12px;
  color: #888;
  font-size: 1rem;
  pointer-events: none;
  transition: 0.2s;
}

.text-field:focus+.label-text,
.text-field:not(:placeholder-shown)+.label-text {
  top: -10px;
  left: 8px;
  font-size: 0.85rem;
  color: #1976d2;
  background: #fff;
  padding: 0 4px;
}

.btn {
  width: 100%;
  padding: 12px 0;
  margin-bottom: 0.7rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.filled-button {
  background: #1976d2;
  color: #fff;
}

.filled-button:hover {
  background: #1256a3;
}

.text-button {
  background: none;
  color: #1976d2;
  margin-bottom: 0;
}

.mensagem {
  color: #1976d2;
  margin-bottom: 1rem;
  font-size: 0.98rem;
}
</style>