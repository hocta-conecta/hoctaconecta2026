import streamlit as st
import bcrypt
from auth import exige_login, exige_perfil, usuario_logado
from database import query, execute
from ui import inject_global_style, page_header, render_sidebar

exige_login()
exige_perfil("admin")

st.set_page_config(
    page_title="Administração · Hocta Conecta", page_icon="⚙️", layout="wide"
)

inject_global_style()
render_sidebar()

page_header(
    "Administração",
    "Configurações de usuário, integração e manutenção do sistema",
    "Administração",
)

user = usuario_logado()

TIPO_CLIENTE = {
    "convenio_ans": "Convênio ANS",
    "cartao_saude": "Cartão Saúde",
    "outro": "Outro",
}

st.markdown("# ⚙️ Administração")
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
tab_usuarios, tab_clientes, tab_limpeza, tab_whatsapp, tab_email = st.tabs(
    ["Usuários", "Clientes", "🗑️ Limpeza de Dados", "💬 WhatsApp", "📧 Email IMAP"]
)


# ── ABA: USUÁRIOS ─────────────────────────────────────────────
with tab_usuarios:
    st.subheader("Usuários do Sistema")

    usuarios = query(
        "SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios ORDER BY perfil, nome"
    )
    if usuarios:
        import pandas as pd

        df = pd.DataFrame(usuarios)
        df["ativo"] = df["ativo"].map({1: "Ativo", 0: "Inativo"})
        df["perfil"] = df["perfil"].str.capitalize()
        df.columns = ["ID", "Nome", "E-mail", "Perfil", "Status", "Criado em"]
        st.dataframe(df, use_container_width=True, hide_index=True)

    st.divider()

    col_novo, col_edit = st.columns(2)

    # ── Criar novo usuário ────────────────────────────────────
    with col_novo:
        st.subheader("Criar Usuário")
        with st.form("form_novo_usuario", clear_on_submit=True):
            nome_u = st.text_input("Nome completo*")
            email_u = st.text_input("E-mail*", placeholder="usuario@hocta.com.br")
            perfil_u = st.selectbox(
                "Perfil*", ["executivo", "admin", "cliente"], format_func=str.capitalize
            )
            senha_u = st.text_input(
                "Senha temporária*", type="password", placeholder="Mínimo 6 caracteres"
            )
            criar_u = st.form_submit_button("Criar Usuário", use_container_width=True)

        if criar_u:
            if not nome_u or not email_u or not senha_u:
                st.error("Preencha todos os campos obrigatórios.")
            elif len(senha_u) < 6:
                st.error("A senha deve ter ao menos 6 caracteres.")
            else:
                existente = query(
                    "SELECT id FROM usuarios WHERE email=?", (email_u.strip().lower(),)
                )
                if existente:
                    st.error("Já existe um usuário com este e-mail.")
                else:
                    hash_s = bcrypt.hashpw(senha_u.encode(), bcrypt.gensalt()).decode()
                    execute(
                        """
                        INSERT INTO usuarios (nome, email, senha_hash, perfil)
                        VALUES (?, ?, ?, ?)
                    """,
                        (nome_u.strip(), email_u.strip().lower(), hash_s, perfil_u),
                    )
                    st.success(f"Usuário **{nome_u}** criado com sucesso!")
                    st.rerun()

    # ── Editar / desativar usuário ────────────────────────────
    with col_edit:
        st.subheader("Editar Usuário")
        outros = [u for u in usuarios if u["id"] != user["id"]]
        if not outros:
            st.info("Nenhum outro usuário cadastrado.")
        else:
            user_map = {f"{u['nome']} ({u['email']})": u for u in outros}
            escolha_u = st.selectbox("Selecione o usuário", list(user_map.keys()))
            u_edit = user_map[escolha_u]

            with st.form("form_editar_usuario"):
                nome_edit = st.text_input("Nome", value=u_edit["nome"])
                perfil_edit = st.selectbox(
                    "Perfil",
                    ["executivo", "admin", "cliente"],
                    index=["executivo", "admin", "cliente"].index(u_edit["perfil"]),
                    format_func=str.capitalize,
                )
                ativo_edit = st.toggle("Usuário Ativo", value=bool(u_edit["ativo"]))
                nova_senha = st.text_input(
                    "Nova Senha (deixe em branco para manter)", type="password"
                )

                # vínculo cliente (apenas para perfil cliente)
                clientes_todos = query(
                    "SELECT id, nome FROM clientes WHERE ativo=1 ORDER BY nome"
                )
                clientes_vinc = query(
                    "SELECT cliente_id FROM usuario_cliente WHERE usuario_id=?",
                    (u_edit["id"],),
                )
                ids_cli_vinc = [c["cliente_id"] for c in clientes_vinc]
                cli_selecionados = st.multiselect(
                    "Clientes vinculados (apenas para perfil Cliente)",
                    options=[c["id"] for c in clientes_todos],
                    default=ids_cli_vinc,
                    format_func=lambda cid: next(
                        (c["nome"] for c in clientes_todos if c["id"] == cid), str(cid)
                    ),
                )

                salvar_u = st.form_submit_button(
                    "Salvar Alterações", use_container_width=True
                )

            if salvar_u:
                if nova_senha:
                    novo_hash = bcrypt.hashpw(
                        nova_senha.encode(), bcrypt.gensalt()
                    ).decode()
                    execute(
                        "UPDATE usuarios SET senha_hash=? WHERE id=?",
                        (novo_hash, u_edit["id"]),
                    )
                execute(
                    """
                    UPDATE usuarios SET nome=?, perfil=?, ativo=? WHERE id=?
                """,
                    (nome_edit, perfil_edit, int(ativo_edit), u_edit["id"]),
                )

                execute(
                    "DELETE FROM usuario_cliente WHERE usuario_id=?", (u_edit["id"],)
                )
                for cid in cli_selecionados:
                    execute(
                        "INSERT OR IGNORE INTO usuario_cliente (usuario_id, cliente_id) VALUES (?,?)",
                        (u_edit["id"], cid),
                    )

                st.success("Usuário atualizado.")
                st.rerun()


