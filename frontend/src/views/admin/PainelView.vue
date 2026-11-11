<script setup>
import { onMounted, ref } from 'vue';
import { cursos, disciplinas, eventosInstitucionais, turmas, usuarios } from '../../api/admin';

// Cada atalho conta os próprios registros; as contagens rodam em paralelo e uma falha não derruba as outras.
const ATALHOS = [
  {
    to: 'admin-usuarios',
    rotulo: 'Usuários',
    descricao: 'Contas, papéis e ativação',
    contar: () => usuarios.listar({ page: 1 }).then((r) => r.total),
  },
  {
    to: 'admin-cursos',
    rotulo: 'Cursos',
    descricao: 'Cursos oferecidos',
    contar: () => cursos.listar().then((l) => l.length),
  },
  {
    to: 'admin-disciplinas',
    rotulo: 'Disciplinas',
    descricao: 'Disciplinas de cada curso',
    contar: () => disciplinas.listar().then((l) => l.length),
  },
  {
    to: 'admin-turmas',
    rotulo: 'Turmas',
    descricao: 'Turmas, professores e matrículas',
    contar: () => turmas.listar().then((l) => l.length),
  },
  {
    to: 'admin-eventos',
    rotulo: 'Eventos institucionais',
    descricao: 'Calendário visível para todos',
    contar: () => eventosInstitucionais.listar().then((l) => l.length),
  },
];

const contagens = ref({});
const erro = ref('');

onMounted(async () => {
  const res = await Promise.allSettled(ATALHOS.map((a) => a.contar()));
  res.forEach((r, i) => {
    contagens.value[i] = r.status === 'fulfilled' ? r.value : '—';
  });
  if (res.some((r) => r.status === 'rejected')) {
    erro.value = 'Não foi possível carregar algumas contagens.';
  }
});
</script>

<template>
  <section>
    <h1 class="titulo-pagina">Administração</h1>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Cadastros da instituição. Escolha uma área para gerenciar.
    </p>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="(a, i) in ATALHOS" :key="a.to">
        <RouterLink
          :to="{ name: a.to }"
          class="block h-full rounded-xl border bg-white p-5 shadow-sm transition-colors hover:border-primary-700 dark:bg-gray-900 dark:hover:border-primary-400"
        >
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ a.rotulo }}</span>
          <span class="mt-2 block text-3xl font-medium tabular-nums">{{
            contagens[i] ?? '…'
          }}</span>
          <span class="mt-1 block text-sm text-gray-500 dark:text-gray-400">{{ a.descricao }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
