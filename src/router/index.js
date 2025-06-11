import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let isAuthChecked = false

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (isAuthChecked) {
    const user = auth.currentUser
    if (requiresAuth && !user) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    onAuthStateChanged(auth, user => {
      isAuthChecked = true
      if (requiresAuth && !user) {
        next({ name: 'Login' })
      } else {
        next()
      }
    })
  }
})

export default router