# ── ABA: CLIENTES ─────────────────────────────────────────────
with tab_clientes:
    st.subheader("Clientes / Operadoras")

    clientes = query("SELECT * FROM clientes ORDER BY nome")
    if clientes:
        import pandas as pd

        df_cli = pd.DataFrame(clientes)[
            ["nome", "tipo", "contato_nome", "contato_email", "contato_tel", "ativo"]
        ]
        df_cli["tipo"] = df_cli["tipo"].map(TIPO_CLIENTE).fillna(df_cli["tipo"])
        df_cli["ativo"] = df_cli["ativo"].map({1: "Ativo", 0: "Inativo"})
        df_cli.columns = [
            "Nome",
            "Tipo",
            "Contato",
            "E-mail Contato",
            "Telefone Contato",
            "Status",
        ]
        st.dataframe(df_cli, use_container_width=True, hide_index=True)

    st.divider()

    col_nc, col_ec = st.columns(2)

    with col_nc:
        st.subheader("Cadastrar Cliente")
        with st.form("form_novo_cliente", clear_on_submit=True):
            nome_c = st.text_input("Nome da Operadora*")
            tipo_c = st.selectbox(
                "Tipo*",
                list(TIPO_CLIENTE.keys()),
                format_func=lambda x: TIPO_CLIENTE[x],
            )
            contato_nome = st.text_input("Nome do Contato")
            contato_email = st.text_input("E-mail do Contato")
            contato_tel = st.text_input("Telefone do Contato")
            criar_c = st.form_submit_button("Cadastrar", use_container_width=True)

        if criar_c:
            if not nome_c:
                st.error("Nome da operadora é obrigatório.")
            else:
                execute(
                    """
                    INSERT INTO clientes (nome, tipo, contato_nome, contato_email, contato_tel)
                    VALUES (?, ?, ?, ?, ?)
                """,
                    (nome_c.strip(), tipo_c, contato_nome, contato_email, contato_tel),
                )
                st.success(f"Cliente **{nome_c}** cadastrado.")
                st.rerun()

    with col_ec:
        st.subheader("Editar Cliente")
        if not clientes:
            st.info("Nenhum cliente cadastrado.")
        else:
            cli_map = {c["nome"]: c for c in clientes}
            escolha_c = st.selectbox(
                "Selecione o cliente", list(cli_map.keys()), key="sel_cli_edit"
            )
            c_edit = cli_map[escolha_c]

            with st.form("form_editar_cliente"):
                nome_ce = st.text_input("Nome*", value=c_edit["nome"])
                tipo_ce = st.selectbox(
                    "Tipo*",
                    list(TIPO_CLIENTE.keys()),
                    index=list(TIPO_CLIENTE.keys()).index(c_edit["tipo"]),
                    format_func=lambda x: TIPO_CLIENTE[x],
                )
                cont_nome = st.text_input("Contato", value=c_edit["contato_nome"] or "")
                cont_email = st.text_input(
                    "E-mail", value=c_edit["contato_email"] or ""
                )
                cont_tel = st.text_input("Telefone", value=c_edit["contato_tel"] or "")
                ativo_c = st.toggle("Ativo", value=bool(c_edit["ativo"]))
                salvar_c = st.form_submit_button("Salvar", use_container_width=True)

            if salvar_c:
                execute(
                    """
                    UPDATE clientes SET nome=?, tipo=?, contato_nome=?, contato_email=?, contato_tel=?, ativo=?
                    WHERE id=?
                """,
                    (
                        nome_ce,
                        tipo_ce,
                        cont_nome,
                        cont_email,
                        cont_tel,
                        int(ativo_c),
                        c_edit["id"],
                    ),
                )
                st.success("Cliente atualizado.")
                st.rerun()


