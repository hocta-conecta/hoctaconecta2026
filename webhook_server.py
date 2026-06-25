"""
Webhook server para integração WhatsApp → Hocta Conecta
Compatível com WPPConnect Server (https://github.com/wppconnect-team/wppconnect-server)

Para rodar junto com o Streamlit:
    uvicorn webhook_server:app --host 0.0.0.0 --port 8000

Para expor via ngrok durante testes:
    ngrok http 8000
    → configure a URL gerada no WPPConnect Server como webhook

Variáveis de ambiente:
    DB_PATH         = caminho do SQLite (default: hocta_conecta.db)
    WEBHOOK_SECRET  = chave de validação do header X-Webhook-Key
    EXEC_DEFAULT_ID = executivo padrão para mensagens não identificadas
    WPP_SESSION     = nome da sessão WPPConnect (default: hocta)
"""

import os
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import JSONResponse
from database import execute, get_connection, query
from whatsapp_service import normaliza_fone

# ── Configuração ──────────────────────────────────────────────
DB_PATH = os.getenv("DB_PATH", "hocta_conecta.db")
WEBHOOK_KEY = os.getenv("WEBHOOK_SECRET", "hocta-whatsapp-secret")
EXEC_DEFAULT_ID = int(os.getenv("EXEC_DEFAULT_ID", "1"))
WPP_SESSION = os.getenv("WPP_SESSION", "hocta")

app = FastAPI(title="Hocta Conecta — WhatsApp Webhook")


def busca_prestador_por_fone(fone_norm: str):
    """Retorna dict com id, razao_social ou None."""
    sufixo = fone_norm[-11:]
    rows = query(
        """SELECT id, razao_social FROM prestadores
           WHERE REPLACE(REPLACE(REPLACE(REPLACE(telefone,' ',''),'-',''),'(',''),')','')
                 LIKE ?""",
        (f"%{sufixo}",),
    )
    return rows[0] if rows else None


def busca_prospecao_ativa(prestador_id: int):
    """Retorna a prospecção mais recente em andamento para o prestador."""
    rows = query(
        """
        SELECT p.id, p.executivo_id, p.etapa
        FROM prospeccoes p
        WHERE p.prestador_id = ?
          AND p.etapa NOT IN ('credenciado', 'declinado')
        ORDER BY p.atualizado_em DESC
        LIMIT 1
    """,
        (prestador_id,),
    )
    return rows[0] if rows else None


def salvar_mensagem(
    wpp_msg_id,
    numero,
    nome_contato,
    direcao,
    texto,
    tipo_midia,
    prestador_id,
    prospeccao_id,
    executivo_id,
    data_hora,
):
    """Insere em whatsapp_mensagens (INSERT OR IGNORE para idempotência)."""
    execute(
        """
        INSERT OR IGNORE INTO whatsapp_mensagens
            (wpp_msg_id, numero, nome_contato, direcao, texto, tipo_midia,
             prestador_id, prospeccao_id, executivo_id, lido, data_hora)
        VALUES (?,?,?,?,?,?,?,?,?,0,?)
        """,
        (
            wpp_msg_id,
            numero,
            nome_contato,
            direcao,
            texto,
            tipo_midia,
            prestador_id,
            prospeccao_id,
            executivo_id,
            data_hora,
        ),
    )
    if prospeccao_id:
        execute(
            """
            UPDATE prospeccoes SET atualizado_em = datetime('now','localtime')
            WHERE id = ?
            """,
            (prospeccao_id,),
        )


def auto_interacao(prosp_id, exec_id, direcao, texto, data_hora):
    """Registra interação deduplicada (canal=whatsapp)."""
    tipo = "contato_estabelecido" if direcao == "recebido" else "follow_up"
    desc = f"[WhatsApp {direcao}] {texto[:800]}"
    existe = query(
        """
        SELECT id FROM interacoes
        WHERE prospeccao_id=? AND canal='whatsapp' AND data_hora=?
        """,
        (prosp_id, data_hora),
    )
    if not existe:
        execute(
            """
            INSERT INTO interacoes
                (prospeccao_id, executivo_id, canal, tipo, descricao,
                 data_interacao, data_hora, direcao)
            VALUES (?,?,'whatsapp',?,?,?,?,?)
            """,
            (prosp_id, exec_id, tipo, desc, data_hora[:10], data_hora, direcao),
        )


# ── Endpoint principal ────────────────────────────────────────


@app.post("/webhook/whatsapp")
async def receber_evento(
    request: Request,
    x_webhook_key: str = Header(default=""),
):
    """
    Recebe eventos do WPPConnect Server.
    Formato:
    {
      "session": "hocta",
      "type": "onmessage",
      "body": {
        "id": "msg_id",
        "body": "texto",
        "from": "5511999999999@c.us",
        "fromMe": false,
        "timestamp": 1234567890,
        "type": "chat",
        "notifyName": "Nome do Contato"
      }
    }
    """
    if WEBHOOK_KEY and x_webhook_key != WEBHOOK_KEY:
        raise HTTPException(status_code=401, detail="Chave inválida")

    body = await request.json()
    session = body.get("session", "")
    tipo = body.get("type", "")

    if session != WPP_SESSION or tipo != "onmessage":
        return JSONResponse({"status": "ignored", "type": tipo})

    msg = body.get("body", {}) or {}

    # Ignora grupos
    from_jid = msg.get("from", "")
    if "@g.us" in from_jid:
        return JSONResponse({"status": "ignored", "reason": "group"})

    # Extrai texto
    texto = (msg.get("body") or msg.get("caption") or "").strip()
    tipo_midia = msg.get("type", "chat")
    if not texto and tipo_midia not in ("image", "document", "audio", "video"):
        return JSONResponse({"status": "ignored", "reason": "no_text"})
    if not texto:
        texto = f"[{tipo_midia}]"

    from_me = msg.get("fromMe", False)
    direcao = "enviado" if from_me else "recebido"

    fone_raw = from_jid.split("@")[0]
    fone_norm = normaliza_fone(fone_raw)
    nome_contato = msg.get("notifyName") or msg.get("pushname") or None
    wpp_msg_id = msg.get("id") or f"{fone_norm}_{msg.get('timestamp','')}"

    ts = msg.get("timestamp", 0)
    try:
        data_hora = datetime.fromtimestamp(int(ts)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        data_hora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Vincular prestador / prospecção
    prestador = busca_prestador_por_fone(fone_norm)
    prestador_id = prestador["id"] if prestador else None
    prospeccao_id = None
    exec_id = EXEC_DEFAULT_ID

    if prestador_id:
        prosp = busca_prospecao_ativa(prestador_id)
        if prosp:
            prospeccao_id = prosp["id"]
            exec_id = prosp["executivo_id"] or EXEC_DEFAULT_ID

    salvar_mensagem(
        wpp_msg_id,
        fone_norm,
        nome_contato,
        direcao,
        texto,
        tipo_midia,
        prestador_id,
        prospeccao_id,
        exec_id,
        data_hora,
    )

    if prospeccao_id:
        auto_interacao(prospeccao_id, exec_id, direcao, texto, data_hora)

    return JSONResponse(
        {
            "status": "ok",
            "numero": fone_norm,
            "prestador": prestador["razao_social"] if prestador else None,
            "prospeccao_id": prospeccao_id,
            "direcao": direcao,
            "preview": texto[:80],
        }
    )


@app.get("/webhook/health")
async def health():
    return {"status": "ok", "service": "Hocta Conecta — WhatsApp Webhook"}
