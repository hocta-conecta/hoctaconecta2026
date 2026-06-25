import bcrypt
import streamlit as st
from database import query


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha_plana.encode(), senha_hash.encode())


def login(email: str, senha: str):
    """Autentica usuário. Retorna dict do usuário ou None."""
    rows = query(
        "SELECT * FROM usuarios WHERE email = ? AND ativo = 1",
        (email,)
    )
    if not rows:
        return None
    user = rows[0]
    if verificar_senha(senha, user["senha_hash"]):
        return user
    return None


def iniciar_sessao(user: dict):
    st.session_state["usuario"] = user


def encerrar_sessao():
    st.session_state.pop("usuario", None)


def usuario_logado():
    return st.session_state.get("usuario")


def exige_login():
    """Bloqueia a página se não estiver logado e redireciona para o login."""
    if not usuario_logado():
        st.switch_page("app.py")
        st.stop()


def exige_perfil(*perfis):
    """Bloqueia se o perfil do usuário não estiver na lista permitida."""
    user = usuario_logado()
    if not user or user["perfil"] not in perfis:
        st.error("Voce nao tem permissao para acessar esta area.")
        st.stop()


def perfil_atual():
    user = usuario_logado()
    return user["perfil"] if user else None


def is_admin():
    return perfil_atual() == "admin"


def is_executivo():
    return perfil_atual() == "executivo"


def is_cliente():
    return perfil_atual() == "cliente"
