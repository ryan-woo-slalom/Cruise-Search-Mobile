import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'intrepidTheme',
    themes: {
      intrepidTheme: {
        dark: false,
        colors: {
          primary: '#0b4f8a',
          secondary: '#1e88e5',
          accent: '#64b5f6',
          surface: '#ffffff',
          background: '#f2f7fc',
          success: '#2e7d32',
          warning: '#ef6c00',
          error: '#c62828',
          info: '#0277bd',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

export default vuetify
