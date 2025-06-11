<template>
  <div class="main-container">
    <div class="content-card">

      <div class="title-row">
        <button @click="voltar" class="btn back-button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Lançamentos</h1>
      </div>

      <div class="month-navigation">
        <button @click="voltarMes" class="btn icon-button">
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="month-display">{{ nomeMesSelecionado }}</span>
        <button @click="avancarMes" class="btn icon-button">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>

      <button @click="openAddModal" class="btn filled-button add-item-button">
        <span class="material-icons">add</span>
        Adicionar Lançamento
      </button>

      <div class="totals-summary">
        <div class="total-item entradas">
          <span>Entradas:</span>
          <span class="value positivo">{{ formatarValor(totalEntradas) }}</span>
        </div>
        <div class="total-item saidas">
          <span>Saídas:</span>
          <span class="value negativo">{{ formatarValor(totalSaidas) }}</span>
        </div>
      </div>
      <div class="lancamentos-list-container">
        <div v-if="lancamentos.length === 0" class="no-items-message">
          Nenhum lançamento cadastrado para este mês.
        </div>
        <div v-else v-for="item in lancamentos" :key="item.id" class="lancamento-item" @click="openEditModal(item)"
          title="Clique para editar ou excluir">
          <div class="item-header">
            <div class="item-category-info">
              <span class="material-icons category-icon">{{ getCategoryIcon(item.categoria) }}</span>
              <span class="item-categoria-nome">{{ item.categoria || 'Sem Categoria' }}</span>
            </div>
            <span class="item-valor" :class="{ 'positivo': item.valor >= 0, 'negativo': item.valor < 0 }">
              {{ formatarValor(item.valor) }}
            </span>
          </div>
          <div class="item-body">
            <p class="item-nome">{{ item.nome }}</p>
            <p class="item-descricao">{{ item.descricao }}</p>
            <p v-if="item.obs" class="item-obs"><strong>Obs:</strong> {{ item.obs }}</p>
          </div>
          <div class="item-footer">
            <span class="item-data">{{ formatarData(item.data) }}</span>
          </div>
        </div>
      </div>

      <p v-if="erro" class="error-message">{{ erro }}</p>

    </div>

    <Transition name="modal-fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-container">
          <h2 class="section-title">Novo Lançamento</h2>
          <div class="input-container">
            <input v-model="newEntry.nome" type="text" id="nome" class="text-field" placeholder=" " />
            <label for="nome" class="label-text">Nome</label>
          </div>
          <div class="input-container">
            <input v-model="newEntry.valorFormatado" type="text" id="valor" class="text-field" placeholder=" "
              inputmode="decimal" @focus="handleFocusValor" />
            <label for="valor" class="label-text">Valor (use negativo para dívidas)</label>
          </div>
          <div class="input-container">
            <input v-model="newEntry.data" type="date" id="data" class="text-field" placeholder=" " />
            <label for="data" class="label-text">Data</label>
          </div>
          <div class="input-container">
            <input v-model="newEntry.descricao" type="text" id="descricao" class="text-field" placeholder=" " />
            <label for="descricao" class="label-text">Descrição</label>
          </div>
          <div class="input-container">
            <textarea v-model="newEntry.obs" id="obs" class="text-field" placeholder=" " rows="2"></textarea>
            <label for="obs" class="label-text">Observações (Opcional)</label>
          </div>

          <div class="input-container">
            <select v-model="newEntry.categoria" id="categoria" class="text-field select-field">
              <option value="" disabled selected>Selecione uma categoria</option>
              <option v-for="cat in categoriasDisponiveis" :key="cat.nome" :value="cat.nome">
                {{ cat.nome }}
              </option>
            </select>
            <label for="categoria" class="label-text select-label-text">Categoria</label>
          </div>

          <p v-if="modalError" class="error-message">{{ modalError }}</p>

          <div class="modal-actions">
            <button @click="closeAddModal" class="btn text-button">Cancelar</button>
            <button @click="adicionarLancamento" class="btn filled-button">Adicionar</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container">
          <div class="title-row">
            <button @click="closeEditModal" class="btn back-button">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="section-title">Editar Lançamento</h2>
          </div>

          <div class="input-container">
            <input v-model="editingEntry.nome" type="text" id="editNome" class="text-field" placeholder=" " />
            <label for="editNome" class="label-text">Nome (ex: Açaí, Dívida Mãe)</label>
          </div>
          <div class="input-container">
            <input v-model="editingEntry.valorFormatado" type="text" id="editValor" class="text-field" placeholder=" "
              inputmode="decimal" @focus="handleFocusValor" />
            <label for="editValor" class="label-text">Valor (use negativo para dívidas)</label>
          </div>
          <div class="input-container">
            <input v-model="editingEntry.data" type="date" id="editData" class="text-field" placeholder=" " />
            <label for="editData" class="label-text">Data</label>
          </div>
          <div class="input-container">
            <input v-model="editingEntry.descricao" type="text" id="editDescricao" class="text-field" placeholder=" " />
            <label for="editDescricao" class="label-text">Descrição</label>
          </div>
          <div class="input-container">
            <textarea v-model="editingEntry.obs" id="editObs" class="text-field" placeholder=" " rows="2"></textarea>
            <label for="editObs" class="label-text">Observações (Opcional)</label>
          </div>

          <div class="input-container">
            <select v-model="editingEntry.categoria" id="editCategoria" class="text-field select-field">
              <option value="" disabled selected>Selecione uma categoria</option>
              <option v-for="cat in categoriasDisponiveis" :key="cat.nome" :value="cat.nome">
                {{ cat.nome }}
              </option>
            </select>
            <label for="editCategoria" class="label-text select-label-text">Categoria</label>
          </div>

          <p v-if="modalError" class="error-message">{{ modalError }}</p>

          <div class="modal-actions">
            <button @click="confirmarExclusao(editingEntry)" class="btn filled-button-danger">Excluir</button>
            <button @click="salvarEdicao" class="btn filled-button">Salvar</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="entryToDelete" class="modal-overlay" @click.self="cancelarExclusao">
        <div class="modal-container">
          <h2 class="section-title">Confirmar Exclusão</h2>
          <p class="modal-text">
            Tem certeza que deseja excluir o lançamento <strong>"{{ entryToDelete.nome }}"</strong>?
          </p>
          <div class="modal-actions">
            <button @click="cancelarExclusao" class="btn text-button">Cancelar</button>
            <button @click="excluirLancamento" class="btn filled-button-danger">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = getAuth();
