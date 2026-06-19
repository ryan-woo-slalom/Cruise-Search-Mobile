import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SavedCruisesView from '../views/SavedCruisesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/saved-cruises',
      name: 'saved-cruises',
      component: SavedCruisesView,
    },
  ],
})

export default router
