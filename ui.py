import streamlit as st
from datetime import date
from auth import usuario_logado, encerrar_sessao
from database import query


def inject_global_style():
    """Injeta um CSS limpo, profissional e sem travar a renderização do app."""
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
            --bg-principal:      #f8fafc;
            --cor-superficie:    #ffffff;
            --cor-borda:         #e2e8f0;
            --cor-primaria:      #1e40af;
            --cor-primaria-soft: #eff6ff;
            --cor-texto:         #0f172a;
            --cor-texto-mutado:  #64748b;
            --radius-md:         12px;
        }

        /* Ajuste de fontes e fundo global */
        html, body, [class*="css"], [data-testid="stAppViewContainer"] {
            font-family: 'Inter', sans-serif !important;
            color: var(--cor-texto) !important;
            background-color: var(--bg-principal) !important;
        }

        /* Container Principal do Conteúdo */
        .main .block-container {
            max-width: 1300px;
            padding-top: 2.5rem !important;
            padding-bottom: 3rem !important;
        }

        /* Oculta de forma limpa elementos nativos indesejados (sem quebrar botões de fechar) */
        #MainMenu, footer, header { visibility: hidden; }
        [data-testid="stSidebarNav"] { display: none; }

        /* Customização Elegante da Barra Lateral (Sidebar) */
        [data-testid="stSidebar"] {
            background-color: var(--cor-superficie) !important;
            border-right: 1px solid var(--cor-borda) !important;
        }
        
        /* Links das Páginas no Menu */
        [data-testid="stSidebar"] .stPageLink a {
            border-radius: 8px !important;
            padding: 10px 16px !important;
            font-size: 0.92rem !important;
            font-weight: 500 !important;
            color: var(--cor-texto-mutated) !important;
            transition: all 0.15s ease !important;
            margin-bottom: 4px !important;
            text-decoration: none !important;
        }
        [data-testid="stSidebar"] .stPageLink a:hover {
            background-color: var(--cor-primaria-soft) !important;
            color: var(--cor-primaria) !important;
        }
        /* Item Ativo (Página Atual) */
        [data-testid="stSidebar"] [aria-current="page"] a,
        [data-testid="stSidebar"] .stPageLink a[aria-current="page"] {
            background-color: var(--cor-primaria) !important;
            color: white !important;
        }

        /* Elementos de Informação do Usuário */
        .user-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 4px 8px;
            margin-bottom: 8px;
        }
        .user-avatar {
            width: 38px; height: 38px; border-radius: 50%;
            background-color: var(--cor-primaria);
            color: white; font-weight: 600; font-size: 1rem;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }

        /* Botão Sair Minimalista */
        .stButton > button {
            border-radius: 8px !important;
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            font-size: 0.9rem !important;
            border: 1px solid var(--cor-borda) !important;
            background-color: transparent !important;
            color: #ef4444 !important;
            transition: all 0.2s ease !important;
        }
        .stButton > button:hover {
            background-color: #fef2f2 !important;
            border-color: #fca5a5 !important;
        }

        /* Refatoração do Card do Topo da Página */
        .page-header-container {
            background: var(--cor-superficie) !important;
            border: 1px solid var(--cor-borda) !important;
            border-radius: var(--radius-md) !important;
            padding: 24px 32px;
            margin-bottom: 28px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .page-header-container h1 {
            margin: 0 0 4px 0 !important;
            font-size: 1.85rem !important;
            font-weight: 700 !important;
            color: var(--cor-texto) !important;
            letter-spacing: -0.02em;
        }
        .page-header-container p {
            margin: 0 !important;
            color: var(--cor-texto-mutado) !important;
            font-size: 0.95rem !important;
        }
        .page-header-badge {
            display: inline-flex;
            background-color: var(--cor-primaria-soft);
            color: var(--cor-primaria);
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_sidebar():
    user = usuario_logado()
    if not user:
        return

    inject_global_style()

    with st.sidebar:
        # Card de Usuário
        inicial = user["nome"][0].upper() if user.get("nome") else "U"
        st.markdown(
            f"""
        <div class="user-card">
            <div class="user-avatar">{inicial}</div>
            <div>
                <div style="font-weight: 600; font-size: 0.9rem; color: var(--cor-texto); line-height: 1.2;">{user['nome']}</div>
                <div style="font-size: 0.72rem; color: var(--cor-texto-mutado); text-transform: uppercase; margin-top: 2px;">{user['perfil']}</div>
            </div>
        </div>
        """,
            unsafe_allow_html=True,
        )

        st.divider()

        # Itens de Menu (Links das Páginas)
        st.page_link("pages/01_dashboard.py", label="Dashboard", icon="📊")
        st.page_link("pages/02_prospeccao.py", label="Prospecção", icon="🎯")
        st.page_link("pages/03_prestadores.py", label="Prestadores", icon="🏥")

        if user["perfil"] in ("admin", "executivo"):
            st.page_link("pages/04_projetos.py", label="Projetos", icon="📁")

        if user["perfil"] == "admin":
            st.page_link("pages/05_admin.py", label="Administração", icon="⚙️")

        st.divider()
        st.page_link("pages/06_meu_perfil.py", label="Meu Perfil", icon="👤")

        if st.button("↩ Sair", use_container_width=True):
            encerrar_sessao()
            st.rerun()

        # Consultas de Alertas/Follow-ups
        hoje = date.today().isoformat()
        base_sql = """
            SELECT COUNT(DISTINCT i.prospeccao_id) AS n
            FROM interacoes i
            JOIN prospeccoes p ON p.id = i.prospeccao_id
            WHERE i.data_followup {op} ?
              AND p.etapa NOT IN ('credenciado','declinado')
        """
        if user["perfil"] == "admin":
            vencidos = query(base_sql.format(op="<"), (hoje,))
            hoje_q = query(base_sql.format(op="="), (hoje,))
        else:
            exec_sql = base_sql + "  AND i.executivo_id = ?"
            vencidos = query(exec_sql.format(op="<"), (hoje, user["id"]))
            hoje_q = query(exec_sql.format(op="="), (hoje, user["id"]))

        n_venc = vencidos[0]["n"] if vencidos else 0
        n_hoje = hoje_q[0]["n"] if hoje_q else 0

        if n_venc > 0:
            st.error(f"⚠️ {n_venc} follow-up(s) vencido(s)!")
        if n_hoje > 0:
            st.warning(f"📅 {n_hoje} vencem hoje")


def page_header(title: str, subtitle: str = None, badge: str = None):
    badge_html = f'<div class="page-header-badge">{badge}</div>' if badge else ""
    subtitle_html = f"<p>{subtitle}</p>" if subtitle else ""
    st.markdown(
        f"""
        <div class="page-header-container">
            {badge_html}
            <h1>{title}</h1>
            {subtitle_html}
        </div>
        """,
        unsafe_allow_html=True,
    )