const router = useRouter();

// Estados da UI principal
const lancamentos = ref([]);
const erro = ref('');

// Data de referência para navegação
const anoSelecionado = ref(new Date().getFullYear());
const mesSelecionado = ref(new Date().getMonth()); // 0 para Janeiro, 11 para Dezembro

// --- Propriedades Computadas para Datas ---
const inicioDoMes = computed(() => {
  return new Date(anoSelecionado.value, mesSelecionado.value, 1);
});

const fimDoMes = computed(() => {
  return new Date(anoSelecionado.value, mesSelecionado.value + 1, 0, 23, 59, 59, 999);
});

// Nomes dos meses para exibição
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Exibe o nome do mês e ano selecionado
const nomeMesSelecionado = computed(() => {
  return `${meses[mesSelecionado.value]} de ${anoSelecionado.value}`;
});


// --- PROPRIEDADES COMPUTADAS ---
const totalEntradas = computed(() => {
  return lancamentos.value
    .filter(item => item.valor >= 0)
    .reduce((sum, item) => sum + item.valor, 0);
});

const totalSaidas = computed(() => {
  return lancamentos.value
    .filter(item => item.valor < 0)
    .reduce((sum, item) => sum + item.valor, 0);
});

// --- DADOS DAS CATEGORIAS ---
const categoriasDisponiveis = ref([
  { nome: 'Salário', icon: 'payments' },
  { nome: 'Essencial', icon: 'home' },
  { nome: 'Alimentação', icon: 'restaurant' },
  { nome: 'Lazer', icon: 'movie_filter' },
  { nome: 'Transporte', icon: 'commute' },
  { nome: 'Moradia', icon: 'apartment' },
  { nome: 'Saúde', icon: 'healing' },
  { nome: 'Educação', icon: 'school' },
  { nome: 'Beleza', icon: 'face' },
  { nome: 'Roupas', icon: 'checkroom' },
  { nome: 'Assinaturas', icon: 'subscriptions' },
  { nome: 'Doações', icon: 'volunteer_activism' },
  { nome: 'Pets', icon: 'pets' },
  { nome: 'Imprevistos', icon: 'crisis_alert' },
  { nome: 'Investimentos', icon: 'trending_up' },
  { nome: 'Outros', icon: 'category' }
]);

