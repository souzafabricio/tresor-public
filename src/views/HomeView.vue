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

// Função de logout
const logout = async () => {
  try {
    const authInstance = getAuth(); // Obter instância do auth
    await signOut(authInstance);
    console.log('Usuário deslogado com sucesso!');
    router.push('/'); // Redireciona para a página de login após o logout
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

// Funções de navegação
const goToSobre = () => router.push('/about');
const goToDashboard = () => router.push('/dashboard');
const goToCartoes = () => router.push('/cartoesview');
const goToFaturas = () => router.push('/faturasview');

// Verifica o estado da autenticação ao montar o componente
onMounted(() => {
  const authInstance = getAuth(); // Obter instância do auth
  onAuthStateChanged(authInstance, (user) => {
    if (user) {
      // Prioriza displayName, se não houver, usa a parte do email antes do @
      primeiroNome.value = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
    } else {
      // Se não houver usuário logado, redireciona para a tela de login
      router.push('/login');
    }
  });
});
</script>

<style scoped>
/*
 * IMPORTANTE:
 * Os estilos globais do tema (variáveis de cor como `--md-sys-color-primary`,
 * e estilos para `body`, `html`, `#app`)
 * FORAM REMOVIDOS DESTE ARQUIVO.
 * Eles devem estar em um arquivo CSS GLOBAL (ex: `src/assets/main.css`)
 * e importados em seu `main.js` ou `App.vue`.
 *
 * Este bloco `<style scoped>` contém APENAS os estilos específicos da HomeView.
 */

/* Layout principal */
.main-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--md-sys-color-background); /* Usa a variável global do tema */
  font-family: 'Roboto', sans-serif;
}

/* Conteúdo principal da página (card) */
.home-content {
  width: 100%;
  max-width: 380px; /* Levemente mais largo para melhor distribuição */
  box-sizing: border-box;
  padding: 32px; /* Aumentado o padding para mais espaço interno */
  border-radius: 24px; /* Mais arredondado */
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15); /* Sombra mais suave e proeminente */
  background-color: var(--md-sys-color-surface-container-high);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px; /* Espaçamento consistente entre os elementos */
}

/* Logo */
.logo {
  width: 100%;
  max-width: 200px; /* Tamanho ajustado para a logo */
  height: auto;
  object-fit: contain;
  margin-top: -130px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.welcome-message {
  font-size: 1.25rem; /* Levemente maior */
  font-weight: 500;
  margin-top: -20px; /* Espaço após a mensagem de boas-vindas */
  color: var(--md-sys-color-on-surface-variant); /* Cor mais sutil */
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

/* Navegação principal */
.main-nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 14px; /* Espaçamento entre os botões de navegação */
}

/* Estilos de Botões */
.btn {
  width: 100%;
  padding: 16px 24px; /* Aumentado padding para botões maiores */
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 10px; /* ARREDONDAMENTO DE 10PX CONFORME SOLICITADO */
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; /* Aumentado o espaço para ícones */
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
  transform: translateY(-3px); /* Efeito de elevação mais pronunciado */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary);
  transform: translateY(0);
  box-shadow: none;
}

/* NOVAS CORES PARA BOTÕES DE NAVEGAÇÃO */
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
  font-size: 22px; /* Tamanho do ícone nos botões de navegação, levemente maior */
}

.logout-button {
  margin-top: 32px; /* Mais espaço antes do botão de sair */
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

/* Media query para telas menores */
@media (max-width: 400px) {
  .home-content {
    max-width: 100%;
    border-radius: 0; /* Remove borda arredondada em telas muito pequenas */
    box-shadow: none; /* Remove sombra em telas muito pequenas */
  }
}
</style>
