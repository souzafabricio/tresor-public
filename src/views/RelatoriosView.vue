<template>
  <div class="main-container">
    <div class="content-card">

      <div class="title-row">
        <button @click="voltar" class="btn back-button">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Relatórios</h1>
      </div>

      <div class="filters-section">
        <h2 class="section-title-small">Configurar Relatório</h2>

        <div class="filter-group">
          <label for="tipoPeriodo">Período:</label>
          <select id="tipoPeriodo" v-model="tipoPeriodo" class="select-field">
            <option value="mensal">Mês Específico</option>
            <option value="intervalo">Intervalo de Datas</option>
            <option value="ultimosMeses">Últimos N Meses</option>
          </select>
        </div>

        <div v-if="tipoPeriodo === 'mensal'" class="filter-group date-select-group">
          <label for="mes">Mês:</label>
          
          <select id="mes" v-model="mesSelecionado" class="select-field month-year-select">
            <option v-for="(mes, index) in meses" :key="index" :value="index">{{ mes }}</option>
          </select>

          <label for="ano">Ano:</label>

          <select id="ano" v-model="anoSelecionado" class="select-field month-year-select">
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>

        </div>

        <div v-if="tipoPeriodo === 'intervalo'" class="filter-group">
          <label for="dataInicio">De:</label>
          <input type="date" id="dataInicio" v-model="dataInicio" class="intervalo-datas-filtro" />
          <label for="dataFim">Até:</label>
          <input type="date" id="dataFim" v-model="dataFim" class="intervalo-datas-filtro" />
        </div>

        <div v-if="tipoPeriodo === 'ultimosMeses'" class="filter-group">
          <label for="numMeses">Últimos:</label>
          <input type="number" id="numMeses" v-model.number="numMeses" min="1" max="24" class="input-field small-input" />
          <span>meses</span>
        </div>

        <div class="filter-group">
          <label for="tipoRelatorio">Tipo de Relatório:</label>
          <select id="tipoRelatorio" v-model="tipoRelatorio" class="select-field">
            <option value="gastosPorCategoria">Gastos por Categoria</option>
            <option value="evolucaoFinanceira">Evolução Financeira (Entradas/Saídas)</option>
            <option value="transacoesDetalhadas">Transações Detalhadas</option>
          </select>
        </div>

        <div v-if="tipoRelatorio === 'gastosPorCategoria' || tipoRelatorio === 'transacoesDetalhadas'" class="filter-group">
          <label for="categoriaFiltro">Filtrar por Categoria:</label>
          <select id="categoriaFiltro" v-model="categoriaFiltro" class="select-field">
            <option value="">Todas as Categorias</option>
            <option v-for="cat in categoriasDisponiveis" :key="cat.id" :value="cat.nome">{{ cat.nome }}</option>
          </select>
        </div>

        <button @click="gerarRelatorio" class="btn filled-button generate-button">
          Gerar Relatório
          <span class="material-icons">bar_chart</span>
        </button>
      </div>

      <hr class="divider" />

      <div v-if="loading" class="loading-message">
        <span class="material-icons spin">refresh</span>
        Carregando dados...
      </div>

      <div v-if="relatorioGerado && !loading" class="report-results-section">
        <h2 class="section-title">Resultado do Relatório</h2>

        <template v-if="tipoRelatorio === 'gastosPorCategoria'">
          <div v-show="gastosPorCategoriaRelatorio.length > 0" class="chart-container">
            <canvas id="categoryChart" ref="categoryChartCanvasRef"></canvas>
          </div>
          <div v-show="gastosPorCategoriaRelatorio.length === 0" class="no-items-message">
              Nenhum gasto encontrado para a categoria selecionada neste período.
          </div>
        </template>

        <template v-if="tipoRelatorio === 'evolucaoFinanceira'">
          <div v-show="evolucaoData.labels.length > 0" class="chart-container">
            <canvas id="evolutionChart" ref="evolutionChartCanvasRef"></canvas>
          </div>
          <div v-show="evolucaoData.labels.length === 0" class="no-items-message">
              Dados insuficientes para gerar o gráfico de evolução financeira.
          </div>
        </template>

        <div v-if="tipoRelatorio === 'gastosPorCategoria' && gastosPorCategoriaRelatorio.length > 0" class="report-table-container">
          <h3>Sumário por Categoria</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in gastosPorCategoriaRelatorio" :key="cat.nome">
                <td>{{ cat.nome }}</td>
                <td>{{ formatarValor(cat.valor) }}</td>
                <td>{{ ((cat.valor / totalSaidasRelatorio) * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total Geral</strong></td>
                <td><strong>{{ formatarValor(totalSaidasRelatorio) }}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="tipoRelatorio === 'transacoesDetalhadas'" class="report-table-container">
          <h3>Transações Detalhadas</h3>
          <table v-if="transacoesDetalhadas.length > 0" class="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Origem</th>
                <th>Cartão</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transacao in transacoesDetalhadas" :key="transacao.id">
                <td>{{ formatarData(transacao.data) }}</td>
                <td>{{ transacao.descricao }}</td>
                <td>{{ transacao.categoriaNome }}</td>
                <td :class="{'positivo': transacao.tipo === 'Entrada', 'negativo': transacao.tipo === 'Saída'}">{{ transacao.tipo }}</td>
                <td :class="{'positivo': transacao.tipo === 'Entrada', 'negativo': transacao.tipo === 'Saída'}">{{ formatarValor(transacao.valor) }}</td>
                <td>{{ transacao.origem }}</td>
                <td>{{ transacao.nomeCartao }}</td>
              </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Total Entradas:</strong></td>
                    <td :class="{'positivo': totalEntradasDetalhado > 0}">{{ formatarValor(totalEntradasDetalhado) }}</td>
                    <td colspan="2"></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Total Saídas:</strong></td>
                    <td :class="{'negativo': totalSaidasDetalhado > 0}">{{ formatarValor(totalSaidasDetalhado) }}</td>
                    <td colspan="2"></td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Saldo Período:</strong></td>
                    <td :class="{'positivo': saldoPeriodoDetalhado > 0, 'negativo': saldoPeriodoDetalhado < 0}">{{ formatarValor(saldoPeriodoDetalhado) }}</td>
                    <td colspan="2"></td>
                </tr>
            </tfoot>
          </table>
          <p v-else class="no-items-message">Nenhuma transação encontrada para os filtros selecionados.</p>
        </div>

        <div class="export-buttons-container">
          <button @click="exportarCSV" class="btn filled-button export-button">
            Exportar CSV
            <span class="material-icons">download</span>
          </button>
          <button @click="exportarPDF" class="btn text-button export-button" disabled>
            Exportar PDF (Em Breve)
            <span class="material-icons">picture_as_pdf</span>
          </button>
        </div>

      </div>

      <p v-if="!relatorioGerado && !loading" class="no-items-message">Use os filtros acima para gerar seu relatório.</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const auth = getAuth();
const router = useRouter();
const erro = ref('');
const loading = ref(false);
const tipoPeriodo = ref('mensal');
const anoSelecionado = ref(new Date().getFullYear());
const mesSelecionado = ref(new Date().getMonth());
const dataInicio = ref('');
const dataFim = ref('');
const numMeses = ref(6);
const tipoRelatorio = ref('gastosPorCategoria');
const categoriaFiltro = ref('');
const relatorioGerado = ref(false);
const gastosPorCategoriaRelatorio = ref([]);
const totalSaidasRelatorio = ref(0);
const transacoesDetalhadas = ref([]);
const evolucaoData = ref({ labels: [], entradas: [], saidas: [], saldo: [] });
const totalEntradasDetalhado = ref(0);
const totalSaidasDetalhado = ref(0);
const saldoPeriodoDetalhado = ref(0);
const categoryChartCanvasRef = ref(null);
const evolutionChartCanvasRef = ref(null);

let currentChartInstance = null;

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const anosDisponiveis = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 10; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
});

const getPeriodoDatas = computed(() => {
  let startDate, endDate;

  if (tipoPeriodo.value === 'mensal') {
    startDate = new Date(anoSelecionado.value, mesSelecionado.value, 1);
    endDate = new Date(anoSelecionado.value, mesSelecionado.value + 1, 0, 23, 59, 59, 999);
  } else if (tipoPeriodo.value === 'intervalo') {
    startDate = dataInicio.value ? new Date(dataInicio.value + 'T00:00:00Z') : null;
    endDate = dataFim.value ? new Date(dataFim.value + 'T23:59:59Z') : null;
  } else if (tipoPeriodo.value === 'ultimosMeses') {
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - numMeses.value + 1, 1);
    startDate.setHours(0,0,0,0);
  }

  if (!startDate || !endDate || startDate > endDate) {
    return { start: null, end: null };
  }
  return { start: startDate, end: endDate };
});

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

