<template>
  <div class="main-container">
    <div class="content-card">

      <div class="title-row">
        <button @click="voltar" class="btn back-button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Faturas</h1>
      </div>

      <div class="input-container select-wrapper">
        <select v-model="idCartao" class="text-field" id="card-select">
          <option value="" disabled>Selecione o cartão</option>
          <option v-for="cartao in cartoes" :key="cartao.id" :value="cartao.id">
            {{ cartao.banco }}
          </option>
        </select>
        <label for="card-select" class="label-text">Cartão</label>
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

      <div v-if="idCartao" class="invoice-details-card">

        <h2 class="section-title">Itens da Fatura</h2>
        <ul v-if="itensFatura.length > 0" class="invoice-items-list">
          <li v-for="item in itensFatura" :key="item.id" class="invoice-item" @click="openEditModal(item)"
            title="Clique para editar ou excluir">
            <div class="item-description">{{ item.descricao }}</div>
            <div class="item-details">
              <span>Data: {{ formatarData(item.data) }}</span>
              <span class="item-value">R$ {{ item.valor.toFixed(2).replace('.', ',') }}</span>
            </div>
            <!-- Ícone da categoria adicionado aqui -->
            <div class="item-category">
              <span class="material-icons category-icon-small">{{ getCategoryIcon(item.categoriaId) }}</span>
              Categoria: {{ getCategoryName(item.categoriaId) }}
            </div>
          </li>
        </ul>

        <p v-else class="no-items-message">Nenhum item cadastrado para este mês.</p>

        <button @click="openAddItemModal" class="btn filled-button add-item-button">
          <span class="material-icons">add</span> Adicionar Item
        </button>

        <hr class="divider" />

        <div class="total-section">
          Total da fatura: <span class="total-value">R$ {{ valorTotal.toFixed(2).replace('.', ',') }}</span>
        </div>

      </div>

      <p v-if="erro" class="error-message">{{ erro }}</p>
      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
    </div>

    <!-- Modal para Adicionar Novo Item -->
    <Transition name="modal-fade">
      <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeAddItemModal">
        <div class="modal-container">
          <h2 class="section-title">Adicionar Novo Item</h2>

          <div class="input-container">
            <input v-model="newItem.descricao" type="text" id="addDescricao" class="text-field" placeholder=" " />
            <label for="addDescricao" class="label-text">Descrição</label>
          </div>

          <div class="input-container">
            <input v-model="valorInputDisplay" type="text" inputmode="decimal" class="text-field" id="addValor"
              placeholder=" " @input="handleValorInput" @focus="clearPlaceholder" @blur="addPlaceholder" />
            <label for="addValor" class="label-text">Valor (ex: 59,90)</label>
          </div>

          <div class="input-container">
            <input v-model="newItem.data" type="date" id="addData" class="text-field" placeholder=" " />
            <label for="addData" class="label-text">Data</label>
          </div>

          <div class="input-container">
            <select v-model="newItem.categoriaId" id="addCategoria" class="text-field select-field">
              <option value="" disabled selected>Selecione uma categoria</option>
              <option v-for="cat in categoriasDisponiveis" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
            <label for="addCategoria" class="label-text select-label-text">Categoria</label>
          </div>

          <p v-if="modalError" class="error-message">{{ modalError }}</p>

          <div class="modal-actions">
            <button @click="closeAddItemModal" class="btn text-button">Cancelar</button>
            <button @click="confirmAddItem" class="btn filled-button">Adicionar</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal para Editar Item -->
    <Transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container">
          <div class="title-row">
            <button @click="closeEditModal" class="btn back-button">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="section-title">Editar Item da Fatura</h2>
          </div>

          <div class="input-container">
            <input v-model="editingItem.descricao" type="text" id="editDescricao" class="text-field" placeholder=" " />
            <label for="editDescricao" class="label-text">Descrição</label>
          </div>

          <div class="input-container">
            <input v-model="editingValorInputDisplay" type="text" inputmode="decimal" class="text-field"
              id="editValor" placeholder=" " @input="handleEditingValorInput" @focus="clearEditingPlaceholder"
              @blur="addEditingPlaceholder" />
            <label for="editValor" class="label-text">Valor</label>
          </div>

          <div class="input-container">
            <input v-model="editingItem.data" type="date" id="editData" class="text-field" placeholder=" " />
            <label for="editData" class="label-text">Data</label>
          </div>

          <div class="input-container">
            <select v-model="editingItem.categoriaId" id="editCategoria" class="text-field select-field">
              <option value="" disabled selected>Selecione uma categoria</option>
              <option v-for="cat in categoriasDisponiveis" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
            <label for="editCategoria" class="label-text select-label-text">Categoria</label>
          </div>

          <p v-if="modalError" class="error-message">{{ modalError }}</p>

          <div class="modal-actions">
            <button @click="confirmarExclusao(editingItem)" class="btn filled-button-danger">Excluir</button>
            <button @click="salvarEdicao" class="btn filled-button">Salvar</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <Transition name="modal-fade">
      <div v-if="itemToDelete" class="modal-overlay" @click.self="cancelarExclusao">
        <div class="modal-container">
          <h2 class="section-title">Confirmar Exclusão</h2>
          <p class="modal-text">
            Tem certeza que deseja excluir o item <strong>"{{ itemToDelete.descricao }}"</strong>?
          </p>
          <div class="modal-actions">
            <button @click="cancelarExclusao" class="btn text-button">Cancelar</button>
            <button @click="excluirItemConfirmado" class="btn filled-button-danger">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'

