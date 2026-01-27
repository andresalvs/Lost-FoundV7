import { reactive } from 'vue'

export const themeStore = reactive({
  darkMode: false,

  initTheme() {
    const saved = localStorage.getItem('theme')

    if (saved) {
      // ✅ Use saved preference if exists
      this.darkMode = saved === 'dark'
    } else {
      // ✅ Default to light mode (ignore system)
      this.darkMode = false
    }

    // Apply the theme class
    document.documentElement.classList.toggle('dark', this.darkMode)
  },

  toggleTheme() {
    this.darkMode = !this.darkMode
    document.documentElement.classList.toggle('dark', this.darkMode)
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
  },
})