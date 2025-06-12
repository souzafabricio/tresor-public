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
          <span>Meta de Economia:</span>
          <span v-if="!editingMeta" class="value">{{ formatarValor(metaMensal) }}</span>
          <input v-else type="number" v-model="inputMetaMensal" @blur="salvarMeta" @keyup.enter="salvarMeta"
            class="meta-input" ref="metaInputRef" />
        </div>
        <div v-if="metaMensal > 0" class="meta-status">
          <span class="meta-details">Gastou: {{ formatarValor(Math.abs(totalSaidasMes)) }}</span>
          <span v-html="formatarMetaStatus"
            :class="{ 'positivo': (metaMensal - Math.abs(totalSaidasMes)) >= 0, 'negativo': (metaMensal - Math.abs(totalSaidasMes)) < 0 }">
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
          <span class="value" :class="{ 'positivo': saldoMes >= 0, 'negativo': saldoMes < 0 }">{{
            formatarValor(saldoMes) }}</span>
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
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const auth = getAuth();
const router = useRouter();
const erro = ref('');
const anoSelecionado = ref(new Date().getFullYear());
const mesSelecionado = ref(new Date().getMonth());

// Referências para armazenar os dados de lançamentos e faturas
const lancamentosDoMes = ref([]);
const itensFaturaDoMes = ref([]);
const lancamentosMesAnterior = ref([]);
const itensFaturaMesAnterior = ref([]); // Novo para dados de faturas do mês anterior
const lancamentosUltimosMeses = ref({});

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

// TOTAL DE ENTRADAS (APENAS DE LANÇAMENTOS COM VALOR POSITIVO)
const totalEntradasMes = computed(() => {
  return lancamentosDoMes.value
    .filter(item => item.valor > 0)
    .reduce((sum, item) => sum + item.valor, 0);
});

// CORREÇÃO AQUI: TOTAL DE SAÍDAS (LANÇAMENTOS COM VALOR NEGATIVO + ITENS DE FATURA)
const totalSaidasMes = computed(() => {
  console.log("Calculando totalSaidasMes...");
  console.log("lancamentosDoMes:", lancamentosDoMes.value);
  console.log("itensFaturaDoMes:", itensFaturaDoMes.value);

  const saidasLancamentosAbs = lancamentosDoMes.value
    .filter(item => {
      // Log para cada item de lançamento para ver se o filtro está correto
      // console.log(`  - Lancamento: ${item.descricao || 'N/A'}, Valor: ${item.valor}, isNegative: ${item.valor < 0}`);
      return item.valor < 0;
    })
    .reduce((sum, item) => {
      const absValue = Math.abs(item.valor);
      // console.log(`  - Adicionando lancamento abs: ${absValue}`);
      return sum + absValue;
    }, 0);
  console.log("saidasLancamentosAbs (total de lançamentos de saída):", saidasLancamentosAbs);

  const saidasFaturasAbs = itensFaturaDoMes.value
    .reduce((sum, item) => {
      // Log para cada item de fatura
      // console.log(`  - Fatura: ${item.descricao || 'N/A'}, Valor: ${item.valor}`);
      return sum + item.valor;
    }, 0); // Soma valores de fatura (já são positivos e representam despesas)
  console.log("saidasFaturasAbs (total de faturas):", saidasFaturasAbs);

  // Soma os valores absolutos e então os torna negativos para representar o total de saídas
  const combinedSaidasAbs = saidasLancamentosAbs + saidasFaturasAbs;
  const finalTotalSaidas = -combinedSaidasAbs;
  console.log("Combined Saídas Abs (antes da negação):", combinedSaidasAbs);
  console.log("Final totalSaidasMes:", finalTotalSaidas);
  return finalTotalSaidas;
});

// SALDO DO MÊS (ENTRADAS - SAÍDAS)
const saldoMes = computed(() => {
  return totalEntradasMes.value + totalSaidasMes.value;
});

const metaMensal = ref(0);
const editingMeta = ref(false);
const inputMetaMensal = ref(0);
const metaInputRef = ref(null);

const toggleEditMeta = async () => {
  editingMeta.value = !editingMeta.value;
  if (editingMeta.value) {
    inputMetaMensal.value = metaMensal.value;
    await nextTick();
    if (metaInputRef.value) {
      metaInputRef.value.focus();
      metaInputRef.value.select();
    }
  }
};