// Função para obter o ícone da categoria
const getCategoryIcon = (categoryName) => {
  const category = categoriasDisponiveis.value.find(cat => cat.nome === categoryName);
  return category ? category.icon : 'category';
};

// Estados do Modal de Adicionar
const showAddModal = ref(false);
const modalError = ref('');
const newEntry = reactive({
  nome: '',
  descricao: '',
  data: '',
  valor: 0, // Valor numérico para salvar no Firebase
  valorFormatado: '0,00', // Valor em string formatada para o input
  obs: '',
  categoria: ''
});

// Estados do Modal de Edição
const showEditModal = ref(false);
const editingEntry = reactive({
  id: null,
  nome: '',
  descricao: '',
  data: '',
  valor: 0,
  valorFormatado: '0,00',
  obs: '',
  categoria: ''
});

// Estados do Modal de Exclusão
const entryToDelete = ref(null);

// Variável para controlar qual modal está ativo para o watcher de valor
const currentActiveModalInputId = ref(''); // 'valor' para adicionar, 'editValor' para editar

// --- FUNÇÃO DE FORMATAÇÃO DE VALOR EM TEMPO REAL ---
const formatarInputValor = (valorString, field) => {
  if (typeof valorString !== 'string') {
    valorString = String(valorString);
  }

  // Permite o sinal negativo inicial e trata caso o usuário digite apenas '-'
  const isNegative = valorString.startsWith('-');
  let cleaned = valorString.replace(/[^0-9]/g, '');

  // Se a string estiver vazia (após remover não-dígitos) ou for apenas "-", retorne o estado inicial
  if (cleaned === '') {
    if (field === 'newEntry') {
      newEntry.valor = 0;
    } else { // field === 'editingEntry'
      editingEntry.valor = 0;
    }
    return isNegative ? '-' : '0,00'; // Se só tem '-', mantém, senão volta para '0,00'
  }


  // Remove zeros à esquerda (ex: "005" vira "5")
  if (cleaned.length > 1 && cleaned.startsWith('0')) {
    cleaned = cleaned.replace(/^0+/, '');
  }

  // Garante que a string tem pelo menos 3 dígitos para formatar com duas casas decimais (ex: "5" vira "005")
  while (cleaned.length < 3) {
    cleaned = '0' + cleaned;
  }

  let integerPart = cleaned.slice(0, -2);
  let decimalPart = cleaned.slice(-2);

  // Adiciona separador de milhares
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  let formatted = integerPart + ',' + decimalPart;

  // Adiciona o sinal negativo de volta, se aplicável
  if (isNegative) {
    formatted = '-' + formatted;
  }

  // Atualiza o valor numérico (para salvar no Firebase)
  const numericValue = parseFloat(formatted.replace(/\./g, '').replace(',', '.'));

  if (field === 'newEntry') {
    newEntry.valor = isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
  } else { // field === 'editingEntry'
    editingEntry.valor = isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
  }

  return formatted;
};

// --- WATCHER PARA FORMATAR O VALOR ENQUANTO DIGITA (PARA AMBOS OS MODAIS) ---
watch(() => newEntry.valorFormatado, (newValue, oldValue) => {
  if (currentActiveModalInputId.value === 'valor') {
    const inputElement = document.getElementById('valor');
    if (!inputElement) return;

    const caretPosition = inputElement.selectionStart;
    const formattedValue = formatarInputValor(newValue, 'newEntry');
    newEntry.valorFormatado = formattedValue;

    requestAnimationFrame(() => {
      const newCaretPosition = calculateNewCaretPosition(oldValue, formattedValue, caretPosition);
      inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
    });
  }
});

watch(() => editingEntry.valorFormatado, (newValue, oldValue) => {
  if (currentActiveModalInputId.value === 'editValor') {
    const inputElement = document.getElementById('editValor');
    if (!inputElement) return;

    const caretPosition = inputElement.selectionStart;
    const formattedValue = formatarInputValor(newValue, 'editingEntry');
    editingEntry.valorFormatado = formattedValue;

    requestAnimationFrame(() => {
      const newCaretPosition = calculateNewCaretPosition(oldValue, formattedValue, caretPosition);
      inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
    });
  }
});


