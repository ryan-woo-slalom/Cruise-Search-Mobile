<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Cruises', href: '#' },
  { label: 'Destinations', href: '#' },
  { label: 'Deals', href: '#' },
]

const isDesktop = computed(() => mdAndUp.value)
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="mobileMenuOpen" temporary class="drawer-shell" width="280">
      <div class="pa-5 drawer-brand border-b">
        <p class="text-overline mb-1">Intrepid</p>
        <h2 class="text-h6 font-weight-bold">Cruise Search</h2>
      </div>
      <v-list nav density="comfortable" class="pa-2">
        <v-list-item
          v-for="link in navLinks"
          :key="link.label"
          :title="link.label"
          :href="link.href"
          prepend-icon="mdi-chevron-right"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="white" elevation="0" class="app-bar-shell" height="72">
      <template v-if="!isDesktop">
        <v-btn icon="mdi-menu" variant="text" @click="mobileMenuOpen = !mobileMenuOpen" />
      </template>

      <v-toolbar-title class="brand-title text-center text-md-left">INTREPID</v-toolbar-title>

      <v-spacer />

      <template v-if="isDesktop">
        <v-btn
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          variant="text"
          class="mr-1 nav-link"
          rounded="pill"
        >
          {{ link.label }}
        </v-btn>
        <v-spacer />
      </template>

      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-account-circle-outline" variant="text" v-bind="props" />
        </template>
        <v-list density="compact">
          <v-list-item title="My Profile" />
          <v-list-item title="Saved Cruises" />
          <v-list-item title="Sign Out" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>

    <v-footer color="#f4f8fc" class="py-10 footer-shell">
      <v-container>
        <v-row class="gy-6" align="start">
          <v-col cols="12" md="5">
            <h3 class="text-h6 mb-2">Intrepid Cruise Lines</h3>
            <p class="text-body-2 mb-4 footer-copy">
              Built for one-hand discovery: search, compare, and book sailings in seconds.
            </p>
            <div class="d-flex ga-2">
              <v-btn icon="mdi-instagram" size="small" variant="outlined" color="primary" />
              <v-btn icon="mdi-facebook" size="small" variant="outlined" color="primary" />
              <v-btn icon="mdi-youtube" size="small" variant="outlined" color="primary" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <h4 class="text-subtitle-1 mb-2 footer-heading">Explore</h4>
            <div><a class="footer-link" href="#">Cruises</a></div>
            <div><a class="footer-link" href="#">Destinations</a></div>
            <div><a class="footer-link" href="#">Deals</a></div>
          </v-col>
          <v-col cols="12" md="4">
            <h4 class="text-subtitle-1 mb-2 footer-heading">Support</h4>
            <div><a class="footer-link" href="#">Contact</a></div>
            <div><a class="footer-link" href="#">Travel Advisors</a></div>
            <div><a class="footer-link" href="#">Accessibility</a></div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
.brand-title {
  font-weight: 800;
  color: #0b4f8a;
  letter-spacing: 0.16em;
  font-size: 1rem;
}

.app-bar-shell {
  border-bottom: 1px solid #d8e6f3;
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(8px);
}

.drawer-shell {
  background: #f6fbff;
}

.drawer-brand {
  color: #164675;
}

.border-b {
  border-bottom: 1px solid #d7e6f3;
}

.nav-link {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.footer-copy {
  color: #476789;
}

.footer-heading {
  color: #153b62;
}

.footer-shell {
  border-top: 1px solid #d8e6f3;
}

.footer-link {
  color: #2d5a84;
  text-decoration: none;
  line-height: 1.9;
}

.footer-link:hover {
  color: #0b4f8a;
  text-decoration: underline;
}
</style>
