import Layout from '@/layout/Layout.vue';
import { useAuthStore } from '@/stores/auth.store';
import CollaboratorsView from '@/views/CollaboratorsView.vue';
import Dashboard from '@/views/Dashboard.vue';
import { createRouter, createWebHistory } from 'vue-router';

const Login = () => import('@/views/LoginView.vue');

function isTokenValid(token: string) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const routes = [
  { path: '/login', component: Login },
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    component: Layout,
    children: [
      { path: '', component: Dashboard },
      { path: 'collaborators', component: CollaboratorsView },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/logout',
    component: { render: () => null },
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      auth.logout();
      next('/login');
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const token = auth.token;
  const authenticated = !!token && isTokenValid(token);

  if (to.path === '/' && authenticated) {
    next('/dashboard');
  } else if (to.meta.requiresAuth && !authenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
