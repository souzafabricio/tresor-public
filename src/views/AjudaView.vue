<template>
  <div class="main-container">
    <div class="content-card">

      <!-- Cabeçalho padronizado -->
      <div class="title-row">
        <button @click="voltar" class="back-button" aria-label="Voltar">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="title">Ajuda</h1>
      </div>

      <p class="intro-text text-on-surface-variant">
        Bem-vindo ao guia de ajuda do seu sistema financeiro! Aqui você encontrará informações sobre como utilizar cada funcionalidade para gerir as suas finanças de forma eficaz.
      </p>

      <div class="help-section">
        <h2 class="section-title"><span class="material-icons section-icon">trending_up</span> Lançamentos</h2>
        <p>Registe todas as suas entradas e saídas de dinheiro. Essencial para ter controle sobre cada transação.</p>
        <ul class="feature-list">
          <li><strong>Adicionar Lançamento:</strong> Clique em "Adicionar Lançamento", preencha o nome, valor (use negativo para saídas), data, descrição e selecione uma categoria. Pode adicionar observações.</li>
          <li><strong>Editar/Excluir:</strong> Clique num lançamento na lista para abrir o modo de edição. Aqui pode atualizar os dados ou excluí-lo permanentemente.</li>
          <li><strong>Navegação Mensal:</strong> Utilize as setas no topo para navegar entre os meses e ver os lançamentos de períodos específicos.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2 class="section-title"><span class="material-icons section-icon">dashboard</span> Dashboard</h2>
        <p>Tenha uma visão geral das suas finanças com resumos e gráficos interativos.</p>
        <ul class="feature-list">
          <li><strong>Totais do Mês:</strong> Veja rapidamente o total das suas entradas, saídas e o saldo atual do mês.</li>
          <li><strong>Meta de Gasto:</strong> Toque no valor da "Meta de Gasto" para editar e definir um limite mensal para as suas despesas. O sistema irá mostrar o quanto já gastou e o que resta.</li>
          <li><strong>Gastos por Categoria:</strong> Visualize como o seu dinheiro está a ser distribuído entre as diferentes categorias.</li>
          <li><strong>Evolução Mensal:</strong> O gráfico mostra a evolução das suas entradas e saídas nos últimos meses, ajudando-o(a) a identificar tendências.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2 class="section-title"><span class="material-icons section-icon">credit_card</span> Cartões</h2>
        <p>Registe e organize os seus cartões de crédito e débito.</p>
        <ul class="feature-list">
          <li><strong>Cadastrar Novo Cartão:</strong> Adicione os dados do seu cartão, como banco, dia de fecho e dia de vencimento da fatura.</li>
          <li><strong>Excluir Cartão:</strong> Ao excluir um cartão, note que todas as faturas e itens de fatura a ele relacionados serão permanentemente removidos.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2 class="section-title"><span class="material-icons section-icon">receipt_long</span> Faturas</h2>
        <p>Acompanhe e gira as suas faturas de cartão de crédito.</p>
        <ul class="feature-list">
          <li><strong>Listar Faturas:</strong> Veja todas as faturas associadas aos seus cartões.</li>
          <li><strong>Gestão de Itens:</strong> Dentro de cada fatura, poderá adicionar, editar e excluir itens relacionados a compras e pagamentos.</li>
          <li><strong>Status da Fatura:</strong> Acompanhe o valor total da fatura e o que já foi pago.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2 class="section-title"><span class="material-icons section-icon">info</span> Dicas Gerais</h2>
        <ul class="feature-list">
          <li><strong>Controle Diário:</strong> Registe os seus gastos assim que ocorrem para manter os seus dados sempre atualizados.</li>
          <li><strong>Categorização:</strong> Use as categorias de forma consistente para obter insights precisos sobre os seus hábitos de consumo.</li>
          <li><strong>Metas Realistas:</strong> Defina metas de gasto que sejam alcançáveis para se manter motivado(a).</li>
        </ul>
      </div>

      <button @click="voltar" class="btn filled-button back-to-home-button">
        <span class="material-icons">home</span> Voltar à Tela Inicial
      </button>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * Navega de volta para a tela inicial.
 */
const voltar = () => {
  router.push('/home'); // Assumindo que sua tela inicial é '/home'
};
</script>

<style scoped>
/*
 * IMPORTANTE:
 * Os estilos globais do tema (variáveis de cor como `--md-sys-color-primary`,
 * e estilos para `body`, `html`, `#app`)
 * FORAM REMOVIDOS DESTE ARQUIVO.
 * Eles devem estar em um arquivo CSS GLOBAL (ex: `src/assets/main.css`)
 * e importados no seu `main.js` ou `App.vue`.
 *
 * Este bloco `<style scoped>` contém APENAS os estilos específicos da AjudaView.
 */

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Alinhado ao topo para conteúdo longo */
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--md-sys-color-background); /* Usa variável global */
  font-family: 'Roboto', sans-serif;
  overflow-y: auto; /* Permite rolagem se o conteúdo for muito longo */
}

.content-card {
  width: 100%;
  max-width: 380px; /* Consistente com HomeView */
  box-sizing: border-box;
  padding: 24px; /* Padding interno do card */
  border-radius: 18px; /* Arredondamento do card */
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1); /* Sombra suave */
  background-color: var(--md-sys-color-surface-container-high); /* Cor de superfície do card */
  color: var(--md-sys-color-on-surface); /* Cor padrão do texto no card */
  margin: 1rem 0; /* Margem superior e inferior */
  text-align: center;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 24px; /* Espaço após o título */
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--md-sys-color-on-background);
  margin: 0;
  flex-grow: 1;
  text-align: center;
  transform: translateX(-25px); /* Ajusta para centralizar o título */
}

.back-button {
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  border-radius: 10px;
  width: 15%; /* Tamanho fixo */
  height: 40px; /* Tamanho fixo */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.back-button .material-icons {
  font-size: 24px;
}

.back-button:hover {
  background-color: var(--md-sys-color-surface-container);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.intro-text {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 32px;
  color: var(--md-sys-color-on-surface-variant);
  text-align: left;
}

.help-section {
  text-align: left;
  margin-bottom: 32px; /* Espaço entre as seções */
  background-color: var(--md-sys-color-surface-container-low); /* Fundo leve para a seção */
  padding: 16px;
  border-radius: 12px;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.03); /* Sombra interna sutil */
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--md-sys-color-primary); /* Cor primária para o título da seção */
  margin-bottom: 12px;
}

.section-icon {
  font-size: 28px;
}

.help-section p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 12px;
}

.feature-list {
  list-style: none; /* Remove bullet padrão */
  padding: 0;
  margin: 0;
}

.feature-list li {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.feature-list li strong {
  color: var(--md-sys-color-on-surface);
}

.feature-list li::before {
  content: '•'; /* Bullet personalizado */
  color: var(--md-sys-color-secondary); /* Cor do bullet */
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

/* Estilos de Botões (reutilizados do HomeView) */
.btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 10px; /* Consistente com 10px */
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.filled-button {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.filled-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  transform: translateY(-3px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.filled-button:active {
  background-color: var(--md-sys-color-on-primary);
  transform: translateY(0);
  box-shadow: none;
}

.back-to-home-button {
    margin-top: 24px; /* Espaçamento antes do botão final */
}

/* Media Query para telas menores */
@media (max-width: 400px) {
  .content-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    padding: 16px; /* Ajusta padding para telas muito pequenas */
  }

  .title {
    font-size: 1.7rem;
  }

  .intro-text, .help-section p, .feature-list li {
    font-size: 0.9rem;
  }
}
</style>
