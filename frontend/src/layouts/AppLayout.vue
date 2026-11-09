<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTemaStore } from '../stores/tema';
import Avatar from '../components/ui/Avatar.vue';

const auth = useAuthStore();
const tema = useTemaStore();
const router = useRouter();

const rotulos = { admin: 'Admin', professor: 'Professor', aluno: 'Aluno' };

function sair() {
  auth.sair();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 bg-primary-800 text-white shadow">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <RouterLink :to="{ name: 'home' }" class="text-lg font-bold tracking-tight">
          Aprender Unoeste
        </RouterLink>
        <span
          v-if="auth.role"
          class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold uppercase"
        >
          {{ rotulos[auth.role] }}
        </span>

        <div class="ml-auto flex items-center gap-2">
          <!-- O sino de notificações entra aqui (13/11) -->
          <RouterLink
            :to="{ name: 'perfil' }"
            class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10"
            aria-label="Meu perfil"
          >
            <Avatar :usuario="auth.usuario" tamanho="h-8 w-8" />
            <span class="hidden text-sm sm:inline">{{ auth.usuario?.nome }}</span>
          </RouterLink>
          <button
            type="button"
            class="rounded-lg p-2 hover:bg-white/10"
            :aria-label="tema.escuro ? 'Usar tema claro' : 'Usar tema escuro'"
            @click="tema.alternar"
          >
            <span aria-hidden="true">{{ tema.escuro ? '☀️' : '🌙' }}</span>
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
            @click="sair"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <RouterView />
  </div>
</template>
