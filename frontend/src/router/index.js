import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import AgentDetail from '../views/AgentDetail.vue';
import CallDetail from '../views/CallDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/agents/:id',
    name: 'AgentDetail',
    component: AgentDetail
  },
  {
    path: '/calls/:id',
    name: 'CallDetail',
    component: CallDetail
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