# ── ABA: LIMPEZA DE DADOS ─────────────────────────────────────
with tab_limpeza:
    import pandas as pd

    st.subheader("🗑️ Exclusão em Lote de Prestadores")
    st.warning(
        "**Atenção:** a exclusão remove o prestador e todos os seus vínculos "
        "(prospecções, interações e especialidades). Esta ação **não pode ser desfeita**."
    )

    # ── Filtros para selecionar quais exibir ──────────────────
    fl1, fl2, fl3 = st.columns(3)
    with fl1:
        busca_lote = st.text_input(
            "Buscar por nome", placeholder="Digite para filtrar...", key="lote_busca"
        )
    with fl2:
        ufs_disp = sorted(
            {
                r["uf"]
                for r in query(
                    "SELECT DISTINCT uf FROM prestadores WHERE uf IS NOT NULL"
                )
            }
        )
        uf_lote = st.selectbox("UF", ["Todas"] + ufs_disp, key="lote_uf")
    with fl3:
        cids_disp = sorted(
            {
                r["cidade"]
                for r in query(
                    "SELECT DISTINCT cidade FROM prestadores WHERE cidade IS NOT NULL"
                )
            }
        )
        cid_lote = st.selectbox("Cidade", ["Todas"] + cids_disp, key="lote_cidade")

    # ── Carrega prestadores com filtros ───────────────────────
    sql_base = """
        SELECT p.id, p.razao_social, p.cidade, p.uf, p.tipo,
               COUNT(DISTINCT pr.id)  AS n_prosp,
               COUNT(DISTINCT i.id)   AS n_inter,
               COUNT(DISTINCT pe.id)  AS n_esp
        FROM prestadores p
        LEFT JOIN prospeccoes pr ON pr.prestador_id = p.id
        LEFT JOIN interacoes   i  ON i.prospeccao_id = pr.id
        LEFT JOIN prestador_especialidades pe ON pe.prestador_id = p.id
        GROUP BY p.id
        ORDER BY p.razao_social
    """
    todos_prest = query(sql_base)

    if busca_lote:
        todos_prest = [
            r for r in todos_prest if busca_lote.lower() in r["razao_social"].lower()
        ]
    if uf_lote != "Todas":
        todos_prest = [r for r in todos_prest if r["uf"] == uf_lote]
    if cid_lote != "Todas":
        todos_prest = [r for r in todos_prest if r["cidade"] == cid_lote]

    if not todos_prest:
        st.info("Nenhum prestador encontrado com os filtros selecionados.")
    else:
        st.caption(f"{len(todos_prest)} prestador(es) encontrado(s)")

        # ── Tabela com checkboxes via dataframe editável ──────
        df_lote = pd.DataFrame(
            [
                {
                    "Selecionar": False,
                    "ID": r["id"],
                    "Razão Social": r["razao_social"],
                    "Cidade/UF": f"{r['cidade']}/{r['uf']}",
                    "Prospecções": r["n_prosp"],
                    "Interações": r["n_inter"],
                    "Especialidades": r["n_esp"],
                }
                for r in todos_prest
            ]
        )

        df_editado = st.data_editor(
            df_lote,
            use_container_width=True,
            hide_index=True,
            disabled=[
                "ID",
                "Razão Social",
                "Cidade/UF",
                "Prospecções",
                "Interações",
                "Especialidades",
            ],
            column_config={
                "Selecionar": st.column_config.CheckboxColumn("✔", width="small"),
                "ID": st.column_config.NumberColumn("ID", width="small"),
            },
            key="lote_editor",
        )

        selecionados = df_editado[df_editado["Selecionar"] == True]["ID"].tolist()

        sel1, sel2, _ = st.columns([1, 1, 4])
        with sel1:
            if st.button("Selecionar todos", key="sel_todos"):
                st.session_state["lote_sel_todos"] = True
                st.rerun()
        with sel2:
            if st.button("Limpar seleção", key="sel_nenhum"):
                st.session_state["lote_sel_todos"] = False
                st.rerun()

        # Aplica "selecionar todos" via session_state
        if st.session_state.get("lote_sel_todos"):
            selecionados = [r["id"] for r in todos_prest]

        st.divider()

        if selecionados:
            st.error(
                f"**{len(selecionados)} prestador(es) selecionado(s) para exclusão.**"
            )

            confirmar = st.checkbox(
                f"Confirmo que desejo excluir permanentemente {len(selecionados)} prestador(es) e todos os seus dados",
                key="lote_confirmar",
            )

            if st.button(
                "🗑️ Excluir Selecionados",
                type="primary",
                disabled=not confirmar,
                key="btn_excluir_lote",
            ):
                excluidos = 0
                erros_exc = []
                for pid in selecionados:
                    try:
                        # Remove em cascata
                        prosp_ids = [
                            r["id"]
                            for r in query(
                                "SELECT id FROM prospeccoes WHERE prestador_id=?",
                                (pid,),
                            )
                        ]
                        for prosp_id in prosp_ids:
                            execute(
                                "DELETE FROM interacoes WHERE prospeccao_id=?",
                                (prosp_id,),
                            )
                        execute("DELETE FROM prospeccoes WHERE prestador_id=?", (pid,))
                        execute(
                            "DELETE FROM prestador_especialidades WHERE prestador_id=?",
                            (pid,),
                        )
                        execute("DELETE FROM prestadores WHERE id=?", (pid,))
                        excluidos += 1
                    except Exception as e:
                        erros_exc.append(f"ID {pid}: {str(e)[:60]}")

                st.session_state.pop("lote_sel_todos", None)
                st.success(f"✅ {excluidos} prestador(es) excluído(s) com sucesso.")
                if erros_exc:
                    for e in erros_exc:
                        st.caption(f"⚠️ {e}")
                st.rerun()
        else:
            st.caption("Selecione ao menos um prestador para habilitar a exclusão.")


