<template>
  <div class="main-container">
    <div class="content-card">

      <div class="title-row">
        <button @click="voltar" class="btn back-button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Dashboard</h1>
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

      <div v-if="insights.length > 0" class="insights-container">
        <h2 class="section-title-small">Insights do Mês</h2>
        <p v-for="(insight, index) in insights" :key="index" class="insight-item">{{ insight }}</p>
      </div>

      <hr v-if="insights.length > 0" class="divider" />

      <div class="totals-summary">
        <div class="total-item meta-mensal" @click="toggleEditMeta">
          <span>Meta de Gasto:</span>
          <span v-if="!editingMeta" class="value">{{ formatarValor(metaMensal) }}</span>
          <input
            v-else
            type="number"
            v-model="inputMetaMensal"
            @blur="salvarMeta"
            @keyup.enter="salvarMeta"
            class="meta-input"
            ref="metaInputRef"
          />
        </div>
        <div v-if="metaMensal > 0" class="meta-status">
          <span class="meta-details">Já gastou: {{ formatarValor(Math.abs(totalSaidasMes)) }}</span>
          <span :class="{ 'positivo': (metaMensal + totalSaidasMes) >= 0, 'negativo': (metaMensal + totalSaidasMes) < 0 }">
            {{ formatarMetaStatus }}
          </span>
        </div>
        <div class="total-item entradas">
          <span>Entradas do Mês:</span>
          <span class="value positivo">{{ formatarValor(totalEntradasMes) }}</span>
        </div>
        <div class="total-item saidas">
          <span>Saídas do Mês:</span>
          <span class="value negativo">{{ formatarValor(totalSaidasMes) }}</span>
        </div>
        <div class="total-item saldo">
          <span>Saldo do Mês:</span>
          <span class="value" :class="{ 'positivo': saldoMes >= 0, 'negativo': saldoMes < 0 }">{{ formatarValor(saldoMes) }}</span>
        </div>
      </div>

      <hr class="divider" />

      <h2 class="section-title">Gastos por Categoria (Mês)</h2>
      <div v-if="gastosPorCategoria.length > 0" class="category-list-container">
        <div v-for="cat in gastosPorCategoria" :key="cat.nome" class="category-item">
          <div class="category-info">
            <span class="material-icons category-icon">{{ getCategoryIcon(cat.nome) }}</span>
            <span class="category-name">{{ cat.nome }}</span>
          </div>
          <span class="category-value">{{ formatarValor(cat.valor) }}</span>
        </div>
      </div>
      <p v-else class="no-items-message">Nenhum gasto registrado para este mês.</p>

      <hr class="divider" />

      <h2 class="section-title">Evolução Mensal</h2>
      <div class="chart-container">
        <canvas id="monthlyEvolutionChart"></canvas>
      </div>
      <p v-if="!chartDataAvailable" class="no-items-message">Dados insuficientes para o gráfico (últimos 4 meses).</p>

      <p v-if="erro" class="error-message">{{ erro }}</p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
// Certifique-se de que `setDoc` e `getDoc` estão importados.
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

// Importa Chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables); // Registra todos os componentes padrão do Chart.js

const auth = getAuth();
const router = useRouter();
const erro = ref('');

// Data de referência para navegação
const anoSelecionado = ref(new Date().getFullYear());
const mesSelecionado = ref(new Date().getMonth()); // 0 para Janeiro, 11 para Dezembro

// Dados carregados para o mês selecionado
const lancamentosDoMes = ref([]);
const lancamentosMesAnterior = ref([]); // Para insights
const lancamentosUltimosMeses = ref({}); // Para o gráfico, estrutura { 'YYYY-MM': [{...}, {...}] }

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

// Calcula o total de entradas para o mês selecionado
const totalEntradasMes = computed(() => {
  return lancamentosDoMes.value
    .filter(item => item.valor > 0)
    .reduce((sum, item) => sum + item.valor, 0);
});

