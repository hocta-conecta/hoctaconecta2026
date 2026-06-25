import streamlit as st
import pandas as pd
import io
from datetime import date
from auth import exige_login, exige_perfil, usuario_logado, is_admin
from database import (
    query,
    execute,
    setup_database,
    normaliza_municipio,
    normaliza_lista_municipios,
    normaliza_campo,
)
from ui import inject_global_style, page_header, render_sidebar

setup_database()

exige_login()
exige_perfil("admin", "executivo")

st.set_page_config(page_title="Projetos · Hocta Conecta", page_icon="📁", layout="wide")

inject_global_style()
render_sidebar()

page_header(
    "Projetos",
    "Planeje, acompanhe e entregue iniciativas com clareza executiva",
    "Portfólio",
)

user = usuario_logado()

ESPECIALIDADES = [
    "Cardiologia",
    "Clinica Medica",
    "Dermatologia",
    "Endocrinologia",
    "Gastroenterologia",
    "Ginecologia",
    "Neurologia",
    "Oftalmologia",
    "Ortopedia",
    "Otorrinolaringologia",
    "Pediatria",
    "Psiquiatria",
    "Urologia",
    "Laboratorio Analises Clinicas",
    "Radiologia",
    "Fisioterapia",
    "Psicologia",
    "Nutricao",
    "Outra",
]

