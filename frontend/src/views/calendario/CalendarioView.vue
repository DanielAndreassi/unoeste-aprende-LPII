<script setup>
import { onMounted, ref, watch } from 'vue';
import { listarEventos } from '../../api/eventos';
import { mensagemErro } from '../../api/http';
import { minhasTurmas } from '../../api/turmas';
import CalendarioMes from '../../components/calendario/CalendarioMes.vue';
import CampoSelect from '../../components/ui/CampoSelect.vue';

// Todas as turmas do usuário + institucionais. Filtro por turma usa o id da turma.
const periodo = ref(null);
const eventos = ref([]);
const erro = ref('');
const turmaId = ref('');
const opcoesTurma = ref([{ valor: '', rotulo: 'Todas as turmas' }]);

async function carregarEventos() {
  if (!periodo.value) return;
  try {
    eventos.value = await listarEventos({
      de: periodo.value.de,
      ate: periodo.value.ate,
      turma: turmaId.value || undefined,
    });
    erro.value = '';
  } catch (err) {
    erro.value = mensagemErro(err);
  }
}

function mudouPeriodo(p) {
  periodo.value = p;
  carregarEventos();
}

watch(turmaId, carregarEventos);

onMounted(async () => {
  try {
    const { cursos } = await minhasTurmas();
    opcoesTurma.value = [
      { valor: '', rotulo: 'Todas as turmas' },
      ...cursos.flatMap((c) => c.turmas.map((t) => ({ valor: t._id, rotulo: t.rotulo }))),
    ];
  } catch (err) {
    erro.value = mensagemErro(err);
  }
});
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="titulo-pagina">Calendário</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Eventos das suas turmas e os institucionais. Horários em São Paulo.
        </p>
      </div>
      <div class="w-full sm:w-72">
        <CampoSelect v-model="turmaId" label="Turma" :opcoes="opcoesTurma" />
      </div>
    </div>

    <p v-if="erro" role="alert" class="mt-4 text-sm text-red-700 dark:text-red-400">{{ erro }}</p>

    <div class="painel mt-6 p-4 sm:p-6">
      <CalendarioMes :eventos="eventos" @periodo="mudouPeriodo" />
    </div>
  </div>
</template>
