import streamlit as st
import bcrypt
import pandas as pd
from auth import (
    exige_login,
    usuario_logado,
    encerrar_sessao,
)  # Ajustado para o nome correto
from database import query, execute
from ui import inject_global_style, page_header, render_sidebar

# Garante que o usuário está autenticado
exige_login()

st.set_page_config(
    page_title="Meu Perfil · Hocta Conecta", page_icon="👤", layout="wide"
)

inject_global_style()
render_sidebar()
st.markdown(
    """
    <style>
    /* ── FORÇAR MENU LATERAL (SIDEBAR) AZUL ────────────────────── */
    [data-testid="stSidebar"] {
        background-color: #0d3c78 !important;
        background-image: linear-gradient(180deg, #1558a8 0%, #0d3c78 100%) !important;
    }
    
    /* Forçar todos os textos gerais e ícones dentro do menu lateral a ficarem brancos */
    [data-testid="stSidebar"] *, 
    [data-testid="stSidebar"] p, 
    [data-testid="stSidebar"] span, 
    [data-testid="stSidebar"] a {
        color: #ffffff !important;
    }

    /* ── CORREÇÃO PARA O ITEM SELECIONADO / COM FOCO ──────────── */
    /* Quando um item do menu nativo do Streamlit é selecionado, ele ganha um fundo branco.
       Precisamos de forçar o texto desse item específico a ficar escuro para dar leitura! */
    [data-testid="stSidebarNav"] data-testid="stSidebarNavLinkActive",
    [data-testid="stSidebarNav"] li[aria-selected="true"] a *,
    [data-testid="stSidebarNav"] a[aria-current="page"] *,
    div[data-testid="stSidebarNav"] ul li div[data-selected="true"] span,
    .st-emotion-cache-17l7u59 { /* Classes dinâmicas do Streamlit para o item ativo */
        color: #0d3c78 !important; /* Texto azul escuro sobre o fundo branco de foco */
    }

    /* Mudar a cor de fundo quando passar o rato por cima dos itens do menu (Hover) */
    [data-testid="stSidebar"] a:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px;
    }
    
    [data-testid="stSidebar"] a:hover * {
        color: #ffffff !important;
    }

    /* ── CORES GLOBAIS DO CONTEÚDO (VARIÁVEIS) ────────────────── */
    :root {
        --c-primary: #1558a8;
        --c-primary-lt: #eef4fc;
        --c-surface: #ffffff;
        --c-outline: #e8eaed;
        --c-text: #202124;
        --c-text-2: #5f6368;
        --c-green: #1e8e3e;
        --c-orange: #f29900;
        --c-red: #d93025;
    }

    .md-card-sub {
        font-size: 0.78rem; color: var(--c-green);
        margin-top: 6px; font-weight: 500;
    }
    .md-card-sub.warn { color: var(--c-orange); }
    .md-card-sub.err  { color: var(--c-red); }

    /* ── Section title ────────────────────────────────────────── */
    .md-section {
        font-family: 'Google Sans', sans-serif;
        font-size: 1rem; font-weight: 600;
        color: var(--c-text); margin: 20px 0 12px 0;
        display: flex; align-items: center; gap: 8px;
    }
    .md-section::after {
        content: ''; flex: 1; height: 1px;
        background: var(--c-outline); margin-left: 8px;
    }

    /* ── Banner ───────────────────────────────────────────────── */
    .hocta-banner {
        background: linear-gradient(135deg, #1558a8 0%, #0d3c78 60%, #071e42 100%);
        border-radius: 12px; padding: 20px 28px; color: white;
        margin-bottom: 20px; display: flex; align-items: center; gap: 16px;
    }

    /* ── Follow-up card ───────────────────────────────────────── */
    .fu-card {
        background: var(--c-surface);
        border: 1px solid var(--c-outline);
        border-radius: 10px; padding: 10px 14px; margin-bottom: 6px;
        display: flex; align-items: flex-start; gap: 10px;
    }
    .fu-dot { font-size: 1.1rem; margin-top: 1px; }
    .fu-name { font-weight: 600; font-size: 0.86rem; color: var(--c-text); }
    .fu-sub  { font-size: 0.76rem; color: var(--c-text-2); margin-top: 1px; }

    /* ── Progress bar ─────────────────────────────────────────── */
    .md-progress-wrap {
        background: #e8eaed; border-radius: 20px; height: 10px;
        overflow: hidden; margin-bottom: 4px;
    }
    .md-progress-bar {
        height: 100%; border-radius: 20px;
        transition: width 0.5s ease;
    }
    .md-chip {
        display: inline-flex; align-items: center; gap: 4px;
        background: var(--c-primary-lt); color: var(--c-primary);
        border-radius: 50px; padding: 3px 10px;
        font-size: 0.76rem; font-weight: 600;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Busca e define a variável 'user'
user = usuario_logado()

page_header(
    "Meu Perfil",
    "Seu painel pessoal com preferências, senha e atividade recente",
    "Conta",
)

col1, col2 = st.columns([1, 1])

# ── Dados do usuário ──────────────────────────────────────────
with col1:
    st.subheader("Seus dados")
    st.markdown(f"**Nome:** {user['nome']}")
    st.markdown(f"**E-mail:** {user['email']}")
    st.markdown(f"**Perfil:** {user['perfil'].capitalize()}")

    projetos_vinc = []
    if user["perfil"] == "executivo":
        projetos_vinc = query(
            """
            SELECT pj.nome, pj.status
            FROM projetos pj
            JOIN executivo_projeto ep ON ep.projeto_id = pj.id
            WHERE ep.executivo_id = ?
            ORDER BY pj.status, pj.nome
        """,
            (user["id"],),
        )
        if projetos_vinc:
            st.markdown("**Projetos vinculados:**")
            for p in projetos_vinc:
                st.markdown(f"- {p['nome']} *({p['status']})*")


# ── Alterar senha ────────────────────────────────────────────
with col2:
    st.subheader("Alterar Senha")
    with st.form("form_trocar_senha", clear_on_submit=True):
        senha_atual = st.text_input("Senha atual", type="password")
        nova_senha = st.text_input(
            "Nova senha", type="password", placeholder="Mínimo 6 caracteres"
        )
        confirma = st.text_input("Confirmar nova senha", type="password")
        salvar = st.form_submit_button("Atualizar Senha", use_container_width=True)

    if salvar:
        if not senha_atual or not nova_senha or not confirma:
            st.error("Preencha todos os campos.")
        elif len(nova_senha) < 6:
            st.error("A nova senha deve ter ao menos 6 caracteres.")
        elif nova_senha != confirma:
            st.error("Nova senha e confirmação não coincidem.")
        else:
            dados = query("SELECT senha_hash FROM usuarios WHERE id=?", (user["id"],))
            hash_atual = dados[0]["senha_hash"]
            if not bcrypt.checkpw(senha_atual.encode(), hash_atual.encode()):
                st.error("Senha atual incorreta.")
            else:
                novo_hash = bcrypt.hashpw(
                    nova_senha.encode(), bcrypt.gensalt()
                ).decode()
                execute(
                    "UPDATE usuarios SET senha_hash=? WHERE id=?",
                    (novo_hash, user["id"]),
                )
                st.success("Senha atualizada com sucesso! Faça login novamente.")
                encerrar_sessao()  # Ajustado para usar a função correta do seu auth.py
                st.rerun()

# ── Resumo de atividade ───────────────────────────────────────
st.divider()
st.subheader("Sua Atividade Recente")

if user["perfil"] in ("admin", "executivo"):
    interacoes_recentes = query(
        """
        SELECT i.data_hora, i.canal, i.tipo, pr.razao_social, pj.nome AS projeto
        FROM interacoes i
        JOIN prospeccoes p ON p.id = i.prospeccao_id
        JOIN prestadores pr ON pr.id = p.prestador_id
        JOIN projetos pj ON pj.id = p.projeto_id
        WHERE i.executivo_id = ?
        ORDER BY i.data_hora DESC
        LIMIT 10
    """,
        (user["id"],),
    )

    TIPO_LABEL = {
        "tentativa_contato": "Tentativa de Contato",
        "contato_estabelecido": "Contato Estabelecido",
        "envio_proposta": "Envio de Proposta",
        "negociacao": "Negociação",
        "follow_up": "Follow-up",
        "contrato_enviado": "Contrato Enviado",
        "contrato_assinado": "Contrato Assinado",
        "outro": "Outro",
    }

    if interacoes_recentes:
        df = pd.DataFrame(interacoes_recentes)
        df["tipo"] = df["tipo"].map(TIPO_LABEL).fillna(df["tipo"])
        df["canal"] = df["canal"].str.capitalize()
        df["data_hora"] = df["data_hora"].str[:16]
        df.columns = ["Data/Hora", "Canal", "Tipo", "Prestador", "Projeto"]
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("Nenhuma interação registrada ainda.")

    col_m1, col_m2, col_m3 = st.columns(3)
    total_int = query(
        "SELECT COUNT(*) AS n FROM interacoes WHERE executivo_id=?", (user["id"],)
    )[0]["n"]
    total_prosp = query(
        "SELECT COUNT(*) AS n FROM prospeccoes WHERE executivo_id=?", (user["id"],)
    )[0]["n"]
    total_cred = query(
        "SELECT COUNT(*) AS n FROM prospeccoes WHERE executivo_id=? AND etapa='credenciado'",
        (user["id"],),
    )[0]["n"]
    col_m1.metric("Total de Interações", total_int)
    col_m2.metric("Prospecções Iniciadas", total_prosp)
    col_m3.metric("Prestadores Credenciados", total_cred)
