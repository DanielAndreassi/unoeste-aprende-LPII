<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { listarEventosTurma } from '../../api/eventos';
import { mensagemErro } from '../../api/http';
import { obterTurma } from '../../api/turmas';
import { infoTipo } from '../../components/calendario/tipos';
import Avatar from '../../components/ui/Avatar.vue';
import { chaveDia, localParaIso, paraExibicao, somarDias } from '../../utils/datas';

const id = useRoute().params.id;
const turma = ref(null);
const eventos = ref([]);
const erro = ref('');

const atalhos = [
  ['Conteúdo', 'conteudo'],
  ['Plano de Ensino', 'plano'],
  ['Notas', 'notas'],
  ['Assistente IA', 'assistente'],
];

async function carregar() {
  try {
    turma.value = await obterTurma(id);
    const hoje = chaveDia(new Date());
    eventos.value = await listarEventosTurma(id, {
      de: localParaIso(`${hoje}T00:00`),
      ate: localParaIso(`${somarDias(hoje, 31)}T00:00`),
    });
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}
carregar();
</script>

<template>
  <section>
    <p v-if="erro" role="alert" class="text-sm text-red-700 dark:text-red-400">{{ erro }}</p>
    <template v-if="turma">
      <h1 class="text-2xl font-medium">{{ turma.disciplina.nome }}</h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Turma {{ turma.codigo }} · {{ turma.semestre }}
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          v-for="p in turma.professores"
          :key="p._id"
          class="inline-flex items-center gap-2 text-sm"
        >
          <Avatar :usuario="p" tamanho="h-7 w-7" />{{ p.nome }}
        </span>
      </div>

      <nav aria-label="Atalhos" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RouterLink
          v-for="[rotulo, caminho] in atalhos"
          :key="caminho"
          :to="`/turmas/${id}/${caminho}`"
          class="rounded-xl border bg-white p-4 text-center text-sm font-medium transition-colors hover:border-primary-700 dark:bg-gray-900 dark:hover:border-primary-400"
        >
          {{ rotulo }}
        </RouterLink>
      </nav>

      <h2 class="mt-8 text-lg font-medium">Próximos eventos</h2>
      <p v-if="!eventos.length" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Nenhum evento nos próximos 30 dias.
      </p>
      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="e in eventos"
          :key="e._id"
          class="flex items-start gap-2 rounded-xl border bg-white p-3 text-sm dark:bg-gray-900"
        >
          <span :class="['mt-1.5 h-2 w-2 shrink-0 rounded-full', infoTipo(e.tipo).ponto]" />
          <div>
            <p class="font-medium">{{ e.titulo }}</p>
            <p class="text-gray-600 dark:text-gray-400">
              {{ infoTipo(e.tipo).rotulo }} · {{ paraExibicao(e.inicio) }}
            </p>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>
