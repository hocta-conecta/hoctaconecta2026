"""
sync_email.py — Motor de sincronização IMAP/SMTP para Umbler
============================================================
Responsabilidades:
  - Criptografar/descriptografar senhas IMAP com Fernet
  - Sincronizar caixa de entrada de cada executivo via IMAP
  - Enviar emails via SMTP
  - Iniciar sync periódico em background thread (Streamlit-safe)
"""

import imaplib
import smtplib
import email as email_lib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.header import decode_header
import re
import base64
import threading
import logging
from datetime import datetime
from pathlib import Path

from cryptography.fernet import Fernet

from database import query, execute, get_connection

# ── Configurações Umbler ──────────────────────────────────────
IMAP_HOST = "imap.umbler.com"
IMAP_PORT = 993
SMTP_HOST = "smtp.umbler.com"
SMTP_PORT = 587

# Tamanho máximo de anexo salvo no banco (5 MB)
MAX_ANEXO_BYTES = 5 * 1024 * 1024

logger = logging.getLogger("hocta.email")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# ── Criptografia de senha ─────────────────────────────────────

def _fernet() -> Fernet:
    """Retorna instância Fernet com chave de st.secrets ou variável de ambiente."""
    try:
        import streamlit as st
        raw = st.secrets.get("EMAIL_FERNET_KEY", "")
    except Exception:
        raw = ""
    if not raw:
        import os
        raw = os.environ.get("EMAIL_FERNET_KEY", "")
    if not raw:
        # Chave fixa de fallback (OK para dev local; em produção use secrets)
        raw = base64.urlsafe_b64encode(b"hocta-imap-key-2024-padded-here!").decode()
    return Fernet(raw.encode() if isinstance(raw, str) else raw)


def criptografar_senha(senha: str) -> str:
    return _fernet().encrypt(senha.encode()).decode()


def descriptografar_senha(enc: str) -> str:
    return _fernet().decrypt(enc.encode()).decode()


# ── Helpers de parsing ────────────────────────────────────────

def _decode_header_str(raw: str) -> str:
    """Decodifica cabeçalho MIME (ex: assunto com UTF-8)."""
    parts = decode_header(raw or "")
    result = []
    for part, charset in parts:
        if isinstance(part, bytes):
            result.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(part)
    return " ".join(result)


def _extrair_email_addr(header: str) -> str:
    m = re.search(r'[\w.+\-]+@[\w\-]+\.[\w.]+', header or "")
    return m.group(0).lower() if m else ""


def _classificar_anexo(nome: str) -> str:
    ext = nome.rsplit(".", 1)[-1].lower() if "." in nome else ""
    mapa = {
        "jpg": "imagem", "jpeg": "imagem", "png": "imagem",
        "gif": "imagem", "webp": "imagem",
        "ppt": "ppt",  "pptx": "ppt",
        "xls": "xlsx", "xlsx": "xlsx",
        "pdf": "pdf",
    }
    return mapa.get(ext, "outro")


def _extrair_links_drive(html: str) -> list[str]:
    return re.findall(r'https://drive\.google\.com/\S+', html or "")


# ── Vinculação ao prestador / prospecção ──────────────────────

def _vincular_prestador(email_contato: str) -> int | None:
    if not email_contato:
        return None
    r = query("SELECT id FROM prestadores WHERE LOWER(email)=?", (email_contato,))
    if r:
        return r[0]["id"]
    # Fallback: domínio do email bate com domínio do email cadastrado no prestador
    dominio = email_contato.split("@")[-1]
    r = query("SELECT id FROM prestadores WHERE LOWER(email) LIKE ?", (f"%@{dominio}",))
    return r[0]["id"] if r else None


def _prosp_ativa(prestador_id: int, executivo_id: int) -> int | None:
    r = query("""
        SELECT id FROM prospeccoes
        WHERE prestador_id=? AND executivo_id=?
          AND etapa NOT IN ('credenciado','declinado')
        ORDER BY data_inicio DESC LIMIT 1
    """, (prestador_id, executivo_id))
    return r[0]["id"] if r else None


