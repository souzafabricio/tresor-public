<template>
    <div class="main-container">
        <div class="content-card">
            <h1 class="title">Sobre o Sistema</h1>
            <p class="about-text">
                Este sistema foi desenvolvido para facilitar o controle financeiro pessoal, permitindo o cadastro de
                cartões, lançamentos, visualização de faturas e acompanhamento de dashboards.<br><br>
                <strong>Principais funcionalidades:</strong>
            <ul>
                <li>Cadastro e gerenciamento de cartões</li>
                <li>Lançamentos de receitas e despesas</li>
                <li>Visualização de faturas mensais</li>
                <li>Dashboard com resumo financeiro</li>
                <li>Login seguro com autenticação</li>
            </ul>
            <br>
            Desenvolvido por <strong>Fabrício Fonseca</strong>.<br>
            <span class="versao-contato">
                Versão 1.0.0
                <a href="mailto:fabriciosouzafonsecalu93@gmail.com" class="contato-link">
                    <span class="material-icons">email</span>
                    Contato
                </a>
            </span>
            </p>
            <button class="back-button" @click="$router.back()">
                Voltar
            </button>
        </div>
    </div>
</template>
<style scoped>
.main-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
}

.content-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 32px 24px;
    max-width: 420px;
    width: 80%;
    height: 500px;
    text-align: center;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    color: #333;
}

.about-text {
    font-size: 1.05rem;
    color: #444;
    margin-bottom: 2rem;
    text-align: left;
}

ul {
    margin: 0.5rem 0 0.5rem 1.2rem;
    padding: 0;
    color: #444;
}

.back-button {
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface-variant);
    border-radius: 10px;
    width: 20%;
    /* Tamanho fixo */
    height: 40px;
    /* Tamanho fixo */
    font-size: 1rem;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.back-button:hover {
    background-color: var(--md-sys-color-surface-container);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.versao-contato {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Centraliza horizontalmente */
    gap: 10px;
    margin-top: 0.2rem;
    width: 100%;
    text-align: center;
}

.contato-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #1976d2;
    font-weight: 500;
    font-size: 1rem;
    text-decoration: none;
    transition: color 0.2s;
    margin: 0;
    /* Remove margens extras */
}

.contato-link .material-icons {
    font-size: 20px;
}

.contato-link:hover {
    color: #1256a3;
    text-decoration: underline;
}
</style>