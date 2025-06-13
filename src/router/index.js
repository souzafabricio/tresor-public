import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cartoesview',
    name: 'cartoesview',
    component: () => import('../views/CartoesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cadastrar-cartao',
    name: 'cadastrar-cartao',
    component: () => import('../views/CadastroCartao.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/faturasview',
    name: 'faturasview',
    component: () => import('../views/FaturasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/CadastroView.vue')
  },
  {
    path: '/recuperar-senha',
    name: 'recuperar-senha',
    component: () => import('../views/RecuperarSenha.vue')
  },
  {
    path: '/ajudaview',
    name: 'ajudaview',
    component: () => import('../views/AjudaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sobreview',
    name: 'sobreview',
    component: () => import('../views/SobreView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: () => import('../views/RelatoriosView.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function waitForAuthReady() {
  const auth = getAuth()
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      unsubscribe()
      resolve()
    })
  })
}

router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  await waitForAuthReady()

  const user = auth.currentUser

  if (requiresAuth && !user) {
    next({ name: 'Login' })
  } else if ((to.path === '/' || to.path === '/cadastro') && user) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router