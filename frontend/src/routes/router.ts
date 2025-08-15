import Layout from '@/layout/Layout.vue';
import { useAuthStore } from '@/stores/auth.store';
import CollaboratorsView from '@/views/CollaboratorsView.vue';
import Dashboard from '@/views/Dashboard.vue';
import MedicalCertificates from '@/views/MedicalCertificates.vue';
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';

const Login = () => import('@/views/LoginView.vue');

function isTokenValid(token: string): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function requireAuth(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore();
  const token = auth.token;
  if (!token || !isTokenValid(token)) {
    return next('/login');
  }
  next();
}

function handleLogout(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore();
  auth.logout();
  next('/login');
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
      { path: 'medical-certificates', component: MedicalCertificates },
    ],
    meta: { requiresAuth: true },
    beforeEnter: requireAuth,
  },
  {
    path: '/logout',
    component: { render: () => null },
    beforeEnter: handleLogout,
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  const token = auth.token;
  const authenticated = !!token && isTokenValid(token);

  if (to.path === '/' && authenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
