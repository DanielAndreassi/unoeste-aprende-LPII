<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificacoesStore } from '../../stores/notificacoes';
import { paraExibicao } from '../../utils/datas';

const store = useNotificacoesStore();
const router = useRouter();
const aberto = ref(false);
const raiz = ref(null);
const botao = ref(null);

onMounted(() => {
  store.iniciar();
  document.addEventListener('click', foraDoSino);
});
onBeforeUnmount(() => {
  store.parar();
  document.removeEventListener('click', foraDoSino);
});

function foraDoSino(e) {
  if (aberto.value && !raiz.value.contains(e.target)) aberto.value = false;
}

function fechar() {
  aberto.value = false;
  botao.value.focus();
}

async function abrir(n) {
  await store.ler(n).catch(() => {});
  aberto.value = false;
  if (n.link) router.push(n.link);
}
</script>

<template>
  <div ref="raiz" class="relative" @keydown.esc="fechar">
    <button
      ref="botao"
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      :aria-label="`Notificações${store.naoLidas ? `, ${store.naoLidas} não lidas` : ''}`"
      aria-haspopup="true"
      :aria-expanded="aberto"
      @click="aberto = !aberto"
    >
      <svg
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
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span
        v-if="store.naoLidas"
        class="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-medium leading-4 text-white"
        aria-hidden="true"
      >
        {{ store.naoLidas > 9 ? '9+' : store.naoLidas }}
      </span>
    </button>

    <div
      v-if="aberto"
      class="fixed inset-x-4 top-[4.25rem] z-40 rounded-xl border bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[22rem] dark:bg-gray-900"
    >
      <div class="flex items-center justify-between border-b px-4 py-3">
        <h2 class="text-sm font-medium">Notificações</h2>
        <button
          v-if="store.naoLidas"
          type="button"
          class="text-sm text-primary-800 hover:underline dark:text-primary-300"
          @click="store.lerTodas"
        >
          Marcar todas como lidas
        </button>
      </div>
      <p v-if="!store.itens.length" class="px-4 py-8 text-center text-sm text-gray-500">
        Nenhuma notificação por aqui.
      </p>
      <ul v-else class="max-h-96 divide-y overflow-y-auto">
        <li v-for="n in store.itens" :key="n._id" class="flex items-start gap-1">
          <button
            type="button"
            class="flex-1 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="abrir(n)"
          >
            <span class="flex items-start gap-2">
              <span
                v-if="!n.lida"
                class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600"
                role="img"
                aria-label="Não lida"
              />
              <span :class="n.lida ? 'text-gray-500 dark:text-gray-400' : ''" class="text-sm">
                {{ n.mensagem }}
                <span class="mt-0.5 block text-xs text-gray-500">
                  {{ paraExibicao(n.createdAt) }}
                </span>
              </span>
            </span>
          </button>
          <button
            type="button"
            class="mr-2 mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Excluir notificação"
            @click="store.excluir(n)"
          >
            ×
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