def _prosp_por_contato(email_contato: str, executivo_id: int | None = None) -> int | None:
    """Busca prospecção ativa pelo email de um contato cadastrado em prospeccao_contatos.

    Tenta primeiro prospecções do executivo específico; se não achar, busca em qualquer exec.
    """
    if not email_contato:
        return None
    ec = email_contato.lower()
    if executivo_id:
        r = query("""
            SELECT pc.prospeccao_id FROM prospeccao_contatos pc
            JOIN prospeccoes p ON p.id = pc.prospeccao_id
            WHERE LOWER(pc.email)=?
              AND p.executivo_id=?
              AND p.etapa NOT IN ('credenciado','declinado')
            ORDER BY p.data_inicio DESC LIMIT 1
        """, (ec, executivo_id))
        if r:
            return r[0]["prospeccao_id"]
    # qualquer executivo
    r = query("""
        SELECT pc.prospeccao_id FROM prospeccao_contatos pc
        JOIN prospeccoes p ON p.id = pc.prospeccao_id
        WHERE LOWER(pc.email)=?
          AND p.etapa NOT IN ('credenciado','declinado')
        ORDER BY p.data_inicio DESC LIMIT 1
    """, (ec,))
    return r[0]["prospeccao_id"] if r else None


def _resolver_prospeccao(email_contato: str, executivo_id: int | None) -> int | None:
    """Resolve prospeccao_id pelo melhor match disponível:
    1. Email principal do prestador (via _vincular_prestador + _prosp_ativa)
    2. Email de contato cadastrado em prospeccao_contatos
    """
    if not email_contato:
        return None
    # 1. email principal do prestador
    prest_id = _vincular_prestador(email_contato)
    if prest_id:
        pid = _prosp_ativa(prest_id, executivo_id) if executivo_id else None
        if not pid:
            # tenta sem filtro de executivo (caixa de equipe)
            r = query("""
                SELECT id FROM prospeccoes
                WHERE prestador_id=? AND etapa NOT IN ('credenciado','declinado')
                ORDER BY data_inicio DESC LIMIT 1
            """, (prest_id,))
            pid = r[0]["id"] if r else None
        if pid:
            return pid
    # 2. tabela de contatos da prospecção
    return _prosp_por_contato(email_contato, executivo_id)


# ── Salvar email + anexos no banco ────────────────────────────

