import streamlit as st
import pandas as pd
from difflib import SequenceMatcher
from auth import exige_login, exige_perfil, usuario_logado, is_admin
from database import (
    query,
    execute,
    normaliza_municipio,
    normaliza_texto,
    normaliza_campo,
)
from ui import inject_global_style, page_header, render_sidebar


def _similares(nome: str, cidade: str, threshold: float = 0.72):
    """Retorna prestadores com nome parecido na mesma cidade ou sem cidade filtrada."""
    todos = query(
        "SELECT id, razao_social, cidade, uf, telefone, cnpj FROM prestadores ORDER BY razao_social"
    )
    nome_n = normaliza_texto(nome)
    resultado = []
    for p in todos:
        p_nome = normaliza_texto(p["razao_social"] or "")
        ratio = SequenceMatcher(None, nome_n, p_nome).ratio()
        substr = nome_n in p_nome or p_nome in nome_n
        if ratio >= threshold or substr:
            resultado.append({**p, "similaridade": round(ratio * 100)})
    resultado.sort(key=lambda x: x["similaridade"], reverse=True)
    return resultado


exige_login()
exige_perfil("admin", "executivo")

st.set_page_config(
    page_title="Prestadores · Hocta Conecta", page_icon="🏥", layout="wide"
)

inject_global_style()
render_sidebar()

page_header(
    "Prestadores",
    "Cadastre e monitore a rede de serviços com clareza e confiança",
    "Rede de Parceiros",
)

user = usuario_logado()

TIPOS = {
    "consultorio": "Consultório",
    "clinica_medica": "Clínica Médica",
    "clinica_nao_medica": "Clínica Não Médica",
    "laboratorio": "Laboratório",
    "servico_imagem": "Serviço de Imagem",
    "policlinica": "Policlínica",
    "Hospitais": "Hospitais",
    "Serviços de Anestesiologia": "Serviços de Anestesiologia"
    "outro": "Outro",
}

UFS = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
]

ESPECIALIDADES = [
    "Acupuntura",
    "Alergia E Imunologia",
    "Anestesiologia",
    "Angiologia",
    "Cardiologia",
    "Cirurgia Cardiovascular",
    "Cirurgia Geral",
    "Cirurgia Pediatrica",
    "Cirurgia Plastica",
    "Cirurgia Toracica",
    "Cirurgia Vascular",
    "Clinica Medica",
    "Coloproctologia",
    "Dermatologia",
    "Endocrinologia",
    "Endoscopia",
    "Gastroenterologia",
    "Geriatria",
    "Ginecologia E Obstetricia",
    "Hematologia",
    "Infectologia",
    "Mastologia",
    "Medicina Do Trabalho",
    "Medicina De Familia",
    "Medicina Esportiva",
    "Medicina Intensiva",
    "Medicina Nuclear",
    "Nefrologia",
    "Neurologia",
    "Neurocirurgia",
    "Nutricao",
    "Oftalmologia",
    "Oncologia",
    "Ortopedia E Traumatologia",
    "Otorrinolaringologia",
    "Patologia",
    "Pediatria",
    "Pneumologia",
    "Psicologia",
    "Psiquiatria",
    "Radiologia E Diagnostico Por Imagem",
    "Reumatologia",
    "Urologia",
    "Analises Clinicas (Lab)",
    "Anatomia Patologica",
    "Fisioterapia",
    "Fonoaudiologia",
    "Nutricao Clinica",
    "Odontologia",
    "Terapia Ocupacional",
    "Outra",
]

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

tab_lista, tab_novo, tab_especialidades, tab_importar = st.tabs(
    [
        "Buscar Prestadores",
        "Cadastrar Prestador",
        "Especialidades por Prestador",
        "📥 Importar Planilha",
    ]
)


