import { createRouter, createWebHistory } from "vue-router";
import Country from '../pages/Country.vue';

import Home from "../pages/Home.vue";
import Dashboard from "../pages/Dashboard.vue";

const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/dashboard",
    component: Dashboard
  },
  {
    path: '/country/:slug',
    component: Country
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;