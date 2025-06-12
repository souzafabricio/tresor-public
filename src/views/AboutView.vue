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

          <div class="input-container value-input-group-container">
            <div class="value-input-group">
              <input v-model="newEntry.valorFormatado" type="text" id="valor" class="text-field value-input-field" placeholder=" "
                inputmode="decimal" pattern="^-?\d*[.,]?\d*$" @focus="handleFocusValor" />
              <button @click="setEntrySign(newEntry, -1, 'valor')" class="btn small-sign-button neg-button" type="button">
                <span class="material-icons">remove</span>
              </button>
              <button @click="setEntrySign(newEntry, 1, 'valor')" class="btn small-sign-button pos-button" type="button">
                <span class="material-icons">add</span>
              </button>
            </div>
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

          <!-- NOVO: Input de Valor com Botões +/- para Edição -->
          <div class="input-container value-input-group-container">
            <div class="value-input-group">
              <input v-model="editingEntry.valorFormatado" type="text" id="editValor" class="text-field value-input-field" placeholder=" "
                inputmode="decimal" @focus="handleFocusValor" />
              <button @click="setEntrySign(editingEntry, -1, 'editValor')" class="btn small-sign-button neg-button" type="button">
                <span class="material-icons">remove</span>
              </button>
              <button @click="setEntrySign(editingEntry, 1, 'editValor')" class="btn small-sign-button pos-button" type="button">
                <span class="material-icons">add</span>
              </button>
            </div>
            <label for="editValor" class="label-text">Valor</label>
          </div>
          <!-- FIM NOVO -->

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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = getAuth();
const router = useRouter();

const lancamentos = ref([]);
const erro = ref('');

const anoSelecionado = ref(new Date().getFullYear());
const mesSelecionado = ref(new Date().getMonth());

const inicioDoMes = computed(() => {
  return new Date(anoSelecionado.value, mesSelecionado.value, 1);
});

const fimDoMes = computed(() => {
  return new Date(anoSelecionado.value, mesSelecionado.value + 1, 0, 23, 59, 59, 999);
});

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const nomeMesSelecionado = computed(() => {
  return `${meses[mesSelecionado.value]} de ${anoSelecionado.value}`;
});

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

const getCategoryIcon = (categoryName) => {
  const category = categoriasDisponiveis.value.find(cat => cat.nome === categoryName);
  return category ? category.icon : 'category';
};

const showAddModal = ref(false);
const modalError = ref('');
const newEntry = reactive({
  nome: '',
  descricao: '',
  data: '',
  valor: 0,
  valorFormatado: '0,00',
  obs: '',
  categoria: ''
});

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

const entryToDelete = ref(null);

const currentActiveModalInputId = ref('');

// Helper para converter string formatada (ex: "1.234,56") para número (ex: 1234.56)
const parseFormattedInputToNumeric = (inputString) => {
  if (typeof inputString !== 'string') {
    inputString = String(inputString);
  }
  const isNegative = inputString.startsWith('-');
  let cleaned = inputString.replace(/[^0-9]/g, '');

  if (cleaned === '') return 0;

  // Garante que haja pelo menos dois dígitos para a parte decimal
  while (cleaned.length < 3) {
    cleaned = '0' + cleaned;
  }

  let numericValue = parseFloat(cleaned.slice(0, -2) + '.' + cleaned.slice(-2));
  return isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
};

// Helper para formatar valor numérico para exibição no campo de input
const formatNumericValueForInputDisplay = (numericValue) => {
  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
    return '0,00';
  }
  // Remove o sinal negativo para a formatação, depois o adiciona se necessário
  const valueForFormat = Math.abs(numericValue);
  const formatted = valueForFormat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
  return numericValue < 0 ? '-' + formatted : formatted;
};


// Atualiza as funções de watch para usar os novos helpers
watch(() => newEntry.valorFormatado, (newValue, oldValue) => {
  if (currentActiveModalInputId.value === 'valor') {
    const inputElement = document.getElementById('valor');
    if (!inputElement) return;

    const caretPosition = inputElement.selectionStart;
    const newNumericValue = parseFormattedInputToNumeric(newValue);
    newEntry.valor = newNumericValue;
    const formattedValue = formatNumericValueForInputDisplay(newNumericValue);

    // Evita loop infinito: só atualiza o v-model se houver diferença real na string formatada
    if (newEntry.valorFormatado !== formattedValue) {
      newEntry.valorFormatado = formattedValue;
    }

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
    const newNumericValue = parseFormattedInputToNumeric(newValue);
    editingEntry.valor = newNumericValue;
    const formattedValue = formatNumericValueForInputDisplay(newNumericValue);

    if (editingEntry.valorFormatado !== formattedValue) {
      editingEntry.valorFormatado = formattedValue;
    }

    requestAnimationFrame(() => {
      const newCaretPosition = calculateNewCaretPosition(oldValue, formattedValue, caretPosition);
      inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
    });
  }
});

