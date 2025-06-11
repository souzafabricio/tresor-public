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
          <li v-for="item in itensFatura" :key="item.id" class="invoice-item" @click="excluirItem(item.id)" title="Clique para excluir este item">
            <div class="item-description">{{ item.descricao }}</div>
            <div class="item-details">
              <span>Data: {{ formatarData(item.data) }}</span>
              <span class="item-value">R$ {{ item.valor.toFixed(2).replace('.', ',') }}</span>
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

    <Transition name="modal-fade">
      <div v-if="showAddItemModal" class="modal-overlay" @click.self="closeAddItemModal">
        <div class="modal-container">
          <h2 class="section-title">Adicionar Novo Item</h2>

          <div class="input-container">
            <input v-model="newItem.descricao" type="text" placeholder="Descrição" class="text-field"
              id="modal-descricao" />
            <label for="modal-descricao" class="label-text">Descrição</label>
          </div>
          <div class="input-container">
            <input v-model="valorInputDisplay"
                   type="text"
                   inputmode="decimal"
                   placeholder="Valor (ex: 59,90)"
                   class="text-field"
                   id="modal-valor"
                   @input="handleValorInput"
                   @focus="clearPlaceholder"
                   @blur="addPlaceholder" />
            <label for="modal-valor" class="label-text">Valor</label>
          </div>
          <div class="input-container">
            <input v-model="newItem.data" type="date" class="text-field" id="modal-data" />
            <label for="modal-data" class="label-text">Data</label>
          </div>

          <p v-if="modalError" class="error-message">{{ modalError }}</p>

          <div class="modal-actions">
            <button @click="closeAddItemModal" class="btn text-button">Cancelar</button>
            <button @click="confirmAddItem" class="btn filled-button">Adicionar</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'

// Autenticação e Roteamento
const auth = getAuth()
const router = useRouter()

// Estados Reativos da Tela
const cartoes = ref([])
const idCartao = ref('')
const anoSelecionado = ref(new Date().getFullYear())
const mesSelecionado = ref(new Date().getMonth())
const itensFatura = ref([])

const erro = ref('')
const sucesso = ref('')

// Estados Reativos do Modal de Adicionar Item
const showAddItemModal = ref(false)
const newItem = reactive({
  descricao: '',
  valor: null, // O valor numérico real para armazenamento/cálculo
  data: ''
})

// Ref para a string do input do valor (o que o usuário vê e digita)
const valorInputDisplay = ref('');

const modalError = ref('')

// Array de nomes dos meses para exibição
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Propriedade computada para exibir o nome completo do mês e ano
const nomeMesSelecionado = computed(() => {
  return `${meses[mesSelecionado.value]} de ${anoSelecionado.value}`
})

// Propriedade computada para calcular o valor total da fatura
const valorTotal = computed(() => {
  return itensFatura.value.reduce((acc, item) => acc + Number(item.valor), 0)
})

// --- Funções de Formatação de Entrada ---
const handleValorInput = () => {
    let rawValue = valorInputDisplay.value.replace(/\D/g, ''); // Remove todos os não dígitos

    // Se o valor estiver vazio ou conter apenas zeros, trate como 0
    if (rawValue.length === 0 || parseInt(rawValue, 10) === 0) {
        newItem.valor = 0; // O valor numérico real é 0
        valorInputDisplay.value = '0,00'; // Exibe "0,00"
        return;
    }

    // Preenche com zeros à esquerda se houver menos de 3 dígitos (para 0,0X, 0,X0)
    while (rawValue.length < 3) {
        rawValue = '0' + rawValue;
    }

    // Pega os últimos dois dígitos como centavos
    const cents = rawValue.slice(-2);
    // Pega o restante como reais
    const reais = rawValue.slice(0, -2);

    // Converte para o valor numérico real
    newItem.valor = parseFloat(`${reais}.${cents}`);

    // Formata para exibição com vírgula e separador de milhares (pt-BR)
    valorInputDisplay.value = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    }).format(newItem.valor);

    // Manter o cursor no final, embora possa ser complexo com essa formatação.
    // Para uma experiência mais fluida, uma biblioteca de máscara é mais indicada.
    nextTick(() => {
        const inputElement = document.getElementById('modal-valor');
        if (inputElement) {
            inputElement.setSelectionRange(valorInputDisplay.value.length, valorInputDisplay.value.length);
        }
    });
};

// Funções para gerenciar o placeholder
const clearPlaceholder = () => {
  // Ao focar, se o valor for "0,00", limpe para permitir digitação "da esquerda para direita"
  if (valorInputDisplay.value === '0,00') {
    valorInputDisplay.value = '';
  }
};

const addPlaceholder = () => {
  // Ao desfocar, se o campo estiver vazio ou o valor for null/0, defina como "0,00"
  if (valorInputDisplay.value === '' || newItem.valor === null || newItem.valor === 0) {
    valorInputDisplay.value = '0,00';
    newItem.valor = 0; // Garante que o valor numérico também é 0
  }
};