const salvarMeta = async () => {
  editingMeta.value = false;
  const userId = auth.currentUser?.uid;
  if (!userId) {
    erro.value = 'Usuário não autenticado para salvar a meta.';
    console.error("salvarMeta: NENHUM USUÁRIO AUTENTICADO!");
    return;
  }
  const novaMeta = Number(inputMetaMensal.value);
  if (isNaN(novaMeta) || novaMeta < 0) {
    erro.value = 'Valor de meta inválido. A meta deve ser um número positivo.';
    inputMetaMensal.value = metaMensal.value;
  }

  const metaId = `${anoSelecionado.value}-${String(mesSelecionado.value + 1).padStart(2, '0')}`;
  try {
    const metaDocRef = doc(db, 'metas', userId, 'mensal', metaId);
    await setDoc(metaDocRef, {
      valor: novaMeta,
      ano: anoSelecionado.value,
      mes: mesSelecionado.value + 1,
      userId: userId,
      ultimaAtualizacao: new Date()
    });
    metaMensal.value = novaMeta;
    erro.value = '';
    console.log("Meta salva com sucesso para:", userId, "Mês:", metaId);
  } catch (e) {
    erro.value = 'Erro ao salvar a meta: ' + e.message;
    console.error('Erro ao salvar meta:', e);
  }
};

const carregarMetaMensal = async (userId) => {
  if (!userId) {
    console.error("carregarMetaMensal: NENHUM USUÁRIO AUTENTICADO!");
    metaMensal.value = 0;
    return;
  }
  const metaId = `${anoSelecionado.value}-${String(mesSelecionado.value + 1).padStart(2, '0')}`;
  try {
    const metaDocRef = doc(db, 'metas', userId, 'mensal', metaId);
    const metaDoc = await getDoc(metaDocRef);
    if (metaDoc.exists()) {
      metaMensal.value = metaDoc.data().valor || 0;
      console.log("Meta carregada:", metaMensal.value, "para:", userId, "Mês:", metaId);
    } else {
      metaMensal.value = 0;
      console.log("Nenhuma meta encontrada para:", userId, "Mês:", metaId);
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

  if (metaMensal.value <= 0) return '';

  if (restante >= 0) {
    return `${formatarValor(restante)} positivo.`;
  } else {
    return `${formatarValor(Math.abs(restante))} negativo.`;
  }
});

// Categorias padronizadas com 'id' e 'nome'
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
  { id: 'outros', nome: 'Outros', icon: 'category' }
]);

// Helper para obter o nome da categoria pelo ID
const getCategoryNameById = (categoryId) => {
  const category = categoriasDisponiveis.value.find(cat => cat.id === categoryId);
  return category ? category.nome : 'Outros';
};

// Helper para obter o ícone da categoria (compatível com nome ou ID)
const getCategoryIcon = (categoryIdentifier) => {
  // Tenta encontrar pelo ID primeiro (para itens de fatura)
  let category = categoriasDisponiveis.value.find(cat => cat.id === categoryIdentifier);
  if (category) return category.icon;

  // Se não encontrado pelo ID, tenta encontrar pelo nome (para lançamentos antigos)
  category = categoriasDisponiveis.value.find(cat => cat.nome === categoryIdentifier);
  return category ? category.icon : 'category';
};

// GASTOS POR CATEGORIA (COMBINANDO LANÇAMENTOS E ITENS DE FATURA)
const gastosPorCategoria = computed(() => {
  const categorias = {};

  // Processar lançamentos (apenas saídas)
  lancamentosDoMes.value
    .filter(item => item.valor < 0)
    .forEach(item => {
      const nomeCategoria = item.categoria || 'Outros'; // 'categoria' para lançamentos
      if (!categorias[nomeCategoria]) {
        categorias[nomeCategoria] = 0;
      }
      categorias[nomeCategoria] += Math.abs(item.valor);
    });

  // Processar itens de fatura
  itensFaturaDoMes.value
    .forEach(item => {
      const nomeCategoria = getCategoryNameById(item.categoriaId); // Converte 'categoriaId' para nome
      if (!categorias[nomeCategoria]) {
        categorias[nomeCategoria] = 0;
      }
      categorias[nomeCategoria] += Math.abs(item.valor); // Itens de fatura são despesas
    });

  return Object.keys(categorias)
    .map(nome => ({ nome, valor: categorias[nome] }))
    .sort((a, b) => b.valor - a.valor);
});