# ── ABA: WHATSAPP ─────────────────────────────────────────────
with tab_whatsapp:
    import os
    import base64
    from whatsapp_service import get_status, get_qrcode

    st.subheader("💬 WhatsApp Hocta — Número Único")

    # ── Status da conexão ─────────────────────────────────────
    st.markdown("#### Status da Conexão")
    col_st, col_btn = st.columns([3, 1])
    with col_btn:
        verificar = st.button("🔄 Verificar", use_container_width=True)

    status_data = get_status()
    status_val = status_data.get("status", "UNKNOWN")

    COR_STATUS = {
        "CONNECTED": ("#1e8e3e", "#e6f4ea", "✅ Conectado"),
        "QRCODE": ("#f29900", "#fef3e2", "📱 Aguardando escaneamento do QR Code"),
        "INITIALIZING": ("#1558a8", "#e8f0fe", "⏳ Iniciando sessão…"),
        "CLOSED": ("#d93025", "#fce8e6", "🔴 Sessão encerrada"),
        "NOPHONE": ("#d93025", "#fce8e6", "📵 Sem telefone conectado"),
        "NOTLOGGED": ("#f29900", "#fef3e2", "🔑 Não autenticado"),
        "OFFLINE": ("#5f6368", "#f1f3f4", "⚫ WPPConnect Server offline"),
        "ERROR": ("#d93025", "#fce8e6", "❌ Erro ao contatar servidor"),
    }
    cor_t, cor_bg, label_status = COR_STATUS.get(
        status_val, ("#5f6368", "#f1f3f4", status_val)
    )

    with col_st:
        st.markdown(
            f"<div style='background:{cor_bg};border-left:4px solid {cor_t};"
            f"border-radius:8px;padding:12px 16px;font-weight:600;color:{cor_t};'>"
            f"{label_status}</div>",
            unsafe_allow_html=True,
        )

    # QR Code (se necessário)
    if status_val in ("QRCODE", "NOTLOGGED", "NOPHONE"):
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("**Escaneie o QR Code abaixo com o WhatsApp da Hocta:**")
        qr = get_qrcode()
        if qr:
            if qr.startswith("data:image"):
                st.image(qr, width=280)
            else:
                try:
                    img_bytes = base64.b64decode(qr)
                    st.image(img_bytes, width=280)
                except Exception:
                    st.code(qr)
        else:
            st.info(
                "QR Code não disponível ainda. Aguarde alguns segundos e clique em Verificar."
            )

    st.divider()

    # ── Configuração de segurança ─────────────────────────────
    st.markdown("#### Configuração")
    wpp_url = os.getenv("WPP_URL", "http://localhost:21465")
    webhook_url = os.getenv("WEBHOOK_URL", "https://SEU-DOMINIO.com/webhook/whatsapp")
    webhook_key = os.getenv("WEBHOOK_SECRET", "hocta-whatsapp-secret")
    st.code(
        f"WPP_URL (WPPConnect Server): {wpp_url}\n"
        f"Webhook URL:                 {webhook_url}\n"
        f"Webhook Key (X-Webhook-Key): {webhook_key}",
        language="text",
    )
    st.caption("Configure essas variáveis de ambiente no servidor e no WPPConnect.")

    st.divider()

    # ── Últimas mensagens ─────────────────────────────────────
    st.markdown("#### Últimas mensagens recebidas")
    ult_wpp = query("""
        SELECT wm.data_hora,
               COALESCE(u.nome, '—') AS executivo,
               COALESCE(pr.razao_social, wm.numero) AS prestador,
               COALESCE(pr.cidade, '—') AS cidade,
               wm.direcao,
               SUBSTR(wm.texto, 1, 100) AS preview
        FROM whatsapp_mensagens wm
        LEFT JOIN prestadores pr ON pr.id = wm.prestador_id
        LEFT JOIN usuarios    u  ON u.id  = wm.executivo_id
        ORDER BY wm.data_hora DESC
        LIMIT 20
    """)

    if ult_wpp:
        import pandas as pd

        df_wpp = pd.DataFrame(ult_wpp)
        df_wpp.columns = [
            "Data/Hora",
            "Executivo",
            "Prestador/Número",
            "Cidade",
            "Direção",
            "Mensagem",
        ]
        st.dataframe(df_wpp, use_container_width=True, hide_index=True)
    else:
        st.caption("Nenhuma mensagem WhatsApp registrada ainda.")

    st.divider()

    # ── Fase 2: WhatsApp individual por executivo ─────────────
    with st.expander("🔮 Em breve — WhatsApp individual por executivo"):
        st.markdown(
            "Na próxima fase será possível vincular um WhatsApp pessoal de cada executivo "
            "à sua conta, permitindo que mensagens enviadas/recebidas pelo celular dele "
            "sejam também registradas no sistema."
        )
        execs_wpp = query(
            "SELECT id, nome, whatsapp_instancia FROM usuarios "
            "WHERE perfil IN ('executivo','admin') ORDER BY nome"
        )
        for ex in execs_wpp:
            st.markdown(
                f"- **{ex['nome']}** — instância: `{ex['whatsapp_instancia'] or '(não configurada)'}`"
            )

    st.divider()

    # ── Guia de instalação ────────────────────────────────────
    with st.expander("📋 Como instalar o WPPConnect Server"):
        st.markdown("""
**1. Via Docker (recomendado)**
```bash
docker run -d --name wppconnect \\
  -p 21465:21465 \\
  -e SECRET_KEY=hocta-secret \\
  -v wppconnect_tokens:/home/user/wppconnect-server/tokens \\
  wppconnect/wppconnect-server:latest
```

**2. Gerar token da sessão (uma vez)**
```
POST http://localhost:21465/api/hocta/CHAVE_SECRETA/generate-token
```
→ Copie o `token` retornado e salve como variável `WPP_TOKEN`

**3. Iniciar a sessão e obter QR Code**
```
POST http://localhost:21465/api/hocta/start-session
  Authorization: Bearer SEU_TOKEN
```
→ O QR Code aparecerá no Admin acima.

**4. Configurar webhook no WPPConnect**
```
POST http://localhost:21465/api/hocta/webhook
  Authorization: Bearer SEU_TOKEN
  Body: {
    "url": "https://SEU-SERVIDOR/webhook/whatsapp",
    "webhookByEvents": false,
    "getQrCode": true
  }
```

**5. Variáveis de ambiente necessárias**
```
WPP_URL=http://localhost:21465
WPP_TOKEN=seu-token-gerado
WPP_SESSION=hocta
WEBHOOK_SECRET=hocta-whatsapp-secret
DB_PATH=/caminho/para/hocta_conecta.db
EXEC_DEFAULT_ID=1
```

**6. Rodar webhook junto com Streamlit**
```bash
uvicorn webhook_server:app --host 0.0.0.0 --port 8000 &
streamlit run app.py
```
        """)