// --- Funções de Carregamento de Dados ---

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

// --- Funções do Modal e de Exclusão ---

/**
 * Exclui um item da fatura após confirmação.
 * @param {string} itemId - O ID do documento do item a ser excluído.
 */
const excluirItem = async (itemId) => {
  if (!confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
    return;
  }

  erro.value = '';
  sucesso.value = '';

  try {
    const itemRef = doc(db, 'itensFatura', itemId);
    await deleteDoc(itemRef);

    sucesso.value = 'Item excluído com sucesso!';
    // Limpa a mensagem de sucesso após 3 segundos
    setTimeout(() => { sucesso.value = '' }, 3000);

    // Recarrega os itens para atualizar a lista e o total
    await carregarItensFatura();

  } catch (e) {
    erro.value = 'Erro ao excluir o item.';
    console.error('Erro ao excluir item:', e);
  }
}

const openAddItemModal = () => {
  showAddItemModal.value = true
  newItem.descricao = ''
  newItem.valor = 0
  valorInputDisplay.value = '0,00'
  newItem.data = new Date().toISOString().slice(0, 10)
  modalError.value = ''
}

const closeAddItemModal = () => {
  showAddItemModal.value = false
  modalError.value = ''
}

const confirmAddItem = async () => {
  // A validação agora usa newItem.valor que já é um número
  if (!newItem.descricao || newItem.valor === null || !newItem.data) {
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
        valor: 0,
        userId,
        criadoEm: new Date()
      })
      faturaId = docRef.id
    } else {
      faturaId = faturasSnap.docs[0].id
    }

    // --- MUDANÇA PRINCIPAL AQUI PARA TRATAR A DATA ---
    const dateParts = newItem.data.split('-').map(Number); // [ano, mês, dia]
    // O construtor Date() usa mês baseado em zero (0 para janeiro, 1 para fevereiro, etc.)
    // Adicionamos 12 horas para garantir que fique no meio do dia no fuso horário local.
    const dateToSave = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 12, 0, 0); // Ano, Mês-1, Dia, Hora, Minuto, Segundo

    await addDoc(collection(db, 'itensFatura'), {
      idFatura: faturaId,
      descricao: newItem.descricao,
      valor: newItem.valor,
      data: dateToSave, // Usamos o objeto Date ajustado
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

// --- Funções de Navegação e Utilidade ---

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
  // Esta parte já usa toLocaleString, que exibe no fuso horário do usuário
  return dataObj.toLocaleString('pt-BR', { dateStyle: 'medium' })
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

// --- Watchers e Lifecycle Hooks ---

// Observa mudanças no cartão, mês ou ano para recarregar os itens da fatura
watch([idCartao, mesSelecionado, anoSelecionado], () => {
  if (idCartao.value) {
    carregarItensFatura()
  } else {
    itensFatura.value = []
  }
})

/**
 * Observa a troca de cartão para resetar a data para o mês vigente.
 */
watch(idCartao, (novoValor, valorAntigo) => {
  // Executa apenas se houver um valor anterior, indicando uma troca, não a carga inicial.
  if (valorAntigo) {
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
/* Seu CSS não precisa de alterações */
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
  font-size: 0.9em;
  /* Ajustado de 1em para 0.9em */
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-color: #f0f2f5;
}

.content-card {
  width: 100%;
  max-width: 360px;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff00;
  position: relative;
  text-align: center;
  margin: 0.8rem 0;
}

.title {
  font-size: 1.8rem;
  /* Reduzido de 2rem */
  font-weight: 700;
  margin-bottom: 20px;
  /* Reduzido de 24px */
  color: #333;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  /* Reduzido de 8px */
  margin-bottom: 20px;
  /* Reduzido de 24px */
  position: relative;
}

.back-button {
  position: static;
  margin-right: 6px;
  /* Reduzido de 8px */
  background-color: #e0e0e0;
  border-radius: 50%;
  /* Mantido para circular */
  padding: 3px 8px;
  /* Reduzido padding */
  font-size: 1.1rem;
  /* Reduzido de 1.2rem */
  min-width: 30px;
  /* Reduzido de 32px */
  min-height: 30px;
  /* Reduzido de 32px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* Sombra mais sutil */
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button .material-icons {
  font-size: 20px;
  /* Reduzido de 22px */
}

.title {
  font-size: 1.8rem;
  /* Reduzido de 2rem */
  font-weight: 700;
  margin: 0;
  color: #333;
}

.back-button:hover {
  background-color: #d0d0d0;
}

.back-button .material-icons {
  font-size: 17px;
  /* Reduzido de 18px */
}

/* --- Estilos de Formulário (Inputs, Selects) --- */
.input-container {
  position: relative;
  margin-bottom: 20px;
  /* Reduzido de 24px */
  width: 100%;
}

.select-wrapper::after {
  content: 'arrow_drop_down';
  font-family: 'Material Icons';
  position: absolute;
  right: 10px;
  /* Ajustado */
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
  font-size: 1.2rem;
  /* Reduzido */
}

.text-field {
  width: 100%;
  padding: 12px 12px 6px 12px;
  /* Reduzido de 16px padding */
  font-size: 0.9rem;
  /* Reduzido de 1rem */
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #333;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  outline: none;
  appearance: none;
  box-sizing: border-box;
}

.text-field:focus {
  border-color: #007bff;
  background-color: #eaf6ff;
}

.label-text {
  position: absolute;
  left: 12px;
  /* Ajustado de 16px */
  top: 12px;
  /* Ajustado de 16px */
  color: #888;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  /* Reduzido de 1rem */
}

.text-field:focus+.label-text,
.text-field:not(:placeholder-shown)+.label-text,
.text-field:not([value=""])+.label-text {
  top: 4px;
  font-size: 0.65rem;
  /* Reduzido de 0.75rem */
  color: #007bff;
}

/* --- Navegação de Mês --- */
.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  /* Reduzido de 24px */
  gap: 12px;
  /* Reduzido de 16px */
}

.month-navigation .icon-button {
  min-width: 36px;
  /* Reduzido de 40px */
  height: 36px;
  /* Reduzido de 40px */
  padding: 0;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  /* Reduzido de 1.25rem */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* Sombra mais sutil */
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
  /* Reduzido de 24px */
}

.month-display {
  flex-grow: 1;
  text-align: center;
  font-size: 1.1rem;
  /* Reduzido de 1.25rem */
  font-weight: 500;
  color: #333;
}

/* --- Cartão de Detalhes da Fatura --- */
.invoice-details-card {
  width: 90%;
  /* Aumentado ligeiramente para preencher mais o card principal */
  padding: 18px;
  /* Reduzido de 24px */
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  /* Sombra mais sutil */
  background-color: #fdfdfd;
  text-align: left;
  min-height: 66vh;
}

.section-title {
  font-size: 1.3rem;
  /* Reduzido de 1.5rem */
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  /* Reduzido de 16px */
  text-align: center;
}

.invoice-items-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 350px;
  /* Aumentado para mais itens no scroll */
  overflow-y: auto;
  padding-right: 6px;
  /* Reduzido de 8px */
}

.invoice-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  /* Reduzido de 12px 16px */
  margin-bottom: 6px;
  /* Reduzido de 8px */
  border-radius: 5px;
  /* Ligeiramente menor */
  background-color: #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Sombra mais sutil */
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.invoice-item:hover {
  background-color: #e9e9e9;
  transform: scale(1.01);
  /* Transformação mais sutil */
}

.item-description {
  font-weight: 500;
  margin-bottom: 3px;
  /* Reduzido de 4px */
  color: #333;
  font-size: 0.9em;
  /* Reduzido de 1em */
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  /* Reduzido de 0.875rem */
  color: #666;
}

.item-value {
  font-weight: 600;
  font-size: 0.9em;
  /* Reduzido de 1rem */
  color: #007bff;
}

.no-items-message {
  padding: 12px;
  /* Reduzido de 16px */
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.85em;
  /* Reduzido */
}

.add-item-button {
  width: auto;
  margin: 20px auto 0 auto;
  /* Reduzido de 24px */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  /* Reduzido de 8px */
  padding: 8px 20px;
  /* Reduzido de 10px 24px */
  font-size: 0.9rem;
  /* Reduzido de 1rem */
}

.add-item-button .material-icons {
  font-size: 18px;
  /* Reduzido de 20px */
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
  /* Reduzido de 24px */
}

.total-section {
  text-align: left;
  font-weight: 600;
  font-size: 1.15rem;
  /* Reduzido de 1.3rem */
  color: #333;
}

.total-value {
  color: #007bff;
  font-weight: 700;
  font-size: 1.15rem;
  /* Mantido igual ao total section */
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
  /* Reduzido */
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
  /* Reduzido */
}

/* --- Estilos Gerais de Botões --- */
.btn {
  padding: 8px 20px;
  /* Reduzido de 10px 24px */
  font-size: 0.9rem;
  /* Reduzido de 1rem */
  font-weight: 500;
  border: none;
  border-radius: 18px;
  /* Reduzido de 20px */
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
  /* Reduzido de 10px 12px */
}

.text-button:hover {
  background-color: rgba(0, 123, 255, 0.08);
}

.text-button:active {
  background-color: rgba(0, 123, 255, 0.12);
}

/* --- Estilos do Modal --- */
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
  /* Reduzido de 24px */
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 380px;
  /* Reduzido de 400px */
  box-sizing: border-box;
  text-align: left;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  /* Reduzido de 8px */
  margin-top: 20px;
  /* Reduzido de 24px */
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
</style>