const auth = getAuth()
const router = useRouter()
const cartoes = ref([])
const idCartao = ref('')
const anoSelecionado = ref(new Date().getFullYear())
const mesSelecionado = ref(new Date().getMonth())
const itensFatura = ref([])
const erro = ref('')
const sucesso = ref('')

// Categorias disponíveis (mantidas as mesmas do componente de Lançamentos)
const categoriasDisponiveis = ref([
  { id: 'salario', nome: 'Salário', icon: 'payments' },
  { id: 'essencial', nome: 'Essencial', icon: 'home' },
  { id: 'alimentacao', nome: 'Alimentação', icon: 'restaurant' },
  { id: 'lazer', nome: 'Lazer', icon: 'movie_filter' },
  { id: 'transporte', nome: 'Transporte', icon: 'commute' },
  { id: 'moradia', nome: 'Moradia', icon: 'apartment' },
  { id: 'saude', nome: 'Saúde', icon: 'healing' },
  { id: 'educacao', nome: 'Educação', icon: 'school' },
  { id: 'beleza', nome: 'Beleza', icon: 'face' },
  { id: 'roupas', nome: 'Roupas', icon: 'checkroom' },
  { id: 'assinaturas', nome: 'Assinaturas', icon: 'subscriptions' },
  { id: 'doacoes', nome: 'Doações', icon: 'volunteer_activism' },
  { id: 'pets', nome: 'Pets', icon: 'pets' },
  { id: 'imprevistos', nome: 'Imprevistos', icon: 'crisis_alert' },
  { id: 'investimentos', nome: 'Investimentos', icon: 'trending_up' },
  { id: 'outros', icon: 'category' }
]);

const showAddItemModal = ref(false)
const newItem = reactive({
  descricao: '',
  valor: null,
  data: '',
  categoriaId: ''
})

const valorInputDisplay = ref(''); // Para o input de valor no modal de adição

const showEditModal = ref(false);
const editingItem = reactive({
  id: null,
  descricao: '',
  valor: null,
  data: '',
  categoriaId: ''
});
const editingValorInputDisplay = ref(''); // Para o input de valor no modal de edição

const itemToDelete = ref(null); // Ref para o item a ser excluído no modal de confirmação

const modalError = ref('')

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const nomeMesSelecionado = computed(() => {
  return `${meses[mesSelecionado.value]} de ${anoSelecionado.value}`
})

const valorTotal = computed(() => {
  return itensFatura.value.reduce((acc, item) => acc + Number(item.valor), 0)
})

// Função para obter o nome da categoria
const getCategoryName = (categoryId) => {
  const category = categoriasDisponiveis.value.find(cat => cat.id === categoryId);
  return category ? category.nome : 'Não categorizado';
};

// Função para obter o ícone da categoria
const getCategoryIcon = (categoryId) => {
  const category = categoriasDisponiveis.value.find(cat => cat.id === categoryId);
  return category ? category.icon : 'category'; // 'category' é um ícone padrão
};