const cartoesDisponiveis = ref([]);

const getCategoryNameById = (categoryId) => {
  const category = categoriasDisponiveis.value.find(cat => cat.id === categoryId);
  return category ? category.nome : 'Outros';
};

const getCardNameById = (cardId) => {
  const card = cartoesDisponiveis.value.find(c => c.id === cardId);
  if (card) {
    const lastFour = String(card.numero).slice(-4);
    return `${card.banco} (final ${lastFour})`;
  }
  return 'Não especificado';
};

const carregarCartoesDoFirebase = async (userId) => {
  if (!userId) {
    cartoesDisponiveis.value = [];
    return;
  }
  try {
    const q = query(collection(db, 'cartoes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    cartoesDisponiveis.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Erro ao carregar cartões para o relatório:', e);
    cartoesDisponiveis.value = [];
  }
};

const carregarLancamentos = async (userId, start, end) => {
  if (!userId || !start || !end) return [];
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
    console.error('Erro ao carregar lançamentos:', e);
    return [];
  }
};

const carregarItensFatura = async (userId, start, end) => {
  if (!userId || !start || !end) return [];
  try {
    const q = query(
      collection(db, 'itensFatura'),
      where('userId', '==', userId),
      where('data', '>=', start),
      where('data', '<=', end)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error('Erro ao carregar itens de fatura:', e);
    return [];
  }
};

const gerarRelatorio = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    erro.value = 'Usuário não autenticado.';
    relatorioGerado.value = false;
    return;
  }

  await carregarCartoesDoFirebase(userId);

  const { start, end } = getPeriodoDatas.value;

  if (!start || !end) {
    erro.value = 'Por favor, selecione um período válido.';
    relatorioGerado.value = false;
    return;
  }
  erro.value = '';

  loading.value = true;
  relatorioGerado.value = true;

  if (currentChartInstance) {
    currentChartInstance.destroy();
    currentChartInstance = null;
  }

  gastosPorCategoriaRelatorio.value = [];
  totalSaidasRelatorio.value = 0;
  evolucaoData.value = { labels: [], entradas: [], saidas: [], saldo: [] };
  transacoesDetalhadas.value = [];
  totalEntradasDetalhado.value = 0;
  totalSaidasDetalhado.value = 0;
  saldoPeriodoDetalhado.value = 0;

  try {
    const lancamentos = await carregarLancamentos(userId, start, end);
    const itensFatura = await carregarItensFatura(userId, start, end);

    if (tipoRelatorio.value === 'gastosPorCategoria') {
      processarGastosPorCategoria(lancamentos, itensFatura);
    } else if (tipoRelatorio.value === 'evolucaoFinanceira') {
      await processarEvolucaoFinanceira(userId, start, end);
    } else if (tipoRelatorio.value === 'transacoesDetalhadas') {
      processarTransacoesDetalhadas(lancamentos, itensFatura);
    }

  } catch (e) {
    erro.value = 'Erro ao gerar relatório: ' + e.message;
    console.error('Erro ao gerar relatório:', e);
    relatorioGerado.value = false;
  } finally {
    loading.value = false;
  }
};