// Helper para calcular a nova posição do cursor
const calculateNewCaretPosition = (oldValue, newValue, oldCaretPosition) => {
  let newCaretPosition = oldCaretPosition;

  // Ajusta a posição do cursor com base nas mudanças de comprimento da string
  const diff = newValue.length - oldValue.length;
  newCaretPosition += diff;

  // Lógica específica para o sinal negativo no início
  if (oldValue.startsWith('-') && !newValue.startsWith('-')) {
    newCaretPosition = Math.max(0, newCaretPosition - 1); // Se o '-' foi removido
  } else if (!oldValue.startsWith('-') && newValue.startsWith('-') && oldCaretPosition === 0) {
    newCaretPosition = Math.min(newValue.length, newCaretPosition + 1); // Se o '-' foi adicionado no início
  }

  // Garante que o cursor não saia dos limites
  return Math.min(Math.max(0, newCaretPosition), newValue.length);
};


// Função para lidar com o foco no campo de valor
const handleFocusValor = (event) => {
  // Define qual input está ativo para o watcher correto
  currentActiveModalInputId.value = event.target.id;

  // Se o valor for "0,00" e não for negativo, seleciona todo o conteúdo
  if (event.target.value === '0,00' || event.target.value === '-0,00') {
    event.target.setSelectionRange(0, event.target.value.length);
  }
};


/**
 * Carrega lançamentos do usuário logado para o mês e ano selecionados do Firestore.
 */
const carregarLancamentos = async (userId) => {
  erro.value = '';
  try {
    const q = query(
      collection(db, 'lancamentos'),
      where('userId', '==', userId),
      where('data', '>=', inicioDoMes.value),
      where('data', '<=', fimDoMes.value)
    );
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordena por data, da mais recente para a mais antiga
    lancamentos.value = lista.sort((a, b) => b.data.toDate() - a.data.toDate());

  } catch (e) {
    console.error('Erro ao carregar lançamentos:', e);
    erro.value = 'Falha ao carregar os lançamentos.';
  }
};

/**
 * Adiciona um novo lançamento no Firestore.
 */
const adicionarLancamento = async () => {
  modalError.value = '';

  // Garante que newEntry.valor esteja atualizado antes da validação final
  newEntry.valorFormatado = formatarInputValor(newEntry.valorFormatado, 'newEntry');

  if (!newEntry.nome || !newEntry.descricao || newEntry.valor === null || isNaN(newEntry.valor) || !newEntry.data || !newEntry.categoria) {
    modalError.value = 'Preencha todos os campos obrigatórios (Nome, Valor, Data, Descrição e Categoria).';
    return;
  }
  // Se o valor for 0 e o formatado for "0,00", é considerado válido para adição.
  // Caso contrário, se o campo for preenchido com algo que resulta em 0,00 mas não é válido (ex: "abc"), impedimos.
  if (newEntry.valor === 0 && newEntry.valorFormatado !== '0,00' && newEntry.valorFormatado !== '-0,00') {
    modalError.value = 'O valor inserido não é válido.';
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    // --- MUDANÇA PRINCIPAL AQUI PARA TRATAR A DATA ---
    const dateParts = newEntry.data.split('-').map(Number); // [ano, mês, dia]
    // O construtor Date() usa mês baseado em zero (0 para janeiro, 1 para fevereiro, etc.)
    // Adicionamos 12 horas para garantir que fique no meio do dia no fuso horário local.
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0); // Ano, Mês-1, Dia, Hora, Minuto, Segundo


    await addDoc(collection(db, 'lancamentos'), {
      userId,
      nome: newEntry.nome,
      descricao: newEntry.descricao,
      data: dateToSave, // Usamos o objeto Date ajustado
      valor: Number(newEntry.valor),
      obs: newEntry.obs,
      categoria: newEntry.categoria,
      criadoEm: new Date(),
    });

    closeAddModal();
    // Recarrega apenas se o lançamento adicionado for no mês/ano atual
    const entryDate = new Date(newEntry.data);
    if (entryDate.getFullYear() === anoSelecionado.value && entryDate.getMonth() === mesSelecionado.value) {
      await carregarLancamentos(userId);
    }

  } catch (e) {
    console.error('Erro ao adicionar lançamento:', e);
    modalError.value = 'Falha ao salvar o lançamento.';
  }
};

/**
 * Salva as edições de um lançamento no Firestore.
 */