// INSIGHTS (AGORA BASEADOS NO totalSaidasMes COMBINADO)
const insights = computed(() => {
  const insightsList = [];
  const totalSaidasMesAtual = Math.abs(totalSaidasMes.value); // Já inclui lançamentos e faturas

  // Calcula o total de saídas do mês anterior (lançamentos + faturas)
  const totalSaidasMesAnterior = Math.abs(
    lancamentosMesAnterior.value
      .filter(item => item.valor < 0)
      .reduce((sum, item) => sum + Math.abs(item.valor), 0) // Soma o valor absoluto dos lançamentos negativos
    +
    itensFaturaMesAnterior.value.reduce((sum, item) => sum + item.valor, 0) // Soma os valores das faturas
  );

  if (totalSaidasMesAnterior > 0) {
    const diferenca = Math.abs(totalSaidasMesAtual - totalSaidasMesAnterior);
    if (totalSaidasMesAtual < totalSaidasMesAnterior) {
      insightsList.push(`Este mês você gastou ${formatarValor(diferenca)} a menos que o mês anterior! 🎉`);
    } else if (totalSaidasMesAtual > totalSaidasMesAnterior) {
      insightsList.push(`Este mês você gastou ${formatarValor(diferenca)} a mais que o mês anterior. Fique de olho! 👀`);
    }
  }

  // Insights baseados em categorias combinadas
  const gastosPorCategoriaMesAtual = {};
  gastosPorCategoria.value.forEach(cat => {
    gastosPorCategoriaMesAtual[cat.nome] = cat.valor;
  });

  const gastoAlimentacao = gastosPorCategoriaMesAtual['Alimentação'] || 0;
  const gastoTransporte = gastosPorCategoriaMesAtual['Transporte'] || 0;

  if (gastoTransporte > 0 && gastoAlimentacao > 0 && gastoTransporte > gastoAlimentacao) {
    insightsList.push(`Você gastou mais em Transporte (${formatarValor(gastoTransporte)}) do que em Alimentação (${formatarValor(gastoAlimentacao)}) este mês.`);
  }

  return insightsList;
});

const getMonthDateRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// NOVA FUNÇÃO: Carregar dados de uma coleção por período
const carregarCollectionPorPeriodo = async (userId, collectionName, start, end) => {
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      where('data', '>=', start),
      where('data', '<=', end)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error(`Erro ao carregar ${collectionName} por período:`, e);
    return [];
  }
};

// Carregamento principal de todos os dados para o dashboard
const carregarDadosDoDashboard = async (userId) => {
  erro.value = '';
  try {
    // Mês atual
    console.log("Buscando dados para o mês atual...");
    lancamentosDoMes.value = await carregarCollectionPorPeriodo(userId, 'lancamentos', inicioDoMes.value, fimDoMes.value);
    console.log("Lancamentos do Mês buscados:", lancamentosDoMes.value);
    itensFaturaDoMes.value = await carregarCollectionPorPeriodo(userId, 'itensFatura', inicioDoMes.value, fimDoMes.value);
    console.log("Itens de Fatura do Mês buscados:", itensFaturaDoMes.value);

    // Mês anterior (para insights)
    console.log("Buscando dados para o mês anterior...");
    const dataMesAnterior = new Date(anoSelecionado.value, mesSelecionado.value - 1, 1);
    const { start: startMesAnterior, end: endMesAnterior } = getMonthDateRange(dataMesAnterior.getFullYear(), dataMesAnterior.getMonth());
    lancamentosMesAnterior.value = await carregarCollectionPorPeriodo(userId, 'lancamentos', startMesAnterior, endMesAnterior);
    itensFaturaMesAnterior.value = await carregarCollectionPorPeriodo(userId, 'itensFatura', startMesAnterior, endMesAnterior);
    console.log("Lancamentos do Mês Anterior buscados:", lancamentosMesAnterior.value);
    console.log("Itens de Fatura do Mês Anterior buscados:", itensFaturaMesAnterior.value);


    await carregarMetaMensal(userId);

    // Dados históricos para o gráfico (últimos 4 meses)
    console.log("Buscando dados históricos para o gráfico...");
    lancamentosUltimosMeses.value = {};
    const itensFaturaUltimosMesesParaGrafico = {};
    for (let i = 0; i < 4; i++) {
      let currentMonth = mesSelecionado.value - i;
      let currentYear = anoSelecionado.value;
      if (currentMonth < 0) {
        currentMonth += 12;
        currentYear--;
      }
      const { start, end } = getMonthDateRange(currentYear, currentMonth);
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      lancamentosUltimosMeses.value[key] = await carregarCollectionPorPeriodo(userId, 'lancamentos', start, end);
      itensFaturaUltimosMesesParaGrafico[key] = await carregarCollectionPorPeriodo(userId, 'itensFatura', start, end);
    }
    console.log("Lancamentos dos Últimos Meses (para gráfico) buscados:", lancamentosUltimosMeses.value);
    console.log("Itens de Fatura dos Últimos Meses (para gráfico) buscados:", itensFaturaUltimosMesesParaGrafico);


    await nextTick();
    renderChart(itensFaturaUltimosMesesParaGrafico); // Passa os dados de faturas para o gráfico
  } catch (e) {
    erro.value = 'Erro ao carregar dados do dashboard.';
    console.error('Erro ao carregar dashboard:', e);
  }
};