# ── ABA: EMAIL IMAP ───────────────────────────────────────────
with tab_email:
    from sync_email import (
        criptografar_senha,
        descriptografar_senha,
        sincronizar_todos,
        sincronizar_executivo,
        sincronizar_caixa_equipe,
        sincronizar_todas_caixas_equipe,
        iniciar_sync_background,
    )

    st.subheader("📧 Configuração de Email IMAP/SMTP (Umbler)")
    st.caption(
        "Configure a caixa de email `@hocta.com.br` de cada executivo. "
        "O sistema sincronizará automaticamente os emails com o histórico de prospecção."
    )

    # ── Info servidores ───────────────────────────────────────
    with st.expander("ℹ️ Configurações do servidor Umbler"):
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("""
**IMAP (leitura)**
- Servidor: `imap.umbler.com`
- Porta: `993` (SSL)
""")
        with c2:
            st.markdown("""
**SMTP (envio)**
- Servidor: `smtp.umbler.com`
- Porta: `587` (TLS)
""")
        st.info("Crie as caixas de email no painel Umbler antes de configurar aqui.")

    st.divider()

    # ── Lista de executivos e status de sync ──────────────────
    execs = query("""
        SELECT id, nome, email, email_imap, email_sync_em
        FROM usuarios
        WHERE perfil='executivo' AND ativo=1
        ORDER BY nome
    """)

    if not execs:
        st.warning("Nenhum executivo ativo cadastrado.")
    else:
        for ex in execs:
            configurado = bool(ex["email_imap"])
            n_emails_banco = (
                query(
                    "SELECT COUNT(*) AS n FROM emails WHERE executivo_id=? AND caixa_tipo='individual'",
                    (ex["id"],),
                )[0]["n"]
                if configurado
                else 0
            )
            sync_info = (
                f"Última sync: {ex['email_sync_em'][:16]}"
                if ex.get("email_sync_em")
                else "Nunca sincronizado"
            )
            status_label = (
                f"✅ {ex['nome']} — `{ex['email_imap']}` · {n_emails_banco} emails · {sync_info}"
                if configurado
                else f"⚙️ {ex['nome']} — {ex['email']}  _(sem email IMAP)_"
            )

            with st.expander(status_label, expanded=not configurado):

                if configurado:
                    ci1, ci2, ci3 = st.columns(3)
                    ci1.metric("📬 Email IMAP", ex["email_imap"])
                    ci2.metric("📥 No banco", f"{n_emails_banco} emails")
                    ci3.metric("🕐 Última sync", (ex["email_sync_em"] or "—")[:16])

                with st.form(f"form_email_{ex['id']}", clear_on_submit=False):
                    email_imap = st.text_input(
                        "Email IMAP (@hocta.com.br)",
                        value=ex["email_imap"] or "",
                        placeholder="executivo@hocta.com.br",
                        key=f"imap_email_{ex['id']}",
                    )
                    senha_nova = st.text_input(
                        "Senha do email"
                        + (" (deixe em branco para manter)" if configurado else ""),
                        type="password",
                        placeholder="Senha da caixa de email",
                        key=f"imap_senha_{ex['id']}",
                    )
                    col_s, col_t, col_sy = st.columns(3)
                    salvar = col_s.form_submit_button(
                        "💾 Salvar", use_container_width=True, type="primary"
                    )
                    testar = col_t.form_submit_button(
                        "🔌 Testar conexão", use_container_width=True
                    )
                    sync_ex = col_sy.form_submit_button(
                        "🔄 Sync agora", use_container_width=True
                    )

                if salvar:
                    if not email_imap:
                        st.error("Informe o email IMAP.")
                    elif not configurado and not senha_nova:
                        st.error("Informe a senha para configurar pela primeira vez.")
                    else:
                        email_norm = email_imap.strip().lower()
                        # Verifica se outro executivo já usa este email
                        conflito = query(
                            "SELECT id, nome FROM usuarios WHERE email_imap=? AND id != ?",
                            (email_norm, ex["id"]),
                        )
                        if conflito:
                            st.error(
                                f"❌ Este email já está configurado para **{conflito[0]['nome']}**. "
                                "Cada executivo deve ter uma caixa exclusiva."
                            )
                        else:
                            if senha_nova:
                                enc = criptografar_senha(senha_nova)
                                execute(
                                    "UPDATE usuarios SET email_imap=?, senha_imap_enc=? WHERE id=?",
                                    (email_norm, enc, ex["id"]),
                                )
                            else:
                                execute(
                                    "UPDATE usuarios SET email_imap=? WHERE id=?",
                                    (email_norm, ex["id"]),
                                )
                            st.success("✅ Credenciais salvas!")
                            st.rerun()

                if testar:
                    import imaplib

                    cred = query(
                        "SELECT email_imap, senha_imap_enc FROM usuarios WHERE id=?",
                        (ex["id"],),
                    )
                    if not cred or not cred[0]["email_imap"]:
                        st.error("Configure as credenciais antes de testar.")
                    else:
                        try:
                            senha_t = descriptografar_senha(cred[0]["senha_imap_enc"])
                            c_test = imaplib.IMAP4_SSL("imap.umbler.com", 993)
                            c_test.login(cred[0]["email_imap"], senha_t)
                            _, data = c_test.select("INBOX")
                            total = int(data[0]) if data[0] else 0
                            c_test.logout()
                            st.success(
                                f"✅ Conexão OK · **{total}** emails na caixa · **{n_emails_banco}** sincronizados no sistema"
                            )
                        except Exception as e:
                            st.error(f"❌ Falha na conexão: {e}")

                if sync_ex:
                    cred = query(
                        "SELECT email_imap, senha_imap_enc FROM usuarios WHERE id=?",
                        (ex["id"],),
                    )
                    if not cred or not cred[0]["email_imap"]:
                        st.error("Configure as credenciais antes de sincronizar.")
                    else:
                        with st.spinner(f"Sincronizando {cred[0]['email_imap']}..."):
                            res = sincronizar_executivo(
                                ex["id"],
                                cred[0]["email_imap"],
                                cred[0]["senha_imap_enc"],
                            )
                        if res.get("erro"):
                            st.error(f"❌ Erro: {res['erro']}")
                        else:
                            st.success(
                                f"✅ Sync concluído · **{res['novos']}** novos importados · "
                                f"**{res['ja_existiam']}** já existiam · "
                                f"**{res['total_imap']}** total na caixa"
                            )
                            st.rerun()

    st.divider()

    # ── Caixas de equipe ──────────────────────────────────────
    st.subheader("🏢 Caixas de Equipe (Inbox Compartilhado)")
    st.caption(
        "Configure caixas compartilhadas como `credenciamento@hocta.com.br`. "
        "Todos os executivos enxergam e operam a partir delas."
    )

    caixas = query("SELECT * FROM caixas_equipe ORDER BY nome")

    # Formulário para nova caixa
    with st.expander("➕ Adicionar nova caixa de equipe"):
        with st.form("form_nova_caixa_equipe", clear_on_submit=True):
            nc1, nc2 = st.columns(2)
            nome_cx = nc1.text_input("Nome da caixa*", placeholder="Ex: Credenciamento")
            email_cx = nc2.text_input(
                "Email*", placeholder="credenciamento@hocta.com.br"
            )
            senha_cx = st.text_input("Senha IMAP*", type="password")
            criar_cx = st.form_submit_button(
                "Criar Caixa", use_container_width=True, type="primary"
            )
        if criar_cx:
            if not nome_cx or not email_cx or not senha_cx:
                st.error("Preencha todos os campos.")
            else:
                enc = criptografar_senha(senha_cx)
                try:
                    execute(
                        "INSERT INTO caixas_equipe (nome, email, senha_imap_enc) VALUES (?,?,?)",
                        (nome_cx.strip(), email_cx.strip().lower(), enc),
                    )
                    st.success(f"✅ Caixa **{nome_cx}** criada!")
                    st.rerun()
                except Exception:
                    st.error("Este email já está cadastrado como caixa de equipe.")

    # Lista caixas existentes
    if not caixas:
        st.info("Nenhuma caixa de equipe configurada ainda.")
    else:
        for cx in caixas:
            n_cx_banco = query(
                "SELECT COUNT(*) AS n FROM emails WHERE caixa_id=? AND caixa_tipo='equipe'",
                (cx["id"],),
            )[0]["n"]
            n_fila = query(
                "SELECT COUNT(*) AS n FROM emails WHERE caixa_id=? AND caixa_tipo='equipe' AND prospeccao_id IS NULL AND atribuido_a IS NULL",
                (cx["id"],),
            )[0]["n"]
            sync_info = (
                f"sync: {cx['email_sync_em'][:16]}"
                if cx.get("email_sync_em")
                else "nunca sincronizado"
            )
            status = "✅" if cx["ativo"] else "⏸️"
            fila_badge = f" · 📥 {n_fila} na fila" if n_fila else ""
            with st.expander(
                f"{status} {cx['nome']} — `{cx['email']}` · {n_cx_banco} emails · {sync_info}{fila_badge}"
            ):

                # Métricas rápidas da caixa
                cm1, cm2, cm3, cm4 = st.columns(4)
                cm1.metric("📥 Total sincronizado", n_cx_banco)
                cm2.metric("📬 Fila de entrada", n_fila)
                vinculados = query(
                    "SELECT COUNT(*) AS n FROM emails WHERE caixa_id=? AND prospeccao_id IS NOT NULL",
                    (cx["id"],),
                )[0]["n"]
                cm3.metric("🔗 Vinculados a prospecção", vinculados)
                cm4.metric("🕐 Última sync", (cx["email_sync_em"] or "—")[:16])

                with st.form(f"form_caixa_{cx['id']}"):
                    ce1, ce2 = st.columns(2)
                    nome_edit = ce1.text_input("Nome", value=cx["nome"])
                    ativo_edit = ce2.toggle("Ativa", value=bool(cx["ativo"]))
                    nova_senha_cx = st.text_input(
                        "Nova senha (deixe em branco para manter)",
                        type="password",
                        key=f"cx_senha_{cx['id']}",
                    )
                    cs1, cs2, cs3 = st.columns(3)
                    salvar_cx = cs1.form_submit_button(
                        "💾 Salvar", use_container_width=True, type="primary"
                    )
                    testar_cx = cs2.form_submit_button(
                        "🔌 Testar", use_container_width=True
                    )
                    sync_cx = cs3.form_submit_button(
                        "🔄 Sync agora", use_container_width=True
                    )

                if salvar_cx:
                    if nova_senha_cx:
                        enc = criptografar_senha(nova_senha_cx)
                        execute(
                            "UPDATE caixas_equipe SET nome=?, ativo=?, senha_imap_enc=? WHERE id=?",
                            (nome_edit, int(ativo_edit), enc, cx["id"]),
                        )
                    else:
                        execute(
                            "UPDATE caixas_equipe SET nome=?, ativo=? WHERE id=?",
                            (nome_edit, int(ativo_edit), cx["id"]),
                        )
                    st.success("Salvo!")
                    st.rerun()

                if testar_cx:
                    import imaplib as _imap

                    try:
                        c_test = _imap.IMAP4_SSL("imap.umbler.com", 993)
                        c_test.login(
                            cx["email"], descriptografar_senha(cx["senha_imap_enc"])
                        )
                        _, data = c_test.select("INBOX")
                        total_imap = int(data[0]) if data[0] else 0
                        c_test.logout()
                        faltam = total_imap - n_cx_banco
                        st.success(
                            f"✅ Conexão OK · **{total_imap}** emails na caixa IMAP · "
                            f"**{n_cx_banco}** sincronizados · "
                            f"**{max(faltam, 0)}** pendentes de importação"
                        )
                    except Exception as e:
                        st.error(f"❌ Falha na conexão: {e}")

                if sync_cx:
                    with st.spinner(f"Sincronizando {cx['email']}..."):
                        res = sincronizar_caixa_equipe(
                            cx["id"], cx["email"], cx["senha_imap_enc"]
                        )
                    if res.get("erro"):
                        st.error(f"❌ Erro: {res['erro']}")
                    else:
                        st.success(
                            f"✅ Sync concluído · **{res['novos']}** novos importados · "
                            f"**{res['ja_existiam']}** já existiam · "
                            f"**{res['total_imap']}** total na caixa IMAP"
                        )
                        st.rerun()

                # Membros com acesso (todos os executivos ativos)
                st.caption("👥 Acesso: todos os executivos e admins ativos")

    st.divider()

    # ── Sync manual ───────────────────────────────────────────
    st.subheader("Sincronização")
    col_sync, col_info = st.columns([2, 3])
    with col_sync:
        if st.button(
            "🔄 Sincronizar todos agora", use_container_width=True, type="primary"
        ):
            with st.spinner("Sincronizando caixas de email..."):
                try:
                    sincronizar_todos()
                    st.success("✅ Sincronização concluída!")
                except Exception as e:
                    st.error(f"Erro: {e}")

        sync_intervalo = st.number_input(
            "Intervalo automático (minutos)",
            min_value=1,
            max_value=60,
            value=5,
            key="email_sync_intervalo",
        )
        if st.button("▶️ Iniciar sync automático", use_container_width=True):
            iniciar_sync_background(intervalo_minutos=sync_intervalo)
            st.success(f"Sync automático iniciado (a cada {sync_intervalo} min)")

    with col_info:
        total_emails = query("SELECT COUNT(*) AS n FROM emails")[0]["n"]
        total_equipe = query(
            "SELECT COUNT(*) AS n FROM emails WHERE caixa_tipo='equipe'"
        )[0]["n"]
        total_anexos = query("SELECT COUNT(*) AS n FROM email_anexos")[0]["n"]
        st.metric("Emails sincronizados", total_emails)
        st.metric("Via caixa de equipe", total_equipe)
        st.metric("Anexos armazenados", total_anexos)