const processarGastosPorCategoria = (lancamentos, itensFatura) => {
  const categorias = {};
  let totalSaidas = 0;

  lancamentos
    .filter(item => item.valor < 0)
    .forEach(item => {
      const nomeCategoria = item.categoria || 'Outros';
      if (!categorias[nomeCategoria]) {
        categorias[nomeCategoria] = 0;
      }
      categorias[nomeCategoria] += Math.abs(item.valor);
      totalSaidas += Math.abs(item.valor);
    });

  itensFatura
    .forEach(item => {
      const nomeCategoria = getCategoryNameById(item.categoriaId);
      if (!categorias[nomeCategoria]) {
        categorias[nomeCategoria] = 0;
      }
      categorias[nomeCategoria] += Math.abs(item.valor);
      totalSaidas += Math.abs(item.valor);
    });

  let resultado = Object.keys(categorias)
    .map(nome => ({ nome, valor: categorias[nome] }))
    .sort((a, b) => b.valor - a.valor);

  if (categoriaFiltro.value) {
    resultado = resultado.filter(cat => cat.nome === categoriaFiltro.value);
    totalSaidas = resultado.reduce((sum, cat) => sum + cat.valor, 0);
  }

  gastosPorCategoriaRelatorio.value = resultado;
  totalSaidasRelatorio.value = totalSaidas;
};