// Funções para formatação de valor no modal de ADIÇÃO
const handleValorInput = () => {
  let rawValue = valorInputDisplay.value.replace(/\D/g, '');

  if (rawValue.length === 0 || parseInt(rawValue, 10) === 0) {
    newItem.valor = 0;
    valorInputDisplay.value = '0,00';
    return;
  }

  while (rawValue.length < 3) {
    rawValue = '0' + rawValue;
  }

  const cents = rawValue.slice(-2);
  const reais = rawValue.slice(0, -2);

  newItem.valor = parseFloat(`${reais}.${cents}`);

  valorInputDisplay.value = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(newItem.valor);

  nextTick(() => {
    const inputElement = document.getElementById('addValor');
    if (inputElement) {
      // Ajuste para posicionar o cursor no final do campo
      inputElement.setSelectionRange(valorInputDisplay.value.length, valorInputDisplay.value.length);
    }
  });
};

const clearPlaceholder = (event) => {
  if (event.target.value === '0,00') {
    event.target.value = '';
  }
};

const addPlaceholder = (event) => {
  if (event.target.value === '' || newItem.valor === null || newItem.valor === 0) {
    event.target.value = '0,00';
    newItem.valor = 0;
  }
};


// Funções para formatação de valor no modal de EDIÇÃO
const handleEditingValorInput = () => {
  let rawValue = editingValorInputDisplay.value.replace(/\D/g, '');

  if (rawValue.length === 0 || parseInt(rawValue, 10) === 0) {
    editingItem.valor = 0;
    editingValorInputDisplay.value = '0,00';
    return;
  }

  while (rawValue.length < 3) {
    rawValue = '0' + rawValue;
  }

  const cents = rawValue.slice(-2);
  const reais = rawValue.slice(0, -2);

  editingItem.valor = parseFloat(`${reais}.${cents}`);

  editingValorInputDisplay.value = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(editingItem.valor);

  nextTick(() => {
    const inputElement = document.getElementById('editValor');
    if (inputElement) {
      inputElement.setSelectionRange(editingValorInputDisplay.value.length, editingValorInputDisplay.value.length);
    }
  });
};

const clearEditingPlaceholder = (event) => {
  if (event.target.value === '0,00') {
    event.target.value = '';
  }
};

const addEditingPlaceholder = (event) => {
  if (event.target.value === '' || editingItem.valor === null || editingItem.valor === 0) {
    event.target.value = '0,00';
    editingItem.valor = 0;
  }
};


const carregarCartoes = async (userId) => {
  erro.value = ''
  try {
    const q = query(collection(db, 'cartoes'), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    cartoes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    if (cartoes.value.length > 0 && !idCartao.value) {
      idCartao.value = cartoes.value[0].id
    }
  } catch (e) {
    erro.value = 'Erro ao carregar cartões.'
    console.error('Erro ao carregar cartões:', e)
  }
}

const mesReferenciaStr = (ano, mes) => {
  return meses[mes]
}

const carregarItensFatura = async () => {
  erro.value = ''
  itensFatura.value = []
  sucesso.value = ''

  if (!idCartao.value) {
    return
  }

  try {
    const userId = auth.currentUser.uid

    const faturasRef = collection(db, 'faturas')
    const q = query(
      faturasRef,
      where('idCartao', '==', idCartao.value),
      where('mesReferencia', '==', mesReferenciaStr(anoSelecionado.value, mesSelecionado.value)),
      where('anoReferencia', '==', anoSelecionado.value),
      where('userId', '==', userId),
    )

    const faturasSnap = await getDocs(q)
    if (faturasSnap.empty) {
      itensFatura.value = []
      return
    }

    const fatura = faturasSnap.docs[0]
    const faturaId = fatura.id

    const itensRef = collection(db, 'itensFatura')
    const qItens = query(itensRef, where('idFatura', '==', faturaId), where('userId', '==', userId))
    const itensSnap = await getDocs(qItens)

    itensFatura.value = itensSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    erro.value = 'Erro ao carregar itens da fatura.'
    console.error('Erro ao carregar itens da fatura:', e)
  }
}

// Função para abrir o modal de adição
const openAddItemModal = () => {
  showAddItemModal.value = true
  newItem.descricao = ''
  newItem.valor = 0
  valorInputDisplay.value = '0,00' // Define o valor formatado inicial
  newItem.data = new Date().toISOString().slice(0, 10)
  newItem.categoriaId = ''
  modalError.value = ''
}

// Função para fechar o modal de adição
const closeAddItemModal = () => {
  showAddItemModal.value = false
  modalError.value = ''
}

// Função para confirmar a adição de um item
const confirmAddItem = async () => {
  if (!newItem.descricao || newItem.valor === null || !newItem.data || !newItem.categoriaId) {
    modalError.value = 'Preencha todos os campos.'
    return
  }
  if (newItem.valor <= 0) {
    modalError.value = 'O valor deve ser maior que zero.'
    return
  }
  if (!idCartao.value) {
    modalError.value = 'Nenhum cartão selecionado. Por favor, selecione um cartão antes de adicionar um item.'
    return
  }
  erro.value = ''
  sucesso.value = ''
  try {
    const userId = auth.currentUser.uid
    const faturasRef = collection(db, 'faturas')
    const q = query(
      faturasRef,
      where('idCartao', '==', idCartao.value),
      where('mesReferencia', '==', mesReferenciaStr(anoSelecionado.value, mesSelecionado.value)),
      where('anoReferencia', '==', anoSelecionado.value),
      where('userId', '==', userId)
    )
    const faturasSnap = await getDocs(q)
    let faturaId = null

    if (faturasSnap.empty) {
      const docRef = await addDoc(collection(db, 'faturas'), {
        idCartao: idCartao.value,
        mesReferencia: mesReferenciaStr(anoSelecionado.value, mesSelecionado.value),
        anoReferencia: anoSelecionado.value,
        valor: 0, // Valor inicial da fatura
        userId,
        criadoEm: new Date()
      })
      faturaId = docRef.id
    } else {
      faturaId = faturasSnap.docs[0].id
    }

    const dateParts = newItem.data.split('-').map(Number);
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0);

    await addDoc(collection(db, 'itensFatura'), {
      idFatura: faturaId,
      descricao: newItem.descricao,
      valor: newItem.valor,
      data: dateToSave,
      categoriaId: newItem.categoriaId,
      userId
    })

    sucesso.value = 'Item adicionado com sucesso!'
    carregarItensFatura()
    closeAddItemModal()
  } catch (e) {
    modalError.value = 'Erro ao adicionar item: ' + e.message
    erro.value = 'Erro ao adicionar item: ' + e.message
    console.error('Erro ao adicionar item:', e)
  }
}

