import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
from difflib import SequenceMatcher
from datetime import date, timedelta, datetime

hoje = date.today()
from auth import exige_login, exige_perfil, usuario_logado, is_admin
from database import (
    query,
    execute,
    setup_database,
    normaliza_municipio,
    normaliza_texto,
)
from ui import inject_global_style, page_header, render_sidebar


# ── FUNÇÃO AUXILIAR DE CONVERSÃO DE DATAS (BLINDAGEM) ──────────
def converter_para_data(valor):
    """Garante o retorno de um objeto datetime.date legítimo ou None."""
    if not valor:
        return None
    if isinstance(valor, date):
        return valor
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, str):
        try:
            # Captura formatos ISO comuns YYYY-MM-DD e despreza timestamp
            return date.fromisoformat(valor.split(" ")[0])
        except ValueError:
            return None
    return None


def _pos_vincular_email(email_id: int, prospeccao_id: int, exec_id: int):
    """Efeitos colaterais após vinculação manual de email a uma prospecção:
    1. Adiciona remetente em prospeccao_contatos (se ainda não existir)
    2. Cria interação automática no histórico
    """
    from sync_email import _auto_interacao

    em = query(
        "SELECT de, direcao, assunto, data_hora FROM emails WHERE id=%s", (email_id,)
    )
    if not em:
        return
    em = em[0]

    de_raw = em["de"] or ""
    email_addr = (
        de_raw.split("<")[-1].replace(">", "").strip()
        if "<" in de_raw
        else de_raw.strip()
    )
    if email_addr and "@" in email_addr:
        nome_contato = (
            de_raw.split("<")[0].strip().strip('"') if "<" in de_raw else None
        )
        try:
            execute(
                """
                INSERT INTO prospeccao_contatos (prospeccao_id, email, nome) 
                VALUES (%s,%s,%s) 
                ON CONFLICT (prospeccao_id, email) DO NOTHING
                """,
                (prospeccao_id, email_addr.lower(), nome_contato or None),
            )
        except Exception:
            pass

    _auto_interacao(
        prospeccao_id,
        exec_id,
        em["direcao"] or "recebido",
        em["assunto"],
        em["data_hora"],
    )


def _similares_prosp(nome: str, threshold: float = 0.72):
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


setup_database()
exige_login()
exige_perfil("admin", "executivo")

st.set_page_config(
    page_title="Prospecção · Hocta Conecta", page_icon="🎯", layout="wide"
)

inject_global_style()
render_sidebar()

page_header(
    "Prospecção",
    "Organize, monitore e acelere o ciclo comercial com confiança",
    "Pipeline Corporativo",
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
    "contato_estabelecido": "Contato Estab.",
    "proposta_enviada": "Proposta Enviada",
    "em_negociacao": "Em Negociação",
    "credenciado": "Credenciado",
    "declinado": "Declinado",
}
ETAPA_LABEL_SHORT = {
    "identificado": "Identificado",
    "contato_tentado": "Tentativa",
    "contato_estabelecido": "Contato ✓",
    "proposta_enviada": "Proposta",
    "em_negociacao": "Negociação",
    "credenciado": "Credenciado",
    "declinado": "Declinado",
}
ETAPA_COR = {
    "identificado": "#8E9CC0",
    "contato_tentado": "#F4A261",
    "contato_estabelecido": "#2A95B6",
    "proposta_enviada": "#8E44AD",
    "em_negociacao": "#E67E22",
    "credenciado": "#27AE60",
    "declinado": "#E74C3C",
}
CANAIS = ["telefone", "whatsapp", "email", "presencial", "outro"]
TIPOS_INTERACAO = [
    "tentativa_contato",
    "contato_estabelecido",
    "envio_proposta",
    "negociacao",
    "follow_up",
    "contrato_enviado",
    "contrato_assinado",
    "outro",
]
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