const processarTransacoesDetalhadas = (lancamentos, itensFatura) => {
  let todasTransacoes = [];
  let entradasTotal = 0;
  let saidasTotal = 0;

  lancamentos.forEach(item => {
    if (!categoriaFiltro.value || item.categoria === categoriaFiltro.value) {
      const valorAbsoluto = Math.abs(item.valor);
      todasTransacoes.push({
        id: item.id,
        data: item.data.toDate(),
        descricao: item.descricao,
        categoriaNome: item.categoria || 'Outros',
        tipo: item.valor > 0 ? 'Entrada' : 'Saída',
        valor: valorAbsoluto,
        origem: 'Lançamento Manual',
        nomeCartao: 'Não se aplica'
      });
      if (item.valor > 0) {
        entradasTotal += valorAbsoluto;
      } else {
        saidasTotal += valorAbsoluto;
      }
    }
  });

  itensFatura.forEach(item => {
    const nomeCategoria = getCategoryNameById(item.categoriaId);
    if (!categoriaFiltro.value || nomeCategoria === categoriaFiltro.value) {
      const valorAbsoluto = Math.abs(item.valor);
      todasTransacoes.push({
        id: item.id,
        data: item.data.toDate(),
        descricao: item.descricao,
        categoriaNome: nomeCategoria,
        tipo: 'Saída',
        valor: valorAbsoluto,
        origem: 'Cartão de Crédito',
        nomeCartao: item.cartaoId ? getCardNameById(item.cartaoId) : 'Não especificado'
      });
      saidasTotal += valorAbsoluto;
    }
  });

  todasTransacoes.sort((a, b) => a.data - b.data);
  transacoesDetalhadas.value = todasTransacoes;

  totalEntradasDetalhado.value = entradasTotal;
  totalSaidasDetalhado.value = saidasTotal;
  saldoPeriodoDetalhado.value = entradasTotal - saidasTotal;
};


const processarEvolucaoFinanceira = async (userId, overallStart, overallEnd) => {
  const labels = [];
  const entradas = [];
  const saidas = [];
  const saldo = [];
  const monthDiff = (overallEnd.getFullYear() - overallStart.getFullYear()) * 12 + (overallEnd.getMonth() - overallStart.getMonth()) + 1;

  for (let i = 0; i < monthDiff; i++) {
    const currentMonthDate = new Date(overallStart.getFullYear(), overallStart.getMonth() + i, 1);
    const monthStart = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const monthEnd = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthLancamentos = await carregarLancamentos(userId, monthStart, monthEnd);
    const monthItensFatura = await carregarItensFatura(userId, monthStart, monthEnd);

    const totalEntradasMes = monthLancamentos
      .filter(item => item.valor > 0)
      .reduce((sum, item) => sum + item.valor, 0);

    const totalSaidasLancamentosMes = monthLancamentos
      .filter(item => item.valor < 0)
      .reduce((sum, item) => sum + Math.abs(item.valor), 0);

    const totalSaidasFaturasMes = monthItensFatura
      .reduce((sum, item) => sum + item.valor, 0);

    const totalSaidasMes = totalSaidasLancamentosMes + totalSaidasFaturasMes;
    const saldoMes = totalEntradasMes - totalSaidasMes;

    labels.push(`${meses[currentMonthDate.getMonth()].substring(0, 3)}/${String(currentMonthDate.getFullYear()).slice(2)}`);
    entradas.push(totalEntradasMes);
    saidas.push(totalSaidasMes);
    saldo.push(saldoMes);
  }

  evolucaoData.value = { labels, entradas, saidas, saldo };
};