const calculateNewCaretPosition = (oldValue, newValue, oldCaretPosition) => {
  let newCaretPosition = oldCaretPosition;

  // Lógica de ajuste do cursor baseada na diferença de tamanho da string
  const diff = newValue.length - oldValue.length;
  newCaretPosition += diff;

  // Ajuste especial para quando o sinal negativo é adicionado/removido na posição 0
  if (oldValue.startsWith('-') && !newValue.startsWith('-')) {
    newCaretPosition = Math.max(0, newCaretPosition - 1);
  } else if (!oldValue.startsWith('-') && newValue.startsWith('-') && oldCaretPosition === 0) {
    newCaretPosition = Math.min(newValue.length, newCaretPosition + 1);
  }

  return Math.min(Math.max(0, newCaretPosition), newValue.length);
};

// Nova função para definir o sinal do valor com base nos botões
const setEntrySign = (entryRef, sign, inputId) => {
    currentActiveModalInputId.value = inputId; // Define o ID do input ativo para o watch

    // Pega o valor numérico absoluto atual
    const currentNumericValue = Math.abs(entryRef.valor);
    // Aplica o novo sinal
    const newNumericValue = sign * currentNumericValue;

    // Atualiza o valor numérico
    entryRef.valor = newNumericValue;
    // Atualiza a string formatada para exibição no input
    entryRef.valorFormatado = formatNumericValueForInputDisplay(newNumericValue);

    // Garante que o input mantenha o foco e o cursor no final
    nextTick(() => {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.focus();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        }
    });
};

const handleFocusValor = (event) => {
  currentActiveModalInputId.value = event.target.id;
  // Quando foca, seleciona todo o texto se for "0,00" ou "-0,00" para facilitar a digitação
  if (event.target.value === '0,00' || event.target.value === '-0,00') {
    event.target.setSelectionRange(0, event.target.value.length);
  }
};

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

    lancamentos.value = lista.sort((a, b) => b.data.toDate() - a.data.toDate());

  } catch (e) {
    console.error('Erro ao carregar lançamentos:', e);
    erro.value = 'Falha ao carregar os lançamentos.';
  }
};

const adicionarLancamento = async () => {
  modalError.value = '';

  // Garante que newEntry.valor esteja atualizado a partir do valorFormatado antes da validação
  newEntry.valor = parseFormattedInputToNumeric(newEntry.valorFormatado);

  if (!newEntry.nome || !newEntry.descricao || newEntry.valor === null || isNaN(newEntry.valor) || !newEntry.data || !newEntry.categoria) {
    modalError.value = 'Preencha todos os campos obrigatórios (Nome, Valor, Data, Descrição e Categoria).';
    return;
  }

  // Se o valor formatado for uma string vazia ou consistir apenas de caracteres não numéricos (ex: "-", ".", ","), considera inválido.
  if (newEntry.valor === 0 && newEntry.valorFormatado.replace(/[^0-9]/g, '') === '') {
    modalError.value = 'O valor inserido não é válido.';
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const dateParts = newEntry.data.split('-').map(Number);
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0);

    await addDoc(collection(db, 'lancamentos'), {
      userId,
      nome: newEntry.nome,
      descricao: newEntry.descricao,
      data: dateToSave,
      valor: Number(newEntry.valor), // Usa o valor numérico processado
      obs: newEntry.obs,
      categoria: newEntry.categoria,
      criadoEm: new Date(),
    });

    closeAddModal();
    const entryDate = new Date(newEntry.data);
    if (entryDate.getFullYear() === anoSelecionado.value && entryDate.getMonth() === mesSelecionado.value) {
      await carregarLancamentos(userId);
    }

  } catch (e) {
    console.error('Erro ao adicionar lançamento:', e);
    modalError.value = 'Falha ao salvar o lançamento.';
  }
};

const salvarEdicao = async () => {
  modalError.value = '';

  // Garante que editingEntry.valor esteja atualizado a partir do valorFormatado antes da validação
  editingEntry.valor = parseFormattedInputToNumeric(editingEntry.valorFormatado);

  if (!editingEntry.nome || !editingEntry.descricao || editingEntry.valor === null || isNaN(editingEntry.valor) || !editingEntry.data || !editingEntry.categoria) {
    modalError.value = 'Preencha todos os campos obrigatórios (Nome, Valor, Data, Descrição e Categoria).';
    return;
  }
  // Se o valor formatado for uma string vazia ou consistir apenas de caracteres não numéricos, considera inválido.
  if (editingEntry.valor === 0 && editingEntry.valorFormatado.replace(/[^0-9]/g, '') === '') {
    modalError.value = 'O valor inserido não é válido.';
    return;
  }

  try {
    const lancamentoRef = doc(db, 'lancamentos', editingEntry.id);
    const dateParts = editingEntry.data.split('-').map(Number);
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0);

    await updateDoc(lancamentoRef, {
      nome: editingEntry.nome,
      descricao: editingEntry.descricao,
      data: dateToSave,
      valor: Number(editingEntry.valor), // Usa o valor numérico processado
      obs: editingEntry.obs,
      categoria: editingEntry.categoria,
      atualizadoEm: new Date(),
    });

    closeEditModal();
    await carregarLancamentos(auth.currentUser.uid);

  } catch (e) {
    console.error('Erro ao salvar edição:', e);
    modalError.value = 'Falha ao salvar as alterações.';
  }
};

