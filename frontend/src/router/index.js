import { createRouter, createWebHashHistory } from "vue-router";

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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;