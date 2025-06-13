<template>
  <router-view/>
</template>

<script setup>
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useRouter } from 'vue-router'

const router = useRouter()

onAuthStateChanged(auth, (user) => {
  const currentRoute = router.currentRoute.value
  if (user) {
    if (currentRoute.path === '/login' || currentRoute.path === '/') {
      router.push('/home')
    }
  } else {
    if (currentRoute.meta.requiresAuth) {
      router.push('/login')
    }
  }
})
</script>
<style>
* {
  font-family: 'Montserrat', sans-serif;
}

body {
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
}

input:-webkit-autofill,
input:-webkit-autofill:focus,
input:-webkit-autofill:hover,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #f9f9f9 inset !important;
  box-shadow: 0 0 0 1000px #e7e8f5 inset !important;
  -webkit-text-fill-color: #333 !important;
  font-size: 1rem !important;
  border-radius: 4px;
  transition: background-color 5000s ease-in-out 0s;
}

</style>