// Funções para o modal de EDIÇÃO
const openEditModal = (item) => {
  Object.assign(editingItem, {
    id: item.id,
    descricao: item.descricao,
    valor: item.valor,
    data: item.data.toDate().toISOString().slice(0, 10),
    categoriaId: item.categoriaId
  });
  editingValorInputDisplay.value = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(item.valor);
  modalError.value = '';
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  modalError.value = '';
};

const salvarEdicao = async () => {
  modalError.value = '';
  if (!editingItem.descricao || editingItem.valor === null || !editingItem.data || !editingItem.categoriaId) {
    modalError.value = 'Preencha todos os campos obrigatórios.';
    return;
  }
  if (editingItem.valor <= 0) {
    modalError.value = 'O valor deve ser maior que zero.';
    return;
  }

  try {
    const itemRef = doc(db, 'itensFatura', editingItem.id);
    const dateParts = editingItem.data.split('-').map(Number);
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0);

    await updateDoc(itemRef, {
      descricao: editingItem.descricao,
      valor: editingItem.valor,
      data: dateToSave,
      categoriaId: editingItem.categoriaId,
    });

    sucesso.value = 'Item atualizado com sucesso!';
    setTimeout(() => { sucesso.value = '' }, 3000);
    closeEditModal();
    await carregarItensFatura();
  } catch (e) {
    modalError.value = 'Erro ao salvar edição: ' + e.message;
    console.error('Erro ao salvar edição:', e);
  }
};

// Funções para o modal de CONFIRMAÇÃO DE EXCLUSÃO
const confirmarExclusao = (item) => {
  itemToDelete.value = item;
};

const cancelarExclusao = () => {
  itemToDelete.value = null;
};

const excluirItemConfirmado = async () => {
  if (!itemToDelete.value) return;
  erro.value = '';
  sucesso.value = '';

  try {
    const itemRef = doc(db, 'itensFatura', itemToDelete.value.id);
    await deleteDoc(itemRef);

    sucesso.value = 'Item excluído com sucesso!';
    setTimeout(() => { sucesso.value = '' }, 3000);
    cancelarExclusao(); // Fecha o modal de confirmação
    closeEditModal();   // Fecha o modal de edição (se estiver aberto)
    await carregarItensFatura();
  } catch (e) {
    erro.value = 'Erro ao excluir o item.';
    console.error('Erro ao excluir item:', e);
  }
};


