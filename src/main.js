import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
// added new
import { themeStore } from './stores/theme.js'

themeStore.initTheme() // initialize before mounting

const app = createApp(App)
app.use(router)
app.mount('#app')