st.markdown("# 📁 Projetos")
st.markdown(
    """
    <style>
    /* ── FORÇAR MENU LATERAL (SIDEBAR) AZUL ────────────────────── */
    [data-testid="stSidebar"] {
        background-color: #0d3c78 !important;
        background-image: linear-gradient(180deg, #1558a8 0%, #0d3c78 100%) !important;
    }
    
    /* Forçar todos os textos, links e ícones dentro do menu lateral a ficarem brancos */
    [data-testid="stSidebar"] *, 
    [data-testid="stSidebar"] p, 
    [data-testid="stSidebar"] span, 
    [data-testid="stSidebar"] a {
        color: #ffffff !important;
    }

    /* Mudar a cor de fundo quando passar o rato por cima dos itens do menu */
    [data-testid="stSidebar"] a:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px;
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

if is_admin():
    tab_lista, tab_novo, tab_metas, tab_benchmark, tab_export = st.tabs(
        ["Projetos", "Novo Projeto", "Metas", "📊 Benchmark", "Exportar"]
    )
else:
    tab_lista, tab_metas, tab_benchmark = st.tabs(
        ["Meus Projetos", "Metas", "📊 Benchmark"]
    )
    tab_novo = None
    tab_export = None


# ── ABA: LISTA ────────────────────────────────────────────────
with tab_lista:
    if is_admin():
        projetos = query("""
            SELECT pj.*, c.nome AS cliente_nome
            FROM projetos pj JOIN clientes c ON c.id = pj.cliente_id
            ORDER BY pj.status, pj.nome
        """)
    else:
        projetos = query(
            """
            SELECT pj.*, c.nome AS cliente_nome
            FROM projetos pj
            JOIN clientes c ON c.id = pj.cliente_id
            JOIN executivo_projeto ep ON ep.projeto_id = pj.id
            WHERE ep.executivo_id = ?
            ORDER BY pj.status, pj.nome
        """,
            (user["id"],),
        )

    if not projetos:
        st.info("Nenhum projeto encontrado.")
    else:
        df = pd.DataFrame(projetos)[
            [
                "nome",
                "cliente_nome",
                "status",
                "data_inicio",
                "data_prevista",
                "municipios",
                "benchmark",
            ]
        ]
        df.columns = [
            "Projeto",
            "Cliente",
            "Status",
            "Início",
            "Previsão",
            "Municípios",
            "Benchmark",
        ]
        df["Status"] = df["Status"].str.capitalize()
        st.dataframe(df, use_container_width=True, hide_index=True)

        if is_admin():
            st.divider()
            st.subheader("Gerenciar Projeto")
            proj_map = {f"{p['nome']} — {p['cliente_nome']}": p for p in projetos}
            escolha = st.selectbox("Selecione o projeto", list(proj_map.keys()))
            proj = proj_map[escolha]

            # Função auxiliar de conversão segura para evitar o erro fromisoformat
            def safe_isoformat(date_raw):
                if date_raw and isinstance(date_raw, str):
                    try:
                        return date.fromisoformat(date_raw)
                    except ValueError:
                        return None
                return None

            with st.form("form_editar_projeto"):
                c1, c2 = st.columns(2)
                with c1:
                    nome = st.text_input("Nome do Projeto*", value=proj["nome"])
                    descricao = st.text_area("Descrição", value=proj["descricao"] or "")
                    municipios = st.text_area(
                        "Municípios cobertos",
                        value=proj["municipios"] or "",
                        placeholder="Um por linha ou separados por vírgula",
                    )
                with c2:
                    data_inicio = st.date_input(
                        "Data de Início",
                        value=safe_isoformat(proj["data_inicio"]),
                    )
                    data_prevista = st.date_input(
                        "Data Prevista de Conclusão",
                        value=safe_isoformat(proj["data_prevista"]),
                    )
                    benchmark = st.text_input(
                        "Benchmark utilizado", value=proj["benchmark"] or ""
                    )
                    status = st.selectbox(
                        "Status",
                        ["ativo", "pausado", "encerrado"],
                        index=["ativo", "pausado", "encerrado"].index(proj["status"]),
                    )

                # ── BLOCO BLINDADO CONTRA EXECUTIVOS INATIVOS (MULTISELECT) ──
                executivos_ativos = query(
                    "SELECT id, nome FROM usuarios WHERE perfil='executivo' AND ativo=1"
                )
                exec_vinculados = query(
                    """
                    SELECT ep.executivo_id, u.nome 
                    FROM executivo_projeto ep 
                    LEFT JOIN usuarios u ON u.id = ep.executivo_id 
                    WHERE ep.projeto_id=?
                    """,
                    (proj["id"],),
                )

                # Dicionário de opções baseado no ID como chave
                opcoes_executivos = {e["id"]: e["nome"] for e in executivos_ativos}

                # Adiciona executivos já vinculados (mesmo se tiverem sido inativados no painel)
                for ev in exec_vinculados:
                    if ev["executivo_id"] not in opcoes_executivos:
                        nome_inativo = (
                            ev["nome"]
                            if ev["nome"]
                            else f"Inativo (ID {ev['executivo_id']})"
                        )
                        opcoes_executivos[ev["executivo_id"]] = f"⚠️ {nome_inativo}"

                ids_vinc = [ev["executivo_id"] for ev in exec_vinculados]

                exec_selecionados = st.multiselect(
                    "Executivos vinculados",
                    options=list(opcoes_executivos.keys()),
                    default=ids_vinc,
                    format_func=lambda eid: opcoes_executivos.get(eid, f"ID {eid}"),
                )

                salvar = st.form_submit_button(
                    "Salvar Alterações", use_container_width=True
                )

            if salvar:
                execute(
                    """
                    UPDATE projetos SET nome=?, descricao=?, municipios=?, benchmark=?,
                        data_inicio=?, data_prevista=?, status=?
                    WHERE id=?
                """,
                    (
                        normaliza_campo(nome),
                        descricao,
                        normaliza_lista_municipios(municipios),
                        benchmark,
                        data_inicio.isoformat() if data_inicio else None,
                        data_prevista.isoformat() if data_prevista else None,
                        status,
                        proj["id"],
                    ),
                )

                execute(
                    "DELETE FROM executivo_projeto WHERE projeto_id=?", (proj["id"],)
                )
                for eid in exec_selecionados:
                    execute(
                        "INSERT OR IGNORE INTO executivo_projeto (executivo_id, projeto_id) VALUES (?,?)",
                        (eid, proj["id"]),
                    )

                st.success("Projeto atualizado com sucesso!")
                st.rerun()


# ── ABA: NOVO PROJETO ─────────────────────────────────────────
if tab_novo:
    with tab_novo:
        st.subheader("Criar Novo Projeto")

        clientes = query("SELECT id, nome FROM clientes WHERE ativo=1 ORDER BY nome")
        if not clientes:
            st.warning("Cadastre ao menos um cliente antes de criar um projeto.")
        else:
            with st.form("form_novo_projeto", clear_on_submit=True):
                cliente_map = {c["nome"]: c["id"] for c in clientes}
                cliente_escolha = st.selectbox(
                    "Cliente (Operadora)*", list(cliente_map.keys())
                )

                c1, c2 = st.columns(2)
                with c1:
                    nome = st.text_input("Nome do Projeto*")
                    descricao = st.text_area("Descrição")
                    municipios = st.text_area(
                        "Municípios cobertos", placeholder="Um por linha"
                    )
                with c2:
                    benchmark = st.text_input("Benchmark utilizado")
                    data_inicio = st.date_input("Data de Início", value=date.today())
                    data_prevista = st.date_input(
                        "Data Prevista de Conclusão", value=None
                    )

                executivos_todos = query(
                    "SELECT id, nome FROM usuarios WHERE perfil='executivo' AND ativo=1"
                )
                exec_selecionados = st.multiselect(
                    "Executivos responsáveis",
                    options=[e["id"] for e in executivos_todos],
                    format_func=lambda eid: next(
                        (e["nome"] for e in executivos_todos if e["id"] == eid),
                        str(eid),
                    ),
                )

                criar = st.form_submit_button("Criar Projeto", use_container_width=True)

            if criar:
                if not nome:
                    st.error("O nome do projeto é obrigatório.")
                else:
                    proj_id = execute(
                        """
                        INSERT INTO projetos (cliente_id, nome, descricao, municipios, benchmark, data_inicio, data_prevista)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                        (
                            cliente_map[cliente_escolha],
                            normaliza_campo(nome),
                            descricao,
                            normaliza_lista_municipios(municipios),
                            benchmark,
                            data_inicio.isoformat() if data_inicio else None,
                            data_prevista.isoformat() if data_prevista else None,
                        ),
                    )
                    for eid in exec_selecionados:
                        execute(
                            "INSERT OR IGNORE INTO executivo_projeto (executivo_id, projeto_id) VALUES (?,?)",
                            (eid, proj_id),
                        )
                    st.success(
                        f"Projeto **{normaliza_campo(nome)}** criado com sucesso!"
                    )
                    st.rerun()