def _salvar_email(prosp_id, exec_id, imap_uid, direcao,
                  assunto, corpo_html, de, para, data_hora,
                  anexos: list, links_drive: list) -> int:
    """Insere email no banco; ignora duplicata (UNIQUE exec_id+imap_uid)."""
    try:
        email_id = execute("""
            INSERT OR IGNORE INTO emails
                (prospeccao_id, executivo_id, imap_uid, direcao,
                 assunto, corpo_html, de, para, data_hora)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, (prosp_id, exec_id, imap_uid, direcao,
               assunto, corpo_html, de, para, data_hora))
    except Exception as e:
        logger.warning(f"Erro ao salvar email uid={imap_uid}: {e}")
        return 0

    if not email_id:
        return 0  # já existia

    # Salva anexos binários
    for anx in anexos:
        conteudo = anx["conteudo"]
        if len(conteudo) > MAX_ANEXO_BYTES:
            conteudo = None  # muito grande, não armazena binário
        execute("""
            INSERT INTO email_anexos (email_id, nome, tipo, conteudo)
            VALUES (?,?,?,?)
        """, (email_id, anx["nome"], anx["tipo"], conteudo))

    # Salva links do Drive como anexos do tipo link_drive
    for url in links_drive:
        execute("""
            INSERT INTO email_anexos (email_id, nome, tipo, drive_url)
            VALUES (?,?,?,?)
        """, (email_id, "Link Google Drive", "link_drive", url))

    # Auto-registra interação se o email está vinculado a uma prospecção
    if email_id and prosp_id and exec_id:
        _auto_interacao(prosp_id, exec_id, direcao, assunto, data_hora)

    return email_id


def _auto_interacao(prosp_id: int, exec_id: int, direcao: str,
                    assunto: str | None, data_hora: str | None):
    """Cria registro de interação automático para um email sincronizado.

    Tipo:
      - recebido + 1º email deste contato → 'contato_estabelecido'
      - recebido + demais                 → 'follow_up'
      - enviado  + 1º email desta prosp   → 'envio_proposta'
      - enviado  + demais                 → 'follow_up'
    Evita duplicar se já existe interação de canal='email' com mesma data_hora+prosp.
    """
    try:
        # Checa duplicata exata
        dup = query("""
            SELECT id FROM interacoes
            WHERE prospeccao_id=? AND canal='email' AND data_hora=?
        """, (prosp_id, data_hora or ""))
        if dup:
            return

        # Conta interações de email anteriores nesta prospecção
        cnt = query("""
            SELECT COUNT(*) AS n FROM interacoes
            WHERE prospeccao_id=? AND canal='email' AND direcao=?
        """, (prosp_id, direcao))
        n_anteriores = cnt[0]["n"] if cnt else 0

        if direcao == "recebido":
            tipo = "contato_estabelecido" if n_anteriores == 0 else "follow_up"
        else:
            tipo = "envio_proposta" if n_anteriores == 0 else "follow_up"

        descricao = f"📧 [auto] {assunto or '(sem assunto)'}"
        ts = data_hora or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        execute("""
            INSERT INTO interacoes
                (prospeccao_id, executivo_id, data_hora, canal, tipo, descricao, direcao)
            VALUES (?,?,?,?,?,?,?)
        """, (prosp_id, exec_id, ts, "email", tipo, descricao, direcao))
    except Exception as e:
        logger.warning(f"Erro ao criar auto-interação prosp={prosp_id}: {e}")


# ── Sincronização IMAP ────────────────────────────────────────

def sincronizar_executivo(exec_id: int, email_imap: str, senha_enc: str) -> dict:
    """
    Conecta via IMAP ao Umbler, lê todos os emails do executivo (lidos ou não),
    vincula ao prestador/prospecção e salva no banco.
    Retorna dict com: novos, ja_existiam, total_imap, erro
    """
    resultado = {"novos": 0, "ja_existiam": 0, "total_imap": 0, "erro": None}

    try:
        senha = descriptografar_senha(senha_enc)
    except Exception:
        msg = f"Falha ao descriptografar senha do executivo {exec_id}"
        logger.error(msg)
        resultado["erro"] = msg
        return resultado

    try:
        conn = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        conn.login(email_imap, senha)
    except Exception as e:
        logger.error(f"Falha IMAP login {email_imap}: {e}")
        resultado["erro"] = str(e)
        return resultado

    try:
        conn.select("INBOX")
        _, uids = conn.search(None, "ALL")
        todos_uids = uids[0].split()
        resultado["total_imap"] = len(todos_uids)
        uids_list = todos_uids[-500:]  # processa os 500 mais recentes

        novos = 0
        ja_existiam = 0
        for uid in uids_list:
            uid_str = uid.decode()

            # Verifica se já existe no banco ou está na blocklist
            existe = query(
                "SELECT id FROM emails WHERE executivo_id=? AND imap_uid=?",
                (exec_id, uid_str)
            )
            if existe:
                ja_existiam += 1
                continue
            if query("SELECT id FROM emails_ignorados WHERE imap_uid=?", (uid_str,)):
                ja_existiam += 1
                continue

            try:
                _, data = conn.fetch(uid, "(RFC822)")
                msg = email_lib.message_from_bytes(data[0][1])
            except Exception as e:
                logger.warning(f"Erro ao fazer fetch uid={uid_str}: {e}")
                continue

            assunto   = _decode_header_str(msg.get("Subject", "(sem assunto)"))
            de        = _decode_header_str(msg.get("From", ""))
            para      = _decode_header_str(msg.get("To", ""))
            data_hora = msg.get("Date", "")

            # Determina direção: enviado se o From é do executivo
            email_exec = email_imap.lower()
            email_de   = _extrair_email_addr(de)
            direcao    = "enviado" if email_de == email_exec else "recebido"
            email_contato = _extrair_email_addr(para if direcao == "enviado" else de)

            corpo_html = ""
            anexos     = []

            for part in msg.walk():
                ct = part.get_content_type()
                cd = str(part.get("Content-Disposition", ""))

                if ct == "text/html" and "attachment" not in cd:
                    payload = part.get_payload(decode=True)
                    if payload:
                        corpo_html = payload.decode("utf-8", errors="replace")
                elif ct == "text/plain" and not corpo_html and "attachment" not in cd:
                    payload = part.get_payload(decode=True)
                    if payload:
                        corpo_html = "<pre>" + payload.decode("utf-8", errors="replace") + "</pre>"
                elif "attachment" in cd or part.get_filename():
                    fname   = _decode_header_str(part.get_filename() or "anexo")
                    payload = part.get_payload(decode=True) or b""
                    tipo    = _classificar_anexo(fname)
                    anexos.append({"nome": fname, "tipo": tipo, "conteudo": payload})

            links_drive  = _extrair_links_drive(corpo_html)
            prosp_id     = _resolver_prospeccao(email_contato, exec_id)

            eid = _salvar_email(prosp_id, exec_id, uid_str, direcao,
                                assunto, corpo_html, de, para, data_hora,
                                anexos, links_drive)
            if eid:
                novos += 1

        resultado["novos"]       = novos
        resultado["ja_existiam"] = ja_existiam

        # Atualiza timestamp de última sync
        execute("UPDATE usuarios SET email_sync_em=? WHERE id=?",
                (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), exec_id))

        logger.info(f"Sync {email_imap}: {novos} novos, {ja_existiam} já existiam, {resultado['total_imap']} total IMAP")

    except Exception as e:
        logger.error(f"Erro durante sync {email_imap}: {e}")
        resultado["erro"] = str(e)
    finally:
        try:
            conn.logout()
        except Exception:
            pass

    return resultado


def sincronizar_todos():
    """Sincroniza todos os executivos com IMAP configurado."""
    execs = query("""
        SELECT id, email_imap, senha_imap_enc
        FROM usuarios
        WHERE perfil='executivo' AND ativo=1
          AND email_imap IS NOT NULL
          AND senha_imap_enc IS NOT NULL
    """)
    for e in execs:
        sincronizar_executivo(e["id"], e["email_imap"], e["senha_imap_enc"])
    sincronizar_todas_caixas_equipe()


# ── Caixa de Equipe (Team Inbox) ──────────────────────────────

def _salvar_email_equipe(caixa_id: int, imap_uid: str, executivo_id,
                         atribuido_a, prosp_id, direcao: str,
                         assunto: str, corpo_html: str,
                         de: str, para: str, data_hora: str,
                         anexos: list, links_drive: list) -> int:
    """Insere email de caixa de equipe — UNIQUE por caixa_id+imap_uid."""
    try:
        email_id = execute("""
            INSERT OR IGNORE INTO emails
                (prospeccao_id, executivo_id, atribuido_a, imap_uid,
                 direcao, assunto, corpo_html, de, para, data_hora,
                 caixa_tipo, caixa_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,'equipe',?)
        """, (prosp_id, executivo_id, atribuido_a, f"equipe_{caixa_id}_{imap_uid}",
               direcao, assunto, corpo_html, de, para, data_hora, caixa_id))
    except Exception as e:
        logger.warning(f"Erro ao salvar email equipe uid={imap_uid}: {e}")
        return 0

    if not email_id:
        return 0

    for anx in anexos:
        conteudo = anx["conteudo"]
        if len(conteudo) > MAX_ANEXO_BYTES:
            conteudo = None
        execute("""
            INSERT INTO email_anexos (email_id, nome, tipo, conteudo)
            VALUES (?,?,?,?)
        """, (email_id, anx["nome"], anx["tipo"], conteudo))

    for url in links_drive:
        execute("""
            INSERT INTO email_anexos (email_id, nome, tipo, drive_url)
            VALUES (?,?,?,?)
        """, (email_id, "Link Google Drive", "link_drive", url))

    # Auto-registra interação se vinculado a prospecção
    exec_responsavel = atribuido_a or executivo_id
    if email_id and prosp_id and exec_responsavel:
        _auto_interacao(prosp_id, exec_responsavel, direcao, assunto, data_hora)

    return email_id


def sincronizar_caixa_equipe(caixa_id: int, email_caixa: str, senha_enc: str) -> dict:
    """
    Sincroniza caixa compartilhada.
    - Detecta qual executivo enviou comparando From com emails da equipe.
    - Emails de prestadores cadastrados são auto-vinculados à prospecção ativa.
    - Emails sem vínculo vão para a Fila de Entrada (prospeccao_id=NULL).
    Retorna dict com: novos, ja_existiam, total_imap, erro
    """
    resultado = {"novos": 0, "ja_existiam": 0, "total_imap": 0, "erro": None}

    try:
        senha = descriptografar_senha(senha_enc)
    except Exception:
        msg = f"Falha ao descriptografar senha da caixa {email_caixa}"
        logger.error(msg)
        resultado["erro"] = msg
        return resultado

    # Mapa de emails da equipe → id do executivo
    membros = query("""
        SELECT id, email, email_imap FROM usuarios
        WHERE ativo=1 AND perfil IN ('executivo','admin')
    """)
    email_para_exec = {}
    for m in membros:
        if m["email"]:
            email_para_exec[m["email"].lower()] = m["id"]
        if m["email_imap"]:
            email_para_exec[m["email_imap"].lower()] = m["id"]
    # A própria caixa de equipe
    email_para_exec[email_caixa.lower()] = None  # enviado pela caixa → exec desconhecido

    try:
        conn = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        conn.login(email_caixa, senha)
        conn.select("INBOX")
        _, uids = conn.search(None, "ALL")
        todos_uids = uids[0].split()
        resultado["total_imap"] = len(todos_uids)
        uids_list = todos_uids[-500:]  # 500 mais recentes

        novos = 0
        ja_existiam = 0
        for uid in uids_list:
            uid_str = uid.decode()
            uid_chave = f"equipe_{caixa_id}_{uid_str}"

            existe = query("SELECT id FROM emails WHERE imap_uid=?", (uid_chave,))
            if existe:
                ja_existiam += 1
                continue
            if query("SELECT id FROM emails_ignorados WHERE imap_uid=?", (uid_chave,)):
                ja_existiam += 1
                continue

            try:
                _, data = conn.fetch(uid, "(RFC822)")
                msg = email_lib.message_from_bytes(data[0][1])
            except Exception as e:
                logger.warning(f"Erro fetch equipe uid={uid_str}: {e}")
                continue

            assunto   = _decode_header_str(msg.get("Subject", "(sem assunto)"))
            de        = _decode_header_str(msg.get("From", ""))
            para      = _decode_header_str(msg.get("To", ""))
            data_hora = msg.get("Date", "")

            email_de = _extrair_email_addr(de)

            # Quem enviou?
            exec_remetente = email_para_exec.get(email_de)
            if email_de in email_para_exec:
                direcao    = "enviado"
                exec_id    = exec_remetente
                email_cont = _extrair_email_addr(para)
            else:
                direcao    = "recebido"
                exec_id    = None
                email_cont = email_de

            corpo_html = ""
            anexos     = []
            for part in msg.walk():
                ct = part.get_content_type()
                cd = str(part.get("Content-Disposition", ""))
                if ct == "text/html" and "attachment" not in cd:
                    p = part.get_payload(decode=True)
                    if p:
                        corpo_html = p.decode("utf-8", errors="replace")
                elif ct == "text/plain" and not corpo_html and "attachment" not in cd:
                    p = part.get_payload(decode=True)
                    if p:
                        corpo_html = "<pre>" + p.decode("utf-8", errors="replace") + "</pre>"
                elif "attachment" in cd or part.get_filename():
                    fname   = _decode_header_str(part.get_filename() or "anexo")
                    payload = part.get_payload(decode=True) or b""
                    anexos.append({"nome": fname, "tipo": _classificar_anexo(fname),
                                   "conteudo": payload})

            links_drive  = _extrair_links_drive(corpo_html)

            # Prospecção ativa — resolve pelo email do contato (prestador principal ou contatos extras)
            prosp_id    = _resolver_prospeccao(email_cont, exec_id)
            atribuido_a = exec_id
            # Se achou prospecção por contato, pega o executivo responsável
            if prosp_id and not exec_id:
                r = query("SELECT executivo_id FROM prospeccoes WHERE id=?", (prosp_id,))
                if r:
                    atribuido_a = r[0]["executivo_id"]

            eid = _salvar_email_equipe(
                caixa_id, uid_str, exec_id, atribuido_a,
                prosp_id, direcao, assunto, corpo_html,
                de, para, data_hora, anexos, links_drive
            )
            if eid:
                novos += 1

        resultado["novos"]       = novos
        resultado["ja_existiam"] = ja_existiam

        execute("UPDATE caixas_equipe SET email_sync_em=? WHERE id=?",
                (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), caixa_id))
        logger.info(f"Sync equipe {email_caixa}: {novos} novos, {ja_existiam} já existiam, {resultado['total_imap']} total IMAP")

    except Exception as e:
        logger.error(f"Erro sync caixa equipe {email_caixa}: {e}")
        resultado["erro"] = str(e)
    finally:
        try:
            conn.logout()
        except Exception:
            pass

    return resultado


def sincronizar_todas_caixas_equipe():
    """Sincroniza todas as caixas de equipe ativas."""
    caixas = query("""
        SELECT id, email, senha_imap_enc FROM caixas_equipe
        WHERE ativo=1 AND senha_imap_enc IS NOT NULL
    """)
    for c in caixas:
        sincronizar_caixa_equipe(c["id"], c["email"], c["senha_imap_enc"])


def enviar_via_equipe(caixa_id: int, exec_id: int, para: str,
                      assunto: str, corpo_html: str,
                      anexos_bytes: list | None = None,
                      prosp_id: int | None = None) -> bool:
    """Envia email pela caixa de equipe com assinatura do executivo."""
    caixa = query("SELECT email, senha_imap_enc FROM caixas_equipe WHERE id=?", (caixa_id,))
    if not caixa or not caixa[0]["senha_imap_enc"]:
        logger.error(f"Caixa de equipe {caixa_id} sem credenciais")
        return False

    exec_info = query("SELECT nome FROM usuarios WHERE id=?", (exec_id,))
    nome_exec = exec_info[0]["nome"] if exec_info else "Equipe"

    email_from = caixa[0]["email"]
    try:
        senha = descriptografar_senha(caixa[0]["senha_imap_enc"])
    except Exception:
        return False

    # Adiciona assinatura do executivo
    assinatura = (
        f"<br><br>--<br><strong>{nome_exec}</strong><br>"
        f"Executivo de Credenciamento · Hocta Saúde<br>"
        f"<a href='mailto:{email_from}'>{email_from}</a>"
    )
    corpo_final = corpo_html + assinatura

    msg = MIMEMultipart("mixed")
    msg["From"]    = f"{nome_exec} via Hocta <{email_from}>"
    msg["To"]      = para
    msg["Subject"] = assunto
    msg.attach(MIMEText(corpo_final, "html", "utf-8"))

    for anx in (anexos_bytes or []):
        part = MIMEBase("application", "octet-stream")
        part.set_payload(anx["conteudo"])
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{anx["nome"]}"')
        msg.attach(part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.login(email_from, senha)
            s.sendmail(email_from, para, msg.as_string())
    except Exception as e:
        logger.error(f"Falha SMTP equipe {email_from} → {para}: {e}")
        return False

    _salvar_email_equipe(
        caixa_id, f"sent_{datetime.now().timestamp()}",
        exec_id, exec_id, prosp_id, "enviado",
        assunto, corpo_final, f"{nome_exec} via Hocta <{email_from}>",
        para, datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
        [], []
    )
    return True


# ── Envio de email via SMTP ───────────────────────────────────

def enviar_email(exec_id: int, para: str, assunto: str, corpo_html: str,
                 anexos_bytes: list | None = None,
                 prosp_id: int | None = None) -> bool:
    """
    Envia email pelo SMTP Umbler usando as credenciais do executivo.
    Salva na tabela emails como 'enviado'.
    anexos_bytes: lista de dicts {"nome": str, "conteudo": bytes}
    """
    cred = query("SELECT email_imap, senha_imap_enc FROM usuarios WHERE id=?", (exec_id,))
    if not cred or not cred[0]["email_imap"]:
        logger.error(f"Executivo {exec_id} sem credenciais SMTP")
        return False

    email_from = cred[0]["email_imap"]
    try:
        senha = descriptografar_senha(cred[0]["senha_imap_enc"])
    except Exception:
        logger.error(f"Falha ao descriptografar senha executivo {exec_id}")
        return False

    msg = MIMEMultipart("mixed")
    msg["From"]    = email_from
    msg["To"]      = para
    msg["Subject"] = assunto
    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    for anx in (anexos_bytes or []):
        part = MIMEBase("application", "octet-stream")
        part.set_payload(anx["conteudo"])
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{anx["nome"]}"')
        msg.attach(part)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.login(email_from, senha)
            s.sendmail(email_from, para, msg.as_string())
    except Exception as e:
        logger.error(f"Falha SMTP envio {email_from} → {para}: {e}")
        return False

    # Salva como enviado no banco
    anexos_parsed = [
        {"nome": a["nome"], "tipo": _classificar_anexo(a["nome"]), "conteudo": a["conteudo"]}
        for a in (anexos_bytes or [])
    ]
    _salvar_email(prosp_id, exec_id, f"sent_{datetime.now().timestamp()}",
                  "enviado", assunto, corpo_html,
                  email_from, para,
                  datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000"),
                  anexos_parsed, [])
    return True


# ── Background scheduler (Streamlit-safe) ────────────────────

_sync_started = False
_sync_lock    = threading.Lock()


def iniciar_sync_background(intervalo_minutos: int = 5):
    """
    Inicia um thread daemon que sincroniza todos os executivos
    a cada `intervalo_minutos`. Chame uma vez via @st.cache_resource.
    """
    global _sync_started
    with _sync_lock:
        if _sync_started:
            return
        _sync_started = True

    def _loop():
        import time
        logger.info(f"Email sync background iniciado (intervalo={intervalo_minutos}min)")
        while True:
            try:
                sincronizar_todos()
            except Exception as e:
                logger.error(f"Erro no loop de sync: {e}")
            time.sleep(intervalo_minutos * 60)

    t = threading.Thread(target=_loop, daemon=True, name="hocta-email-sync")
    t.start()
    logger.info("Thread de sync de email iniciada")