// Calcula o total de saídas para o mês selecionado
const totalSaidasMes = computed(() => {
  return lancamentosDoMes.value
    .filter(item => item.valor < 0)
    .reduce((sum, item) => sum + item.valor, 0);
});

// Saldo do Mês
const saldoMes = computed(() => {
  return totalEntradasMes.value + totalSaidasMes.value;
});

// --- Meta Mensal ---
const metaMensal = ref(0);
const editingMeta = ref(false);
const inputMetaMensal = ref(0);
const metaInputRef = ref(null); // Ref para o input da meta

const toggleEditMeta = async () => {
  editingMeta.value = !editingMeta.value;
  if (editingMeta.value) {
    inputMetaMensal.value = metaMensal.value;
    await nextTick(); // Espera o input ser renderizado
    if (metaInputRef.value) { // Verifica se a ref existe
      metaInputRef.value.focus();
      metaInputRef.value.select(); // Seleciona o texto para facilitar a edição
    }
  }
};

const salvarMeta = async () => {
  editingMeta.value = false;
  const userId = auth.currentUser?.uid;
  if (!userId) {
    erro.value = 'Usuário não autenticado para salvar a meta.';
    console.error("salvarMeta: NENHUM USUÁRIO AUTENTICADO!"); // Log de depuração
    return;
  }
  const novaMeta = Number(inputMetaMensal.value);
  if (isNaN(novaMeta) || novaMeta < 0) {
    erro.value = 'Valor de meta inválido. A meta deve ser um número positivo.';
    inputMetaMensal.value = metaMensal.value; // Volta ao valor anterior
    return;
  }

  // Define o ID do documento da meta como 'ano-mes' (ex: '2025-05')
  const metaId = `${anoSelecionado.value}-${String(mesSelecionado.value + 1).padStart(2, '0')}`; // +1 porque mesSelecionado é 0-indexado
  try {
    // Caminho da coleção: 'metas' -> 'userId' -> 'mensal' -> 'metaId'
    // Ex: metas/algumUIDDoUsuario/mensal/2025-06
    const metaDocRef = doc(db, 'metas', userId, 'mensal', metaId);
    await setDoc(metaDocRef, {
      valor: novaMeta,
      ano: anoSelecionado.value,
      mes: mesSelecionado.value + 1, // Salva o mês como 1-indexado
      userId: userId, // ESSENCIAL para as regras de segurança
      ultimaAtualizacao: new Date()
    });
    metaMensal.value = novaMeta;
    erro.value = ''; // Limpa erro se houver
    console.log("Meta salva com sucesso para:", userId, "Mês:", metaId); // Log de sucesso
  } catch (e) {
    erro.value = 'Erro ao salvar a meta: ' + e.message;
    console.error('Erro ao salvar meta:', e);
  }
};

const carregarMetaMensal = async (userId) => {
  if (!userId) {
    console.error("carregarMetaMensal: NENHUM USUÁRIO AUTENTICADO!"); // Log de depuração
    metaMensal.value = 0;
    return;
  }
  const metaId = `${anoSelecionado.value}-${String(mesSelecionado.value + 1).padStart(2, '0')}`; // +1 porque mesSelecionado é 0-indexado
  try {
    // Caminho da coleção: 'metas' -> 'userId' -> 'mensal' -> 'metaId'
    const metaDocRef = doc(db, 'metas', userId, 'mensal', metaId);
    const metaDoc = await getDoc(metaDocRef);
    if (metaDoc.exists()) {
      metaMensal.value = metaDoc.data().valor || 0;
      console.log("Meta carregada:", metaMensal.value, "para:", userId, "Mês:", metaId); // Log de sucesso
    } else {
      metaMensal.value = 0; // Nenhuma meta definida para este mês
      console.log("Nenhuma meta encontrada para:", userId, "Mês:", metaId); // Log de informação
    }
    erro.value = '';
  } catch (e) {
    console.error('Erro ao carregar meta mensal:', e);
    erro.value = 'Erro ao carregar meta mensal: ' + e.message;
    metaMensal.value = 0;
  }
};