# ── ABA: METAS ────────────────────────────────────────────────
with tab_metas:
    st.subheader("Metas de Suficiência de Rede")

    if is_admin():
        projetos_ativos = query(
            "SELECT id, nome FROM projetos WHERE status='ativo' ORDER BY nome"
        )
    else:
        projetos_ativos = query(
            """
            SELECT pj.id, pj.nome FROM projetos pj
            JOIN executivo_projeto ep ON ep.projeto_id = pj.id
            WHERE ep.executivo_id=? AND pj.status='ativo'
        """,
            (user["id"],),
        )

    if not projetos_ativos:
        st.info("Nenhum projeto ativo.")
    else:
        proj_map = {p["nome"]: p["id"] for p in projetos_ativos}
        proj_escolha = st.selectbox(
            "Projeto", list(proj_map.keys()), key="sel_proj_meta"
        )
        proj_id = proj_map[proj_escolha]

        has_benchmark = (
            query(
                "SELECT COUNT(*) AS c FROM benchmark_especialidades WHERE projeto_id=?",
                (proj_id,),
            )[0]["c"]
            > 0
        )
        if has_benchmark:
            st.warning(
                "⚠️ Este projeto já utiliza **benchmark importado** como referência de planejamento. "
                "Não é possível usar metas manuais e benchmark ao mesmo tempo — "
                "o dashboard priorizará o benchmark. Para usar metas manuais, remova o benchmark na aba **📊 Benchmark**.",
                icon="⚠️",
            )

        metas = query(
            """
            SELECT m.*, u.nome AS exec_nome
            FROM metas m
            LEFT JOIN usuarios u ON u.id = m.executivo_id
            WHERE m.projeto_id = ?
            ORDER BY m.municipio, m.especialidade
        """,
            (proj_id,),
        )

        if metas:
            rows_meta = []
            for m in metas:
                prof = query(
                    """
                    SELECT COALESCE(SUM(pe.quantidade_profissionais), 0) AS t
                    FROM prospeccoes p
                    JOIN prestadores pr ON pr.id = p.prestador_id
                    JOIN prestador_especialidades pe ON pe.prestador_id = pr.id
                    WHERE p.projeto_id = ? AND p.etapa = 'credenciado'
                      AND pr.cidade = ? AND pe.especialidade = ?
                """,
                    (proj_id, m["municipio"], m["especialidade"]),
                )[0]["t"]
                rows_meta.append(
                    {
                        "Município": m["municipio"],
                        "Especialidade": m["especialidade"],
                        "Meta (prof.)": m["quantidade_meta"],
                        "Credenciados": prof,
                        "Status": (
                            "✅ Atingida"
                            if prof >= m["quantidade_meta"]
                            else f"⏳ {prof}/{m['quantidade_meta']}"
                        ),
                        "Executivo Resp.": m["exec_nome"] or "—",
                    }
                )
            st.dataframe(
                pd.DataFrame(rows_meta), use_container_width=True, hide_index=True
            )
            metas_ok = sum(1 for r in rows_meta if "✅" in r["Status"])
            st.caption(f"**{metas_ok}/{len(rows_meta)}** metas atingidas")
        else:
            st.info("Nenhuma meta cadastrada para este projeto.")

        if is_admin():
            st.divider()
            st.subheader("Cadastrar Metas em Matriz")
            st.caption(
                "Defina os municípios e especialidades, preencha a quantidade de profissionais necessários em cada célula (0 = não incluir) e salve tudo de uma vez."
            )

            executivos = query(
                "SELECT id, nome FROM usuarios WHERE perfil='executivo' AND ativo=1"
            )

            c1, c2 = st.columns(2)
            with c1:
                municipios_input = st.text_area(
                    "Municípios (um por linha)*",
                    placeholder="Sao Paulo\nCampinas\nSantos",
                    height=120,
                    key="mun_input",
                )
            with c2:
                esps_selecionadas = st.multiselect(
                    "Especialidades*", ESPECIALIDADES, key="esp_multi"
                )

            exec_opt = [{"id": None, "nome": "— Sem responsável —"}] + executivos
            exec_escolha = st.selectbox(
                "Executivo Responsável para todas as metas (opcional)",
                options=[e["id"] for e in exec_opt],
                format_func=lambda eid: next(
                    (e["nome"] for e in exec_opt if e["id"] == eid), ""
                ),
                key="exec_matriz",
            )

            municipios_lista = (
                [
                    normaliza_municipio(m)
                    for m in municipios_input.splitlines()
                    if m.strip()
                ]
                if municipios_input
                else []
            )

            if municipios_lista and esps_selecionadas:
                st.markdown(
                    "**Preencha a quantidade de profissionais por célula** (deixe 0 para não incluir essa combinação):"
                )

                import numpy as np

                df_matriz = pd.DataFrame(
                    np.zeros(
                        (len(municipios_lista), len(esps_selecionadas)), dtype=int
                    ),
                    index=municipios_lista,
                    columns=esps_selecionadas,
                )

                df_editado = st.data_editor(
                    df_matriz,
                    use_container_width=True,
                    key="matriz_metas",
                )

                total_cells = int((df_editado > 0).sum().sum())
                st.caption(f"{total_cells} combinação(ões) com meta > 0 serão salvas.")

                if st.button(
                    "💾 Salvar Matriz de Metas",
                    type="primary",
                    use_container_width=True,
                ):
                    salvos = 0
                    for mun in df_editado.index:
                        for esp in df_editado.columns:
                            qtd = int(df_editado.loc[mun, esp])
                            if qtd > 0:
                                existente = query(
                                    "SELECT id FROM metas WHERE projeto_id=? AND municipio=? AND especialidade=?",
                                    (proj_id, mun, esp),
                                )
                                if existente:
                                    execute(
                                        "UPDATE metas SET quantidade_meta=?, executivo_id=? WHERE id=?",
                                        (qtd, exec_escolha, existente[0]["id"]),
                                    )
                                else:
                                    execute(
                                        "INSERT INTO metas (projeto_id, municipio, especialidade, quantidade_meta, executivo_id) VALUES (?,?,?,?,?)",
                                        (proj_id, mun, esp, qtd, exec_escolha),
                                    )
                                salvos += 1
                    if salvos:
                        st.success(f"{salvos} meta(s) salvas com sucesso!")
                        st.rerun()
                    else:
                        st.warning(
                            "Nenhuma célula com valor > 0. Preencha ao menos uma quantidade."
                        )
            elif municipios_lista or esps_selecionadas:
                st.info(
                    "Preencha os municípios e selecione ao menos uma especialidade para montar a matriz."
                )