const salvarEdicao = async () => {
  modalError.value = '';

  // Garante que editingEntry.valor esteja atualizado antes da validação final
  editingEntry.valorFormatado = formatarInputValor(editingEntry.valorFormatado, 'editingEntry');

  if (!editingEntry.nome || !editingEntry.descricao || editingEntry.valor === null || isNaN(editingEntry.valor) || !editingEntry.data || !editingEntry.categoria) {
    modalError.value = 'Preencha todos os campos obrigatórios (Nome, Valor, Data, Descrição e Categoria).';
    return;
  }
  if (editingEntry.valor === 0 && editingEntry.valorFormatado !== '0,00' && editingEntry.valorFormatado !== '-0,00') {
    modalError.value = 'O valor inserido não é válido.';
    return;
  }

  try {
    const lancamentoRef = doc(db, 'lancamentos', editingEntry.id);
    // --- MUDANÇA PRINCIPAL AQUI PARA TRATAR A DATA ---
    const dateParts = editingEntry.data.split('-').map(Number); // [ano, mês, dia]
    // O construtor Date() usa mês baseado em zero (0 para janeiro, 1 para fevereiro, etc.)
    // Adicionamos 12 horas para garantir que fique no meio do dia no fuso horário local.
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0); // Ano, Mês-1, Dia, Hora, Minuto, Segundo

    await updateDoc(lancamentoRef, {
      nome: editingEntry.nome,
      descricao: editingEntry.descricao,
      data: dateToSave, // Usamos o objeto Date ajustado
      valor: Number(editingEntry.valor),
      obs: editingEntry.obs,
      categoria: editingEntry.categoria,
      atualizadoEm: new Date(), // Adiciona um timestamp de atualização
    });

    closeEditModal();
    await carregarLancamentos(auth.currentUser.uid); // Recarrega para refletir a mudança

  } catch (e) {
    console.error('Erro ao salvar edição:', e);
    modalError.value = 'Falha ao salvar as alterações.';
  }
};


/**
 * Exclui um lançamento do Firestore.
 */
const excluirLancamento = async () => {
  if (!entryToDelete.value) return;
  try {
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, 'lancamentos', entryToDelete.value.id));
    cancelarExclusao();
    closeEditModal(); // Fecha o modal de edição se a exclusão veio de lá
    await carregarLancamentos(userId);
  } catch (e) {
    console.error("Erro ao excluir:", e);
    erro.value = "Falha ao excluir o lançamento."
  }
};

// --- Funções de controle dos Modais ---
const openAddModal = () => {
  // Reseta os campos do formulário e define a data atual como padrão
  Object.assign(newEntry, {
    nome: '',
    descricao: '',
    data: new Date().toISOString().slice(0, 10), // Define a data atual
    valor: 0, // Inicia o valor numérico como 0
    valorFormatado: '0,00', // Inicia o campo formatado com "0,00"
    obs: '',
    categoria: ''
  });
  modalError.value = '';
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const openEditModal = (item) => {
  // Preenche editingEntry com os dados do item clicado
  Object.assign(editingEntry, {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao,
    data: item.data.toDate().toISOString().slice(0, 10), // Converte timestamp para string de data
    valor: item.valor,
    valorFormatado: formatarValor(item.valor).replace('R$', '').trim(), // Formata para a exibição sem R$
    obs: item.obs,
    categoria: item.categoria
  });
  modalError.value = '';
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const confirmarExclusao = (item) => {
  entryToDelete.value = item;
};

const cancelarExclusao = () => {
  entryToDelete.value = null;
};

// --- Funções de Navegação de Mês ---
const avancarMes = () => {
  if (mesSelecionado.value === 11) {
    mesSelecionado.value = 0;
    anoSelecionado.value++;
  } else {
    mesSelecionado.value++;
  }
};

const voltarMes = () => {
  if (mesSelecionado.value === 0) {
    mesSelecionado.value = 11;
    anoSelecionado.value--;
  } else {
    mesSelecionado.value--;
  }
};


// --- Funções de Formatação e Navegação ---
// Esta função é usada apenas para exibição dos valores já salvos/calculados
const formatarValor = (valor) => {
  // Garante que é um número antes de formatar
  if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarData = (timestamp) => {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const voltar = () => {
  router.push('/home'); // Ou use router.back()
};

// --- Watchers e Lifecycle Hooks ---

// Observa mudanças no mês ou ano selecionado para recarregar os lançamentos
watch([mesSelecionado, anoSelecionado], async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    await carregarLancamentos(userId);
  }
});

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await carregarLancamentos(user.uid);
    } else {
      router.push('/');
    }
  });
});
</script>

