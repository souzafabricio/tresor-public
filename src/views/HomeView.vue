<template>
  <div class="main-layout">
    <div class="home-content surface-container-high">

      <img src="@/assets/logofundobranco.png" alt="Logo do Sistema" class="logo mb-6" />
      <p v-if="primeiroNome" class="welcome-message text-on-surface">Olá, <br> {{ primeiroNome }}!</p>
      <p v-else class="welcome-message text-on-surface">Olá!</p>

      <div class="menu-row">
        <button class="btn mini-btn" @click="goToAjuda">
          <span class="material-icons">help_outline</span>
          Ajuda
        </button>
        <span class="menu-label">Menu</span>
        <button class="btn mini-btn" @click="goToSobreApp">
          <span class="material-icons">info_outline</span>
          Sobre
        </button>
      </div>

      <nav class="main-nav">
        <button @click="goToSobre" class="btn filled-button nav-button">
          <span class="material-icons">trending_up</span>
          Lançamentos
        </button>
        <button @click="goToDashboard" class="btn filled-button nav-button secondary-color-button">
          <span class="material-icons">dashboard</span>
          Dashboard
        </button>
        <button @click="goToCartoes" class="btn filled-button nav-button tertiary-color-button">
          <span class="material-icons">credit_card</span>
          Cartões
        </button>
        <button @click="goToFaturas" class="btn filled-button nav-button">
          <span class="material-icons">receipt_long</span>
          Faturas
        </button>
        <button @click="goToRelatorios" class="btn filled-button nav-button">
          <span class="material-icons">grading</span>
          Relatórios
        </button>
      </nav>

      <button @click="logout" class="btn filled-button logout-button">
        <span class="material-icons">logout</span>
        Sair
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const primeiroNome = ref('');
const goToAjuda = () => router.push('/ajudaview');
const goToSobreApp = () => router.push('/sobreview');
const goToRelatorios = () => router.push('/relatorios');

const logout = async () => {
  try {
    const authInstance = getAuth();
    await signOut(authInstance);
    console.log('Usuário deslogado com sucesso!');
    router.push('/');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

const goToSobre = () => router.push('/about');
const goToDashboard = () => router.push('/dashboard');
const goToCartoes = () => router.push('/cartoesview');
const goToFaturas = () => router.push('/faturasview');

onMounted(() => {
  const authInstance = getAuth();
  onAuthStateChanged(authInstance, (user) => {
    if (user) {
      primeiroNome.value = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
    } else {
      router.push('/login');
    }
  });
});
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--md-sys-color-background);
  font-family: 'Roboto', sans-serif;
}

.home-content {
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
  background-color: var(--md-sys-color-surface-container-high);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.logo {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: contain;
  margin-top: -130px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.welcome-message {
  font-size: 1.25rem;
  font-weight: 500;
  margin-top: -20px;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

.menu-label {
  font-size: 1.0rem;
  color: #888;
  margin-bottom: 0.2rem;
  margin-top: 0.5rem;
  display: block;
  text-align: center;
  width: 100%;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.main-nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 14px;
}

.btn {
  width: 100%;
  padding: 16px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-decoration: none;
}

.filled-button {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.filled-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  transform: translateY(-3px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary);
  transform: translateY(0);
  box-shadow: none;
}

.nav-button.secondary-color-button {
  background-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
}
.nav-button.secondary-color-button:hover {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.nav-button.secondary-color-button:active {
  background-color: var(--md-sys-color-on-secondary);
}

.nav-button.tertiary-color-button {
  background-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary);
}
.nav-button.tertiary-color-button:hover {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}
.nav-button.tertiary-color-button:active {
  background-color: var(--md-sys-color-on-tertiary);
}

.nav-button .material-icons {
  font-size: 22px;
}

.logout-button {
  margin-top: 32px;
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.logout-button:hover {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  transform: translateY(-3px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.logout-button:active {
  background-color: var(--md-sys-color-on-error);
  transform: translateY(0);
  box-shadow: none;
}

.menu-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 0.2rem;
  margin-top: 0.5rem;
}

.menu-label {
  font-size: 1.0rem;
  color: #888;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-align: center;
  background: none;
  border: none;
  padding: 0 6px;
  min-width: 48px;
}

.mini-btn {
  padding: 6px 12px;
  font-size: 0.95rem;
  border-radius: 8px;
  background: #f3f3f3;
  color: #555;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.mini-btn .material-icons {
  font-size: 18px;
  margin-right: 2px;
}

.mini-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 400px) {
  .home-content {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
