import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import date, timedelta
from math import ceil
from auth import exige_login, usuario_logado, is_admin, is_executivo, is_cliente
from database import query, setup_database, normaliza_texto, normaliza_municipio
from ui import inject_global_style, page_header, render_sidebar
from st_aggrid import AgGrid, GridOptionsBuilder

setup_database()
exige_login()

st.set_page_config(
    page_title="Dashboard · Hocta Conecta", page_icon="📊", layout="wide"
)

inject_global_style()
render_sidebar()

page_header(
    "Dashboard",
    "Visão geral operacional e status da rede de prestadores",
    "Painel Corporativo",
)

user = usuario_logado()

ETAPAS = [
    "identificado",
    "contato_tentado",
    "contato_estabelecido",
    "proposta_enviada",
    "em_negociacao",
    "credenciado",
    "declinado",
]
ETAPA_LABEL = {
    "identificado": "Identificado",
    "contato_tentado": "Contato Tentado",
    "contato_estabelecido": "Contato Estabelecido",
    "proposta_enviada": "Proposta Enviada",
    "em_negociacao": "Em Negociação",
    "credenciado": "Credenciado",
    "declinado": "Declinado",
}

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

    .md-card {
        background: var(--c-surface);
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 18px;
        padding: 18px 20px;
        min-height: 128px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
    }
    .md-card-icon {
        font-size: 1.75rem;
        line-height: 1;
    }
    .md-card-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--c-text);
    }
    .md-card-label {
        font-size: 0.95rem;
        color: var(--c-text-2);
        line-height: 1.3;
    }
    .md-card.verde { border-color: #1e8e3e; }
    .md-card.laranja { border-color: #f29900; }
    .md-card.vermelho { border-color: #d93025; }
    .md-card.roxo { border-color: #6f42c1; }

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
CARD_ICON = {
    "": ("📊", ""),
    "verde": ("✅", "verde"),
    "laranja": ("⚡", "laranja"),
    "vermelho": ("⚠️", "vermelho"),
    "roxo": ("🎯", "roxo"),
}
CARD_SUB_CLS = {"verde": "", "laranja": "warn", "vermelho": "err", "roxo": ""}


def card(label, value, sub="", cor=""):
    icon, cls = CARD_ICON.get(cor, ("📊", ""))
    sub_cls = CARD_SUB_CLS.get(cor, "")
    sub_html = f'<div class="md-card-sub {sub_cls}">{sub}</div>' if sub else ""
    st.markdown(
        f"""
    <div class="md-card {cls}">
        <div class="md-card-icon">{icon}</div>
        <div class="md-card-value">{value}</div>
        <div class="md-card-label">{label}</div>
        {sub_html}
    </div>
    """,
        unsafe_allow_html=True,
    )


def produtividade_panels(executivo_id=None):
    """Painéis de produtividade diária e semanal. Se executivo_id=None, mostra todos."""
    hoje = date.today()
    inicio_semana = hoje - timedelta(days=hoje.weekday())  # segunda-feira
    ultimos_30 = hoje - timedelta(days=29)

    # ── Parâmetros de filtro ───────────────────────────────────
    if executivo_id:
        p_exec = (executivo_id,)
        filtro_exec = "AND i.executivo_id = ?"
        filtro_exec_p = "AND p.executivo_id = ?"
    else:
        p_exec = ()
        filtro_exec = ""
        filtro_exec_p = ""

    st.markdown(
        '<div class="md-section">📈 Produtividade</div>', unsafe_allow_html=True
    )

    tab_dia, tab_semana, tab_historico = st.tabs(
        ["Hoje", "Esta Semana", "Últimos 30 dias"]
    )

    # ── ABA: HOJE ─────────────────────────────────────────────
    with tab_dia:
        hoje_str = hoje.isoformat()

        interacoes_hoje = query(
            "SELECT COUNT(*) AS c FROM interacoes i WHERE date(i.data_hora) = ? "
            + filtro_exec,
            (hoje_str,) + p_exec,
        )[0]["c"]

        avancos_hoje = query(
            "SELECT COUNT(*) AS c FROM prospeccoes p WHERE date(p.atualizado_em) = ? "
            "AND p.etapa != 'identificado' " + filtro_exec_p,
            (hoje_str,) + p_exec,
        )[0]["c"]

        cred_hoje = query(
            "SELECT COUNT(*) AS c FROM prospeccoes p WHERE date(p.data_contratacao) = ? "
            "AND p.etapa = 'credenciado' " + filtro_exec_p,
            (hoje_str,) + p_exec,
        )[0]["c"]

        novas_hoje = query(
            "SELECT COUNT(*) AS c FROM prospeccoes p WHERE date(p.criado_em) = ? "
            + filtro_exec_p,
            (hoje_str,) + p_exec,
        )[0]["c"]

        cd1, cd2, cd3, cd4 = st.columns(4)
        with cd1:
            card("Interações", interacoes_hoje, "contatos realizados hoje")
        with cd2:
            card("Avanços de Etapa", avancos_hoje, "cards movidos hoje", cor="laranja")
        with cd3:
            card("Novas Prospecções", novas_hoje, "iniciadas hoje")
        with cd4:
            card("Credenciados", cred_hoje, "fechados hoje", cor="verde")

        # Interações por canal hoje
        canais_hoje = query(
            "SELECT i.canal, COUNT(*) AS n FROM interacoes i "
            "WHERE date(i.data_hora) = ? "
            + filtro_exec
            + " GROUP BY i.canal ORDER BY n DESC",
            (hoje_str,) + p_exec,
        )
        if canais_hoje:
            st.markdown("<br>", unsafe_allow_html=True)
            fig_canal = go.Figure(
                go.Bar(
                    x=[r["canal"].capitalize() for r in canais_hoje],
                    y=[r["n"] for r in canais_hoje],
                    marker_color=[
                        "#1E6B8A",
                        "#2A95B6",
                        "#F4A261",
                        "#27AE60",
                        "#8E44AD",
                    ],
                    text=[r["n"] for r in canais_hoje],
                    textposition="outside",
                )
            )
            fig_canal.update_layout(
                title="Interações por Canal — Hoje",
                height=240,
                margin=dict(t=40, b=10, l=10, r=10),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                yaxis=dict(showgrid=False, visible=False),
            )
            st.plotly_chart(fig_canal, use_container_width=True)
        else:
            st.info("Nenhuma interação registrada hoje.")

    # ── ABA: ESTA SEMANA ──────────────────────────────────────
    with tab_semana:
        dias_semana = [(inicio_semana + timedelta(days=i)) for i in range(7)]
        nomes_dia = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

        int_semana = query(
            "SELECT date(i.data_hora) AS dia, COUNT(*) AS n FROM interacoes i "
            "WHERE date(i.data_hora) BETWEEN ? AND ? " + filtro_exec + " GROUP BY dia",
            (inicio_semana.isoformat(), hoje.isoformat()) + p_exec,
        )
        int_por_dia = {r["dia"]: r["n"] for r in int_semana}

        cred_semana = query(
            "SELECT date(p.data_contratacao) AS dia, COUNT(*) AS n FROM prospeccoes p "
            "WHERE p.etapa = 'credenciado' AND date(p.data_contratacao) BETWEEN ? AND ? "
            + filtro_exec_p
            + " GROUP BY dia",
            (inicio_semana.isoformat(), hoje.isoformat()) + p_exec,
        )
        cred_por_dia = {r["dia"]: r["n"] for r in cred_semana}

        dias_labels = [nomes_dia[d.weekday()] for d in dias_semana]
        dias_iso = [d.isoformat() for d in dias_semana]
        vals_int = [int_por_dia.get(d, 0) for d in dias_iso]
        vals_cred = [cred_por_dia.get(d, 0) for d in dias_iso]

        fig_sem = go.Figure()
        fig_sem.add_bar(
            name="Interações",
            x=dias_labels,
            y=vals_int,
            marker_color="#1E6B8A",
            text=vals_int,
            textposition="outside",
        )
        fig_sem.add_bar(
            name="Credenciados",
            x=dias_labels,
            y=vals_cred,
            marker_color="#27AE60",
            text=vals_cred,
            textposition="outside",
        )
        fig_sem.update_layout(
            barmode="group",
            height=300,
            margin=dict(t=10, b=10, l=10, r=10),
            legend=dict(orientation="h", y=1.12),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            yaxis=dict(showgrid=True, gridcolor="#f0f0f0"),
        )
        st.plotly_chart(fig_sem, use_container_width=True)

        cs1, cs2, cs3 = st.columns(3)
        with cs1:
            card("Interações na Semana", sum(vals_int))
        with cs2:
            card("Credenciados na Semana", sum(vals_cred), cor="verde")
        with cs3:
            media_diaria = round(
                sum(vals_int) / max((hoje - inicio_semana).days + 1, 1), 1
            )
            card("Média Diária", f"{media_diaria} interações/dia", cor="roxo")

        if not executivo_id:
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown(
                '<div class="md-section">🏆 Ranking Semanal por Executivo</div>',
                unsafe_allow_html=True,
            )
            ranking = query(
                """
                SELECT u.nome, COUNT(i.id) AS interacoes,
                       SUM(CASE WHEN p2.etapa='credenciado' AND date(p2.data_contratacao) BETWEEN ? AND ? THEN 1 ELSE 0 END) AS credenciados
                FROM usuarios u
                LEFT JOIN interacoes i ON i.executivo_id = u.id AND date(i.data_hora) BETWEEN ? AND ?
                LEFT JOIN prospeccoes p2 ON p2.executivo_id = u.id
                WHERE u.perfil = 'executivo'
                GROUP BY u.id ORDER BY interacoes DESC
            """,
                (
                    inicio_semana.isoformat(),
                    hoje.isoformat(),
                    inicio_semana.isoformat(),
                    hoje.isoformat(),
                ),
            )
            if ranking:
                df_rank = pd.DataFrame(ranking)
                df_rank.columns = ["Executivo", "Interações", "Credenciados"]
                st.dataframe(df_rank, use_container_width=True, hide_index=True)

    # ── ABA: ÚLTIMOS 30 DIAS ──────────────────────────────────
    with tab_historico:
        int_30 = query(
            "SELECT date(i.data_hora) AS dia, COUNT(*) AS n FROM interacoes i "
            "WHERE date(i.data_hora) BETWEEN ? AND ? "
            + filtro_exec
            + " GROUP BY dia ORDER BY dia",
            (ultimos_30.isoformat(), hoje.isoformat()) + p_exec,
        )
        cred_30 = query(
            "SELECT date(p.data_contratacao) AS dia, COUNT(*) AS n FROM prospeccoes p "
            "WHERE p.etapa = 'credenciado' AND date(p.data_contratacao) BETWEEN ? AND ? "
            + filtro_exec_p
            + " GROUP BY dia ORDER BY dia",
            (ultimos_30.isoformat(), hoje.isoformat()) + p_exec,
        )

        if int_30 or cred_30:
            all_days = [(ultimos_30 + timedelta(days=i)).isoformat() for i in range(30)]
            int_map = {r["dia"]: r["n"] for r in int_30}
            cred_map = {r["dia"]: r["n"] for r in cred_30}

            fig_30 = go.Figure()
            fig_30.add_bar(
                name="Interações",
                x=all_days,
                y=[int_map.get(d, 0) for d in all_days],
                marker_color="#1E6B8A",
                opacity=0.7,
            )
            fig_30.add_scatter(
                name="Credenciados (acum.)",
                x=all_days,
                y=pd.Series([cred_map.get(d, 0) for d in all_days]).cumsum().tolist(),
                mode="lines+markers",
                line=dict(color="#27AE60", width=2),
                yaxis="y2",
            )
            fig_30.update_layout(
                height=320,
                margin=dict(t=10, b=10, l=10, r=10),
                legend=dict(orientation="h", y=1.12),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                yaxis=dict(title="Interações", showgrid=True, gridcolor="#f0f0f0"),
                yaxis2=dict(
                    title="Credenciados acum.",
                    overlaying="y",
                    side="right",
                    showgrid=False,
                ),
            )
            st.plotly_chart(fig_30, use_container_width=True)

            cr1, cr2, cr3, cr4 = st.columns(4)
            with cr1:
                card("Interações (30d)", sum(int_map.values()))
            with cr2:
                card("Credenciados (30d)", sum(cred_map.values()), cor="verde")
            with cr3:
                novas_30 = query(
                    "SELECT COUNT(*) AS c FROM prospeccoes p WHERE date(p.criado_em) BETWEEN ? AND ? "
                    + filtro_exec_p,
                    (ultimos_30.isoformat(), hoje.isoformat()) + p_exec,
                )[0]["c"]
                card("Novas Prospecções (30d)", novas_30)
            with cr4:
                dias_com_ativ = len(int_map)
                card("Dias com Atividade", f"{dias_com_ativ}/30", cor="roxo")
        else:
            st.info("Nenhuma atividade nos últimos 30 dias.")


def funil_chart(dados):
    etapas_funil = [e for e in ETAPAS if e not in ("credenciado", "declinado")]
    contagens = {e: 0 for e in etapas_funil}
    for d in dados:
        if d["etapa"] in contagens:
            contagens[d["etapa"]] += 1
    labels = [ETAPA_LABEL[e] for e in etapas_funil]
    values = [contagens[e] for e in etapas_funil]
    if not any(values):
        return None
    fig = go.Figure(
        go.Funnel(
            y=labels,
            x=values,
            textinfo="value+percent previous",
            marker_color=["#1E6B8A", "#2480A0", "#2A95B6", "#30AACC", "#36BFE2"],
        )
    )
    fig.update_layout(
        margin=dict(t=10, b=10, l=10, r=10),
        height=300,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    return fig


# ── Dashboard do Executivo ─────────────────────────────────────
def dashboard_executivo():
    hoje = date.today().isoformat()

    st.markdown(
        f"""
    <div class="hocta-banner">
        <div style="font-size:2.5rem;">🎯</div>
        <div>
            <div style="font-size:1.4rem; font-weight:700;">Olá, {user['nome'].split()[0]}!</div>
            <div style="opacity:0.8; font-size:0.9rem;">{date.today().strftime('%A, %d de %B de %Y').capitalize()} · Hocta Conecta</div>
        </div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    total_prospeccoes = query(
        "SELECT COUNT(*) AS c FROM prospeccoes WHERE etapa NOT IN ('declinado')"
    )[0]["c"]
    total_credenciados = query(
        "SELECT COUNT(*) AS c FROM prospeccoes WHERE etapa = 'credenciado'"
    )[0]["c"]
    total_projetos = query("SELECT COUNT(*) AS c FROM projetos WHERE status = 'ativo'")[0]["c"]
    interacoes_30 = query(
        "SELECT COUNT(*) AS c FROM interacoes WHERE date(data_hora) BETWEEN date('now','-29 days') AND date('now')"
    )[0]["c"]
    novas_30 = query(
        "SELECT COUNT(*) AS c FROM prospeccoes WHERE date(criado_em) BETWEEN date('now','-29 days') AND date('now')"
    )[0]["c"]
    taxa_geral = round(total_credenciados / total_prospeccoes * 100, 1) if total_prospeccoes else 0

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        card("Projetos Ativos", total_projetos, "Visão geral do portfólio")
    with c2:
        card(
            "Prospecções em Aberto",
            total_prospeccoes,
            "Exclui prospecções declinadas",
            cor="laranja",
        )
    with c3:
        card("Credenciados Totais", total_credenciados, "Rede credenciada atual", cor="verde")
    with c4:
        card("Conversão Global", f"{taxa_geral}%", "Meta de fechamento", cor="roxo")
    with c5:
        card("Atividade 30d", f"{interacoes_30} interações", f"{novas_30} prospecções iniciadas")

    atividades = query(
        "SELECT date(i.data_hora) AS dia, COUNT(*) AS n FROM interacoes i "
        "WHERE date(i.data_hora) BETWEEN date('now','-29 days') AND date('now') "
        "GROUP BY dia ORDER BY dia"
    )
    cred_trend = query(
        "SELECT date(data_contratacao) AS dia, COUNT(*) AS n FROM prospeccoes "
        "WHERE etapa = 'credenciado' AND date(data_contratacao) BETWEEN date('now','-29 days') AND date('now') "
        "GROUP BY dia ORDER BY dia"
    )

    if atividades or cred_trend:
        st.markdown('<div class="md-section">Tendência Corporativa</div>', unsafe_allow_html=True)
        dias = [d["dia"] for d in atividades]
        inter_val = [d["n"] for d in atividades]
        cred_map = {d["dia"]: d["n"] for d in cred_trend}
        fig_trend = go.Figure()
        fig_trend.add_trace(
            go.Scatter(
                x=dias,
                y=inter_val,
                name="Interações",
                mode="lines+markers",
                line=dict(color="#1E6B8A", width=3),
            )
        )
        fig_trend.add_trace(
            go.Bar(
                x=dias,
                y=[cred_map.get(d, 0) for d in dias],
                name="Credenciados",
                marker_color="#27AE60",
                opacity=0.75,
            )
        )
        fig_trend.update_layout(
            height=300,
            margin=dict(t=30, b=10, l=10, r=10),
            legend=dict(orientation="h", y=1.1),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(showgrid=False),
            yaxis=dict(showgrid=True, gridcolor="#f0f0f0"),
        )
        st.plotly_chart(fig_trend, use_container_width=True)

    inativos = query(
        """
        SELECT p.id, pr.razao_social, pj.nome AS projeto, MAX(i.data_hora) AS ultima_interacao
        FROM prospeccoes p
        JOIN prestadores pr ON pr.id = p.prestador_id
        JOIN projetos pj ON pj.id = p.projeto_id
        LEFT JOIN interacoes i ON i.prospeccao_id = p.id
        WHERE p.etapa NOT IN ('credenciado','declinado')
        GROUP BY p.id
        HAVING ultima_interacao IS NULL OR date(ultima_interacao) <= date('now','-14 days')
        ORDER BY ultima_interacao ASC
        LIMIT 8
        """
    )

    st.markdown('<div class="md-section">Alertas de Inatividade</div>', unsafe_allow_html=True)
    if inativos:
        for item in inativos:
            ultima = item["ultima_interacao"] or "sem registro"
            st.markdown(
                f"""
            <div class=\"fu-card\" style=\"border-left:3px solid #f29900;\">
                <span class=\"fu-dot\">⚠️</span>
                <div><div class=\"fu-name\">{item['razao_social']}</div>
                <div class=\"fu-sub\">Projeto: {item['projeto']} · Última interação: {ultima}</div></div>
            </div>
            """,
                unsafe_allow_html=True,
            )
    else:
        st.success("✅ Nenhuma prospecção inativa detectada nos últimos 14 dias.")

    ranking_geral = query(
        """
        SELECT u.nome,
               COALESCE(i.interacoes, 0) AS interacoes,
               COALESCE(c.credenciados, 0) AS credenciados
        FROM usuarios u
        LEFT JOIN (
            SELECT executivo_id, COUNT(*) AS interacoes
            FROM interacoes
            GROUP BY executivo_id
        ) i ON i.executivo_id = u.id
        LEFT JOIN (
            SELECT executivo_id, COUNT(*) AS credenciados
            FROM prospeccoes
            WHERE etapa = 'credenciado'
            GROUP BY executivo_id
        ) c ON c.executivo_id = u.id
        WHERE u.perfil = 'executivo'
        ORDER BY credenciados DESC, interacoes DESC
        LIMIT 8
        """
    )

    if ranking_geral:
        st.markdown('<div class="md-section">Ranking Geral de Executivos</div>', unsafe_allow_html=True)
        df_rank = pd.DataFrame(ranking_geral)
        df_rank.columns = ["Executivo", "Interações", "Credenciados"]
        st.dataframe(df_rank, use_container_width=True, hide_index=True)

    prospeccoes = query(
        """
        SELECT p.*, pr.razao_social, pj.nome AS projeto_nome,
               (
                   SELECT i.data_followup FROM interacoes i
                   WHERE i.prospeccao_id = p.id AND i.data_followup IS NOT NULL
                   ORDER BY i.data_followup DESC LIMIT 1
               ) AS data_followup
        FROM prospeccoes p
        JOIN prestadores pr ON pr.id = p.prestador_id
        JOIN projetos pj ON pj.id = p.projeto_id
        WHERE p.executivo_id = ?
    """,
        (user["id"],),
    )

    abertas = [p for p in prospeccoes if p["etapa"] not in ("credenciado", "declinado")]
    credenciados = [p for p in prospeccoes if p["etapa"] == "credenciado"]
    total = len(prospeccoes)
    taxa = round(len(credenciados) / total * 100, 1) if total else 0

    followups_hoje = query(
        """
        SELECT i.*, pr.razao_social, i.proxima_acao
        FROM interacoes i
        JOIN prospeccoes p ON p.id = i.prospeccao_id
        JOIN prestadores pr ON pr.id = p.prestador_id
        WHERE i.executivo_id = ? AND i.data_followup = ?
    """,
        (user["id"], hoje),
    )

    followups_venc = query(
        """
        SELECT i.*, pr.razao_social
        FROM interacoes i
        JOIN prospeccoes p ON p.id = i.prospeccao_id
        JOIN prestadores pr ON pr.id = p.prestador_id
        WHERE i.executivo_id = ? AND i.data_followup < ? AND p.etapa NOT IN ('credenciado','declinado')
    """,
        (user["id"], hoje),
    )

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        card("Prospecções Abertas", len(abertas), cor="")
    with c2:
        card(
            "Follow-ups Hoje",
            len(followups_hoje),
            "⚠️ Vencidos: " + str(len(followups_venc)) if followups_venc else "",
            cor="laranja" if followups_hoje else "",
        )
    with c3:
        card("Credenciados", len(credenciados), cor="verde")
    with c4:
        card("Taxa de Conversão", f"{taxa}%", cor="roxo")

    st.markdown("<br>", unsafe_allow_html=True)
    col_f, col_r = st.columns([1, 1])

    with col_f:
        st.markdown(
            '<div class="md-section">Funil de Prospecções</div>', unsafe_allow_html=True
        )
        if abertas:
            _fig_funil = funil_chart(abertas)
            if _fig_funil:
                st.plotly_chart(_fig_funil, use_container_width=True)
            else:
                st.info("Todas as prospecções estão credenciadas ou declinadas.")
        else:
            st.info("Nenhuma prospecção em andamento.")

    with col_r:
        st.markdown(
            '<div class="md-section">Agenda de Hoje</div>', unsafe_allow_html=True
        )
        if followups_venc:
            for f in followups_venc:
                st.markdown(
                    f"""<div class="fu-card" style="border-left:3px solid #d93025;">
                    <span class="fu-dot">🔴</span>
                    <div><div class="fu-name">{f['razao_social']}</div>
                    <div class="fu-sub">Vencido · {f['proxima_acao'] or '—'}</div></div>
                </div>""",
                    unsafe_allow_html=True,
                )
        if followups_hoje:
            for f in followups_hoje:
                st.markdown(
                    f"""<div class="fu-card" style="border-left:3px solid #f29900;">
                    <span class="fu-dot">🟡</span>
                    <div><div class="fu-name">{f['razao_social']}</div>
                    <div class="fu-sub">Hoje · {f['proxima_acao'] or '—'}</div></div>
                </div>""",
                    unsafe_allow_html=True,
                )
        if not followups_hoje and not followups_venc:
            st.success("✅ Nenhum follow-up pendente hoje!")

    st.markdown("<br>", unsafe_allow_html=True)
    produtividade_panels(executivo_id=user["id"])

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(
        '<div class="md-section">Minhas Prospecções</div>', unsafe_allow_html=True
    )
    if prospeccoes:
        df = pd.DataFrame(prospeccoes)[
            ["razao_social", "projeto_nome", "etapa", "data_inicio", "data_followup"]
        ]
        df.columns = ["Prestador", "Projeto", "Etapa", "Início", "Próximo Follow-up"]
        df["Etapa"] = df["Etapa"].map(ETAPA_LABEL).fillna(df["Etapa"])
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("Nenhuma prospecção registrada ainda.")


# ── Dashboard do Projeto ──────────────────────────────────────
def dashboard_projeto(kpfx: str = "dp"):
    hoje_str = date.today().strftime("%d/%m/%Y")
    st.markdown(
        f"""
    <div class="hocta-banner">
        <div style="font-size:2.5rem;">📊</div>
        <div>
            <div style="font-size:1.4rem; font-weight:700;">Dashboard do Projeto</div>
            <div style="opacity:0.8; font-size:0.9rem;">{hoje_str} · Hocta Conecta</div>
        </div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    if is_admin():
        projetos = query("SELECT * FROM projetos WHERE status = 'ativo' ORDER BY nome")
    elif is_executivo():
        projetos = query(
            """
            SELECT pj.* FROM projetos pj
            JOIN executivo_projeto ep ON ep.projeto_id = pj.id
            WHERE ep.executivo_id = ? AND pj.status = 'ativo'
            ORDER BY pj.nome
        """,
            (user["id"],),
        )
        if not projetos:
            st.info("Você ainda não está vinculado a nenhum projeto ativo.")
            return
    else:
        clientes_vinc = query(
            "SELECT cliente_id FROM usuario_cliente WHERE usuario_id = ?", (user["id"],)
        )
        ids_clientes = [c["cliente_id"] for c in clientes_vinc]
        if not ids_clientes:
            st.warning("Nenhum projeto vinculado ao seu perfil.")
            return
        placeholders = ",".join("?" * len(ids_clientes))
        projetos = query(
            f"SELECT * FROM projetos WHERE cliente_id IN ({placeholders}) AND status='ativo'",
            tuple(ids_clientes),
        )

    if not projetos:
        st.info("Nenhum projeto ativo.")
        return

    projeto_map = {p["nome"]: p for p in projetos}
    escolha = st.selectbox(
        "Selecione o projeto", list(projeto_map.keys()), key=f"{kpfx}_proj"
    )
    proj = projeto_map[escolha]

    metas = query("SELECT * FROM metas WHERE projeto_id = ?", (proj["id"],))
    bk_esps_raw = query(
        "SELECT cidade AS municipio, especialidade, quantidade AS quantidade_meta "
        "FROM benchmark_especialidades WHERE projeto_id=? ORDER BY cidade, especialidade",
        (proj["id"],),
    )
    prospeccoes = query(
        """
        SELECT p.*, pr.razao_social, pr.especialidade, pr.cidade
        FROM prospeccoes p JOIN prestadores pr ON pr.id = p.prestador_id
        WHERE p.projeto_id = ?
    """,
        (proj["id"],),
    )

    if bk_esps_raw:
        metas_unificadas = [dict(r) for r in bk_esps_raw]
        fonte_meta = "benchmark"
    elif metas:
        metas_unificadas = [
            {
                "municipio": m["municipio"],
                "especialidade": m["especialidade"],
                "quantidade_meta": m["quantidade_meta"],
            }
            for m in metas
        ]
        fonte_meta = "metas"
    else:
        metas_unificadas = []
        fonte_meta = None

    total_meta = sum(m["quantidade_meta"] for m in metas_unificadas)
    prospectados = len([p for p in prospeccoes if p["etapa"] not in ("declinado",)])
    credenciados_n = len([p for p in prospeccoes if p["etapa"] == "credenciado"])
    declinados = len([p for p in prospeccoes if p["etapa"] == "declinado"])

    prof_cred_res = query(
        """
        SELECT COALESCE(SUM(
            CASE
                WHEN pe.id IS NOT NULL THEN pe.quantidade_profissionais
                ELSE 1
            END
        ), 0) AS total
        FROM prospeccoes p
        JOIN prestadores pr ON pr.id = p.prestador_id
        LEFT JOIN prestador_especialidades pe ON pe.prestador_id = p.prestador_id
        WHERE p.projeto_id = ? AND p.etapa = 'credenciado'
        GROUP BY p.id
    """,
        (proj["id"],),
    )
    prof_credenciados = sum(r["total"] for r in prof_cred_res) if prof_cred_res else 0

    ciclos = [p["dias_ciclo"] for p in prospeccoes if p["dias_ciclo"]]
    tempo_medio = round(sum(ciclos) / len(ciclos), 1) if ciclos else None
    pct_meta = (
        min(round(prof_credenciados / total_meta * 100), 100) if total_meta else 0
    )

    st.markdown(f"### {proj['nome']}")

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        card("Meta (profissionais)", total_meta)
    with c2:
        card("Prospectados", prospectados)
    with c3:
        card(
            "Credenciados",
            f"{credenciados_n} prest.",
            f"{prof_credenciados} prof.",
            cor="verde",
        )
    with c4:
        card("Declinados", declinados, cor="vermelho" if declinados else "")
    with c5:
        card("Ciclo Médio", f"{tempo_medio}d" if tempo_medio else "—", cor="")

    st.markdown("<br>", unsafe_allow_html=True)
    cor_prog = (
        "#1e8e3e" if pct_meta >= 100 else "#1558a8" if pct_meta >= 50 else "#f29900"
    )
    st.markdown(
        f"""
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
        <div style="flex:1;">
            <div class="md-progress-wrap">
                <div class="md-progress-bar" style="width:{pct_meta}%;background:{cor_prog};"></div>
            </div>
        </div>
        <span class="md-chip">{pct_meta}%</span>
    </div>
    <div style="font-size:0.8rem;color:#5f6368;margin-bottom:20px;">
        <b>{prof_credenciados}</b> de <b>{total_meta}</b> profissionais credenciados
    </div>
    """,
        unsafe_allow_html=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)
    c6, c7, c8 = st.columns(3)
    with c6:
        card(
            "Meta Atingida",
            f"{pct_meta}%",
            f"{prof_credenciados} de {total_meta} profissionais",
            cor="verde" if pct_meta >= 100 else "laranja" if pct_meta >= 60 else "",
        )
    with c7:
        card(
            "Prospecções em Andamento",
            sum(1 for p in prospeccoes if p["etapa"] not in ("credenciado", "declinado")),
            "Carteira ativa do projeto",
            cor="laranja",
        )
    with c8:
        conversao_local = round(credenciados_n / prospectados * 100, 1) if prospectados else 0
        card(
            "Conversão do Projeto",
            f"{conversao_local}%",
            "Credenciados x Prospectados",
            cor="roxo",
        )

    # ══════════════════════════════════════════════════════════
    # ABAS PRINCIPAIS DO PROJETO
    # ══════════════════════════════════════════════════════════
    tab_plan, tab_prosp, tab_cred = st.tabs(
        [
            "📋 Planejamento",
            "🎯 Prospecção Ativa",
            "✅ Credenciamentos",
        ]
    )

    # ── ABA 1 — PLANEJAMENTO ──
    with tab_plan:
        lbl_meta = "Benchmark" if fonte_meta == "benchmark" else "Meta"
        st.markdown(
            f'<div class="md-section">{lbl_meta} por Especialidade</div>',
            unsafe_allow_html=True,
        )

        if metas_unificadas:
            rows = []
            for m in metas_unificadas:
                prof_cred = query(
                    """
                    SELECT COALESCE(SUM(
                        CASE WHEN pe.id IS NOT NULL THEN pe.quantidade_profissionais ELSE 1 END
                    ), 0) AS total
                    FROM prospeccoes p
                    JOIN prestadores pr ON pr.id = p.prestador_id
                    LEFT JOIN prestador_especialidades pe
                        ON pe.prestador_id = pr.id
                        AND UPPER(TRIM(pe.especialidade)) = UPPER(TRIM(?))
                    WHERE p.projeto_id = ? AND p.etapa = 'credenciado'
                      AND pr.cidade = ?
                      AND (pe.id IS NOT NULL OR UPPER(TRIM(pr.especialidade)) = UPPER(TRIM(?)))
                """,
                    (
                        m["especialidade"],
                        proj["id"],
                        m["municipio"],
                        m["especialidade"],
                    ),
                )[0]["total"]

                prof_prosp = query(
                    """
                    SELECT COALESCE(SUM(
                        CASE WHEN pe.id IS NOT NULL THEN pe.quantidade_profissionais ELSE 1 END
                    ), 0) AS total
                    FROM prospeccoes p
                    JOIN prestadores pr ON pr.id = p.prestador_id
                    LEFT JOIN prestador_especialidades pe
                        ON pe.prestador_id = pr.id
                        AND UPPER(TRIM(pe.especialidade)) = UPPER(TRIM(?))
                    WHERE p.projeto_id = ? AND p.etapa NOT IN ('credenciado','declinado')
                      AND pr.cidade = ?
                      AND (pe.id IS NOT NULL OR UPPER(TRIM(pr.especialidade)) = UPPER(TRIM(?)))
                """,
                    (
                        m["especialidade"],
                        proj["id"],
                        m["municipio"],
                        m["especialidade"],
                    ),
                )[0]["total"]

                rows.append(
                    {
                        "Município": m["municipio"],
                        "Especialidade": m["especialidade"],
                        lbl_meta: m["quantidade_meta"],
                        "Credenciados": prof_cred,
                        "Em Prospecção": prof_prosp,
                    }
                )

            municipios_disponiveis = sorted({r["Município"] for r in rows})
            filtro_mun = st.selectbox(
                "Filtrar por município",
                ["Todos"] + municipios_disponiveis,
                key=f"{kpfx}_filtro_mun",
            )
            rows_filtrados = (
                rows
                if filtro_mun == "Todos"
                else [r for r in rows if r["Município"] == filtro_mun]
            )

            df_mun = (
                pd.DataFrame(rows)
                .groupby("Município", as_index=False)[[lbl_meta, "Credenciados", "Em Prospecção"]]
                .sum()
            )
            if not df_mun.empty:
                df_mun["Atingido (%)"] = (
                    df_mun["Credenciados"] / df_mun[lbl_meta] * 100
                ).fillna(0).round(1)
                df_mun["Gap"] = df_mun[lbl_meta] - df_mun["Credenciados"]

                st.markdown(
                    '<div class="md-section">Cobertura por Município</div>',
                    unsafe_allow_html=True,
                )
                mun_top = df_mun.sort_values("Atingido (%)", ascending=False).head(4)
                cols = st.columns(min(4, len(mun_top)))
                for col, (_, row) in zip(cols, mun_top.iterrows()):
                    with col:
                        card(
                            row["Município"],
                            f"{row['Atingido (%)']}%",
                            f"{row['Credenciados']} / {row[lbl_meta]}",
                            cor="verde" if row["Atingido (%)"] >= 80 else "laranja",
                        )

            if rows_filtrados:
                df_g = (
                    pd.DataFrame(rows_filtrados)
                    .groupby("Especialidade", as_index=False)[
                        [lbl_meta, "Credenciados", "Em Prospecção"]
                    ]
                    .sum()
                )
                df_g = df_g.sort_values(lbl_meta, ascending=True)

                fig_metas = go.Figure()
                fig_metas.add_bar(
                    name=lbl_meta,
                    y=df_g["Especialidade"],
                    x=df_g[lbl_meta],
                    orientation="h",
                    marker_color="#e8eaed",
                    opacity=0.9,
                    marker_line=dict(color="#1E6B8A", width=1),
                    text=df_g[lbl_meta],
                    textposition="outside",
                )
                fig_metas.add_bar(
                    name="Em Prospecção",
                    y=df_g["Especialidade"],
                    x=df_g["Credenciados"] + df_g["Em Prospecção"],
                    orientation="h",
                    marker_color="#fbbf24",
                    opacity=0.85,
                )
                fig_metas.add_bar(
                    name="Credenciados",
                    y=df_g["Especialidade"],
                    x=df_g["Credenciados"],
                    orientation="h",
                    marker_color="#1e8e3e",
                    text=df_g["Credenciados"].apply(lambda v: str(v) if v > 0 else ""),
                    textposition="inside",
                    insidetextanchor="start",
                )
                fig_metas.update_layout(
                    barmode="overlay",
                    height=max(350, len(df_g) * 35),
                    margin=dict(t=10, b=10, l=10, r=40),
                    legend=dict(orientation="h", y=1.08, x=0),
                    paper_bgcolor="rgba(0,0,0,0)",
                    plot_bgcolor="rgba(0,0,0,0)",
                    xaxis=dict(
                        title="Quantidade de Profissionais",
                        showgrid=True,
                        gridcolor="#F1F5F9",
                    ),
                    yaxis=dict(title=None, showgrid=False),
                )
                st.plotly_chart(fig_metas, use_container_width=True)

                st.markdown("<br>", unsafe_allow_html=True)
                df_detalhado = pd.DataFrame(rows_filtrados)

                gb = GridOptionsBuilder.from_dataframe(df_detalhado)
                gb.configure_default_column(
                    editable=False, groupable=True, filter=True, sortable=True
                )
                gb.configure_pagination(
                    paginationAutoPageSize=False, paginationPageSize=10
                )
                grid_options = gb.build()

                AgGrid(
                    df_detalhado, gridOptions=grid_options, theme="alpine", height=320
                )

                benchmark_prestadores = query(
                    "SELECT * FROM benchmark_prestadores WHERE projeto_id = ? ORDER BY cidade, razao_social",
                    (proj["id"],),
                )
                if benchmark_prestadores:
                    nomes_prosp = {
                        normaliza_texto(p["razao_social"])
                        for p in prospeccoes
                        if p.get("razao_social")
                    }
                    bench_rows = []
                    for b in benchmark_prestadores:
                        nome_norm = normaliza_texto(b["razao_social"])
                        status = (
                            "Coincidente"
                            if nome_norm in nomes_prosp
                            else "Exclusivo"
                        )
                        bench_rows.append(
                            {
                                "Prestador Benchmark": b["razao_social"],
                                "Cidade": b["cidade"],
                                "Especialidade": b["especialidade"],
                                "Status": status,
                            }
                        )

                    st.markdown(
                        '<div class="md-section">Benchmark de Prestadores</div>',
                        unsafe_allow_html=True,
                    )
                    st.caption(
                        f"Total benchmark: {len(benchmark_prestadores)} — Coindicentes: {sum(1 for r in bench_rows if r['Status'] == 'Coincidente')} — Exclusivos: {sum(1 for r in bench_rows if r['Status'] == 'Exclusivo')}"
                    )
                    df_bench = pd.DataFrame(bench_rows)
                    gb_bench = GridOptionsBuilder.from_dataframe(df_bench)
                    gb_bench.configure_default_column(filter=True, sortable=True)
                    gb_bench.configure_pagination(paginationPageSize=10)
                    AgGrid(df_bench, gridOptions=gb_bench.build(), theme="alpine", height=280)
            else:
                st.info("Nenhuma meta encontrada para o filtro selecionado.")
        else:
            st.info("Nenhuma meta ou benchmark configurado para este projeto.")

    # ── ABA 2 — PROSPECÇÃO ATIVA ──
    with tab_prosp:
        st.markdown(
            '<div class="md-section">Funil e Cards em Andamento</div>',
            unsafe_allow_html=True,
        )
        abertas_proj = [
            p for p in prospeccoes if p["etapa"] not in ("credenciado", "declinado")
        ]

        followups_hoje_proj = query(
            """
            SELECT COUNT(DISTINCT i.prospeccao_id) AS c
            FROM interacoes i
            JOIN prospeccoes p ON p.id = i.prospeccao_id
            WHERE p.projeto_id = ? AND i.data_followup = date('now')
            """,
            (proj["id"],),
        )[0]["c"]
        followups_venc_proj = query(
            """
            SELECT COUNT(DISTINCT i.prospeccao_id) AS c
            FROM interacoes i
            JOIN prospeccoes p ON p.id = i.prospeccao_id
            WHERE p.projeto_id = ? AND i.data_followup < date('now')
              AND p.etapa NOT IN ('credenciado','declinado')
            """,
            (proj["id"],),
        )[0]["c"]

        exec_ranking = query(
            """
            SELECT u.nome,
                   COUNT(p.id) AS prospeccoes,
                   SUM(CASE WHEN p.etapa = 'credenciado' THEN 1 ELSE 0 END) AS credenciados
            FROM usuarios u
            JOIN prospeccoes p ON p.executivo_id = u.id
            WHERE p.projeto_id = ? AND u.perfil = 'executivo'
            GROUP BY u.id
            ORDER BY credenciados DESC, prospeccoes DESC
            LIMIT 8
            """,
            (proj["id"],),
        )

        c1, c2, c3 = st.columns(3)
        with c1:
            card("Prospecções em Andamento", len(abertas_proj), "Carteira ativa")
        with c2:
            card(
                "Follow-ups Hoje",
                followups_hoje_proj,
                "Pendentes na agenda",
                cor="laranja" if followups_hoje_proj else "",
            )
        with c3:
            card(
                "Follow-ups Vencidos",
                followups_venc_proj,
                "Ação imediata",
                cor="vermelho" if followups_venc_proj else "",
            )

        if abertas_proj:
            col_funil, col_lista = st.columns([1.3, 1])
            with col_funil:
                fig_f = funil_chart(abertas_proj)
                if fig_f:
                    st.plotly_chart(fig_f, use_container_width=True)
                else:
                    st.info("Sem dados suficientes para gerar o funil.")

            with col_lista:
                df_abertas = pd.DataFrame(abertas_proj)[
                    ["razao_social", "especialidade", "cidade", "etapa"]
                ]
                df_abertas.columns = [
                    "Razão Social",
                    "Especialidade",
                    "Município",
                    "Etapa Atual",
                ]
                df_abertas["Etapa Atual"] = (
                    df_abertas["Etapa Atual"]
                    .map(ETAPA_LABEL)
                    .fillna(df_abertas["Etapa Atual"])
                )

                gb_ab = GridOptionsBuilder.from_dataframe(df_abertas)
                gb_ab.configure_default_column(filter=True, sortable=True)
                AgGrid(
                    df_abertas, gridOptions=gb_ab.build(), theme="alpine", height=320
                )

            if exec_ranking:
                st.markdown(
                    '<div class="md-section">Ranking de Executivos</div>',
                    unsafe_allow_html=True,
                )
                df_exec = pd.DataFrame(exec_ranking)
                df_exec.columns = ["Executivo", "Prospecções", "Credenciados"]
                st.dataframe(df_exec, use_container_width=True, hide_index=True)
        else:
            st.success("🎉 Todas as prospecções deste projeto foram concluídas!")

    # ── ABA 3 — CREDENCIAMENTOS ──
    with tab_cred:
        st.markdown(
            '<div class="md-section">Rede Credenciada do Projeto</div>',
            unsafe_allow_html=True,
        )
        cred_proj = [p for p in prospeccoes if p["etapa"] == "credenciado"]

        if cred_proj:
            df_cred = pd.DataFrame(cred_proj)[
                ["razao_social", "especialidade", "cidade", "data_contratacao"]
            ]
            df_cred.columns = [
                "Prestador Parceiro",
                "Especialidade Atendida",
                "Cidade",
                "Data de Fechamento",
            ]

            df_cred["Data de Fechamento"] = pd.to_datetime(
                df_cred["Data de Fechamento"]
            )
            df_cron = (
                df_cred.groupby("Data de Fechamento")
                .size()
                .reset_index(name="Quantidade")
            )
            df_cron = df_cron.sort_values("Data de Fechamento")
            df_cron["Acumulado"] = df_cron["Quantidade"].cumsum()

            total_30 = df_cron["Quantidade"].tail(30).sum() if not df_cron.empty else 0
            media_diaria = round(total_30 / 30, 2) if total_30 else 0
            restante = max(total_meta - prof_credenciados, 0)
            dias_para_meta = ceil(restante / media_diaria) if media_diaria > 0 else None
            previsao = (
                (date.today() + timedelta(days=dias_para_meta)).strftime("%d/%m/%Y")
                if dias_para_meta
                else "Dados insuficientes"
            )

            c1, c2, c3 = st.columns(3)
            with c1:
                card(
                    "Meta Restante",
                    f"{restante} perf.",
                    "Profissionais ainda a credenciar",
                    cor="laranja" if restante > 0 else "verde",
                )
            with c2:
                card(
                    "Média 30d",
                    f"{media_diaria} / dia",
                    "Velocidade atual de credenciamento",
                    cor="roxo",
                )
            with c3:
                card(
                    "Conclusão Prevista",
                    previsao,
                    "Estimativa com ritmo atual",
                    cor="verde" if dias_para_meta and dias_para_meta <= 30 else "laranja",
                )

            fig_line = go.Figure()
            fig_line.add_trace(
                go.Scatter(
                    x=df_cron["Data de Fechamento"],
                    y=df_cron["Acumulado"],
                    mode="lines+markers",
                    name="Prestadores",
                    line=dict(color="#27AE60", width=3),
                )
            )

            if restante and media_diaria > 0:
                ultima_data = df_cron["Data de Fechamento"].max()
                base_acum = df_cron["Acumulado"].iloc[-1]
                proj_days = dias_para_meta or 0
                proj_dates = [ultima_data + timedelta(days=i) for i in range(1, proj_days + 1)]
                proj_values = [base_acum + round(media_diaria * i) for i in range(1, proj_days + 1)]
                fig_line.add_trace(
                    go.Scatter(
                        x=proj_dates,
                        y=proj_values,
                        mode="lines",
                        name="Projeção",
                        line=dict(color="#d93025", dash="dash"),
                    )
                )

            fig_line.update_layout(
                title="Velocidade de Entrada de Novos Prestadores (Acumulado)",
                height=300,
                margin=dict(t=40, b=10, l=10, r=10),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                xaxis=dict(showgrid=True, gridcolor="#F1F5F9"),
                yaxis=dict(showgrid=True, gridcolor="#F1F5F9"),
            )
            st.plotly_chart(fig_line, use_container_width=True)

            gb_cr = GridOptionsBuilder.from_dataframe(df_cred)
            gb_cr.configure_default_column(filter=True, sortable=True)
            gb_cr.configure_pagination(paginationPageSize=10)
            st.markdown("<br>", unsafe_allow_html=True)
            AgGrid(df_cred, gridOptions=gb_cr.build(), theme="alpine", height=320)
        else:
            st.info(
                "Nenhum prestador foi finalizado como 'Credenciado' para este projeto ainda."
            )


# ── Roteamento Interno das Visualizações do Dashboard ──────────
if is_cliente():
    dashboard_projeto(kpfx="cli")
else:
    visualizacao = st.segmented_control(
        "Mudar Visão",
        options=["Meu Painel Operacional", "Métricas por Projeto"],
        default="Meu Painel Operacional",
    )
    st.markdown("<br>", unsafe_allow_html=True)

    if visualizacao == "Meu Painel Operacional":
        dashboard_executivo()
    else:
        dashboard_projeto(kpfx="internal")
