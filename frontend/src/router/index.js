import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// meta.publica = não exige login; meta.roles = perfis permitidos (herdado pelas rotas filhas).
const routes = [
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: { publica: true },
    children: [
      {
        path: '',
        name: 'login',
        meta: { titulo: 'Entrar', subtitulo: 'Acesse suas disciplinas' },
        component: () => import('../views/auth/LoginView.vue'),
      },
      {
        path: '/esqueci-senha',
        name: 'esqueci-senha',
        meta: { titulo: 'Esqueci minha senha' },
        component: () => import('../views/auth/EsqueciSenhaView.vue'),
      },
      {
        // aberta mesmo logado: o link do e-mail deve funcionar em qualquer sessão
        path: '/redefinir-senha',
        name: 'redefinir-senha',
        meta: { aberta: true, titulo: 'Definir senha' },
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
        path: 'calendario',
        name: 'calendario',
        meta: { roles: ['admin', 'professor', 'aluno'] },
        component: () => import('../views/calendario/CalendarioView.vue'),
      },
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
          {
            path: 'conteudo',
            name: 'turma-conteudo',
            component: () => import('../views/turma/ConteudoView.vue'),
          },
          {
            path: 'calendario',
            name: 'turma-calendario',
            component: () => import('../views/turma/CalendarioView.vue'),
          },
          {
            path: 'notas',
            name: 'turma-notas',
            component: () => import('../views/turma/NotasView.vue'),
          },
        ],
      },
      {
        // grupo de administração: meta.roles vale para todas as filhas (guard em beforeEach)
        path: 'admin',
        meta: { roles: ['admin'] },
        children: [
          { path: '', name: 'admin', component: () => import('../views/admin/PainelView.vue') },
          {
            path: 'usuarios',
            name: 'admin-usuarios',
            component: () => import('../views/admin/UsuariosView.vue'),
          },
          {
            path: 'cursos',
            name: 'admin-cursos',
            component: () => import('../views/admin/CursosView.vue'),
          },
          {
            path: 'disciplinas',
            name: 'admin-disciplinas',
            component: () => import('../views/admin/DisciplinasView.vue'),
          },
          {
            path: 'turmas',
            name: 'admin-turmas',
            component: () => import('../views/admin/TurmasView.vue'),
          },
          {
            path: 'eventos',
            name: 'admin-eventos',
            component: () => import('../views/admin/EventosInstitucionaisView.vue'),
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