let monthlyEvolutionChartInstance = null;

// CORREÇÃO: `chartDataAvailable` agora é uma `ref` simples, atualizada pela função `renderChart`.
const chartDataAvailable = ref(false);


const renderChart = (itensFaturaUltimosMesesParaGrafico) => {
  if (monthlyEvolutionChartInstance) {
    monthlyEvolutionChartInstance.destroy();
  }

  const ctx = document.getElementById('monthlyEvolutionChart');
  if (!ctx) {
    console.warn("Elemento canvas 'monthlyEvolutionChart' não encontrado.");
    chartDataAvailable.value = false; // Define como falso se o canvas não for encontrado
    return;
  }

  const labels = [];
  const entradasData = [];
  const saidasData = [];

  const dataPontos = [];
  for (let i = 3; i >= 0; i--) {
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
    const lancamentosHistorico = lancamentosUltimosMeses.value[key] || [];
    const faturasHistorico = itensFaturaUltimosMesesParaGrafico[key] || []; // Dados de faturas históricas

    const totalEntradas = lancamentosHistorico
      .filter(item => item.valor > 0)
      .reduce((sum, item) => sum + item.valor, 0);

    const totalSaidasLancamentos = lancamentosHistorico
      .filter(item => item.valor < 0)
      .reduce((sum, item) => sum + Math.abs(item.valor), 0); // Soma o valor absoluto das saídas

    const totalSaidasFaturas = faturasHistorico
      .reduce((sum, item) => sum + item.valor, 0); // Soma o valor das faturas (que são despesas)

    const totalSaidas = totalSaidasLancamentos + totalSaidasFaturas;

    labels.push(`${meses[month].substring(0, 3)}/${String(year).slice(2)}`);
    entradasData.push(totalEntradas);
    saidasData.push(totalSaidas);
  });

  // Verifica se há dados para exibir no gráfico antes de renderizar
  const chartHasData = entradasData.some(val => val > 0) || saidasData.some(val => val > 0);
  if (!chartHasData) {
    console.log("Dados insuficientes para o gráfico (últimos 4 meses).");
    chartDataAvailable.value = false;
    return;
  }
  chartDataAvailable.value = true; // Define como verdadeiro se há dados

  monthlyEvolutionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Entradas',
          data: entradasData,
          backgroundColor: 'rgba(40, 167, 69, 0.7)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        },
        {
          label: 'Saídas',
          data: saidasData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
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
            label: function (context) {
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
            callback: function (value) {
              return formatarValor(value);
            }
          }
        }
      }
    }
  });
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

const voltar = () => {
  router.back();
};

const formatarValor = (valor) => {
  if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

watch([mesSelecionado, anoSelecionado], async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    await carregarDadosDoDashboard(userId);
  }
});

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("onAuthStateChanged: Usuário logado, UID:", user.uid);
      await carregarDadosDoDashboard(user.uid);
    } else {
      erro.value = 'Usuário não autenticado. Redirecionando para o login.';
      console.error("onAuthStateChanged: NENHUM USUÁRIO LOGADO!");
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
  display: flex;
  border-radius: 50%;
  padding: 3px 8px;
  min-width: 30px;
  min-height: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  flex-direction: column;
  justify-content: space-around;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.total-item .value.positivo {
  color: #28a745;
}

.total-item .value.negativo {
  color: #dc3545;
}

.total-item.meta-mensal {
  font-weight: 600;
  color: #007bff;
  cursor: pointer;
  border-bottom: 1px dashed #eee;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.total-item.meta-mensal .value {
  color: #007bff;
}

.meta-input {
  border: 1px solid #007bff;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 1.1rem;
  font-weight: 700;
  width: 120px;
  text-align: right;
  color: #007bff;
}

.meta-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #666;
  padding: 4px 0 10px;
  border-bottom: 1px dashed #eee;
  margin-bottom: 8px;
}

.meta-status .positivo {
  color: #28a745;
  font-weight: 600;
}

.meta-status .negativo {
  color: #dc3545;
  font-weight: 600;
}

.meta-status .meta-details {
  font-weight: 500;
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

.insights-container {
  width: 90%;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  text-align: left;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-icon {
  font-size: 1.2rem;
  color: #007bff;
}

.category-name {
  font-size: 0.9em;
  font-weight: 500;
  color: #444;
}

.category-value {
  font-size: 0.95em;
  font-weight: 600;
  color: #dc3545;
}

.chart-container {
  position: relative;
  width: 100%;
  max-width: 340px;
  height: 200px;
  margin: 15px auto 20px;
}

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