# ── ABA: EXPORTAR ─────────────────────────────────────────────
if tab_export:
    with tab_export:
        st.subheader("Exportar Credenciados")

        projetos_todos = query("SELECT id, nome FROM projetos ORDER BY nome")
        if not projetos_todos:
            st.info("Nenhum projeto cadastrado.")
        else:
            proj_map_exp = {p["nome"]: p["id"] for p in projetos_todos}
            proj_exp = st.selectbox(
                "Projeto para exportar", list(proj_map_exp.keys()), key="exp_proj"
            )
            proj_id_exp = proj_map_exp[proj_exp]

            formato = st.radio("Formato", ["CSV", "Excel (XLSX)"], horizontal=True)

            credenciados = query(
                """
                SELECT pr.razao_social, pr.nome_fantasia, pr.cnpj, pr.tipo,
                       pr.especialidade, pr.cidade, pr.uf, pr.telefone, pr.email,
                       p.data_contratacao, p.dias_ciclo, u.nome AS executivo
                FROM prospeccoes p
                JOIN prestadores pr ON pr.id = p.prestador_id
                JOIN usuarios u ON u.id = p.executivo_id
                WHERE p.projeto_id = ? AND p.etapa = 'credenciado'
                ORDER BY pr.razao_social
            """,
                (proj_id_exp,),
            )

            st.metric("Prestadores Credenciados", len(credenciados))

            if credenciados:
                df_exp = pd.DataFrame(credenciados)
                df_exp.columns = [
                    "Razão Social",
                    "Nome Fantasia",
                    "CNPJ",
                    "Tipo",
                    "Especialidade",
                    "Cidade",
                    "UF",
                    "Telefone",
                    "E-mail",
                    "Data Credenciamento",
                    "Dias de Ciclo",
                    "Executivo",
                ]
                st.dataframe(df_exp, use_container_width=True, hide_index=True)

                if formato == "CSV":
                    csv = df_exp.to_csv(index=False).encode("utf-8-sig")
                    st.download_button(
                        "Baixar CSV",
                        data=csv,
                        file_name=f"credenciados_{proj_exp.replace(' ','_')}.csv",
                        mime="text/csv",
                        use_container_width=True,
                    )
                else:
                    buf = io.BytesIO()
                    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
                        df_exp.to_excel(writer, index=False, sheet_name="Credenciados")
                    buf.seek(0)
                    st.download_button(
                        "Baixar Excel",
                        data=buf,
                        file_name=f"credenciados_{proj_exp.replace(' ','_')}.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True,
                    )

                execute(
                    """
                    INSERT INTO exportacoes (projeto_id, executivo_id, formato, registros)
                    VALUES (?, ?, ?, ?)
                """,
                    (
                        proj_id_exp,
                        user["id"],
                        formato.lower().replace(" (xlsx)", "").replace("excel", "xlsx"),
                        len(credenciados),
                    ),
                )
            else:
                st.info("Nenhum prestador credenciado neste projeto ainda.")


