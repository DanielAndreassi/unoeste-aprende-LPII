<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTemaStore } from '../stores/tema';
import Avatar from '../components/ui/Avatar.vue';
import Marca from '../components/ui/Marca.vue';

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
    <header class="sticky top-0 z-30 border-b bg-white dark:bg-gray-900">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <RouterLink :to="{ name: 'home' }" aria-label="Aprender Unoeste, início">
          <Marca />
        </RouterLink>
        <template v-if="auth.role">
          <span class="h-4 w-px bg-gray-900/10 dark:bg-white/10" aria-hidden="true" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ rotulos[auth.role] }}</span>
        </template>

        <div class="ml-auto flex items-center gap-2">
          <!-- O sino de notificações entra aqui (13/11) -->
          <RouterLink
            :to="{ name: 'perfil' }"
            class="flex h-10 items-center gap-2 rounded-lg px-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Meu perfil"
          >
            <Avatar :usuario="auth.usuario" />
            <span class="hidden sm:inline">{{ auth.usuario?.nome }}</span>
          </RouterLink>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            :aria-label="tema.escuro ? 'Usar tema claro' : 'Usar tema escuro'"
            @click="tema.alternar"
          >
            <svg
              v-if="tema.escuro"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              />
            </svg>
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </button>
          <button
            type="button"
            class="h-10 rounded-lg px-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
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