const excluirLancamento = async () => {
  if (!entryToDelete.value) return;
  try {
    const userId = auth.currentUser.uid;
    await deleteDoc(doc(db, 'lancamentos', entryToDelete.value.id));
    cancelarExclusao();
    closeEditModal();
    await carregarLancamentos(userId);
  } catch (e) {
    console.error("Erro ao excluir:", e);
    erro.value = "Falha ao excluir o lançamento."
  }
};

const openAddModal = () => {
  Object.assign(newEntry, {
    nome: '',
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    valor: 0,
    valorFormatado: formatNumericValueForInputDisplay(0), // Inicializa com valor formatado
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
  Object.assign(editingEntry, {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao,
    data: item.data.toDate().toISOString().slice(0, 10),
    valor: item.valor,
    valorFormatado: formatNumericValueForInputDisplay(item.valor), // Inicializa com valor formatado
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

const formatarValor = (valor) => {
  if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarData = (timestamp) => {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const voltar = () => {
  router.push('/home');
};

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
body,
html,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  color: #333;
  font-family: 'Roboto', sans-serif;
  font-size: 0.9em;
}

.main-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Roboto', sans-serif;
}

.content-card {
  width: 100%;
  max-width: 340px;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  text-align: center;
  margin: 0.8rem 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-bottom: 20px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  flex-grow: 1;
  text-align: center;
  transform: translateX(-18px);
}

.back-button {
  border-radius: 50%;
  padding: 3px 8px;
  min-width: 30px;
  min-height: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
}

.back-button .material-icons {
  font-size: 20px;
}

.back-button:hover {
  background-color: #d0d0d0;
}

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

.totals-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 8px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  background-color: #fdfdfd;
  border-radius: 8px;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  flex: 1;
}

.total-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 3px;
}

.total-item.entradas .value {
  color: #28a745;
}

.total-item.saidas .value {
  color: #dc3545;
}

.lancamentos-list-container {
  margin-top: 20px;
  width: 100%;
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 6px;
}

.lancamento-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.lancamento-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.item-category-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
}

.category-icon {
  font-size: 1.2rem;
  color: #007bff;
}

.item-nome {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
  display: block;
}

.item-valor {
  font-size: 1rem;
  font-weight: 600;
}

.item-valor.positivo {
  color: #28a745;
}

.item-valor.negativo {
  color: #dc3545;
}


.item-body .item-descricao {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 6px;
  line-height: 1.3;
}

.item-body .item-obs {
  font-size: 0.8rem;
  color: #777;
  background-color: #e9ecef;
  padding: 3px 6px;
  border-radius: 4px;
  font-style: italic;
}

.item-footer {
  margin-top: 10px;
  text-align: right;
}

.item-data {
  font-size: 0.75rem;
  color: #6c757d;
}

/* NOVO: Estilos para o grupo de input de valor e botões */
.value-input-group-container {
  position: relative;
  margin-bottom: 20px;
}

.value-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.value-input-field {
  flex-grow: 1;
  width: auto;
  padding-right: 5px;
}

.small-sign-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.small-sign-button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.small-sign-button .material-icons {
  font-size: 20px;
}

.small-sign-button.pos-button {
  background-color: #28a745;
  color: #fff;
}
.small-sign-button.pos-button:hover {
  background-color: #218838;
}

.small-sign-button.neg-button {
  background-color: #dc3545;
  color: #fff;
}
.small-sign-button.neg-button:hover {
  background-color: #c82333;
}
/* FIM NOVO */


.input-container {
  position: relative;
  margin-bottom: 20px;
}

.text-field {
  width: 100%;
  padding: 14px 14px 7px 14px;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  outline: none;
  box-sizing: border-box;
  appearance: none;
}

textarea.text-field {
  padding-top: 20px;
  resize: vertical;
}

.text-field.select-field {
  padding-top: 14px;
  height: 48px;
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
  left: 14px;
  top: 14px;
  color: #888;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.text-field:focus+.label-text,
.text-field:not(:placeholder-shown)+.label-text {
  top: 4px;
  font-size: 0.7rem;
  color: #007bff;
}

.select-label-text {
  top: 14px;
}

.text-field:focus+.select-label-text,
.text-field:not(:placeholder-shown).select-field+.select-label-text {
  top: 4px;
  font-size: 0.7rem;
  color: #007bff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 360px;
  text-align: left;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
  text-align: center;
  flex-grow: 1;
}

.modal-text {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 20px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.btn {
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-item-button {
  width: 100%;
}

.filled-button {
  background-color: #007bff;
  color: #ffffff;
}

.filled-button:hover {
  background-color: #0056b3;
}

.text-button {
  background-color: transparent;
  color: #007bff;
}

.text-button:hover {
  background-color: rgba(0, 123, 255, 0.08);
}

.filled-button-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.filled-button-danger:hover {
  background-color: #c82333;
}

.error-message {
  color: #dc3545;
  margin-top: 0.8rem;
  font-weight: 500;
}

.no-items-message {
  padding: 14px;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}
</style>
