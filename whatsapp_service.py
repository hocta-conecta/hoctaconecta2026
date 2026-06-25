"""
Wrapper HTTP para o WPPConnect Server.

O WPPConnect Server é um serviço Node.js que mantém a sessão do WhatsApp
via WPPConnect (baseado em Baileys / WhatsApp Web).

Instalação rápida via Docker:
    docker run -d --name wppconnect \
      -p 21465:21465 \
      -e SECRET_KEY=hocta-secret \
      wppconnect/wppconnect-server

Variáveis de ambiente:
    WPP_URL     = http://localhost:21465   (URL base do WPPConnect Server)
    WPP_TOKEN   = (gerado pelo WPPConnect na primeira chamada)
    WPP_SESSION = hocta                    (nome da sessão — fixo)
"""

import os
import re
import requests
from datetime import datetime

WPP_URL     = os.getenv("WPP_URL",     "http://localhost:21465")
WPP_TOKEN   = os.getenv("WPP_TOKEN",   "")
WPP_SESSION = os.getenv("WPP_SESSION", "hocta")
_TIMEOUT    = 10  # segundos


def _headers() -> dict:
    return {"Authorization": f"Bearer {WPP_TOKEN}", "Content-Type": "application/json"}


def normaliza_fone(fone: str) -> str:
    """Remove tudo exceto dígitos e garante DDI 55 (Brasil)."""
    digits = re.sub(r"\D", "", fone or "")
    if digits.startswith("55") and len(digits) >= 12:
        return digits
    if len(digits) in (10, 11):
        return "55" + digits
    return digits


def _numero_para_jid(numero: str) -> str:
    """Converte número normalizado para JID do WhatsApp (ex: 5511999999999@c.us)."""
    n = normaliza_fone(numero)
    return f"{n}@c.us"


# ── Status / QR Code ──────────────────────────────────────────

def get_status() -> dict:
    """
    Retorna o status da sessão WPPConnect.
    Possíveis valores: CONNECTED, QRCODE, CLOSED, INITIALIZING, NOPHONE, NOTLOGGED
    """
    try:
        r = requests.get(
            f"{WPP_URL}/api/{WPP_SESSION}/status-session",
            headers=_headers(),
            timeout=_TIMEOUT,
        )
        if r.status_code == 200:
            data = r.json()
            return {"status": data.get("status", "UNKNOWN"), "raw": data}
        return {"status": "ERROR", "http": r.status_code}
    except requests.exceptions.ConnectionError:
        return {"status": "OFFLINE", "detalhe": "WPPConnect Server não acessível"}
    except Exception as e:
        return {"status": "ERROR", "detalhe": str(e)}


def get_qrcode() -> str | None:
    """
    Retorna a imagem do QR code em base64 (data URI) para exibição no Admin,
    ou None se a sessão já estiver conectada ou o servidor estiver offline.
    """
    try:
        r = requests.get(
            f"{WPP_URL}/api/{WPP_SESSION}/qrcode-session",
            headers=_headers(),
            timeout=_TIMEOUT,
        )
        if r.status_code == 200:
            data = r.json()
            # WPPConnect Server retorna {"status":"...", "qrcode":"data:image/png;base64,..."}
            qr = data.get("qrcode") or data.get("base64")
            return qr if qr else None
        return None
    except Exception:
        return None


def gerar_token() -> dict:
    """
    Gera (ou recupera) o token de API para a sessão.
    Deve ser chamado uma vez durante a configuração inicial.
    Retorna {"token": "...", "status": "ok"|"error"}
    """
    try:
        r = requests.post(
            f"{WPP_URL}/api/{WPP_SESSION}/{WPP_TOKEN}/generate-token",
            timeout=_TIMEOUT,
        )
        if r.status_code == 200:
            data = r.json()
            token = data.get("token", "")
            return {"token": token, "status": "ok"}
        return {"status": "error", "http": r.status_code}
    except Exception as e:
        return {"status": "error", "detalhe": str(e)}


# ── Envio de mensagens ────────────────────────────────────────

def enviar_mensagem(numero: str, texto: str) -> dict:
    """
    Envia mensagem de texto para um número.
    numero: qualquer formato (será normalizado internamente)
    Retorna: {"status": "ok", "id": "..."} ou {"status": "error", "detalhe": "..."}
    """
    if not WPP_TOKEN:
        return {"status": "error", "detalhe": "WPP_TOKEN não configurado"}

    jid = _numero_para_jid(numero)
    try:
        r = requests.post(
            f"{WPP_URL}/api/{WPP_SESSION}/send-message",
            headers=_headers(),
            json={"phone": jid, "message": texto, "isGroup": False},
            timeout=_TIMEOUT,
        )
        if r.status_code in (200, 201):
            data = r.json()
            msg_id = (data.get("id") or {}).get("id") or data.get("id") or ""
            return {"status": "ok", "id": msg_id, "raw": data}
        return {"status": "error", "http": r.status_code, "body": r.text[:200]}
    except requests.exceptions.ConnectionError:
        return {"status": "error", "detalhe": "WPPConnect Server não acessível"}
    except Exception as e:
        return {"status": "error", "detalhe": str(e)}


def encerrar_sessao() -> dict:
    """Encerra/desconecta a sessão ativa (logout do WhatsApp)."""
    try:
        r = requests.post(
            f"{WPP_URL}/api/{WPP_SESSION}/close-session",
            headers=_headers(),
            timeout=_TIMEOUT,
        )
        return {"status": "ok" if r.status_code == 200 else "error", "http": r.status_code}
    except Exception as e:
        return {"status": "error", "detalhe": str(e)}
