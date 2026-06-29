import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SavedCruisesView from '../views/SavedCruisesView.vue'
import BookingLandingView from '../views/BookingLandingView.vue'
import BookingFlowView from '../views/BookingFlowView.vue'

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
    {
      path: '/booking-landing',
      name: 'booking-landing',
      component: BookingLandingView,
    },
    {
      path: '/booking-flow',
      name: 'booking-flow',
      component: BookingFlowView,
    },
  ],
})

export default router
