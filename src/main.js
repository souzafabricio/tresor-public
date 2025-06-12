import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    onAuthStateChanged(auth, () => {
      const app = createApp(App).use(router)
      app.mount('#app')
      
      const splash = document.getElementById('splash-screen')
      if (splash) splash.remove()
    })
  })
  .catch((error) => {
    console.error('Erro ao definir persistência:', error)
    const app = createApp(App).use(router)
    app.mount('#app')
    const splash = document.getElementById('splash-screen')
    if (splash) splash.remove()
  })