const renderCategoryChart = () => {
  const ctx = categoryChartCanvasRef.value;
  if (!ctx) {
    return;
  }

  const labels = gastosPorCategoriaRelatorio.value.map(cat => cat.nome);
  const data = gastosPorCategoriaRelatorio.value.map(cat => cat.valor);
  const backgroundColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c', '#f1c40f',
    '#a8dadc', '#457b9d', '#1d3557', '#f4a261', '#e76f51', '#2a9d8f'
  ];

  if (currentChartInstance) {
    currentChartInstance.destroy();
  }

  currentChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += formatarValor(context.parsed);
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = (context.parsed / total * 100).toFixed(1);
                label += ` (${percentage}%)`;
              }
              return label;
            }
          }
        }
      }
    }
  });
};

const renderEvolutionChart = () => {
  const ctx = evolutionChartCanvasRef.value;
  if (!ctx) {
    return;
  }

  if (currentChartInstance) {
    currentChartInstance.destroy();
  }

  currentChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: evolucaoData.value.labels,
      datasets: [
        {
          label: 'Entradas',
          data: evolucaoData.value.entradas,
          borderColor: 'rgba(40, 167, 69, 1)',
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Saídas',
          data: evolucaoData.value.saidas,
          borderColor: 'rgba(220, 53, 69, 1)',
          backgroundColor: 'rgba(220, 53, 69, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Saldo',
          data: evolucaoData.value.saldo,
          borderColor: 'rgba(0, 123, 255, 1)',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
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

const exportarCSV = () => {
  let csvContent = "";
  let filename = "relatorio.csv";

  if (tipoRelatorio.value === 'gastosPorCategoria') {
    if (gastosPorCategoriaRelatorio.value.length === 0) {
      alert("Nenhum dado para exportar no relatório de Gastos por Categoria.");
      return;
    }
    csvContent = "Categoria,Total,Porcentagem\n";
    gastosPorCategoriaRelatorio.value.forEach(cat => {
      const percentage = ((cat.valor / totalSaidasRelatorio.value) * 100).toFixed(1);
      csvContent += `${cat.nome},${cat.valor.toFixed(2).replace('.', ',')},${percentage}%\n`;
    });
    const { start, end } = getPeriodoDatas.value;
    const periodStr = start && end ? `${start.toLocaleDateString()}_${end.toLocaleDateString()}`.replace(/\//g, '-') : 'periodo_selecionado';
    filename = `gastos_por_categoria_${periodStr}.csv`;
  } else if (tipoRelatorio.value === 'transacoesDetalhadas') {
    if (transacoesDetalhadas.value.length === 0) {
      alert("Nenhum dado para exportar no relatório de Transações Detalhadas.");
      return;
    }
    csvContent = "Data,Descricao,Categoria,Tipo,Valor,Origem,Cartao\n";
    transacoesDetalhadas.value.forEach(transacao => {
      const dataFormatada = formatarData(transacao.data);
      const valorFormatado = transacao.valor.toFixed(2).replace('.', ',');
      const escapeCsvField = (field) => `"${String(field).replace(/"/g, '""')}"`;

      csvContent += `${dataFormatada},${escapeCsvField(transacao.descricao)},${escapeCsvField(transacao.categoriaNome)},${escapeCsvField(transacao.tipo)},${valorFormatado},${escapeCsvField(transacao.origem)},${escapeCsvField(transacao.nomeCartao)}\n`;
    });
    const { start, end } = getPeriodoDatas.value;
    const periodStr = start && end ? `${start.toLocaleDateString()}_${end.toLocaleDateString()}`.replace(/\//g, '-') : 'periodo_selecionado';
    filename = `transacoes_detalhadas_${periodStr}.csv`;
  } else if (tipoRelatorio.value === 'evolucaoFinanceira') {
    if (evolucaoData.value.labels.length === 0) {
      alert("Nenhum dado para exportar no relatório de Evolução Financeira.");
      return;
    }
    csvContent = "Mes,Entradas,Saidas,Saldo\n";
    evolucaoData.value.labels.forEach((label, index) => {
      const entradas = evolucaoData.value.entradas[index].toFixed(2).replace('.', ',');
      const saidas = evolucaoData.value.saidas[index].toFixed(2).replace('.', ',');
      const saldo = evolucaoData.value.saldo[index].toFixed(2).replace('.', ',');
      csvContent += `${label},${entradas},${saidas},${saldo}\n`;
    });
    filename = `evolucao_financeira.csv`;
  } else {
    alert("Nenhum relatório gerado ou tipo de relatório não suportado para exportação CSV.");
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportarPDF = () => {
  alert('Exportação para PDF será implementada em breve! 😊');
};

const formatarValor = (valor) => {
  if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarData = (date) => {
  if (!(date instanceof Date)) return '';
  return date.toLocaleDateString('pt-BR');
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      erro.value = 'Usuário não autenticado. Redirecionando para o login.';
      router.push('/');
    } else {
      await carregarCartoesDoFirebase(user.uid);
    }
  });
});

watch([gastosPorCategoriaRelatorio, evolucaoData, tipoRelatorio, loading, relatorioGerado], () => {
  if (!loading.value && relatorioGerado.value) {
    if (tipoRelatorio.value === 'gastosPorCategoria' && gastosPorCategoriaRelatorio.value.length > 0) {
      nextTick(() => {
        renderCategoryChart();
      });
    } else if (tipoRelatorio.value === 'evolucaoFinanceira' && evolucaoData.value.labels.length > 0) {
      nextTick(() => {
        renderEvolutionChart();
      });
    } else {
        if (currentChartInstance) {
            currentChartInstance.destroy();
            currentChartInstance = null;
        }
    }
  } else {
      if (currentChartInstance) {
          currentChartInstance.destroy();
          currentChartInstance = null;
      }
  }
}, { deep: true });

watch(tipoRelatorio, () => {
  if (currentChartInstance) {
    currentChartInstance.destroy();
    currentChartInstance = null;
  }

  gastosPorCategoriaRelatorio.value = [];
  totalSaidasRelatorio.value = 0;
  evolucaoData.value = { labels: [], entradas: [], saidas: [], saldo: [] };
  transacoesDetalhadas.value = [];
  totalEntradasDetalhado.value = 0;
  totalSaidasDetalhado.value = 0;
  saldoPeriodoDetalhado.value = 0;

  relatorioGerado.value = false;
});

const voltar = () => {
  router.back();
};
</script>

<style scoped>
body, html, #app {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f0f2f5;
    color: #333;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
}

.main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    padding: 20px 15px;
    box-sizing: border-box;
}

.content-card {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
    text-align: center;
    margin: 10px 0;
    box-sizing: border-box;
}

.title-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    margin-bottom: 25px;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    flex-grow: 1;
    text-align: center;
    transform: translateX(-15px);
}

.back-button {
    display: flex;
    border-radius: 50%;
    padding: 8px;
    min-width: 40px;
    min-height: 40px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    color: #555;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.back-button .material-icons {
    font-size: 24px;
}

.back-button:hover {
    background-color: #e0e0e0;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.back-button:active {
    background-color: #d0d0d0;
    box-shadow: none;
}

.section-title,
.section-title-small {
    font-weight: 600;
    color: #34495e;
    margin-bottom: 15px;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
}

.section-title {
    font-size: 1.4rem;
}

.section-title-small {
    font-size: 1.15rem;
    margin-top: 10px;
}

.filters-section {
    width: 100%;
    padding: 0 5px;
    text-align: left;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
}

.filter-group label {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    min-width: 70px;
    flex-shrink: 0;
}

.input-field,
.select-field {
    flex-grow: 1;
    padding: 10px 12px;
    border: 1px solid #c0c0c0;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    background-color: #fdfdfd;
    min-width: unset;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus,
.select-field:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
    outline: none;
}

.date-select-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.date-select-group label {
    min-width: unset;
    width: auto;
    white-space: nowrap;
    margin-right: 0;
}

.month-year-select {
    flex-grow: 1;
    flex-shrink: 1;
    width: auto;
    min-width: 90px;
    max-width: 120px;
    padding: 8px 10px;
    font-size: 0.95rem;
}

#ano.select-field {
    margin-left: 0;
}

