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
    <v-navigation-drawer v-model="mobileMenuOpen" temporary>
      <v-list nav density="comfortable">
        <v-list-item v-for="link in navLinks" :key="link.label" :title="link.label" :href="link.href" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="white" elevation="1">
      <template v-if="!isDesktop">
        <v-btn icon="mdi-menu" variant="text" @click="mobileMenuOpen = !mobileMenuOpen" />
      </template>

      <v-toolbar-title class="brand-title text-center text-md-left">Intrepid</v-toolbar-title>

      <v-spacer />

      <template v-if="isDesktop">
        <v-btn v-for="link in navLinks" :key="link.label" :href="link.href" variant="text" class="mr-1">
          {{ link.label }}
        </v-btn>
        <v-spacer />
      </template>

      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-account-circle" variant="text" v-bind="props" />
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

    <v-footer color="#2d3741" class="text-white py-8">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-2">Intrepid Cruise Lines</h3>
            <p class="text-body-2 mb-0">Find ocean adventures built around your dates and budget.</p>
          </v-col>
          <v-col cols="12" md="3">
            <h4 class="text-subtitle-1 mb-2">Explore</h4>
            <div><a class="footer-link" href="#">Cruises</a></div>
            <div><a class="footer-link" href="#">Destinations</a></div>
            <div><a class="footer-link" href="#">Deals</a></div>
          </v-col>
          <v-col cols="12" md="3">
            <h4 class="text-subtitle-1 mb-2">Follow</h4>
            <div><a class="footer-link" href="#">Instagram</a></div>
            <div><a class="footer-link" href="#">Facebook</a></div>
            <div><a class="footer-link" href="#">YouTube</a></div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
.brand-title {
  font-weight: 700;
  color: #0b4f8a;
  letter-spacing: 0.04em;
}

.footer-link {
  color: #d7e4ef;
  text-decoration: none;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}
</style>
