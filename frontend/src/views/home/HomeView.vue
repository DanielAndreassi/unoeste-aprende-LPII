<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { listarEventos } from '../../api/eventos';
import { mensagemErro } from '../../api/http';
import { minhasTurmas } from '../../api/turmas';
import CalendarioMes from '../../components/calendario/CalendarioMes.vue';
import { infoTipo } from '../../components/calendario/tipos';
import CardTurma from '../../components/home/CardTurma.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';
import { chaveDia, diaCurto, hora, localParaIso, somarDias } from '../../utils/datas';

// Home do aluno e do professor (o admin é redirecionado ao painel pelo router).
const semestre = ref('');
const semestres = ref([]);
const cursos = ref([]);
const carregando = ref(true);
const erro = ref('');

const proximos = ref([]); // eventos de hoje até +7 dias
const eventosMes = ref([]);

const hoje = chaveDia(new Date());

async function carregarTurmas() {
  carregando.value = true;
  try {
    const r = await minhasTurmas({ semestre: semestre.value || undefined });
    cursos.value = r.cursos;
    semestres.value = r.semestres;
    semestre.value = r.semestre; // o servidor devolve o semestre efetivo (padrão: o atual)
    erro.value = '';
  } catch (err) {
    erro.value = mensagemErro(err);
  } finally {
    carregando.value = false;
  }
}

async function carregarProximos() {
  try {
    proximos.value = await listarEventos({
      de: localParaIso(`${hoje}T00:00`),
      ate: localParaIso(`${somarDias(hoje, 8)}T00:00`),
    });
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

async function mudouPeriodo({ de, ate }) {
  try {
    eventosMes.value = await listarEventos({ de, ate });
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

const eventosPorTurma = computed(() =>
  Map.groupBy(
    proximos.value.filter((e) => e.turma),
    (e) => e.turma._id,
  ),
);
// Agenda da semana: eventos agrupados por dia; "Hoje" e "Amanhã" no lugar da data
const agenda = computed(() =>
  [...Map.groupBy(proximos.value, (e) => chaveDia(e.inicio))].map(([dia, eventos]) => ({
    dia,
    rotulo: dia === hoje ? 'Hoje' : dia === somarDias(hoje, 1) ? 'Amanhã' : diaCurto(dia),
    eventos,
  })),
);
// nome curto da disciplina (o rótulo da API repete turma e semestre em toda linha)
const nomeTurma = computed(
  () => new Map(cursos.value.flatMap((c) => c.turmas.map((t) => [t._id, t.disciplina.nome]))),
);
const opcoesSemestre = computed(() => semestres.value.map((s) => ({ valor: s, rotulo: s })));

onMounted(() => {
  carregarTurmas();
  carregarProximos();
});
// só recarrega quando o usuário troca o semestre (o primeiro valor vem do próprio servidor)
watch(semestre, (novo, antigo) => antigo && carregarTurmas());
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="titulo-pagina">Minhas disciplinas</h1>
      <div v-if="semestres.length > 1" class="w-full sm:w-40">
        <CampoSelect v-model="semestre" label="Semestre" :opcoes="opcoesSemestre" />
      </div>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <div v-if="carregando" class="grid gap-4 sm:grid-cols-2" aria-busy="true">
          <div
            v-for="n in 4"
            :key="n"
            class="h-36 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        </div>
        <p v-else-if="!cursos.length" class="text-sm text-gray-600 dark:text-gray-400">
          Você não tem disciplinas em {{ semestre }}.
        </p>
        <template v-else>
          <section v-for="c in cursos" :key="c.curso._id" class="mb-8">
            <h2 class="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ c.curso.nome }}
            </h2>
            <ul class="grid gap-4 sm:grid-cols-2">
              <li v-for="t in c.turmas" :key="t._id">
                <CardTurma :turma="t" :eventos="(eventosPorTurma.get(t._id) ?? []).slice(0, 2)" />
              </li>
            </ul>
          </section>
        </template>
      </div>

      <aside class="space-y-6">
        <section class="painel p-5">
          <h2 class="mb-4 text-sm font-medium">Próximos 7 dias</h2>
          <p v-if="!proximos.length" class="text-sm text-gray-600 dark:text-gray-400">
            Nenhum evento nos próximos 7 dias.
          </p>
          <ol v-else class="space-y-4">
            <li v-for="g in agenda" :key="g.dia">
              <h3
                :class="[
                  'mb-2 text-xs font-medium',
                  g.dia === hoje
                    ? 'text-primary-800 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400',
                ]"
              >
                {{ g.rotulo }}
              </h3>
              <ul class="space-y-2">
                <li v-for="e in g.eventos" :key="e._id" class="flex items-start gap-2 text-sm">
                  <span
                    class="w-10 shrink-0 text-xs leading-5 tabular-nums text-gray-600 dark:text-gray-400"
                  >
                    {{ hora(e.inicio) }}
                  </span>
                  <span
                    :class="['mt-1.5 h-2 w-2 shrink-0 rounded-full', infoTipo(e.tipo).ponto]"
                    aria-hidden="true"
                  />
                  <span class="min-w-0">
                    <span class="block">{{ e.titulo }}</span>
                    <span class="block truncate text-xs text-gray-600 dark:text-gray-400">
                      {{ e.turma ? nomeTurma.get(e.turma._id) ?? e.turma.rotulo : 'Institucional' }}
                    </span>
                  </span>
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <section class="painel p-5">
          <CalendarioMes :eventos="eventosMes" @periodo="mudouPeriodo" />
        </section>
      </aside>
    </div>
  </main>
</template>