#mes.select-field {
    margin-left: 0;
}

.intervalo-datas-filtro {
    display: flex;
    flex-direction: left;
    gap: 0.2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    background-color: #fdfdfd;
    box-sizing: border-box;
    width: calc(50% - 35px);
    max-width: 140px;
    margin-left: 0;
}

.filter-group span {
    font-size: 1rem;
    color: #555;
}

.small-input {
    max-width: 70px;
    text-align: center;
}

.btn {
    padding: 10px 22px;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.filled-button {
    background-color: #007bff;
    color: #ffffff;
    box-shadow: 0 3px 8px rgba(0, 123, 255, 0.25);
}

.filled-button:hover {
    background-color: #0056b3;
    box-shadow: 0 5px 12px rgba(0, 123, 255, 0.35);
}

.filled-button:active {
    background-color: #004085;
    box-shadow: none;
}

.text-button {
    background-color: transparent;
    color: #007bff;
    box-shadow: none;
    padding: 10px 15px;
}

.text-button:hover {
    background-color: rgba(0, 123, 255, 0.1);
}

.text-button:active {
    background-color: rgba(0, 123, 255, 0.15);
}

.text-button:disabled {
    color: #a0a0a0;
    cursor: not-allowed;
    background-color: transparent;
}

.text-button:disabled:hover {
    background-color: transparent;
}

.generate-button {
    width: 100%;
    margin-top: 25px;
    font-size: 1.05rem;
    padding: 12px 0;
}

.divider {
    border: 0;
    height: 1px;
    background-color: #e0e0e0;
    margin: 30px 0;
}

.loading-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #007bff;
    font-size: 1.05rem;
    font-weight: 500;
    margin-top: 25px;
}