<style scoped>
/*
 * IMPORTANTE: Para que os ícones do Material Design apareçam,
 * certifique-se de que a seguinte linha esteja no <head> do seu `public/index.html`:
 * <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
 */

/* Estilos Globais/Reset Simplificado */
body,
html,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  color: #333;
  font-family: 'Roboto', sans-serif;
  /* Reduz a fonte base do corpo para afetar tudo proporcionalmente */
  font-size: 0.9em; /* Ajustado de 1em para 0.9em */
}

.main-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Alinhado ao topo */
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Roboto', sans-serif;
}

.content-card {
  width: 100%;
  max-width: 360px;
  padding: 14px; /* Reduzido de 16px */
  border-radius: 10px; /* Reduzido de 12px */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  text-align: center;
  margin: 0.8rem 0; /* Reduzido de 1rem */
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px; /* Reduzido de 8px */
  margin-bottom: 20px; /* Reduzido de 24px */
}

.title {
  font-size: 1.8rem; /* Reduzido de 2rem */
  font-weight: 700;
  color: #333;
  flex-grow: 1;
  text-align: center;
  transform: translateX(-18px); /* Ajuste para centralizar visualmente */
}

.back-button {
  border-radius: 50%; /* Mantido para circular */
  padding: 3px 8px; /* Reduzido padding */
  min-width: 30px; /* Reduzido de 32px */
  min-height: 30px; /* Reduzido de 32px */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Sombra mais sutil */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
}

.back-button .material-icons {
  font-size: 20px; /* Reduzido de 22px */
}

.back-button:hover {
  background-color: #d0d0d0;
}

/* --- Navegação de Mês --- */
.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  gap: 12px;
}

.month-navigation .icon-button {
  min-width: 36px;
  height: 36px;
  padding: 0;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.month-navigation .icon-button:hover {
  background-color: #d0d0d0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.month-navigation .icon-button .material-icons {
  font-size: 20px;
}

.month-display {
  flex-grow: 1;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

/* --- ESTILOS PARA OS TOTAIS --- */
.totals-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 16px; /* Reduzido de 20px */
  margin-bottom: 16px; /* Reduzido de 20px */
  padding: 8px 0; /* Reduzido de 10px */
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  background-color: #fdfdfd;
  border-radius: 8px;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.9rem; /* Reduzido de 1rem */
  font-weight: 500;
  color: #555;
  flex: 1;
}

.total-item .value {
  font-size: 1.1rem; /* Reduzido de 1.2rem */
  font-weight: 700;
  margin-top: 3px; /* Reduzido de 4px */
}

.total-item.entradas .value {
  color: #28a745;
}

.total-item.saidas .value {
  color: #dc3545;
}
/* ------------------------------------ */

/* Lista de Lançamentos */
.lancamentos-list-container {
  margin-top: 20px; /* Reduzido de 24px */
  width: 100%;
  max-height: 55vh; /* Ajustado para caber mais itens */
  overflow-y: auto;
  padding-right: 6px; /* Reduzido de 8px */
}

.lancamento-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px; /* Reduzido de 16px */
  margin-bottom: 8px; /* Reduzido de 12px */
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.lancamento-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Alinha no centro verticalmente */
  margin-bottom: 6px; /* Reduzido de 8px */
}

/* NOVO ESTILO PARA CATEGORIA NO ITEM */
.item-category-info {
  display: flex;
  align-items: center;
  gap: 6px; /* Espaçamento entre ícone e nome da categoria */
  font-size: 0.9rem; /* Tamanho da fonte da categoria */
  font-weight: 500;
  color: #666;
  text-transform: uppercase; /* Opcional: deixar em maiúsculas */
}

.category-icon {
  font-size: 1.2rem; /* Tamanho do ícone */
  color: #007bff; /* Cor do ícone */
}

.item-nome {
  font-size: 1rem; /* Reduzido de 1.1rem */
  font-weight: 600;
  color: #333;
  margin-top: 4px; /* Espaçamento da categoria para o nome */
  display: block; /* Garante que fique em sua própria linha */
}

