import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { auth } from './firebase'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

// 1. Defina a persistência da autenticação
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // 2. Crie a instância do aplicativo Vue UMA VEZ
    const app = createApp(App).use(router);
    // 3. Monte o aplicativo no DOM UMA VEZ
    app.mount('#app');
    // 4. Use onAuthStateChanged APENAS para reagir a mudanças de estado de autenticação
    // E remova a splash screen APÓS a verificação inicial
    // Corrigido aqui: o parâmetro '_user' foi removido, pois não é utilizado
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Este callback é chamado na inicialização e em cada mudança de estado (login/logout)
      // Se você só precisa remover o splash na primeira verificação, use unsubscribe()
      unsubscribe();

      console.log("Initial Firebase Auth state determined. Removing splash screen.");
      const splash = document.getElementById('splash-screen');
      if (splash) splash.remove();
    });
  })
  .catch((error) => {
    console.error('Erro ao definir persistência:', error);
    const app = createApp(App).use(router);
    app.mount('#app');
    const splash = document.getElementById('splash-screen');
    if (splash) splash.remove();
  });