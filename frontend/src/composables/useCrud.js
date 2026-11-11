import { ref } from 'vue';
import { mensagemErro } from '../api/http';

// CRUD das telas de admin: lista, modal de formulário e confirmação de exclusão.
// `api` = { listar(), criar(corpo), atualizar(id, corpo), excluir(id) }; `listar` devolve o array.
export function useCrud(api) {
  const itens = ref([]);
  const carregando = ref(true);
  const erro = ref('');

  const modalForm = ref(false);
  const editando = ref(null); // null = criando
  const salvando = ref(false);
  const campos = ref({});
  const erroForm = ref('');

  const modalExcluir = ref(false);
  const alvo = ref(null);
  const textoExclusao = ref({});
  const excluindo = ref(false);
  const erroExclusao = ref('');

  async function carregar() {
    try {
      itens.value = await api.listar();
      erro.value = '';
    } catch (err) {
      erro.value = mensagemErro(err);
    } finally {
      carregando.value = false;
    }
  }

  function abrirForm(item = null) {
    editando.value = item;
    campos.value = {};
    erroForm.value = '';
    modalForm.value = true;
  }

  // Erros de campo (`campos`) vão junto do campo; o resto (ex.: 409) vai ao aviso do formulário.
  async function salvar(corpo) {
    salvando.value = true;
    campos.value = {};
    erroForm.value = '';
    try {
      if (editando.value) await api.atualizar(editando.value._id, corpo);
      else await api.criar(corpo);
      modalForm.value = false;
      await carregar();
    } catch (err) {
      campos.value = err.response?.data?.campos ?? {};
      if (!Object.keys(campos.value).length) erroForm.value = mensagemErro(err);
    } finally {
      salvando.value = false;
    }
  }

  function pedirExclusao(item, mensagem, extra = {}) {
    alvo.value = item;
    textoExclusao.value = { titulo: 'Confirmar exclusão', rotulo: 'Excluir', ...extra, mensagem };
    erroExclusao.value = '';
    modalExcluir.value = true;
  }

  async function confirmarExclusao() {
    excluindo.value = true;
    erroExclusao.value = '';
    try {
      await api.excluir(alvo.value._id);
      modalExcluir.value = false;
      await carregar();
    } catch (err) {
      erroExclusao.value = mensagemErro(err);
    } finally {
      excluindo.value = false;
    }
  }

  return {
    itens,
    carregando,
    erro,
    carregar,
    modalForm,
    editando,
    abrirForm,
    salvando,
    campos,
    erroForm,
    salvar,
    modalExcluir,
    textoExclusao,
    pedirExclusao,
    excluindo,
    erroExclusao,
    confirmarExclusao,
  };
}