st.markdown(
    """
    <style>
    [data-testid="stSidebar"] {
        background-color: #0d3c78 !important;
        background-image: linear-gradient(180deg, #1558a8 0%, #0d3c78 100%) !important;
    }
    [data-testid="stSidebar"] *, 
    [data-testid="stSidebar"] p, 
    [data-testid="stSidebar"] span, 
    [data-testid="stSidebar"] a {
        color: #ffffff !important;
    }
    [data-testid="stSidebarNav"] data-testid="stSidebarNavLinkActive",
    [data-testid="stSidebarNav"] li[aria-selected="true"] a *,
    [data-testid="stSidebarNav"] a[aria-current="page"] *,
    div[data-testid="stSidebarNav"] ul li div[data-selected="true"] span {
        color: #0d3c78 !important;
    }
    [data-testid="stSidebar"] a:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px;
    }
    [data-testid="stSidebar"] a:hover * {
        color: #ffffff !important;
    }
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
    .md-card-sub { font-size: 0.78rem; color: var(--c-green); margin-top: 6px; font-weight: 500; }
    .md-card-sub.warn { color: var(--c-orange); }
    .md-card-sub.err  { color: var(--c-red); }
    .md-section {
        font-family: 'Google Sans', sans-serif; font-size: 1rem; font-weight: 600;
        color: var(--c-text); margin: 20px 0 12px 0; display: flex; align-items: center; gap: 8px;
    }
    .md-section::after { content: ''; flex: 1; height: 1px; background: var(--c-outline); margin-left: 8px; }
    .hocta-banner { background: linear-gradient(135deg, #1558a8 0%, #0d3c78 60%, #071e42 100%); border-radius: 12px; padding: 20px 28px; color: white; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
    .fu-card { background: var(--c-surface); border: 1px solid var(--c-outline); border-radius: 10px; padding: 10px 14px; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 10px; }
    .fu-dot { font-size: 1.1rem; margin-top: 1px; }
    .fu-name { font-weight: 600; font-size: 0.86rem; color: var(--c-text); }
    .fu-sub  { font-size: 0.76rem; color: var(--c-text-2); margin-top: 1px; }
    .md-progress-wrap { background: #e8eaed; border-radius: 20px; height: 10px; overflow: hidden; margin-bottom: 4px; }
    .md-progress-bar { height: 100%; border-radius: 20px; transition: width 0.5s ease; }
    .md-chip { display: inline-flex; align-items: center; gap: 4px; background: var(--c-primary-lt); color: var(--c-primary); border-radius: 50px; padding: 3px 10px; font-size: 0.76rem; font-weight: 600; }
    </style>
    """,
    unsafe_allow_html=True,
)