# ── ABA: LISTA ────────────────────────────────────────────────
with tab_lista:
    POR_PAGINA = 10

    if "prest_pagina" not in st.session_state:
        st.session_state["prest_pagina"] = 0
    if "prest_selecionado" not in st.session_state:
        st.session_state["prest_selecionado"] = None

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        busca = st.text_input(
            "Buscar por nome / CNPJ",
            placeholder="Digite para filtrar...",
            key="busca_prest",
        )
    with col2:
        filtro_tipo = st.selectbox(
            "Tipo", ["Todos"] + list(TIPOS.values()), key="filtro_tipo_prest"
        )
    with col3:
        filtro_uf = st.selectbox("UF", ["Todas"] + UFS, key="filtro_uf_prest")
    with col4:
        filtro_esp = st.selectbox(
            "Especialidade", ["Todas"] + ESPECIALIDADES, key="filtro_esp_prest"
        )

    filtro_hash = f"{busca}{filtro_tipo}{filtro_uf}{filtro_esp}"
    if st.session_state.get("_filtro_hash") != filtro_hash:
        st.session_state["prest_pagina"] = 0
        st.session_state["prest_selecionado"] = None
        st.session_state["_filtro_hash"] = filtro_hash

    prestadores = query("SELECT * FROM prestadores ORDER BY razao_social")

    if busca:
        busca_n = normaliza_texto(busca)
        prestadores = [
            p
            for p in prestadores
            if busca_n in normaliza_texto(p["razao_social"])
            or (p["cnpj"] and busca in p["cnpj"])
            or (p["nome_fantasia"] and busca_n in normaliza_texto(p["nome_fantasia"]))
        ]
    if filtro_tipo != "Todos":
        tipo_key = next((k for k, v in TIPOS.items() if v == filtro_tipo), None)
        if tipo_key:
            prestadores = [p for p in prestadores if p["tipo"] == tipo_key]
    if filtro_uf != "Todas":
        prestadores = [p for p in prestadores if p["uf"] == filtro_uf]
    if filtro_esp != "Todas":
        ids_com_esp = {
            r["prestador_id"]
            for r in query(
                "SELECT prestador_id FROM prestador_especialidades WHERE especialidade = ?",
                (filtro_esp,),
            )
        }
        prestadores = [p for p in prestadores if p["id"] in ids_com_esp]

    total = len(prestadores)
    total_pags = max(1, -(-total // POR_PAGINA))
    pagina = min(st.session_state["prest_pagina"], total_pags - 1)
    inicio = pagina * POR_PAGINA
    prest_pagina = prestadores[inicio : inicio + POR_PAGINA]

    cab1, cab2 = st.columns([3, 1])
    with cab1:
        st.caption(f"{total} prestador(es) · página {pagina + 1} de {total_pags}")
    with cab2:
        nav1, nav2 = st.columns(2)
        with nav1:
            if st.button(
                "◀ Anterior",
                disabled=pagina == 0,
                use_container_width=True,
                key="pag_ant",
            ):
                st.session_state["prest_pagina"] -= 1
                st.session_state["prest_selecionado"] = None
                st.rerun()
        with nav2:
            if st.button(
                "Próxima ▶",
                disabled=pagina >= total_pags - 1,
                use_container_width=True,
                key="pag_prox",
            ):
                st.session_state["prest_pagina"] += 1
                st.session_state["prest_selecionado"] = None
                st.rerun()

    if not prestadores:
        st.info("Nenhum prestador encontrado.")
    else:
        ETAPA_COR_PREST = {
            "identificado": "#8E9CC0",
            "contato_tentado": "#F4A261",
            "contato_estabelecido": "#2A95B6",
            "proposta_enviada": "#8E44AD",
            "em_negociacao": "#E67E22",
            "credenciado": "#27AE60",
            "declinado": "#E74C3C",
        }
        ETAPA_L_PREST = {
            "identificado": "Identificado",
            "contato_tentado": "Contato Tentado",
            "contato_estabelecido": "Contato Estab.",
            "proposta_enviada": "Proposta Enviada",
            "em_negociacao": "Em Negociação",
            "credenciado": "✅ Credenciado",
            "declinado": "❌ Declinado",
        }

        h1, h2, h3, h4, h5, h6, h7 = st.columns([3, 2, 1.5, 2, 1.5, 1.5, 1])
        h1.markdown("**Razão Social**")
        h2.markdown("**Tipo**")
        h3.markdown("**Cidade/UF**")
        h4.markdown("**Especialidades**")
        h5.markdown("**Telefone**")
        h6.markdown("**Prospecção**")
        h7.markdown("**Ação**")
        st.divider()

        for p in prest_pagina:
            esps = query(
                """
                SELECT especialidade, quantidade_profissionais
                FROM prestador_especialidades WHERE prestador_id=?
                ORDER BY especialidade
            """,
                (p["id"],),
            )
            esp_resumo = (
                ", ".join(e["especialidade"] for e in esps)
                if esps
                else p["especialidade"] or "—"
            )

            prosp_ativa = query(
                """
                SELECT pr.etapa, pj.nome AS projeto
                FROM prospeccoes pr
                JOIN projetos pj ON pj.id = pr.projeto_id
                WHERE pr.prestador_id = ?
                  AND pr.etapa NOT IN ('credenciado','declinado')
                ORDER BY pr.atualizado_em DESC LIMIT 1
            """,
                (p["id"],),
            )
            prosp_any = query(
                "SELECT COUNT(*) AS c FROM prospeccoes WHERE prestador_id=?", (p["id"],)
            )[0]["c"]

            selecionado = st.session_state["prest_selecionado"] == p["id"]

            c1, c2, c3, c4, c5, c6, c7 = st.columns([3, 2, 1.5, 2, 1.5, 1.5, 1])
            c1.write(p["razao_social"])
            c2.write(TIPOS.get(p["tipo"], p["tipo"]))
            c3.write(f"{p['cidade']}/{p['uf']}")
            c4.write((esp_resumo[:40] + "…") if len(esp_resumo) > 40 else esp_resumo)
            c5.write(p["telefone"] or "—")
            if prosp_ativa:
                etapa = prosp_ativa[0]["etapa"]
                cor = ETAPA_COR_PREST.get(etapa, "#999")
                c6.markdown(
                    f"<span style='background:{cor}20;color:{cor};border:1px solid {cor};"
                    f"border-radius:50px;padding:2px 8px;font-size:0.72rem;font-weight:600;'>"
                    f"{ETAPA_L_PREST.get(etapa, etapa)}</span>",
                    unsafe_allow_html=True,
                )
            elif prosp_any:
                c6.markdown(
                    "<span style='color:#9aa0a6;font-size:0.75rem;'>Encerrada</span>",
                    unsafe_allow_html=True,
                )
            else:
                c6.markdown(
                    "<span style='color:#d93025;font-size:0.75rem;'>⚠ Sem prospecção</span>",
                    unsafe_allow_html=True,
                )

            btn_label = "✕ Fechar" if selecionado else "✏️ Editar"
            if c7.button(btn_label, key=f"sel_{p['id']}"):
                st.session_state["prest_selecionado"] = None if selecionado else p["id"]
                st.rerun()
            st.divider()

            # ── Painel de edição inline ──────────────────────
            if selecionado:
                with st.container():
                    st.markdown("---")
                    col_info, col_form = st.columns([1, 2])

                    with col_info:
                        st.markdown("**Especialidades cadastradas:**")
                        esps_ed = query(
                            """
                            SELECT id, especialidade, quantidade_profissionais
                            FROM prestador_especialidades WHERE prestador_id=?
                            ORDER BY especialidade
                        """,
                            (p["id"],),
                        )
                        if esps_ed:
                            for e in esps_ed:
                                st.markdown(
                                    f"🔹 {e['especialidade']} — **{e['quantidade_profissionais']} prof.**"
                                )
                        else:
                            st.caption("Nenhuma especialidade.")

                        st.markdown("**Prospecções:**")
                        prosps = query(
                            """
                            SELECT pj.nome AS projeto, pr.etapa, pr.id,
                                   u.nome AS executivo, pr.data_inicio
                            FROM prospeccoes pr
                            JOIN projetos pj ON pj.id = pr.projeto_id
                            JOIN usuarios u  ON u.id  = pr.executivo_id
                            WHERE pr.prestador_id = ?
                            ORDER BY pr.atualizado_em DESC
                        """,
                            (p["id"],),
                        )
                        if prosps:
                            for pr in prosps:
                                etapa = pr["etapa"]
                                cor = ETAPA_COR_PREST.get(etapa, "#999")
                                badge = (
                                    f"<span style='background:{cor}20;color:{cor};"
                                    f"border:1px solid {cor};border-radius:50px;"
                                    f"padding:1px 7px;font-size:0.7rem;font-weight:600;'>"
                                    f"{ETAPA_L_PREST.get(etapa, etapa)}</span>"
                                )
                                st.markdown(
                                    f"📁 **{pr['projeto']}** {badge}<br>"
                                    f"<small style='color:#80868b;'>👤 {pr['executivo']} · desde {pr['data_inicio'] or '?'}</small>",
                                    unsafe_allow_html=True,
                                )
                        else:
                            st.warning(
                                "⚠️ Este prestador **não tem prospecção** em nenhum projeto."
                            )
                            st.caption(
                                "As interações registradas ficam órfãs até uma prospecção ser criada."
                            )
                            st.page_link(
                                "pages/02_prospeccao.py",
                                label="➕ Iniciar prospecção para este prestador →",
                                icon="🎯",
                            )

                    with col_form:
                        st.markdown("**Editar dados:**")
                        with st.form(f"form_edit_{p['id']}"):
                            e1, e2 = st.columns(2)
                            with e1:
                                razao = st.text_input(
                                    "Razão Social*", value=p["razao_social"]
                                )
                                fantasia = st.text_input(
                                    "Nome Fantasia", value=p["nome_fantasia"] or ""
                                )
                                cnpj = st.text_input("CNPJ", value=p["cnpj"] or "")
                                tipo_ed = st.selectbox(
                                    "Tipo*",
                                    list(TIPOS.keys()),
                                    index=(
                                        list(TIPOS.keys()).index(p["tipo"])
                                        if p["tipo"] in TIPOS
                                        else 0
                                    ),
                                    format_func=lambda x: TIPOS[x],
                                )
                            with e2:
                                cidade = st.text_input("Cidade*", value=p["cidade"])
                                uf_ed = st.selectbox(
                                    "UF*",
                                    UFS,
                                    index=UFS.index(p["uf"]) if p["uf"] in UFS else 0,
                                )
                                telefone = st.text_input(
                                    "Telefone", value=p["telefone"] or ""
                                )
                                email = st.text_input("E-mail", value=p["email"] or "")
                            obs = st.text_area(
                                "Observações", value=p["observacoes"] or "", height=80
                            )
                            salvar = st.form_submit_button(
                                "💾 Salvar Alterações", use_container_width=True
                            )

                        if salvar:
                            erros = []
                            if not razao:
                                erros.append("Razão Social é obrigatória")
                            if not cidade:
                                erros.append("Cidade é obrigatória")

                            if cnpj:
                                cnpj_limpo = "".join(c for c in cnpj if c.isdigit())
                                if len(cnpj_limpo) != 14:
                                    erros.append("CNPJ deve ter exatamente 14 dígitos")

                            if erros:
                                st.error("❌ " + "\n".join(f"• {e}" for e in erros))
                            else:
                                execute(
                                    """
                                    UPDATE prestadores
                                    SET razao_social=?, nome_fantasia=?, cnpj=?, tipo=?,
                                        cidade=?, uf=?, telefone=?, email=?, observacoes=?
                                    WHERE id=?
                                """,
                                    (
                                        normaliza_campo(razao),
                                        normaliza_campo(fantasia) if fantasia else "",
                                        cnpj,
                                        tipo_ed,
                                        normaliza_campo(cidade),
                                        uf_ed,
                                        telefone,
                                        email,
                                        obs,
                                        p["id"],
                                    ),
                                )
                                st.success("Prestador atualizado!")
                                st.session_state["prest_selecionado"] = None
                                st.rerun()

                        if is_admin():
                            st.divider()
                            tem_prosp = query(
                                "SELECT COUNT(*) AS c FROM prospeccoes WHERE prestador_id=?",
                                (p["id"],),
                            )[0]["c"]
                            if tem_prosp:
                                st.warning(
                                    f"⚠️ Este prestador tem **{tem_prosp}** prospecção(ões) vinculada(s). Excluí-lo removerá também as prospecções e interações."
                                )
                            confirmar_key = f"confirmar_del_{p['id']}"
                            if st.checkbox(
                                "Confirmo a exclusão deste prestador", key=confirmar_key
                            ):
                                if st.button(
                                    "🗑️ Excluir Prestador",
                                    type="primary",
                                    key=f"del_{p['id']}",
                                ):
                                    prosps_ids = [
                                        r["id"]
                                        for r in query(
                                            "SELECT id FROM prospeccoes WHERE prestador_id=?",
                                            (p["id"],),
                                        )
                                    ]
                                    for pid_prosp in prosps_ids:
                                        execute(
                                            "DELETE FROM interacoes WHERE prospeccao_id=?",
                                            (pid_prosp,),
                                        )
                                    execute(
                                        "DELETE FROM prospeccoes WHERE prestador_id=?",
                                        (p["id"],),
                                    )
                                    execute(
                                        "DELETE FROM prestador_especialidades WHERE prestador_id=?",
                                        (p["id"],),
                                    )
                                    execute(
                                        "DELETE FROM prestadores WHERE id=?", (p["id"],)
                                    )
                                    st.session_state["prest_selecionado"] = None
                                    st.rerun()
                    st.markdown("---")


# ── ABA: CADASTRO ─────────────────────────────────────────────
with tab_novo:
    st.subheader("Cadastrar Novo Prestador")

    if st.session_state.get("novo_prest_id"):
        pid_novo = st.session_state["novo_prest_id"]
        nome_novo = st.session_state.get("novo_prest_nome", "Prestador")
        st.success(f"✅ **{nome_novo}** cadastrado com sucesso!")
        st.markdown("#### Especialidades e profissionais")
        st.caption(
            "Adicione as especialidades oferecidas e a quantidade de profissionais de cada uma."
        )

        esps_cadastradas = query(
            """
            SELECT id, especialidade, quantidade_profissionais
            FROM prestador_especialidades WHERE prestador_id=?
            ORDER BY especialidade
        """,
            (pid_novo,),
        )

        if esps_cadastradas:
            for e in esps_cadastradas:
                ce1, ce2, ce3 = st.columns([4, 1, 1])
                ce1.write(f"🔹 {e['especialidade']}")
                with ce2:
                    nq = st.number_input(
                        "Qtd",
                        min_value=1,
                        value=e["quantidade_profissionais"],
                        key=f"qnv_{e['id']}",
                        label_visibility="collapsed",
                    )
                    if nq != e["quantidade_profissionais"]:
                        execute(
                            "UPDATE prestador_especialidades SET quantidade_profissionais=? WHERE id=?",
                            (nq, e["id"]),
                        )
                        st.rerun()
                with ce3:
                    if st.button("🗑️", key=f"dnv_{e['id']}", help="Remover"):
                        execute(
                            "DELETE FROM prestador_especialidades WHERE id=?",
                            (e["id"],),
                        )
                        st.rerun()

        esps_existentes = {e["especialidade"] for e in esps_cadastradas}
        esps_disponiveis_novo = [e for e in ESPECIALIDADES if e not in esps_existentes]

        if esps_disponiveis_novo:
            with st.form("form_add_esp_novo", clear_on_submit=True):
                fa1, fa2, fa3 = st.columns([4, 1, 1])
                with fa1:
                    add_esp = st.selectbox(
                        "Especialidade",
                        esps_disponiveis_novo,
                        label_visibility="collapsed",
                    )
                with fa2:
                    add_qtd = st.number_input(
                        "Qtd", min_value=1, value=1, label_visibility="collapsed"
                    )
                with fa3:
                    add_btn = st.form_submit_button("＋ Add", use_container_width=True)
            if add_btn:
                execute(
                    """
                    INSERT INTO prestador_especialidades (prestador_id, especialidade, quantidade_profissionais)
                    VALUES (?, ?, ?)
                    ON CONFLICT(prestador_id, especialidade)
                    DO UPDATE SET quantidade_profissionais = excluded.quantidade_profissionais
                """,
                    (pid_novo, normaliza_campo(add_esp), add_qtd),
                )
                st.rerun()

        st.divider()
        if st.button("✔ Concluir cadastro", type="primary", use_container_width=True):
            del st.session_state["novo_prest_id"]
            st.session_state.pop("novo_prest_nome", None)
            st.rerun()

    else:
        with st.form("form_novo_prestador"):
            c1, c2 = st.columns(2)
            with c1:
                razao = st.text_input("Razão Social*", placeholder="Nome Empresarial")
                fantasia = st.text_input(
                    "Nome Fantasia", placeholder="Como é conhecido"
                )
                cnpj = st.text_input("CNPJ", placeholder="00.000.000/0000-00")
                tipo = st.selectbox(
                    "Tipo*", list(TIPOS.keys()), format_func=lambda x: TIPOS[x]
                )
            with c2:
                cidade = st.text_input("Cidade*")
                uf = st.selectbox("UF*", UFS)
                telefone = st.text_input("Telefone", placeholder="(11) 99999-9999")
                email = st.text_input("E-mail", placeholder="contato@clinica.com.br")
            obs = st.text_area(
                "Observações", placeholder="Informações adicionais relevantes..."
            )
            salvar = st.form_submit_button(
                "Cadastrar Prestador →", use_container_width=True
            )

        if salvar:
            erros = []
            if not razao:
                erros.append("Razão Social é obrigatória")
            if not cidade:
                erros.append("Cidade é obrigatória")
            if not uf:
                erros.append("UF é obrigatória")

            if cnpj:
                cnpj_limpo = "".join(c for c in cnpj if c.isdigit())
                if len(cnpj_limpo) != 14:
                    erros.append("CNPJ deve ter exatamente 14 dígitos")

            if erros:
                st.error("❌ " + "\n".join(f"• {e}" for e in erros))
            else:
                st.session_state["pend_prest"] = dict(
                    razao=normaliza_campo(razao),
                    fantasia=normaliza_campo(fantasia) if fantasia else "",
                    cnpj=cnpj,
                    tipo=tipo,
                    cidade=normaliza_campo(cidade),
                    uf=uf,
                    telefone=telefone,
                    email=email,
                    obs=obs,
                )
                similares = _similares(razao, cidade)
                st.session_state["pend_similares"] = similares
                st.rerun()

    # ── Revisão de similares (fora do form) ───────────────────
    if st.session_state.get("pend_prest") and not st.session_state.get("novo_prest_id"):
        pend = st.session_state["pend_prest"]
        simils = st.session_state.get("pend_similares", [])

        if simils:
            st.warning(
                f"⚠️ Encontramos **{len(simils)}** prestador(es) com nome parecido. Confira antes de prosseguir:"
            )
            for s in simils:
                esps_s = query(
                    "SELECT especialidade FROM prestador_especialidades WHERE prestador_id=? ORDER BY especialidade",
                    (s["id"],),
                )
                esps_txt = ", ".join(e["especialidade"] for e in esps_s) or "—"
                with st.container(border=True):
                    sc1, sc2 = st.columns([5, 2])
                    with sc1:
                        st.markdown(
                            f"**{s['razao_social']}**  `{s['similaridade']}% similar`"
                        )
                        st.caption(
                            f"📍 {s['cidade']}/{s['uf']}  ·  CNPJ: {s['cnpj'] or '—'}  ·  Tel: {s['telefone'] or '—'}"
                        )
                        st.caption(f"🩺 {esps_txt}")
                    with sc2:
                        st.session_state["prest_selecionado"] = s["id"]
                        st.page_link(
                            "pages/03_prestadores.py", label="✏️ Editar este", icon="🏥"
                        )

            st.divider()
            col_novo, col_cancel = st.columns(2)
            with col_novo:
                if st.button(
                    "✅ Não é nenhum deles — cadastrar como novo",
                    type="primary",
                    use_container_width=True,
                ):
                    p = pend
                    pid = execute(
                        """
                        INSERT INTO prestadores (razao_social, nome_fantasia, cnpj, tipo, cidade, uf, telefone, email, observacoes)
                        VALUES (?,?,?,?,?,?,?,?,?)
                    """,
                        (
                            p["razao"],
                            p["fantasia"],
                            p["cnpj"],
                            p["tipo"],
                            p["cidade"],
                            p["uf"],
                            p["telefone"],
                            p["email"],
                            p["obs"],
                        ),
                    )
                    st.session_state["novo_prest_id"] = pid
                    st.session_state["novo_prest_nome"] = p["razao"]
                    st.session_state.pop("pend_prest", None)
                    st.session_state.pop("pend_similares", None)
                    st.rerun()
            with col_cancel:
                if st.button("✕ Cancelar e corrigir o nome", use_container_width=True):
                    st.session_state.pop("pend_prest", None)
                    st.session_state.pop("pend_similares", None)
                    st.rerun()
        else:
            # Sem similares: cadastra direto
            p = pend
            pid = execute(
                """
                INSERT INTO prestadores (razao_social, nome_fantasia, cnpj, tipo, cidade, uf, telefone, email, observacoes)
                VALUES (?,?,?,?,?,?,?,?,?)
            """,
                (
                    p["razao"],
                    p["fantasia"],
                    p["cnpj"],
                    p["tipo"],
                    p["cidade"],
                    p["uf"],
                    p["telefone"],
                    p["email"],
                    p["obs"],
                ),
            )
            st.session_state["novo_prest_id"] = pid
            st.session_state["novo_prest_nome"] = p["razao"]
            st.session_state.pop("pend_prest", None)
            st.session_state.pop("pend_similares", None)
            st.rerun()


# ── ABA: ESPECIALIDADES ───────────────────────────────────────
with tab_especialidades:
    st.subheader("Especialidades e Profissionais por Prestador")
    st.caption(
        "Cada especialidade conta individualmente para o atingimento das metas de suficiência de rede."
    )

    todos_prestadores = query(
        "SELECT id, razao_social, cidade, uf FROM prestadores ORDER BY razao_social"
    )
    if not todos_prestadores:
        st.info("Nenhum prestador cadastrado ainda.")
    else:
        prest_map_esp = {
            f"{p['razao_social']} — {p['cidade']}/{p['uf']}": p["id"]
            for p in todos_prestadores
        }
        escolha_esp = st.selectbox(
            "Selecione o prestador", list(prest_map_esp.keys()), key="sel_prest_esp"
        )
        prest_id_esp = prest_map_esp[escolha_esp]

        esps_atuais = query(
            """
            SELECT id, especialidade, quantidade_profissionais
            FROM prestador_especialidades
            WHERE prestador_id = ?
            ORDER BY especialidade
        """,
            (prest_id_esp,),
        )

        if esps_atuais:
            st.markdown("**Especialidades cadastradas:**")
            total_prof = sum(e["quantidade_profissionais"] for e in esps_atuais)
            st.metric("Total de profissionais neste prestador", total_prof)

            for e in esps_atuais:
                col_esp, col_qtd, col_del = st.columns([3, 1, 1])
                with col_esp:
                    st.write(f"🔹 {e['especialidade']}")
                with col_qtd:
                    nova_qtd = st.number_input(
                        "Qtd",
                        min_value=1,
                        value=e["quantidade_profissionais"],
                        key=f"qtd_{e['id']}",
                        label_visibility="collapsed",
                    )
                    if nova_qtd != e["quantidade_profissionais"]:
                        execute(
                            "UPDATE prestador_especialidades SET quantidade_profissionais=? WHERE id=?",
                            (nova_qtd, e["id"]),
                        )
                        st.rerun()
                with col_del:
                    if st.button(
                        "🗑️", key=f"del_{e['id']}", help="Remover especialidade"
                    ):
                        execute(
                            "DELETE FROM prestador_especialidades WHERE id=?",
                            (e["id"],),
                        )
                        st.rerun()
        else:
            st.info("Nenhuma especialidade cadastrada para este prestador.")

        st.divider()
        st.markdown("**Adicionar especialidade:**")

        esps_existentes = {e["especialidade"] for e in esps_atuais}
        esps_disponiveis = [e for e in ESPECIALIDADES if e not in esps_existentes]

        if not esps_disponiveis:
            st.success(
                "Todas as especialidades já foram cadastradas para este prestador."
            )
        else:
            with st.form("form_add_esp", clear_on_submit=True):
                col_a, col_b, col_c = st.columns([3, 1, 1])
                with col_a:
                    nova_esp = st.selectbox("Especialidade", esps_disponiveis)
                with col_b:
                    nova_qtd_add = st.number_input(
                        "Nº de profissionais", min_value=1, value=1
                    )
                with col_c:
                    st.write("")
                    st.write("")
                    adicionar = st.form_submit_button(
                        "Adicionar", use_container_width=True
                    )

            if adicionar:
                execute(
                    """
                    INSERT INTO prestador_especialidades (prestador_id, especialidade, quantidade_profissionais)
                    VALUES (?, ?, ?)
                    ON CONFLICT(prestador_id, especialidade)
                    DO UPDATE SET quantidade_profissionais = excluded.quantidade_profissionais
                """,
                    (prest_id_esp, normaliza_campo(nova_esp), nova_qtd_add),
                )
                st.success(
                    f"**{nova_esp}** adicionada ({nova_qtd_add} profissional(is))."
                )
                st.rerun()


# ── ABA: IMPORTAR PLANILHA ────────────────────────────────────
with tab_importar:
    st.subheader("Importar Prestadores via Planilha")
    st.caption(
        "Aceita arquivos **.csv** ou **.xlsx**. "
        "A planilha deve ter as colunas: **Prestador, CNPJ, Tipo de Prestador, Serviços, "
        "Status, Contato, Cidade, UF, Data do Contato, Observação da Evolução**."
    )

    TIPO_MAP = {
        "consultorio": "consultorio",
        "consultório": "consultorio",
        "clinica medica": "clinica_medica",
        "clínica medica": "clinica_medica",
        "clinica médica": "clinica_medica",
        "clínica médica": "clinica_medica",
        "clinicas medicas": "clinica_medica",
        "clínicas médicas": "clinica_medica",
        "clinica nao medica": "clinica_nao_medica",
        "clínica não médica": "clinica_nao_medica",
        "clinicas nao medicas": "clinica_nao_medica",
        "clínicas não médicas": "clinica_nao_medica",
        "laboratorio": "laboratorio",
        "laboratório": "laboratorio",
        "servico imagem": "servico_imagem",
        "serviço imagem": "servico_imagem",
        "serviços de imagens": "servico_imagem",
        "servicos de imagens": "servico_imagem",
        "policlinica": "policlinica",
        "policlínica": "policlinica",
        "outro": "outro",
    }

    STATUS_MAP = {
        "contrato formalizado": "credenciado",
        "credenciado": "credenciado",
        "em negociacao": "em_negociacao",
        "em negociação": "em_negociacao",
        "contato realizado": "contato_estabelecido",
        "contato estabelecido": "contato_estabelecido",
        "analise": "proposta_enviada",
        "análise": "proposta_enviada",
        "proposta enviada": "proposta_enviada",
        "contato tentado": "contato_tentado",
        "identificado": "identificado",
        "declinado": "declinado",
    }

    arquivo = st.file_uploader("Selecione o arquivo", type=["csv", "xlsx"])

    if arquivo:
        try:
            if arquivo.name.endswith(".xlsx"):
                df_imp = pd.read_excel(arquivo, header=0)
            else:
                df_imp = pd.read_csv(arquivo, header=0)

            df_imp.columns = [str(c).strip() for c in df_imp.columns]
            df_imp = df_imp.dropna(how="all")

            st.markdown(f"**{len(df_imp)} linhas encontradas.** Pré-visualização:")
            st.dataframe(df_imp.head(5), use_container_width=True, hide_index=True)

            def find_col(df, candidates):
                for c in df.columns:
                    if c.lower().strip() in [x.lower() for x in candidates]:
                        return c
                return None

            col_nome = find_col(
                df_imp, ["Prestador", "Prestador ", "Nome", "Razão Social"]
            )
            col_cnpj = find_col(df_imp, ["CNPJ"])
            col_tipo = find_col(df_imp, ["Tipo de Prestador", "Tipo"])
            col_esp = find_col(
                df_imp, ["Seviços", "Serviços", "Especialidade", "Especialidades"]
            )
            col_status = find_col(df_imp, ["Status"])
            col_tel = find_col(df_imp, ["Contato", "Telefone"])
            col_cidade = find_col(df_imp, ["Cidade", "Cidade "])
            col_uf = find_col(df_imp, ["UF"])
            col_data = find_col(df_imp, ["Data do Contato", "Data Inicial", "Data"])
            col_obs = find_col(df_imp, ["Observação da Evolução", "Observações", "Obs"])

            st.divider()
            st.markdown("**Mapeamento de colunas detectado:**")
            mc1, mc2 = st.columns(2)
            with mc1:
                col_nome = st.selectbox(
                    "Coluna: Nome do Prestador*",
                    df_imp.columns.tolist(),
                    index=df_imp.columns.tolist().index(col_nome) if col_nome else 0,
                )
                col_cnpj = st.selectbox(
                    "Coluna: CNPJ",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=(
                        df_imp.columns.tolist().index(col_cnpj) + 1 if col_cnpj else 0
                    ),
                )
                col_tipo = st.selectbox(
                    "Coluna: Tipo de Prestador",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=(
                        df_imp.columns.tolist().index(col_tipo) + 1 if col_tipo else 0
                    ),
                )
                col_esp = st.selectbox(
                    "Coluna: Serviços/Especialidade",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=df_imp.columns.tolist().index(col_esp) + 1 if col_esp else 0,
                )
                col_status = st.selectbox(
                    "Coluna: Status/Etapa",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=(
                        df_imp.columns.tolist().index(col_status) + 1
                        if col_status
                        else 0
                    ),
                )
            with mc2:
                col_tel = st.selectbox(
                    "Coluna: Telefone",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=df_imp.columns.tolist().index(col_tel) + 1 if col_tel else 0,
                )
                col_cidade = st.selectbox(
                    "Coluna: Cidade*",
                    df_imp.columns.tolist(),
                    index=(
                        df_imp.columns.tolist().index(col_cidade) if col_cidade else 0
                    ),
                )
                col_uf = st.selectbox(
                    "Coluna: UF*",
                    df_imp.columns.tolist(),
                    index=df_imp.columns.tolist().index(col_uf) if col_uf else 0,
                )
                col_data = st.selectbox(
                    "Coluna: Data do Contato",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=(
                        df_imp.columns.tolist().index(col_data) + 1 if col_data else 0
                    ),
                )
                col_obs = st.selectbox(
                    "Coluna: Observações",
                    ["(nenhuma)"] + df_imp.columns.tolist(),
                    index=df_imp.columns.tolist().index(col_obs) + 1 if col_obs else 0,
                )

            st.divider()
            st.markdown("**Vincular prospecções a um projeto:**")
            projetos_imp = query(
                "SELECT id, nome FROM projetos WHERE status='ativo' ORDER BY nome"
            )
            proj_imp_opt = [
                {"id": None, "nome": "— Não vincular a projeto —"}
            ] + projetos_imp
            proj_imp_escolha = st.selectbox(
                "Projeto",
                options=[p["id"] for p in proj_imp_opt],
                format_func=lambda pid: next(
                    (p["nome"] for p in proj_imp_opt if p["id"] == pid), ""
                ),
                key="proj_imp",
            )

            if proj_imp_escolha is None:
                st.warning(
                    "⚠️ **Nenhum projeto selecionado.** Os prestadores serão cadastrados, mas "
                    "**as interações e status ficarão órfãos** — não aparecerão no pipeline e "
                    "não poderão ser acompanhados. Selecione um projeto para importar corretamente."
                )

            exec_lista = query(
                "SELECT id, nome FROM usuarios WHERE perfil IN ('executivo','admin') ORDER BY nome"
            )
            exec_imp_escolha = st.selectbox(
                "Executivo responsável pelas interações importadas",
                options=[e["id"] for e in exec_lista],
                format_func=lambda eid: next(
                    (e["nome"] for e in exec_lista if e["id"] == eid), ""
                ),
                key="exec_imp",
            )

            forcar = st.checkbox(
                "⚠️ Forçar importação (ignora duplicatas — use se registros estiverem faltando)",
                key="forcar_import",
            )

            if st.button(
                "📥 Importar Prestadores", type="primary", use_container_width=True
            ):
                from datetime import datetime as _dt, date as _date

                importados = 0
                atualizados = 0
                erros = []
                ignorados_nomes = []

                total_rows = len(df_imp)
                barra = st.progress(0)
                status_txt = st.empty()
                erros_box = st.empty()

                for idx, (_, row) in enumerate(df_imp.iterrows()):
                    nome_raw = str(row.get(col_nome, "")).strip() if col_nome else ""
                    pct = (idx + 1) / total_rows
                    barra.progress(pct, text=f"Processando {idx + 1}/{total_rows}...")

                    if not nome_raw or nome_raw.lower() == "nan":
                        continue

                    # Normaliza nome imediatamente
                    nome = normaliza_campo(nome_raw)
                    status_txt.caption(f"🔄 {nome}")

                    cnpj = (
                        str(row.get(col_cnpj, "")).strip()
                        if col_cnpj != "(nenhuma)"
                        else ""
                    )
                    cidade = normaliza_campo(str(row.get(col_cidade, "")).strip())
                    uf = str(row.get(col_uf, "")).strip().upper()[:2]
                    tel = (
                        str(row.get(col_tel, "")).strip()
                        if col_tel != "(nenhuma)"
                        else ""
                    )
                    obs_val = (
                        str(row.get(col_obs, "")).strip()
                        if col_obs != "(nenhuma)"
                        else ""
                    )
                    data_v = (
                        str(row.get(col_data, "")).strip()
                        if col_data != "(nenhuma)"
                        else ""
                    )
                    status_v = (
                        str(row.get(col_status, "")).strip()
                        if col_status != "(nenhuma)"
                        else ""
                    )
                    tipo_raw = (
                        str(row.get(col_tipo, "")).strip().lower()
                        if col_tipo != "(nenhuma)"
                        else ""
                    )
                    esp_raw = (
                        str(row.get(col_esp, "")).strip()
                        if col_esp != "(nenhuma)"
                        else ""
                    )

                    tipo_v = TIPO_MAP.get(tipo_raw, "outro")
                    etapa_v = STATUS_MAP.get(status_v.lower(), "identificado")

                    if (
                        not cidade
                        or cidade.lower() == "nan"
                        or not uf
                        or uf.lower() == "nan"
                    ):
                        erros.append(f"Sem cidade/UF: {nome}")
                        erros_box.warning(
                            f"⚠️ {len(erros)} erro(s) até agora — último: sem cidade/UF em '{nome}'"
                        )
                        continue

                    try:
                        # Normaliza data
                        data_inicio = None
                        raw_data = (
                            row.get(col_data)
                            if col_data and col_data != "(nenhuma)"
                            else None
                        )
                        if raw_data is not None and hasattr(raw_data, "date"):
                            try:
                                data_inicio = raw_data.date().isoformat()
                            except Exception:
                                pass
                        elif data_v and data_v.lower() not in ("nan", "", "none"):
                            for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"):
                                try:
                                    data_inicio = (
                                        _dt.strptime(data_v, fmt).date().isoformat()
                                    )
                                    break
                                except ValueError:
                                    continue

                        data_final = data_inicio or _date.today().isoformat()

                        # Deduplicação por nome normalizado + cidade normalizada
                        existente = query(
                            "SELECT id FROM prestadores WHERE LOWER(TRIM(razao_social))=LOWER(TRIM(?)) AND LOWER(TRIM(cidade))=LOWER(TRIM(?))",
                            (nome, cidade),
                        )

                        if existente and not forcar:
                            prest_id = existente[0]["id"]
                            atualizados += 1
                            ignorados_nomes.append(nome)
                        else:
                            prest_id = execute(
                                "INSERT INTO prestadores (razao_social, cnpj, tipo, cidade, uf, telefone, observacoes) VALUES (?,?,?,?,?,?,?)",
                                (
                                    nome,
                                    cnpj if cnpj and cnpj.lower() != "nan" else None,
                                    tipo_v,
                                    cidade,
                                    uf,
                                    tel if tel and tel.lower() != "nan" else None,
                                    (
                                        obs_val
                                        if obs_val and obs_val.lower() != "nan"
                                        else None
                                    ),
                                ),
                            )
                            importados += 1

                        # Especialidades — normalizadas
                        if esp_raw and esp_raw.lower() not in ("nan", ""):
                            import re as _re

                            esps_raw = [
                                normaliza_campo(e.strip())
                                for e in _re.split(r"[,/;]+", esp_raw)
                                if e.strip()
                            ]
                            for esp_item in esps_raw:
                                ja_existe = query(
                                    "SELECT id FROM prestador_especialidades WHERE prestador_id=? AND especialidade=?",
                                    (prest_id, esp_item),
                                )
                                if not ja_existe:
                                    execute(
                                        "INSERT INTO prestador_especialidades (prestador_id, especialidade, quantidade_profissionais) VALUES (?,?,1)",
                                        (prest_id, esp_item),
                                    )

                        # Prospecção
                        if proj_imp_escolha and prest_id:
                            prosp_exist = query(
                                "SELECT id FROM prospeccoes WHERE prestador_id=? AND projeto_id=?",
                                (prest_id, proj_imp_escolha),
                            )
                            if not prosp_exist:
                                data_contrat = (
                                    data_final if etapa_v == "credenciado" else None
                                )
                                execute(
                                    "INSERT INTO prospeccoes (prestador_id, projeto_id, executivo_id, etapa, data_inicio, data_contratacao) VALUES (?,?,?,?,?,?)",
                                    (
                                        prest_id,
                                        proj_imp_escolha,
                                        exec_imp_escolha,
                                        etapa_v,
                                        data_final,
                                        data_contrat,
                                    ),
                                )

                                if obs_val and obs_val.lower() not in ("nan", ""):
                                    prosp_novo = query(
                                        "SELECT id FROM prospeccoes WHERE prestador_id=? AND projeto_id=?",
                                        (prest_id, proj_imp_escolha),
                                    )
                                    if prosp_novo:
                                        inter_exist = query(
                                            "SELECT id FROM interacoes WHERE prospeccao_id=? AND descricao=? AND data_interacao=?",
                                            (
                                                prosp_novo[0]["id"],
                                                obs_val[:500],
                                                data_final,
                                            ),
                                        )
                                        if not inter_exist:
                                            execute(
                                                "INSERT INTO interacoes (prospeccao_id, executivo_id, canal, tipo, descricao, data_interacao) VALUES (?,?,'outro','outro',?,?)",
                                                (
                                                    prosp_novo[0]["id"],
                                                    exec_imp_escolha,
                                                    obs_val[:500],
                                                    data_final,
                                                ),
                                            )

                    except Exception as e:
                        msg = f"{nome}: {str(e)[:100]}"
                        erros.append(msg)
                        erros_box.warning(f"⚠️ {len(erros)} erro(s) — último: {msg}")

                # Resultado final
                barra.progress(1.0, text="✅ Importação concluída!")
                status_txt.empty()
                erros_box.empty()

                total_proc = importados + atualizados
                st.success(
                    f"✅ **{total_proc}** linha(s) processadas — "
                    f"**{importados}** prestadores novos cadastrados · "
                    f"**{atualizados}** já existentes (aproveitados)"
                )
                if proj_imp_escolha:
                    exec_nome = next(
                        (e["nome"] for e in exec_lista if e["id"] == exec_imp_escolha),
                        "—",
                    )
                    st.info(
                        f"Prospecções e interações vinculadas ao projeto selecionado "
                        f"com executivo **{exec_nome}** e datas da planilha. "
                        f"Prestadores já existentes também tiveram suas prospecções criadas."
                    )
                if erros:
                    with st.expander(
                        f"⚠️ {len(erros)} linha(s) com erro — clique para ver"
                    ):
                        for e in erros:
                            st.caption(f"• {e}")
                if ignorados_nomes:
                    with st.expander(
                        f"Ver {len(ignorados_nomes)} linha(s) de prestadores já existentes"
                    ):
                        for n in ignorados_nomes:
                            st.caption(f"• {n}")

        except Exception as e:
            st.error(f"Erro ao ler o arquivo: {e}")
