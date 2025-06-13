<template>
  <div class="main-container">
    <div class="content-card">

      <div class="title-row">
        <button @click="voltar" class="btn back-button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Seus Cartões</h1>
      </div>

      <div v-if="cartoes.length === 0" class="empty-state">
        <span class="material-icons empty-state-icon">credit_card_off</span>
        <p class="empty-state-text">
          Você ainda não cadastrou nenhum cartão.<br>Adicione o seu primeiro para começar a organizar!
        </p>
        <router-link to="/cadastrar-cartao" class="btn filled-button add-item-button large-add-button">
          <span class="material-icons">add_card</span>
          Cadastrar Meu Primeiro Cartão
        </router-link>
      </div>

      <div v-else class="cartoes-list-container">
        <router-link to="/cadastrar-cartao" class="btn filled-button add-item-button list-add-button">
          <span class="material-icons">add_card</span>
          Cadastrar Novo Cartão
        </router-link>

        <div v-for="cartao in cartoes" :key="cartao.id" class="cartao-item"
          @click="toggleCardNumberVisibility(cartao.id)">
          <div class="cartao-info">
            <div class="banco">{{ cartao.banco }}</div>
            <div class="card-number">
              {{ visibleCardId === cartao.id ? formatCardNumber(cartao.numero) : maskCardNumber(cartao.numero) }}
            </div>
            <div class="datas">Fechamento: dia {{ cartao.fechamento }} | Vencimento: dia {{ cartao.vencimento }}</div>
          </div>
          <button @click.stop="confirmarExclusao(cartao)" class="btn-excluir" title="Excluir cartão">
            <span class="material-icons">delete_outline</span>
          </button>
        </div>
      </div>

      <p v-if="erro" class="error-message">{{ erro }}</p>

    </div>

    <Transition name="modal-fade">
      <div v-if="cartaoParaExcluir" class="modal-overlay" @click.self="cancelarExclusao">
        <div class="modal-container">
          <h2 class="section-title">Confirmar Exclusão</h2>
          <p class="modal-text">
            Ao excluir o cartão <strong>{{ cartaoParaExcluir.banco }}</strong>, todas as faturas e itens relacionados
            também serão excluídos permanentemente. Deseja continuar?
          </p>
          <div class="modal-actions">
            <button @click="cancelarExclusao" class="btn text-button">Cancelar</button>
            <button @click="excluirCartao" class="btn filled-button-danger">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = getAuth();
const router = useRouter();

const erro = ref('');
const cartoes = ref([]);
const cartaoParaExcluir = ref(null);
const visibleCardId = ref(null);

const carregarCartoes = async () => {
  try {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }
    const q = query(collection(db, 'cartoes'), where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    cartoes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Erro ao carregar cartões:', e);
    erro.value = 'Falha ao carregar os cartões.';
  }
};

const confirmarExclusao = (cartao) => {
  cartaoParaExcluir.value = cartao;
};

const cancelarExclusao = () => {
  cartaoParaExcluir.value = null;
};

const excluirCartao = async () => {
  if (!cartaoParaExcluir.value) return;

  const cartao = cartaoParaExcluir.value;
  try {
    const userId = auth.currentUser.uid;

    const faturasSnap = await getDocs(
      query(collection(db, 'faturas'), where('idCartao', '==', cartao.id), where('userId', '==', userId))
    );

    for (const faturaDoc of faturasSnap.docs) {
      const itensSnap = await getDocs(
        query(collection(db, 'itensFatura'), where('idFatura', '==', faturaDoc.id), where('userId', '==', userId))
      );

      for (const item of itensSnap.docs) {
        await deleteDoc(doc(db, 'itensFatura', item.id));
      }

      await deleteDoc(doc(db, 'faturas', faturaDoc.id));
    }

    await deleteDoc(doc(db, 'cartoes', cartao.id));

    cancelarExclusao();
    await carregarCartoes();

  } catch (e) {
    console.error('Erro ao excluir cartão e dados relacionados:', e);
    erro.value = 'Falha ao excluir o cartão.';
  }
};

const voltar = () => {
  router.push('/home');
};

/*
 * @param {string} cardId
 */
const toggleCardNumberVisibility = (cardId) => {
  if (visibleCardId.value === cardId) {
    visibleCardId.value = null;
  } else {
    visibleCardId.value = cardId;
  }
};

/**
 * @param {string} number
 * @returns {string}
 */
const formatCardNumber = (number) => {
  if (!number) return 'XXXX XXXX XXXX XXXX';
  return String(number).replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
};

/**
 * @param {string} number
 * @returns {string}
 */
const maskCardNumber = (number) => {
  if (!number) return '**** **** **** XXXX';
  const cleanNumber = String(number).replace(/\D/g, '');
  if (cleanNumber.length <= 4) {
    return '**** **** **** ' + cleanNumber.padEnd(4, 'X');
  }
  const lastFour = cleanNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
};


onMounted(() => {
  carregarCartoes();
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
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 950%;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f0f2f5;

}

.content-card {
  width: 100%;
  max-width: 360px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  text-align: center;
  margin: 1rem 0;
  min-height: 5vh;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 24px;
  position: relative;
}

.back-button {
  position: static;
  margin-right: 8px;
  background-color: #e0e0e0;
  border-radius: 50px;
  padding: 4px 10px;
  min-width: 32px;
  min-height: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button .material-icons {
  font-size: 22px;
}

.back-button:hover {
  background-color: #d0d0d0;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #333;
  flex-grow: 1;
  text-align: center;
  transform: translateX(-16px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: #fcfcfc;
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
}

.empty-state-icon {
  font-size: 80px;
  color: #b0b0b0;
  margin-bottom: 20px;
}

.empty-state-text {
  font-size: 1.1rem;
  color: #777;
  margin-bottom: 30px;
  line-height: 1.6;
}

.cartoes-list-container {
  list-style-type: none;
  padding: 0;
  margin: 22px 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cartao-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  margin-bottom: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa, #eef1f5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e5e5;
  text-align: left;
  position: relative;
  cursor: pointer;
}

.cartao-info .banco {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 4px;
}

.cartao-info .card-number {
  font-family: 'Roboto Mono', monospace;
  font-size: 1.2rem;
  font-weight: 500;
  color: #444;
  margin-top: 8px;
  margin-bottom: 12px;
}

.cartao-info .datas {
  font-size: 0.85rem;
  color: #777;
}

.btn-excluir {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc3545;
  transition: background-color 0.2s ease;
}

.btn-excluir .material-icons {
  font-size: 22px;
}

.btn-excluir:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.no-items-message {
  padding: 16px;
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 24px;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  font-weight: 500;
}

.btn {
  padding: 10px 35px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-item-button {
  width: 80%;
  margin-bottom: 0;
}

.large-add-button {
  padding: 14px 28px;
  font-size: 1.1rem;
}

.list-add-button {
  margin-bottom: 24px;
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
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.filled-button-danger:hover {
  background-color: #c82333;
  box-shadow: 0 3px 6px rgba(220, 53, 69, 0.3);
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
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 400px;
  box-sizing: border-box;
  text-align: left;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.modal-text {
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 24px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
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