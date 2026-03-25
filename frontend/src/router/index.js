import AnimalListView from '@/views/AnimalListView.vue'
import AnimalView from '@/views/AnimalView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/animals",
      component: AnimalListView
    },
    {
      path: '/animal/:id',
      name: 'animal',
      component: AnimalView
    }
  ],
})

export default router