.item-valor {
  font-size: 1rem; /* Reduzido de 1.1rem */
  font-weight: 600;
}
.item-valor.positivo { color: #28a745; }
.item-valor.negativo { color: #dc3545; }


.item-body .item-descricao {
  font-size: 0.85rem; /* Reduzido de 0.95rem */
  color: #555;
  margin-bottom: 6px; /* Reduzido de 8px */
  line-height: 1.3; /* Levemente ajustado para compactar */
}
.item-body .item-obs {
  font-size: 0.8rem; /* Reduzido de 0.85rem */
  color: #777;
  background-color: #e9ecef;
  padding: 3px 6px; /* Reduzido de 4px 8px */
  border-radius: 4px;
  font-style: italic;
}

.item-footer {
  margin-top: 10px; /* Reduzido de 12px */
  text-align: right;
}

.item-data {
  font-size: 0.75rem; /* Reduzido de 0.8rem */
  color: #6c757d;
}


/* Estilos de Formulário */
.input-container {
  position: relative;
  margin-bottom: 20px; /* Reduzido de 24px */
}

.text-field {
  width: 100%;
  padding: 14px 14px 7px 14px; /* Ajuste para o padding */
  font-size: 0.95rem; /* Levemente menor */
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  outline: none;
  box-sizing: border-box;
  appearance: none; /* Remove estilo padrão do select em alguns browsers */
}
textarea.text-field {
    padding-top: 20px; /* Ajuste para o padding */
    resize: vertical;
}

/* NOVO ESTILO PARA SELECT */
.text-field.select-field {
  padding-top: 14px; /* Ajusta padding para o texto do label */
  height: 48px; /* Altura fixa para alinhar com outros campos */
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888888"%3e%3cpath d="M7 10l5 5 5-5z"/%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 24px;
}

.text-field:focus {
  border-color: #007bff;
}

.label-text {
  position: absolute;
  left: 14px; /* Ajustado para o padding */
  top: 14px; /* Ajustado para o padding */
  color: #888;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 0.95rem; /* Levemente menor */
}

.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px;
  font-size: 0.7rem; /* Levemente menor */
  color: #007bff;
}

/* Ajuste para o label do select, se necessário */
.select-label-text {
  top: 14px; /* Posiciona o label no centro do select */
}

.text-field:focus + .select-label-text,
.text-field:not(:placeholder-shown).select-field + .select-label-text {
  top: 4px; /* move o label para cima quando selecionado */
  font-size: 0.7rem;
  color: #007bff;
}


/* Modais */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.modal-container {
  background-color: #ffffff; padding: 20px; /* Reduzido de 24px para 20px */
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 90%; max-width: 360px; /* Ligeiramente menor */
  text-align: left;
}
.section-title {
  font-size: 1.4rem; /* Reduzido de 1.5rem para 1.4rem */
  font-weight: 600; color: #333;
  margin-bottom: 14px; /* Reduzido de 16px para 14px */
  text-align: center;
  flex-grow: 1; /* Para centralizar o título na linha de título */
}
.modal-text {
  font-size: 0.95rem; /* Reduzido de 1rem para 0.95rem */
  color: #555; line-height: 1.4; /* Ajustado para compactar */
  margin-bottom: 20px; /* Reduzido de 24px para 20px */
  text-align: center;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 6px; /* Reduzido de 8px para 6px */
  margin-top: 20px; /* Reduzido de 24px para 20px */
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: translateY(20px); }

/* Botões e Mensagens */
.btn {
  padding: 8px 20px; /* Ajuste para o padding */
  font-size: 0.9rem; /* Reduzido de 1rem para 0.9rem */
  font-weight: 500;
  border: none; border-radius: 8px; /* Ligeiramente menor */
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; /* Reduzido de 8px para 6px */
}
.add-item-button { width: 100%; }
.filled-button { background-color: #007bff; color: #ffffff; }
.filled-button:hover { background-color: #0056b3; }
.text-button { background-color: transparent; color: #007bff; }
.text-button:hover { background-color: rgba(0, 123, 255, 0.08); }
.filled-button-danger { background-color: #dc3545; color: #ffffff; }
.filled-button-danger:hover { background-color: #c82333; }
.error-message { color: #dc3545; margin-top: 0.8rem; /* Levemente menor */ font-weight: 500; }
.no-items-message { padding: 14px; /* Reduzido de 16px */ text-align: center; color: #888; font-style: italic; font-size: 0.9rem; /* Reduzido */ }
</style>