.loading-message .spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.report-results-section {
    width: 100%;
    text-align: left;
    margin-top: 25px;
}

.chart-container {
    position: relative;
    width: 100%;
    max-width: 350px;
    height: 280px;
    margin: 25px auto;
}

.report-table-container {
    margin-top: 35px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.report-table-container h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
    padding: 15px 0 0;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    background-color: #ffffff;
    overflow: hidden;
}

.data-table th,
.data-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    font-size: 0.9rem;
}

.data-table th {
    background-color: #f8f8f8;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
}

.data-table tbody tr:last-child td {
    border-bottom: none;
}

.data-table tfoot td {
    background-color: #e9ecef;
    font-weight: 700;
    color: #333;
    border-top: 1px solid #ddd;
    padding: 15px;
}

.data-table .positivo {
    color: #28a745;
    font-weight: 600;
}

.data-table .negativo {
    color: #dc3545;
    font-weight: 600;
}

.no-items-message {
    color: #6c757d;
    font-style: italic;
    margin-top: 25px;
    text-align: center;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #e9ecef;
}

.error-message {
    color: #dc3545;
    margin-top: 25px;
    text-align: center;
    font-weight: 500;
    padding: 10px;
    background-color: #ffebeb;
    border: 1px solid #ffccdd;
    border-radius: 8px;
}

.export-buttons-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-top: 35px;
    padding: 0 10px;
}

.export-button {
    flex-grow: 1;
    max-width: 180px;
}

@media (max-width: 480px) {
    .content-card {
        padding: 15px;
    }

    .title {
        font-size: 1.8rem;
    }

    .back-button {
        min-width: 36px;
        min-height: 36px;
        padding: 6px;
    }

    .back-button .material-icons {
        font-size: 22px;
    }

    .section-title {
        font-size: 1.3rem;
    }

    .section-title-small {
        font-size: 1.05rem;
    }

    .filter-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .filter-group label {
        min-width: unset;
        width: 100%;
        text-align: left;
    }

    .input-field,
    .select-field {
        width: 100%;
        max-width: none;
    }

    .date-select-group {
        flex-direction: column;
        width: 100%;
    }
    
    .date-select-group label {
        width: auto;
    }

    .intervalo-datas-filtro {
        width: 50%;
        max-width: none;
    }

    .small-input {
        max-width: 100px;
    }

    .btn {
        padding: 8px 18px;
        font-size: 0.95rem;
    }

    .generate-button {
        padding: 10px 0;
    }

    .data-table th,
    .data-table td {
        padding: 10px 12px;
        font-size: 0.85rem;
    }

    .data-table tfoot td {
        padding: 12px;
    }

    .export-buttons-container {
        flex-direction: column;
        align-items: center;
    }

    .export-button {
        width: 100%;
        max-width: 250px;
    }
}

@media (max-width: 360px) {
    .title {
        font-size: 1.6rem;
    }

    .content-card {
        padding: 12px;
    }

    .filter-group {
        margin-bottom: 15px;
    }

    .input-field,
    .select-field {
        font-size: 0.9rem;
        padding: 8px 10px;
    }

    .month-year-select {
        font-size: 0.85rem;
    }
}
</style>