const formatarData = (timestamp) => {
  if (!timestamp) return ''
  let dataObj
  if (timestamp && typeof timestamp.toDate === 'function') {
    dataObj = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    dataObj = timestamp
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    dataObj = new Date(timestamp)
  } else {
    return ''
  }

  return dataObj.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const avancarMes = () => {
  if (mesSelecionado.value === 11) {
    mesSelecionado.value = 0
    anoSelecionado.value++
  } else {
    mesSelecionado.value++
  }
}

const voltarMes = () => {
  if (mesSelecionado.value === 0) {
    mesSelecionado.value = 11
    anoSelecionado.value--
  } else {
    mesSelecionado.value--
  }
}

const voltar = () => {
  router.back()
}

watch([idCartao, mesSelecionado, anoSelecionado], () => {
  if (idCartao.value) {
    carregarItensFatura()
  } else {
    itensFatura.value = []
  }
})

watch(idCartao, (novoValor, valorAntigo) => {
  if (novoValor && novoValor !== valorAntigo) { // Apenas resetar se um novo cartão for selecionado
    const dataAtual = new Date();
    mesSelecionado.value = dataAtual.getMonth();
    anoSelecionado.value = dataAtual.getFullYear();
  }
});

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      carregarCartoes(user.uid)
    } else {
      erro.value = 'Usuário não autenticado. Redirecionando para o login.'
      router.push('/')
    }
  })
})
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

.content-card {
  width: 100%;
  max-width: 360px;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  position: relative;
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

.invoice-details-card {
  width: 90%;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  background-color: #fdfdfd;
  text-align: left;
  min-height: 66vh;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

.invoice-items-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 6px;
}

.invoice-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 5px;
  background-color: #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.invoice-item:hover {
  background-color: #e9e9e9;
  transform: scale(1.01);
}

.item-description {
  font-weight: 500;
  margin-bottom: 3px;
  color: #333;
  font-size: 0.9em;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: #666;
  margin-bottom: 4px;
}

.item-category {
  font-size: 0.75em;
  color: #777;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px; /* Espaçamento entre o ícone e o texto da categoria */
}

.category-icon-small {
  font-size: 0.9em; /* Tamanho pequeno para o ícone na lista */
  color: #007bff;
}

.item-value {
  font-weight: 600;
  font-size: 0.9em;
  color: #007bff;
}

.no-items-message {
  padding: 12px;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.85em;
}

.add-item-button {
  width: auto;
  margin: 20px auto 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 0.9rem;
}

.add-item-button .material-icons {
  font-size: 18px;
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}

.total-section {
  text-align: left;
  font-weight: 600;
  font-size: 1.15rem;
  color: #333;
}

.total-value {
  color: #007bff;
  font-weight: 700;
  font-size: 1.15rem;
}

.error-message {
  color: #dc3545;
  margin-top: 0.8rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
  font-size: 0.85em;
}

.success-message {
  color: #28a745;
  margin-top: 0.8rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
  font-size: 0.85em;
}

.btn {
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.filled-button {
  background-color: #007bff;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.filled-button:hover {
  background-color: #0056b3;
  box-shadow: 0 3px 6px rgba(0, 123, 255, 0.3);
}

.filled-button:active {
  background-color: #004085;
  box-shadow: none;
}

.text-button {
  background-color: transparent;
  color: #007bff;
  box-shadow: none;
  padding: 8px 10px;
}

.text-button:hover {
  background-color: rgba(0, 123, 255, 0.08);
}

.text-button:active {
  background-color: rgba(0, 123, 255, 0.12);
}

.filled-button-danger {
  background-color: #dc3545;
  color: #ffffff;
}

.filled-button-danger:hover {
  background-color: #c82333;
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
  max-width: 380px;
  box-sizing: border-box;
  text-align: left;
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

/* Estilos de input (floating label) copiados do componente Lançamentos */
.input-container {
  position: relative;
  margin-bottom: 20px;
}

.select-wrapper::after {
  content: 'arrow_drop_down';
  font-family: 'Material Icons';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
  font-size: 1.2rem;
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

.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px;
  font-size: 0.7rem;
  color: #007bff;
}

.select-label-text {
  top: 14px;
}

.text-field:focus + .select-label-text,
.text-field:not(:placeholder-shown).select-field + .select-label-text {
  top: 4px;
  font-size: 0.7rem;
  color: #007bff;
}
.modal-text {
  font-size: 0.95rem;
  color: #555; line-height: 1.4;
  margin-bottom: 20px;
  text-align: center;
}
</style>