ESPECIALIDADES_LIST = [
    "Acupuntura",
    "Alergia e Imunologia",
    "Anestesiologia",
    "Angiologia",
    "Cardiologia",
    "Cirurgia Cardiovascular",
    "Cirurgia Geral",
    "Cirurgia Pediátrica",
    "Cirurgia Plástica",
    "Cirurgia Torácica",
    "Cirurgia Vascular",
    "Clínica Médica",
    "Coloproctologia",
    "Dermatologia",
    "Endocrinologia",
    "Endoscopia",
    "Gastroenterologia",
    "Geriatria",
    "Ginecologia e Obstetrícia",
    "Hematologia",
    "Infectologia",
    "Mastologia",
    "Medicina do Trabalho",
    "Medicina de Família",
    "Medicina Esportiva",
    "Medicina Intensiva",
    "Medicina Nuclear",
    "Nefrologia",
    "Neurologia",
    "Neurocirurgia",
    "Nutrição",
    "Oftalmologia",
    "Oncologia",
    "Ortopedia e Traumatologia",
    "Otorrilaringologia",
    "Patologia",
    "Pediatria",
    "Pneumologia",
    "Psicologia",
    "Psiquiatria",
    "Radiologia e Diagnóstico por Imagem",
    "Reumatologia",
    "Urologia",
    "Análises Clínicas (Lab)",
    "Anatomia Patológica",
    "Fisioterapia",
    "Fonoaudiologia",
    "Nutrição Clínica",
    "Odontologia",
    "Terapia Ocupacional",
    "Outra",
]
TIPOS_PREST_D = {
    "consultorio": "Consultório",
    "clinica_medica": "Clínica Médica",
    "clinica_nao_medica": "Clínica Não Médica",
    "laboratorio": "Laboratório",
    "servico_imagem": "Serviço de Imagem",
    "policlinica": "Policlínica",
    "outro": "Outro",
}
UFS_D = [
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


def _esp_editor_modal(prestador_id: int, key_prefix: str):
    """Editor de especialidades sem st.rerun() — mantém dialog aberto."""
    deleted = st.session_state.get(f"{key_prefix}_del", set())

    esps = query(
        """
        SELECT id, especialidade, quantidade_profissionais
        FROM prestador_especialidades WHERE prestador_id=%s ORDER BY especialidade
        """,
        (prestador_id,),
    )
    esps_visiveis = [e for e in esps if e["id"] not in deleted]

    if esps_visiveis:
        for e in esps_visiveis:
            ec1, ec2, ec3 = st.columns([4, 1, 1])
            ec1.write(f"🔹 {e['especialidade']}")
            qty_key = f"{key_prefix}_qty_{e['id']}"

            def _save_qty(eid=e["id"], k=qty_key):
                execute(
                    "UPDATE prestador_especialidades SET quantidade_profissionais=%s WHERE id=%s",
                    (st.session_state[k], eid),
                )

            ec2.number_input(
                "q",
                min_value=1,
                value=e["quantidade_profissionais"],
                key=qty_key,
                label_visibility="collapsed",
                on_change=_save_qty,
            )
            with ec3:
                if st.button("🗑️", key=f"{key_prefix}_del_{e['id']}", help="Remover"):
                    execute(
                        "DELETE FROM prestador_especialidades WHERE id=%s", (e["id"],)
                    )
                    s = st.session_state.get(f"{key_prefix}_del", set())
                    s.add(e["id"])
                    st.session_state[f"{key_prefix}_del"] = s
    else:
        st.caption("Nenhuma especialidade cadastrada ainda.")

    esps_exist = {e["especialidade"] for e in esps_visiveis}
    esps_disp = [e for e in ESPECIALIDADES_LIST if e not in esps_exist]
    if esps_disp:
        with st.form(f"form_{key_prefix}_add", clear_on_submit=True):
            fa1, fa2, fa3 = st.columns([4, 1, 1])
            with fa1:
                add_esp = st.selectbox("esp", esps_disp, label_visibility="collapsed")
            with fa2:
                add_qtd = st.number_input(
                    "qtd", min_value=1, value=1, label_visibility="collapsed"
                )
            with fa3:
                add_btn = st.form_submit_button("＋", use_container_width=True)
        if add_btn:
            execute(
                """
                INSERT INTO prestador_especialidades (prestador_id, especialidade, quantidade_profissionais)
                VALUES (%s,%s,%s)
                ON CONFLICT(prestador_id, especialidade)
                DO UPDATE SET quantidade_profissionais=excluded.quantidade_profissionais
                """,
                (prestador_id, add_esp, add_qtd),
            )


@st.dialog("➕ Nova Prospecção", width="large")
def modal_nova_prospeccao():
    """Modal de nova prospecção chamável direto do pipeline."""
    if is_admin():
        projetos_m = query(
            "SELECT id, nome FROM projetos WHERE status='ativo' ORDER BY nome"
        )
        executivos_m = query(
            "SELECT id, nome FROM usuarios WHERE perfil='executivo' AND ativo=1 ORDER BY nome"
        )
    else:
        projetos_m = query(
            """
            SELECT pj.id, pj.nome FROM projetos pj
            JOIN executivo_projeto ep ON ep.projeto_id=pj.id
            WHERE ep.executivo_id=%s AND pj.status='ativo'
            """,
            (user["id"],),
        )
        executivos_m = [{"id": user["id"], "nome": user["nome"]}]

    if not projetos_m:
        st.warning("Nenhum projeto ativo disponível.")
        return

    modo = st.radio(
        "Prestador",
        ["Selecionar existente", "Cadastrar novo"],
        horizontal=True,
        label_visibility="collapsed",
    )

    if modo == "Cadastrar novo":
        if st.session_state.get("mdl_similares") is not None:
            simils = st.session_state["mdl_similares"]
            pend = st.session_state["mdl_pend"]
            if simils:
                st.warning(f"⚠️ {len(simils)} prestador(es) com nome parecido:")
                for s in simils:
                    esps_s = query(
                        "SELECT especialidade FROM prestador_especialidades WHERE prestador_id=%s",
                        (s["id"],),
                    )
                    esps_txt = ", ".join(e["especialidade"] for e in esps_s) or "—"
                    with st.container(border=True):
                        ms1, ms2 = st.columns([5, 2])
                        ms1.markdown(
                            f"**{s['razao_social']}** `{s['similaridade']}% similar`"
                        )
                        ms1.caption(f"📍 {s['cidade']}/{s['uf']}  ·  🩺 {esps_txt}")
                        with ms2:
                            if st.button(
                                "Usar este",
                                key=f"mdl_usar_{s['id']}",
                                use_container_width=True,
                            ):
                                st.session_state["mdl_prest_id_escolhido"] = s["id"]
                                st.session_state.pop("mdl_similares", None)
                                st.session_state.pop("mdl_pend", None)
                st.divider()
                col_mn, col_mc = st.columns(2)
                with col_mn:
                    if st.button(
                        "✅ Cadastrar como novo mesmo assim",
                        type="primary",
                        use_container_width=True,
                    ):
                        p = pend
                        pid = execute(
                            """
                            INSERT INTO prestadores (razao_social, cnpj, tipo, cidade, uf, telefone) 
                            VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
                            """,
                            (
                                p["razao"],
                                p["cnpj"],
                                p["tipo"],
                                normaliza_municipio(p["cidade"]),
                                p["uf"],
                                p["tel"],
                            ),
                        )
                        st.session_state["mdl_prest_id_escolhido"] = pid
                        st.session_state.pop("mdl_similares", None)
                        st.session_state.pop("mdl_pend", None)
                with col_mc:
                    if st.button("✕ Corrigir nome", use_container_width=True):
                        st.session_state.pop("mdl_similares", None)
                        st.session_state.pop("mdl_pend", None)
                if not st.session_state.get("mdl_prest_id_escolhido"):
                    return
            else:
                p = pend
                pid = execute(
                    """
                    INSERT INTO prestadores (razao_social, cnpj, tipo, cidade, uf, telefone) 
                    VALUES (%s,%s,%s,%s,%s,%s) RETURNING id
                    """,
                    (
                        p["razao"],
                        p["cnpj"],
                        p["tipo"],
                        normaliza_municipio(p["cidade"]),
                        p["uf"],
                        p["tel"],
                    ),
                )
                st.session_state["mdl_prest_id_escolhido"] = pid
                st.session_state.pop("mdl_similares", None)
                st.session_state.pop("mdl_pend", None)

        if st.session_state.get("mdl_prest_id_escolhido"):
            pid_mdl = st.session_state["mdl_prest_id_escolhido"]
            pr_mdl = query(
                "SELECT razao_social, cidade, uf FROM prestadores WHERE id=%s",
                (pid_mdl,),
            )
            if pr_mdl:
                st.success(
                    f"✅ **{pr_mdl[0]['razao_social']}** — {pr_mdl[0]['cidade']}/{pr_mdl[0]['uf']}"
                )
            st.markdown("**🩺 Especialidades e profissionais** _(opcional)_")
            _esp_editor_modal(pid_mdl, f"mdl_novo_{pid_mdl}")
            prestador_id_final = pid_mdl
        else:
            _pre_nome = st.session_state.pop("fila_preencher_nome", "")
            _pre_email = st.session_state.pop("fila_preencher_email", "")
            if _pre_nome or _pre_email:
                st.info(
                    f"📥 Iniciando prospecção a partir de email recebido · `{_pre_email}`"
                )

            with st.form("form_mdl_novo_prest", clear_on_submit=True):
                mn1, mn2 = st.columns(2)
                with mn1:
                    mn_razao = st.text_input("Razão Social*", value=_pre_nome)
                    mn_cnpj = st.text_input("CNPJ")
                    mn_tipo = st.selectbox(
                        "Tipo*",
                        list(TIPOS_PREST_D.keys()),
                        format_func=lambda x: TIPOS_PREST_D[x],
                    )
                with mn2:
                    mn_cidade = st.text_input("Cidade*")
                    mn_uf = st.selectbox("UF*", UFS_D)
                    mn_tel = st.text_input("Telefone")
                mn_salvar = st.form_submit_button(
                    "Verificar e cadastrar →", use_container_width=True
                )
            if mn_salvar:
                if not mn_razao or not mn_cidade:
                    st.error("Razão Social e Cidade são obrigatórios.")
                else:
                    st.session_state["mdl_pend"] = dict(
                        razao=mn_razao,
                        cnpj=mn_cnpj,
                        tipo=mn_tipo,
                        cidade=normaliza_municipio(mn_cidade),
                        uf=mn_uf,
                        tel=mn_tel,
                    )
                    st.session_state["mdl_similares"] = _similares_prosp(mn_razao)
            return
    else:
        prestadores_m = query(
            "SELECT id, razao_social, cidade, uf FROM prestadores ORDER BY razao_social"
        )
        if not prestadores_m:
            st.info("Nenhum prestador cadastrado.")
            return
        pmap = {
            f"{p['razao_social']} — {p['cidade']}/{p['uf']}": p["id"]
            for p in prestadores_m
        }
        pesc = st.selectbox(
            "Prestador", list(pmap.keys()), label_visibility="collapsed"
        )
        prestador_id_final = pmap[pesc]
        st.markdown("**🩺 Especialidades e profissionais**")
        _esp_editor_modal(prestador_id_final, f"mdl_sel_{prestador_id_final}")

    st.divider()
    proj_map_m = {p["nome"]: p["id"] for p in projetos_m}
    proj_esc_m = st.selectbox("Projeto", list(proj_map_m.keys()))
    proj_id_m = proj_map_m[proj_esc_m]

    if is_admin() and executivos_m:
        exec_map_m = {e["nome"]: e["id"] for e in executivos_m}
        exec_esc_m = st.selectbox("Executivo", list(exec_map_m.keys()))
        exec_id_m = exec_map_m[exec_esc_m]
    else:
        exec_id_m = user["id"]

    if st.button("🚀 Iniciar Prospecção", type="primary", use_container_width=True):
        existente_m = query(
            "SELECT id FROM prospeccoes WHERE prestador_id=%s AND projeto_id=%s AND etapa NOT IN ('credenciado','declinado')",
            (prestador_id_final, proj_id_m),
        )
        if existente_m:
            st.warning(
                "Já existe uma prospecção ativa para este prestador neste projeto."
            )
        else:
            novo_prosp_id = execute(
                """
                INSERT INTO prospeccoes (prestador_id, projeto_id, executivo_id, status_final, etapa, data_inicio) 
                VALUES (%s, %s, %s, 'em_andamento', 'identificado', CURRENT_DATE) RETURNING id
                """,
                (prestador_id_final, proj_id_m, exec_id_m),
            )
            if is_admin():
                execute(
                    "INSERT INTO executivo_projeto (executivo_id, projeto_id) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                    (exec_id_m, proj_id_m),
                )
            _fila_eid = st.session_state.pop("fila_email_origem_id", None)
            if _fila_eid and novo_prosp_id:
                execute(
                    "UPDATE emails SET prospeccao_id=%s, atribuido_a=%s WHERE id=%s",
                    (novo_prosp_id, exec_id_m, _fila_eid),
                )
            for k in ["mdl_prest_id_escolhido", "mdl_similares", "mdl_pend"]:
                st.session_state.pop(k, None)
            st.toast("✅ Prospecção iniciada!")
            st.rerun()


CANAL_ICON = {
    "telefone": "📞",
    "whatsapp": "💬",
    "email": "📧",
    "presencial": "🤝",
    "outro": "📝",
    "whatsapp_auto": "🤖",
}

_SPEECH_JS = """
<script>
(function() {
  var btn  = window.parent.document.getElementById('hocta-mic-btn');
  var area = window.parent.document.querySelector('textarea[data-testid="stTextArea"] textarea, textarea');
  if (!btn || !area) return;

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { btn.title = 'Reconhecimento de voz não suportado neste browser'; btn.style.opacity='0.4'; return; }

  var rec = new SpeechRecognition();
  rec.lang = 'pt-BR'; rec.continuous = true; rec.interimResults = true;
  var listening = false; var base = '';

  rec.onresult = function(e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) base += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeInputValueSetter.call(area, base + interim);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  };

  rec.onend = function() { listening = false; btn.textContent = '🎙'; btn.style.background = ''; };

  btn.addEventListener('click', function() {
    if (listening) { rec.stop(); }
    else { base = area.value; rec.start(); listening = true; btn.textContent = '⏹'; btn.style.background='#d93025'; btn.style.color='white'; }
  });
})();
</script>
"""


@st.dialog("📋 Prospecção", width="large")
def modal_historico(prosp_id, prosp_nome, etapa_atual, projeto_nome):
    st.markdown(
        f"**{prosp_nome}** ·  {projeto_nome}  ·  `{ETAPA_LABEL.get(etapa_atual, etapa_atual)}`"
    )

    tab_hist, tab_comentario, tab_prest, tab_contatos = st.tabs(
        ["📜 Histórico", "💬 Novo comentário", "🏥 Prestador", "👥 Contatos"]
    )

    with tab_hist:
        interacoes = query(
            """
            SELECT i.data_hora, i.canal, i.tipo, i.descricao, i.proxima_acao, i.data_followup, u.nome AS executivo
            FROM interacoes i
            JOIN usuarios u ON u.id = i.executivo_id
            WHERE i.prospeccao_id = %s
            ORDER BY i.data_hora DESC
            """,
            (prosp_id,),
        )
        if not interacoes:
            st.info("Nenhuma interação registrada ainda.")
        else:
            for i in interacoes:
                icone = CANAL_ICON.get(i["canal"], "📝")
                data_exib = str(i["data_hora"])[:16]
                with st.container(border=True):
                    h1, h2 = st.columns([3, 2])
                    h1.markdown(f"{icone} **{TIPO_LABEL.get(i['tipo'], i['tipo'])}**")
                    h2.caption(f"🕐 {data_exib}  ·  👤 {i['executivo']}")
                    if i["descricao"]:
                        st.markdown(f"> {i['descricao']}")

    with tab_comentario:
        st.markdown(
            '<button id="hocta-mic-btn" style="font-size:1.3rem;background:none;border:1px solid #dadce0;border-radius:50px;padding:4px 14px;cursor:pointer;margin-bottom:8px;">🎙</button>',
            unsafe_allow_html=True,
        )
        comentario = st.text_area(
            "Comentário / nota interna", height=130, key=f"coment_{prosp_id}"
        )
        components.html(_SPEECH_JS, height=0)

        if st.button(
            "💾 Salvar comentário",
            type="primary",
            use_container_width=True,
            key=f"salv_cm_{prosp_id}",
        ):
            if comentario.strip():
                execute(
                    """
                    INSERT INTO interacoes (prospeccao_id, executivo_id, canal, tipo, descricao, data_hora)
                    VALUES (%s, %s, 'outro', 'outro', %s, NOW())
                    """,
                    (prosp_id, user["id"], comentario.strip()),
                )
                st.success("Comentário salvo!")
                st.rerun()

    with tab_prest:
        prest = query(
            """
            SELECT pr.razao_social, pr.nome_fantasia, pr.cnpj, pr.tipo, pr.cidade, pr.uf, pr.telefone, pr.email, pr.observacoes, p.data_inicio, p.dias_ciclo
            FROM prospeccoes p JOIN prestadores pr ON pr.id = p.prestador_id WHERE p.id = %s
            """,
            (prosp_id,),
        )
        if prest:
            r = prest[0]
            st.markdown(f"**Razão Social: {r['razao_social']}")
            st.write(
                f"📍 Cidade: {r['cidade']}/{r['uf']}  ·  📞 Tel: {r['telefone'] or '—'}"
            )
            st.write(
                f"📅 Iniciado em: {r['data_inicio'] or '—'}  ·  🔄 Ciclo: {r['dias_ciclo'] or 0} dias"
            )

    with tab_contatos:
        st.caption("Contatos vinculados ao prestador.")
        contatos = query(
            "SELECT id, email, nome FROM prospeccao_contatos WHERE prospeccao_id = %s",
            (prosp_id,),
        )
        for c in contatos:
            st.write(f"👤 {c['nome'] or 'Sem Nome'} — `{c['email']}`")


@st.dialog("🎯 Registrar Interação", width="large")
def modal_interacao(prosp_id, etapa_atual):
    st.markdown(f"### Atualizar Pipeline")
    with st.form("form_interacao"):
        nova_etapa = st.selectbox(
            "Avançar para Etapa:", ETAPAS, index=ETAPAS.index(etapa_atual)
        )
        canal = st.selectbox("Canal de Contato", CANAIS)
        tipo = st.selectbox(
            "Tipo de Interação", TIPOS_INTERACAO, format_func=lambda x: TIPO_LABEL[x]
        )
        desc = st.text_area("Histórico da conversa / Observações", height=100)

        st.subheader("Próxima Ação (Follow-up)")
        prox_acao = st.text_input("O que fazer a seguir?")
        dt_fup = st.date_input(
            "Data do Follow-up", value=date.today() + timedelta(days=3)
        )

        btn_salvar = st.form_submit_button(
            "💾 Salvar Evolução", use_container_width=True
        )

        if btn_salvar:
            execute(
                """
                INSERT INTO interacoes (prospeccao_id, executivo_id, canal, tipo, descricao, proxima_acao, data_followup, data_hora)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                """,
                (prosp_id, user["id"], canal, tipo, desc, prox_acao, str(dt_fup)),
            )

            execute(
                """
                UPDATE prospeccoes 
                SET etapa = %s, 
                    dias_ciclo = CURRENT_DATE - data_inicio, 
                    atualizado_em = NOW() 
                WHERE id = %s
                """,
                (nova_etapa, prosp_id),
            )
            st.toast("Evolução registrada com sucesso!")
            st.rerun()


# ── PIPELINE KANBAN (RENDERIZAÇÃO DA PÁGINA) ──────────────────────────────────
st.button("➕ Iniciar Nova Prospecção", type="primary", on_click=modal_nova_prospeccao)

cols = st.columns(len(ETAPAS))

for idx, etapa in enumerate(ETAPAS):
    with cols[idx]:
        st.markdown(
            f"<div style='background-color:{ETAPA_COR[etapa]}; padding:6px; border-radius:4px; text-align:center; color:white; font-weight:bold; font-size:0.85rem;'>{ETAPA_LABEL_SHORT[etapa]}</div>",
            unsafe_allow_html=True,
        )

        if is_admin():
            prospec_cards = query(
                """
                SELECT p.id, pr.razao_social, p.etapa, pj.nome as projeto, p.dias_ciclo 
                FROM prospeccoes p 
                JOIN prestadores pr ON pr.id = p.prestador_id 
                JOIN projetos pj ON pj.id = p.projeto_id
                WHERE p.etapa = %s AND p.status_final = 'em_andamento'
                """,
                (etapa,),
            )
        else:
            prospec_cards = query(
                """
                SELECT p.id, pr.razao_social, p.etapa, pj.nome as projeto, p.dias_ciclo 
                FROM prospeccoes p 
                JOIN prestadores pr ON pr.id = p.prestador_id 
                JOIN projetos pj ON pj.id = p.projeto_id
                WHERE p.etapa = %s AND p.executivo_id = %s AND p.status_final = 'em_andamento'
                """,
                (etapa, user["id"]),
            )

        for card in prospec_cards:
            with st.container(border=True):
                # ── IMPLEMENTAÇÃO DA TRATATIVA DO TRACEBACK (BLINDAGEM DO FU) ──
                # Busca o último follow-up agendado para esta prospecção
                ultimo_fup = query(
                    """
                    SELECT data_followup FROM interacoes 
                    WHERE prospeccao_id = %s AND data_followup IS NOT NULL 
                    ORDER BY data_hora DESC LIMIT 1
                    """,
                    (card["id"],),
                )

                fu_txt = ""
                if ultimo_fup:
                    fu_data = converter_para_data(ultimo_fup[0]["data_followup"])
                    # Comparação 100% blindada de date com date
                    if fu_data and fu_data < hoje:
                        fu_txt = f" ⚠️ Atrasado desde {fu_data.strftime('%d/%m')}"

                st.markdown(f"**{fu_txt}")
                st.caption(f"📁 {card['projeto']} · ⏳ {card['dias_ciclo'] or 0}d")

                b1, b2 = st.columns(2)
                if b1.button("📜 Ver", key=f"v_{card['id']}", use_container_width=True):
                    modal_historico(
                        card["id"],
                        card["razao_social"],
                        card["etapa"],
                        card["projeto"],
                    )
                if b2.button(
                    "🚀 Evoluir", key=f"e_{card['id']}", use_container_width=True
                ):
                    modal_interacao(card["id"], card["etapa"])