const formatarMetaStatus = computed(() => {
  const gastoAtual = Math.abs(totalSaidasMes.value);
  const restante = metaMensal.value - gastoAtual;

  if (metaMensal.value <= 0) return ''; // Não exibe status se não há meta

  if (restante >= 0) {
    return `Faltam: ${formatarValor(restante)}`;
  } else {
    return `Ultrapassou: ${formatarValor(Math.abs(restante))}`;
  }
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

// Calcula gastos por categoria usando o campo 'categoria'
const gastosPorCategoria = computed(() => {
  const categorias = {};
  lancamentosDoMes.value
    .filter(item => item.valor < 0) // Apenas saídas
    .forEach(item => {
      const nomeCategoria = item.categoria || 'Outros';
      if (!categorias[nomeCategoria]) {
        categorias[nomeCategoria] = 0;
      }
      categorias[nomeCategoria] += Math.abs(item.valor);
    });

  return Object.keys(categorias)
    .map(nome => ({ nome, valor: categorias[nome] }))
    .sort((a, b) => b.valor - a.valor);
});

// --- Insights Automáticos ---
const insights = computed(() => {
  const insightsList = [];
  const totalSaidasMesAtual = Math.abs(totalSaidasMes.value);
  const totalSaidasMesAnterior = Math.abs(
    lancamentosMesAnterior.value
      .filter(item => item.valor < 0)
      .reduce((sum, item) => sum + item.valor, 0)
  );

  // Comparação com o mês anterior
  if (totalSaidasMesAnterior > 0) {
    const diferenca = Math.abs(totalSaidasMesAtual - totalSaidasMesAnterior);
    if (totalSaidasMesAtual < totalSaidasMesAnterior) {
      insightsList.push(`Este mês você gastou ${formatarValor(diferenca)} a menos que o mês anterior! 🎉`);
    } else if (totalSaidasMesAtual > totalSaidasMesAnterior) {
      insightsList.push(`Este mês você gastou ${formatarValor(diferenca)} a mais que o mês anterior. Fique de olho! 👀`);
    }
  }

  // Comparação de categorias (exemplo: Alimentação vs Transporte)
  const gastosPorCategoriaMesAtual = {};
  gastosPorCategoria.value.forEach(cat => {
    gastosPorCategoriaMesAtual[cat.nome] = cat.valor;
  });

  const gastoAlimentacao = gastosPorCategoriaMesAtual['Alimentação'] || 0;
  const gastoTransporte = gastosPorCategoriaMesAtual['Transporte'] || 0;

  if (gastoTransporte > 0 && gastoAlimentacao > 0 && gastoTransporte > gastoAlimentacao) {
    insightsList.push(`Você gastou mais em Transporte (${formatarValor(gastoTransporte)}) do que em Alimentação (${formatarValor(gastoAlimentacao)}) este mês.`);
  }

  // Adicione mais insights aqui conforme a necessidade

  return insightsList;
});


// --- Funções de Carregamento de Dados ---

// Helper para obter os limites de data de um mês específico
const getMonthDateRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Carrega lançamentos para um período específico
const carregarLancamentosPorPeriodo = async (userId, start, end) => {
  try {
    const q = query(
      collection(db, 'lancamentos'),
      where('userId', '==', userId),
      where('data', '>=', start),
      where('data', '<=', end)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Erro ao carregar lançamentos por período:', e);
    return [];
  }
};

const carregarDadosDoDashboard = async (userId) => {
  erro.value = '';
  try {
    // Carrega lançamentos do mês atual
    lancamentosDoMes.value = await carregarLancamentosPorPeriodo(userId, inicioDoMes.value, fimDoMes.value);

    // Carrega lançamentos do mês anterior para insights
    const dataMesAnterior = new Date(anoSelecionado.value, mesSelecionado.value - 1, 1);
    const { start: startMesAnterior, end: endMesAnterior } = getMonthDateRange(dataMesAnterior.getFullYear(), dataMesAnterior.getMonth());
    lancamentosMesAnterior.value = await carregarLancamentosPorPeriodo(userId, startMesAnterior, endMesAnterior);

    // Carrega meta mensal
    await carregarMetaMensal(userId);

    // Carrega dados para o gráfico (últimos 4 meses)
    lancamentosUltimosMeses.value = {};
    for (let i = 0; i < 4; i++) {
      let currentMonth = mesSelecionado.value - i;
      let currentYear = anoSelecionado.value;
      if (currentMonth < 0) {
        currentMonth += 12;
        currentYear--;
      }
      const { start, end } = getMonthDateRange(currentYear, currentMonth);
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`; // Formato YYYY-MM
      lancamentosUltimosMeses.value[key] = await carregarLancamentosPorPeriodo(userId, start, end);
    }
    await nextTick(); // Garante que o DOM foi atualizado antes de tentar renderizar o gráfico
    renderChart(); // Renderiza o gráfico após carregar todos os dados
  } catch (e) {
    erro.value = 'Erro ao carregar dados do dashboard.';
    console.error('Erro ao carregar dashboard:', e);
  }
};


// --- Gráfico de Evolução ---
let monthlyEvolutionChartInstance = null; // Variável para armazenar a instância do gráfico

const chartDataAvailable = computed(() => {
  // Verifica se há pelo menos um mês com dados para o gráfico
  return Object.values(lancamentosUltimosMeses.value).some(arr => arr.length > 0);
});

const renderChart = () => {
  if (monthlyEvolutionChartInstance) {
    monthlyEvolutionChartInstance.destroy(); // Destrói a instância anterior se existir
  }

  const ctx = document.getElementById('monthlyEvolutionChart');
  if (!ctx || !chartDataAvailable.value) {
    return; // Não renderiza se o canvas não existe ou não há dados
  }

  const labels = [];
  const entradasData = [];
  const saidasData = [];

  // Pega os últimos 4 meses a partir do mês selecionado
  const dataPontos = [];
  for (let i = 3; i >= 0; i--) { // Começa do mais antigo para o mais recente
    let currentMonth = mesSelecionado.value - i;
    let currentYear = anoSelecionado.value;
    if (currentMonth < 0) {
      currentMonth += 12;
      currentYear--;
    }
    dataPontos.push({ year: currentYear, month: currentMonth });
  }

  dataPontos.forEach(({ year, month }) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const lancamentosDoMesHistorico = lancamentosUltimosMeses.value[key] || [];

    const totalEntradas = lancamentosDoMesHistorico
      .filter(item => item.valor > 0)
      .reduce((sum, item) => sum + item.valor, 0);

    const totalSaidas = lancamentosDoMesHistorico
      .filter(item => item.valor < 0)
      .reduce((sum, item) => sum + Math.abs(item.valor), 0); // Abs para o gráfico de barras

    labels.push(`${meses[month].substring(0, 3)}/${String(year).slice(2)}`); // Jan/25
    entradasData.push(totalEntradas);
    saidasData.push(totalSaidas);
  });

  monthlyEvolutionChartInstance = new Chart(ctx, {
    type: 'bar', // Pode ser 'line' também
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Entradas',
          data: entradasData,
          backgroundColor: 'rgba(40, 167, 69, 0.7)', // Verde
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Saídas',
          data: saidasData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)', // Vermelho
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatarValor(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor (R$)'
          },
          ticks: {
            callback: function(value) {
              return formatarValor(value);
            }
          }
        }
      }
    }
  });
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

// --- Função de Navegação ---
const voltar = () => {
  router.back();
};

// --- Funções de Formatação ---
const formatarValor = (valor) => {
  if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- Watchers e Lifecycle Hooks ---

// Observa mudanças no mês ou ano selecionado para recarregar todos os dados do dashboard
watch([mesSelecionado, anoSelecionado], async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    await carregarDadosDoDashboard(userId);
  }
});

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("onAuthStateChanged: Usuário logado, UID:", user.uid); // Log de depuração
      await carregarDadosDoDashboard(user.uid);
    } else {
      erro.value = 'Usuário não autenticado. Redirecionando para o login.';
      console.error("onAuthStateChanged: NENHUM USUÁRIO LOGADO!"); // Log de depuração
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
  font-size: 0.9em;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.content-card {
  width: 100%;
  max-width: 360px;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  text-align: center;
  margin: 0.8rem 0;
}

/* Ajustes para o Botão de Voltar no Título */
.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Alinha o botão de voltar à esquerda */
  gap: 6px;
  margin-bottom: 20px;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  flex-grow: 1; /* Permite que o título ocupe o espaço restante */
  text-align: center; /* Centraliza o texto do título */
  transform: translateX(-18px); /* Ajusta para centralizar o título levando em conta o botão */
}

.back-button {
  display: flex; /* Garante que o botão seja exibido */
  border-radius: 50%;
  padding: 3px 8px;
  min-width: 30px;
  min-height: 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

/* --- Seção de Resumo de Totais (Entradas, Saídas, Saldo) --- */
.totals-summary {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
  padding: 6px 0;
}

.total-item:not(:last-child) {
  border-bottom: 1px dashed #eee;
}

.total-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  margin-left: 10px;
}

.total-item.entradas .value {
  color: #28a745;
}

.total-item.saidas .value {
  color: #dc3545;
}

.total-item .value.positivo { color: #28a745; }
.total-item .value.negativo { color: #dc3545; }

/* --- Meta Mensal --- */
.total-item.meta-mensal {
  font-weight: 600;
  color: #007bff; /* Cor azul para a meta */
  cursor: pointer; /* Indica que é clicável */
  border-bottom: 1px dashed #eee; /* Linha para separar da próxima item */
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.total-item.meta-mensal .value {
  color: #007bff; /* Mantém a cor azul para o valor da meta */
}

.meta-input {
  border: 1px solid #007bff;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 1.1rem;
  font-weight: 700;
  width: 120px; /* Ajuste a largura conforme necessário */
  text-align: right;
  color: #007bff;
}

.meta-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  padding: 4px 0 10px;
  border-bottom: 1px dashed #eee;
  margin-bottom: 8px;
}

.meta-status .positivo { color: #28a745; font-weight: 600; }
.meta-status .negativo { color: #dc3545; font-weight: 600; }
.meta-status .meta-details { font-weight: 500; }


/* --- Estilos Gerais de Botões --- */
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

/* --- Títulos de Seção --- */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

.section-title-small {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

/* --- Insights Container --- */
.insights-container {
  width: 90%;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 16px;
  text-align: left; /* Insights podem ser justificados à esquerda */
}

.insight-item {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 5px;
  line-height: 1.4;
}
.insight-item:last-child {
  margin-bottom: 0;
}


/* --- Gastos por Categoria (Lista com Ícones) --- */
.category-list-container {
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 6px;
  margin-bottom: 15px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 5px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 6px; /* Espaçamento entre ícone e nome da categoria */
}

.category-icon {
  font-size: 1.2rem; /* Tamanho do ícone */
  color: #007bff; /* Cor do ícone */
}

.category-name {
  font-size: 0.9em;
  font-weight: 500;
  color: #444;
}

.category-value {
  font-size: 0.95em;
  font-weight: 600;
  color: #dc3545; /* Cor vermelha para gastos */
}

/* --- Gráfico de Evolução --- */
.chart-container {
  position: relative;
  width: 100%;
  max-width: 340px; /* Ajuste para o tamanho do card */
  height: 200px; /* Altura fixa para o gráfico */
  margin: 15px auto 20px;
}

/* --- Mensagens e Divisores --- */
.no-items-message {
  padding: 14px;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.85em;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  font-weight: 500;
  max-width: 320px;
  text-align: center;
  user-select: none;
  word-wrap: break-word;
  font-size: 0.85em;
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
}
</style>