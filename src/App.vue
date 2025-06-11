<template>
  <router-view/>
</template>

<style>
* {
  font-family: 'Montserrat', sans-serif;
}

body {
  background-color: #fffcf7;
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
  -webkit-box-shadow: 0 0 0 1000px #f9f9f9 inset !important; /* cor de fundo igual ao input */
  box-shadow: 0 0 0 1000px #e7e8f5 inset !important;
  -webkit-text-fill-color: #333 !important; /* cor do texto */
  font-size: 1rem !important; /* força o tamanho da fonte igual ao input normal */
  border-radius: 4px; /* igual ao seu input */
  transition: background-color 5000s ease-in-out 0s;
}

</style>
