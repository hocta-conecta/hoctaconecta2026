import streamlit as st

from database import setup_database
from auth import login, iniciar_sessao, usuario_logado

# ── Setup Inicial ──────────────────────────────────────────────
setup_database()

st.set_page_config(
    page_title="Hocta Conecta",
    page_icon="🔗",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── CSS Customizado (Tela de Login) ───────────────────────────────
st.markdown(
    """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        html, body, [class*="css"], .stApp {
            font-family: 'Inter', sans-serif !important;
            background-color: #F8FAFC !important;
        }

        [data-testid='stSidebar'] { display: none !important; }
        [data-testid='collapsedControl'] { display: none !important; }
        [data-testid="stHeader"] { background: transparent !important; }
    </style>
    """,
    unsafe_allow_html=True,
)


# ── Tela de Login ─────────────────────────────────────────────
user_session = usuario_logado()

if user_session:
    st.switch_page("pages/01_dashboard.py")
else:
    col1, col2, col3 = st.columns([1, 1.8, 1])
    with col2:
        st.markdown(
            """
            <div style="text-align:center; padding: 4rem 0 2rem 0;">
                <h1 style="color:#1E6B8A; font-size:2.5rem; font-weight:700; margin-bottom:0.5rem;">🔗 Hocta Conecta</h1>
                <p style="color:#64748b; font-size:1.1rem;">Gestão de Rede Prestadora</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        with st.form("form_login", clear_on_submit=False):
            email = st.text_input("E-mail", placeholder="seu@email.com.br")
            senha = st.text_input("Senha", type="password", placeholder="••••••••")
            entrar = st.form_submit_button(
                "Entrar no Sistema", use_container_width=True
            )

        if entrar:
            if not email or not senha:
                st.warning("Preencha e-mail e senha.")
            else:
                user = login(email.strip().lower(), senha)
                if user:
                    iniciar_sessao(user)
                    st.switch_page("pages/01_dashboard.py")
                else:
                    st.error("E-mail ou senha incorretos.")