# ── ABA: BENCHMARK ────────────────────────────────────────────
with tab_benchmark:
    st.subheader("Benchmark de Rede")
    st.caption(
        "Importe a planilha da rede concorrente ou cadastre manualmente para comparar com o que está sendo credenciado."
    )

    projetos_bk = query("SELECT id, nome FROM projetos ORDER BY nome")
    if not projetos_bk:
        st.info("Nenhum projeto cadastrado.")
    else:
        proj_bk_map = {p["nome"]: p["id"] for p in projetos_bk}
        proj_bk_nome = st.selectbox(
            "Projeto", list(proj_bk_map.keys()), key="sel_proj_bk"
        )
        proj_bk_id = proj_bk_map[proj_bk_nome]

        qtd_bk = query(
            "SELECT COUNT(*) AS c FROM benchmark_prestadores WHERE projeto_id=?",
            (proj_bk_id,),
        )[0]["c"]
        st.caption(f"Benchmark atual: **{qtd_bk}** registros de prestadores")

        has_metas_manual = (
            query("SELECT COUNT(*) AS c FROM metas WHERE projeto_id=?", (proj_bk_id,))[
                0
            ]["c"]
            > 0
        )
        if has_metas_manual:
            st.warning(
                "⚠️ Este projeto já possui **metas manuais** cadastradas. "
                "Ao importar benchmark, o dashboard passará a usar o benchmark como referência (ele tem precedência). "
                "Para evitar conflito, considere remover as metas manuais na aba **Metas**.",
                icon="⚠️",
            )

        sub_imp, sub_manual = st.tabs(["📥 Importar Planilha", "✏️ Cadastro Manual"])

        # ── Sub-aba: Importar planilha ──────────────────────
        with sub_imp:
            st.markdown(
                "**Formato esperado:** planilha com colunas de nome, cidade, UF, especialidade (pode ter mais colunas)."
            )
            arquivo_bk = st.file_uploader(
                "Selecione o arquivo (.xlsx ou .csv)", type=["xlsx", "csv"], key="up_bk"
            )

            if arquivo_bk:
                try:
                    if arquivo_bk.name.endswith(".xlsx"):
                        abas = pd.ExcelFile(arquivo_bk).sheet_names
                        aba_escolha = st.selectbox(
                            "Aba da planilha", abas, key="aba_bk"
                        )
                        df_bk = pd.read_excel(
                            arquivo_bk, sheet_name=aba_escolha, header=0
                        )
                    else:
                        df_bk = pd.read_csv(arquivo_bk, header=0)

                    df_bk.columns = [str(c).strip() for c in df_bk.columns]
                    df_bk = df_bk.dropna(how="all")

                    st.markdown(f"**{len(df_bk)} linhas.** Pré-visualização:")
                    st.dataframe(
                        df_bk.head(4), use_container_width=True, hide_index=True
                    )

                    def find_col(df, candidates):
                        for c in df.columns:
                            if c.strip().upper() in [x.upper() for x in candidates]:
                                return c
                        return None

                    col_bk_nome = find_col(
                        df_bk,
                        [
                            "NM_PRESTADOR",
                            "PRESTADOR",
                            "NOME",
                            "RAZÃO SOCIAL",
                            "RAZAO SOCIAL",
                            "NM_LIVRO",
                        ],
                    )
                    col_bk_fant = find_col(
                        df_bk, ["NM_FANTASIA", "NOME FANTASIA", "FANTASIA"]
                    )
                    col_bk_cnpj = find_col(df_bk, ["NU_CGC_CPF", "CNPJ", "CPF"])
                    col_bk_tipo = find_col(
                        df_bk, ["TIPO_ESTABELECIMENTO", "TIPO DE PRESTADOR", "TIPO"]
                    )
                    col_bk_esp = find_col(
                        df_bk,
                        ["DS_ESPECIALIDADE", "ESPECIALIDADE", "SERVIÇOS", "SEVIÇOS"],
                    )
                    col_bk_tel = find_col(
                        df_bk, ["DS_FONE", "TELEFONE", "CONTATO", "FONE"]
                    )
                    col_bk_cid = find_col(df_bk, ["CIDADE"])
                    col_bk_uf = find_col(df_bk, ["UF"])
                    col_bk_end = find_col(
                        df_bk, ["ENDERECO", "ENDEREÇO", "DS_ENDERECO"]
                    )

                    st.divider()
                    st.markdown("**Mapeamento de colunas:**")
                    bc1, bc2 = st.columns(2)
                    all_cols = df_bk.columns.tolist()
                    none_opt = ["(nenhuma)"]

                    def sel(label, col, key, allow_none=True):
                        opts = (none_opt + all_cols) if allow_none else all_cols
                        idx = (
                            (all_cols.index(col) + (1 if allow_none else 0))
                            if col
                            else 0
                        )
                        return st.selectbox(label, opts, index=idx, key=key)

                    with bc1:
                        col_bk_nome = sel(
                            "Nome do Prestador*", col_bk_nome, "bk_nome", False
                        )
                        col_bk_cnpj = sel("CNPJ/CPF", col_bk_cnpj, "bk_cnpj")
                        col_bk_tipo = sel("Tipo", col_bk_tipo, "bk_tipo")
                        col_bk_esp = sel("Especialidade", col_bk_esp, "bk_esp")
                    with bc2:
                        col_bk_cid = sel("Cidade*", col_bk_cid, "bk_cid", False)
                        col_bk_uf = sel("UF", col_bk_uf, "bk_uf")
                        col_bk_tel = sel("Telefone", col_bk_tel, "bk_tel")
                        col_bk_fant = sel("Nome Fantasia", col_bk_fant, "bk_fant")

                    if st.button(
                        "📥 Importar Benchmark",
                        type="primary",
                        use_container_width=True,
                        key="btn_imp_bk",
                    ):
                        barra_bk = st.progress(0, text="Importando...")
                        status_bk = st.empty()
                        total_bk = len(df_bk)
                        imp_bk = 0

                        for idx, (_, row) in enumerate(df_bk.iterrows()):
                            barra_bk.progress(
                                int((idx + 1) / total_bk * 100),
                                text=f"Processando {idx+1}/{total_bk}...",
                            )
                            nome_bk_raw = str(row.get(col_bk_nome, "")).strip()
                            if not nome_bk_raw or nome_bk_raw.lower() == "nan":
                                continue

                            nome_bk = normaliza_campo(nome_bk_raw)
                            status_bk.caption(f"🔄 {nome_bk}")

                            cid_bk = normaliza_municipio(
                                str(row.get(col_bk_cid, "")).strip()
                            )
                            uf_bk = (
                                str(row.get(col_bk_uf, "")).strip().upper()[:2]
                                if col_bk_uf
                                else ""
                            )

                            # Logica restante da importacao continuaria aqui...
                except Exception as e:
                    st.error(f"Erro ao ler arquivo: {e}")
