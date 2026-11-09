import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// meta.publica = não exige login; meta.roles = perfis permitidos (herdado pelas rotas filhas).
const routes = [
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: { publica: true },
    children: [
      { path: '', name: 'login', component: () => import('../views/auth/LoginView.vue') },
      {
        path: '/esqueci-senha',
        name: 'esqueci-senha',
        component: () => import('../views/auth/EsqueciSenhaView.vue'),
      },
      {
        // aberta mesmo logado: o link do e-mail deve funcionar em qualquer sessão
        path: '/redefinir-senha',
        name: 'redefinir-senha',
        meta: { aberta: true },
        component: () => import('../views/auth/RedefinirSenhaView.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/home/HomeView.vue') },
      { path: 'perfil', name: 'perfil', component: () => import('../views/perfil/PerfilView.vue') },
      {
        path: 'turmas/:id',
        component: () => import('../layouts/TurmaLayout.vue'),
        meta: { roles: ['professor', 'aluno'] },
        children: [
          {
            path: '',
            name: 'turma-inicio',
            component: () => import('../views/turma/TurmaInicioView.vue'),
          },
        ],
      },
      {
        path: ':pathMatch(.*)*',
        name: 'nao-encontrado',
        component: () => import('../views/NaoEncontradoView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const publica = to.matched.some((r) => r.meta.publica);

  if (!publica && !auth.logado) return { name: 'login', query: { redirect: to.fullPath } };
  if (publica && auth.logado && !to.meta.aberta) return { name: 'home' };
  if (to.matched.some((r) => r.meta.roles && !r.meta.roles.includes(auth.role)))
    return { name: 'home' };
});

export default router;
