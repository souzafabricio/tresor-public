<template>
  <div class="main-container">
    <div class="content-card">

      <!-- Cabeçalho Padronizado -->
      <div class="title-row">
        <h1 class="title">Novo Cartão</h1>
      </div>
      
      <!-- Campos de Formulário Estilizados -->
      <div class="input-container">
        <input v-model="banco" type="text" id="banco" class="text-field" placeholder=" " />
        <label for="banco" class="label-text">Banco (ex: Bradesco)</label>
      </div>

      <div class="input-container">
        <input v-model="fechamento" type="number" id="fechamento" class="text-field" placeholder=" " />
        <label for="fechamento" class="label-text">Dia do fechamento</label>
      </div>

      <div class="input-container">
        <input v-model="vencimento" type="number" id="vencimento" class="text-field" placeholder=" " />
        <label for="vencimento" class="label-text">Dia do vencimento</label>
      </div>
      
      <!-- Mensagens de Feedback -->
      <p v-if="erro" class="error-message">{{ erro }}</p>
      <p v-if="sucesso" class="success-message">Cartão cadastrado com sucesso!</p>

      <!-- Botões de Ação -->
      <div class="form-actions">
        <button @click="voltar" class="btn back-button">Voltar</button>
        <button @click="cadastrarCartao" class="btn filled-button">Cadastrar</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = getAuth();
const router = useRouter();

const banco = ref('');
const fechamento = ref('');
const vencimento = ref('');
const erro = ref('');
const sucesso = ref(false);

const cadastrarCartao = async () => {
    erro.value = '';
    sucesso.value = false;

    if (!banco.value || !fechamento.value || !vencimento.value) {
        erro.value = 'Preencha todos os campos.';
        return;
    }
    
    // Validação simples para dias
    if (fechamento.value < 1 || fechamento.value > 31 || vencimento.value < 1 || vencimento.value > 31) {
        erro.value = 'Os dias devem estar entre 1 e 31.';
        return;
    }

    try {
        if (!auth.currentUser) {
            erro.value = 'Usuário não autenticado. Faça login novamente.';
            router.push('/');
            return;
        }

        await addDoc(collection(db, 'cartoes'), {
            banco: banco.value,
            fechamento: Number(fechamento.value),
            vencimento: Number(vencimento.value),
            userId: auth.currentUser.uid,
            criadoEm: new Date(),
        });

        sucesso.value = true;
        // Redireciona para a lista de cartões após um breve delay para o usuário ver a mensagem
        setTimeout(() => {
            router.push('/CartoesView');
        }, 800);

    } catch (e) {
        erro.value = 'Erro ao salvar o cartão.';
        console.error('Erro Firebase:', e);
    }
};

const voltar = () => {
    router.push('/CartoesView');
};
</script>

<style scoped>
/*
 * IMPORTANTE: Certifique-se de que a fonte de ícones do Material Design
 * está no <head> do seu `public/index.html`:
 * <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
 */

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f0f2f500;
  font-family: 'Roboto', sans-serif;
}

.content-card {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff00;
  text-align: center;
  margin: 1rem 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
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
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
  flex-grow: 1;
  text-align: center;

}

/* --- Estilos de Formulário (Inputs, Selects) --- */
.input-container {
  position: relative;
  margin-bottom: 24px;
  width: 100%;
}

.text-field {
  width: 100%;
  padding: 16px 16px 8px 16px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #333;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  outline: none;
  box-sizing: border-box;
}

.text-field:focus {
  border-color: #007bff;
  background-color: #eaf6ff;
}

.label-text {
  position: absolute;
  left: 16px;
  top: 16px;
  color: #888;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}

/* Efeito de label flutuante */
.text-field:focus + .label-text,
.text-field:not(:placeholder-shown) + .label-text {
  top: 4px;
  font-size: 0.75rem;
  color: #007bff;
}

/* Ações do Formulário (Botões) */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  width: 100%;
}

/* Mensagens de Erro e Sucesso */
.error-message {
  color: #dc3545;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
}

.success-message {
  color: #28a745;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
}

/* --- Estilos Gerais de Botões --- */
.btn {
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  /* MODIFICADO: Arredondamento dos botões */
  border-radius: 10px;
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

.text-button {
  background-color: transparent;
  color: #007bff;
  box-shadow: none;
  padding: 10px 12px;
}

.text-button:hover {
  background-color: rgba(0, 123, 255, 0.08);
}
</style>
