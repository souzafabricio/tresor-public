const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  pwa: {
    name: 'Trésor',
    themeColor: '#42b983',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '.',
    icons: [
      {
        src: 'assets/logo-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'assets/logo-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true
    }
  }
})
