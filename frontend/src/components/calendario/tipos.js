// Tipos de evento e cores (regras-negocio.md › Eventos). Classes escritas por extenso para o Tailwind gerá-las.
export const TIPOS = {
  'aula-ao-vivo': {
    rotulo: 'Aula ao vivo',
    chip: 'border-orange-600 bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
    ponto: 'bg-orange-600 dark:bg-orange-400',
  },
  atividade: {
    rotulo: 'Atividade',
    chip: 'border-purple-600 bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100',
    ponto: 'bg-purple-600 dark:bg-purple-400',
  },
  prova: {
    rotulo: 'Prova',
    chip: 'border-red-600 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
    ponto: 'bg-red-600 dark:bg-red-400',
  },
  outro: {
    rotulo: 'Outro',
    chip: 'border-gray-500 bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
    ponto: 'bg-gray-500',
  },
};

// tipo desconhecido cai em "Outro"
export const infoTipo = (tipo) => TIPOS[tipo] ?? TIPOS.outro;
