import bcrypt
import os
import re
import unicodedata
from pathlib import Path

try:
    import streamlit as st
except Exception:
    st = None

try:
    import sqlite3
except Exception:
    sqlite3 = None

try:
    import psycopg
    from psycopg.rows import dict_row
except Exception:
    psycopg = None
    dict_row = None

DB_URL = ""
DB_PATH = "hocta_conecta.db"

if st:
    try:
        DB_URL = st.secrets.get("DATABASE_URL", "") or os.environ.get(
            "DATABASE_URL", ""
        )
        DB_PATH = st.secrets.get("DB_PATH", "hocta_conecta.db")
    except Exception:
        DB_URL = os.environ.get("DATABASE_URL", "")
        DB_PATH = os.environ.get("DB_PATH", "hocta_conecta.db")
else:
    DB_URL = os.environ.get("DATABASE_URL", "")
    DB_PATH = os.environ.get("DB_PATH", "hocta_conecta.db")

DB_URL = DB_URL.strip() if DB_URL else ""
# Adicione estas linhas:
if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

IS_POSTGRES = bool(DB_URL)



def normaliza_texto(texto: str, lower: bool = True) -> str:
    if texto is None:
        return ""
    texto = str(texto).strip()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(ch for ch in texto if unicodedata.category(ch) != "Mn")
    texto = " ".join(texto.split())
    return texto.lower() if lower else texto


def normaliza_municipio(nome: str) -> str:
    if not nome:
        return nome
    nome = normaliza_texto(nome, lower=False)
    nome = nome.title()
    return nome


def normaliza_lista_municipios(texto: str) -> str:
    if not texto:
        return ""
    itens = [
        normaliza_municipio(item)
        for item in re.split(r"[,\n\r]+", texto)
        if item.strip()
    ]
    return "\n".join(itens)


def normaliza_campo(texto: str) -> str:
    return normaliza_municipio(texto)


def _translate_sql(sql: str) -> str:
    if not IS_POSTGRES:
        return sql

    translated = sql
    if re.search(r"INSERT\s+OR\s+IGNORE\s+INTO", translated, flags=re.IGNORECASE):
        translated = re.sub(
            r"INSERT\s+OR\s+IGNORE\s+INTO",
            "INSERT INTO",
            translated,
            flags=re.IGNORECASE,
        )
        translated = translated.rstrip()
        if translated.endswith(";"):
            translated = translated[:-1]
        translated = f"{translated} ON CONFLICT DO NOTHING"

    translated = translated.replace("?", "%s")
    translated = translated.replace(
        "INTEGER PRIMARY KEY AUTOINCREMENT",
        "SERIAL PRIMARY KEY",
    )
    translated = translated.replace("AUTOINCREMENT", "")
    translated = translated.replace(
        "datetime('now','localtime')",
        "NOW()::TEXT",
    )
    translated = translated.replace(
        "date('now','localtime')",
        "CURRENT_DATE::TEXT",
    )
    translated = translated.replace("datetime('now')", "NOW()::TEXT")

    def _replace_julianday(sql_text: str) -> str:
        result = []
        pos = 0
        while True:
            match = re.search(r"julianday\s*\(", sql_text[pos:], flags=re.IGNORECASE)
            if not match:
                result.append(sql_text[pos:])
                break

            start = pos + match.start()
            open_paren = pos + match.end() - 1
            depth = 1
            idx = open_paren + 1
            while idx < len(sql_text) and depth > 0:
                if sql_text[idx] == "(":
                    depth += 1
                elif sql_text[idx] == ")":
                    depth -= 1
                idx += 1

            if depth != 0:
                result.append(sql_text[pos:])
                break

            inner = sql_text[open_paren + 1 : idx - 1].strip()
            if inner.lower() == "'now'":
                replacement = "(EXTRACT(EPOCH FROM NOW()) / 86400)"
            else:
                replacement = f"(EXTRACT(EPOCH FROM {inner}::TIMESTAMP) / 86400)"

            result.append(sql_text[pos:start])
            result.append(replacement)
            pos = idx

        return "".join(result)

    translated = _replace_julianday(translated)

    translated = re.sub(
        r"\b([A-Za-z_][\w.]*?)\s*=\s*1\b",
        r"\1 = true",
        translated,
    )
    translated = re.sub(
        r"\b([A-Za-z_][\w.]*?)\s*=\s*0\b",
        r"\1 = false",
        translated,
    )

    return translated


_TABLES_WITH_ID_COLUMN = frozenset(
    {
        "usuarios",
        "clientes",
        "projetos",
        "metas",
        "benchmark_especialidades",
        "benchmark_prestadores",
        "prestadores",
        "prestador_especialidades",
        "prospeccoes",
        "interacoes",
        "exportacoes",
        "caixas_equipe",
        "emails",
        "email_anexos",
        "emails_ignorados",
        "prospeccao_contatos",
        "whatsapp_mensagens",
    }
)


def _prepare_sql(sql: str) -> str:
    translated = _translate_sql(sql)
    if not IS_POSTGRES:
        return translated

    normalized = translated.strip()
    if re.match(
        r"^INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)", normalized, flags=re.IGNORECASE
    ):
        table_name = (
            re.match(
                r"^INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)",
                normalized,
                flags=re.IGNORECASE,
            )
            .group(1)
            .lower()
        )
        if (
            table_name in _TABLES_WITH_ID_COLUMN
            and "RETURNING" not in normalized.upper()
        ):
            translated = translated.rstrip().rstrip(";") + " RETURNING id"
    return translated


class _CursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, sql, params=()):
        return self._cursor.execute(_prepare_sql(sql), params)

    def executemany(self, sql, seq_of_params):
        return self._cursor.executemany(_prepare_sql(sql), seq_of_params)

    def __getattr__(self, name):
        return getattr(self._cursor, name)


class _ConnectionWrapper:
    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=()):
        return self._conn.execute(_prepare_sql(sql), params)

    def cursor(self):
        return _CursorWrapper(self._conn.cursor())

    def commit(self):
        return self._conn.commit()

    def close(self):
        return self._conn.close()

    def __getattr__(self, name):
        return getattr(self._conn, name)


def _get_table_columns(conn, table_name: str):
    if IS_POSTGRES:
        rows = conn.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = %s "
            "ORDER BY ordinal_position",
            (table_name,),
        ).fetchall()
        return [row["column_name"] for row in rows]

    return [
        row[1] for row in conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    ]


def _table_exists(conn, table_name: str) -> bool:
    if IS_POSTGRES:
        row = conn.execute(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_schema = 'public' AND table_name = %s)",
            (table_name,),
        ).fetchone()
        if row:
            exists_val = row.get("exists") if isinstance(row, dict) else row[0]
            return bool(exists_val)
        return False

    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
        (table_name,),
    ).fetchone()
    return bool(row)


def get_connection():
    if IS_POSTGRES:
        if psycopg is None:
            raise RuntimeError(
                "psycopg é necessário para conexões PostgreSQL/Supabase. "
                "Instale psycopg[binary] e defina DATABASE_URL."
            )
        conn = psycopg.connect(
            DB_URL, autocommit=False, row_factory=dict_row, connect_timeout=10
        )
        return _ConnectionWrapper(conn)

    if sqlite3 is None:
        raise RuntimeError("sqlite3 não está disponível no ambiente.")

    db_path = Path(DB_PATH)
    if db_path.parent and not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return _ConnectionWrapper(conn)


def setup_database():
    """Cria todas as tabelas se não existirem e insere admin padrão."""
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nome        TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            senha_hash  TEXT    NOT NULL,
            perfil      TEXT    NOT NULL CHECK(perfil IN ('admin','executivo','cliente')),
            ativo       INTEGER NOT NULL DEFAULT 1,
            criado_em   TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            nome          TEXT    NOT NULL,
            tipo          TEXT    NOT NULL CHECK(tipo IN ('convenio_ans','cartao_saude','outro')),
            contato_nome  TEXT,
            contato_email TEXT,
            contato_tel   TEXT,
            ativo         INTEGER NOT NULL DEFAULT 1,
            criado_em     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS usuario_cliente (
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
            cliente_id INTEGER NOT NULL REFERENCES clientes(id),
            PRIMARY KEY (usuario_id, cliente_id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS projetos (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
            nome           TEXT    NOT NULL,
            descricao      TEXT,
            municipios     TEXT,
            benchmark      TEXT,
            data_inicio    TEXT,
            data_prevista  TEXT,
            status         TEXT    NOT NULL DEFAULT 'ativo'
                           CHECK(status IN ('ativo','pausado','encerrado')),
            criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS executivo_projeto (
            executivo_id INTEGER NOT NULL REFERENCES usuarios(id),
            projeto_id   INTEGER NOT NULL REFERENCES projetos(id),
            PRIMARY KEY (executivo_id, projeto_id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS metas (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id       INTEGER NOT NULL REFERENCES projetos(id),
            municipio        TEXT    NOT NULL,
            especialidade    TEXT    NOT NULL,
            quantidade_meta  INTEGER NOT NULL DEFAULT 1,
            executivo_id     INTEGER REFERENCES usuarios(id),
            criado_em        TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS benchmark_especialidades (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id     INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
            cidade         TEXT    NOT NULL,
            especialidade  TEXT    NOT NULL,
            quantidade     INTEGER NOT NULL DEFAULT 1,
            UNIQUE(projeto_id, cidade, especialidade)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS benchmark_prestadores (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id     INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
            razao_social   TEXT    NOT NULL,
            nome_fantasia  TEXT,
            cnpj           TEXT,
            tipo           TEXT,
            cidade         TEXT    NOT NULL,
            uf             TEXT,
            telefone       TEXT,
            especialidade  TEXT,
            endereco       TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS prestadores (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            razao_social   TEXT    NOT NULL,
            nome_fantasia  TEXT,
            cnpj           TEXT,
            tipo           TEXT    NOT NULL
                           CHECK(tipo IN (
                               'consultorio','clinica_medica',
                               'clinica_nao_medica','laboratorio',
                               'servico_imagem','policlinica','outro'
                           )),
            especialidade  TEXT,
            cidade         TEXT    NOT NULL,
            uf             TEXT    NOT NULL,
            telefone       TEXT,
            email          TEXT,
            observacoes    TEXT,
            criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS prestador_especialidades (
            id                       INTEGER PRIMARY KEY AUTOINCREMENT,
            prestador_id             INTEGER NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
            especialidade            TEXT    NOT NULL,
            quantidade_profissionais INTEGER NOT NULL DEFAULT 1,
            UNIQUE(prestador_id, especialidade)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS prospeccoes (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            prestador_id      INTEGER NOT NULL REFERENCES prestadores(id),
            projeto_id        INTEGER NOT NULL REFERENCES projetos(id),
            executivo_id      INTEGER NOT NULL REFERENCES usuarios(id),
            etapa             TEXT    NOT NULL DEFAULT 'identificado'
                              CHECK(etapa IN (
                                  'identificado','contato_tentado','contato_estabelecido',
                                  'proposta_enviada','em_negociacao','credenciado','declinado'
                              )),
            status_final      TEXT    CHECK(status_final IN ('em_andamento','credenciado','declinado')),
            data_inicio       TEXT    NOT NULL DEFAULT (date('now','localtime')),
            data_contratacao  TEXT,
            dias_ciclo        INTEGER,
            criado_em         TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            atualizado_em     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS interacoes (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            prospeccao_id  INTEGER NOT NULL REFERENCES prospeccoes(id),
            executivo_id   INTEGER NOT NULL REFERENCES usuarios(id),
            data_hora      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            canal          TEXT    NOT NULL
                           CHECK(canal IN ('telefone','whatsapp','email','presencial','outro')),
            tipo           TEXT    NOT NULL
                           CHECK(tipo IN (
                               'tentativa_contato','contato_estabelecido','envio_proposta',
                               'negociacao','follow_up','contrato_enviado','contrato_assinado','outro'
                           )),
            descricao      TEXT,
            proxima_acao   TEXT,
            data_followup  TEXT,
            criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS exportacoes (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id   INTEGER NOT NULL REFERENCES projetos(id),
            executivo_id INTEGER NOT NULL REFERENCES usuarios(id),
            data         TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            formato      TEXT    NOT NULL CHECK(formato IN ('csv','xlsx')),
            arquivo      TEXT,
            registros    INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS caixas_equipe (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            nome           TEXT    NOT NULL,
            email          TEXT    NOT NULL UNIQUE,
            senha_imap_enc TEXT,
            email_sync_em  TEXT,
            ativo          INTEGER NOT NULL DEFAULT 1,
            criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS emails (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            prospeccao_id   INTEGER REFERENCES prospeccoes(id),
            executivo_id    INTEGER REFERENCES usuarios(id),
            imap_uid        TEXT,
            direcao         TEXT NOT NULL CHECK(direcao IN ('recebido','enviado')),
            assunto         TEXT,
            corpo_html      TEXT,
            de              TEXT,
            para            TEXT,
            data_hora       TEXT,
            sincronizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            UNIQUE(executivo_id, imap_uid)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS email_anexos (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id INTEGER NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
            nome     TEXT    NOT NULL,
            tipo     TEXT    NOT NULL
                     CHECK(tipo IN ('imagem','xlsx','ppt','pdf','link_drive','outro')),
            conteudo BLOB,
            drive_url TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS email_visto (
            email_id   INTEGER NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
            visto_em   TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            PRIMARY KEY (email_id, usuario_id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS emails_ignorados (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            imap_uid   TEXT    NOT NULL UNIQUE,
            motivo     TEXT    NOT NULL DEFAULT 'spam',
            usuario_id INTEGER REFERENCES usuarios(id),
            criado_em  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS prospeccao_contatos (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            prospeccao_id  INTEGER NOT NULL REFERENCES prospeccoes(id) ON DELETE CASCADE,
            email          TEXT    NOT NULL,
            nome           TEXT,
            cargo          TEXT,
            criado_em      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
            UNIQUE(prospeccao_id, email)
        )
    """)
    c.execute("""
        CREATE INDEX IF NOT EXISTS idx_prosp_contatos_email
        ON prospeccao_contatos(email)
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            wpp_msg_id      TEXT    UNIQUE,
            numero          TEXT    NOT NULL,
            nome_contato    TEXT,
            direcao         TEXT    NOT NULL CHECK(direcao IN ('enviado','recebido')),
            texto           TEXT,
            tipo_midia      TEXT    NOT NULL DEFAULT 'text',
            prestador_id    INTEGER REFERENCES prestadores(id),
            prospeccao_id   INTEGER REFERENCES prospeccoes(id),
            executivo_id    INTEGER REFERENCES usuarios(id),
            lido            INTEGER NOT NULL DEFAULT 0,
            data_hora       TEXT    NOT NULL,
            sincronizado_em TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_wpp_numero ON whatsapp_mensagens(numero)")
    c.execute(
        "CREATE INDEX IF NOT EXISTS idx_wpp_prospeccao ON whatsapp_mensagens(prospeccao_id)"
    )

    conn.commit()
    conn.close()
    _criar_admin_padrao()
    _migrar_especialidade_legado()
    _migrar_metas_unique()
    _migrar_prioridade()
    _migrar_whatsapp()
    _migrar_email_creds()
    _migrar_email_equipe()
    _migrar_interacao_direcao()
    _migrar_whatsapp_mensagens()
    _normalizar_municipios_existentes()
    _corrigir_municipio_araxa()


def _migrar_email_creds():
    conn = get_connection()
    c = conn.cursor()
    cols = _get_table_columns(conn, "usuarios")
    if "email_imap" not in cols:
        c.execute("ALTER TABLE usuarios ADD COLUMN email_imap TEXT")
    if "senha_imap_enc" not in cols:
        c.execute("ALTER TABLE usuarios ADD COLUMN senha_imap_enc TEXT")
    if "email_sync_em" not in cols:
        c.execute("ALTER TABLE usuarios ADD COLUMN email_sync_em TEXT")
    c.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_imap
        ON usuarios(email_imap) WHERE email_imap IS NOT NULL
    """)
    conn.commit()
    conn.close()


def _migrar_email_equipe():
    conn = get_connection()
    c = conn.cursor()
    cols = _get_table_columns(conn, "emails")
    if "caixa_tipo" not in cols:
        c.execute(
            "ALTER TABLE emails ADD COLUMN caixa_tipo TEXT NOT NULL DEFAULT 'individual'"
        )
    if "caixa_id" not in cols:
        c.execute(
            "ALTER TABLE emails ADD COLUMN caixa_id INTEGER REFERENCES caixas_equipe(id)"
        )
    if "atribuido_a" not in cols:
        c.execute(
            "ALTER TABLE emails ADD COLUMN atribuido_a INTEGER REFERENCES usuarios(id)"
        )
    conn.commit()
    conn.close()


def _migrar_interacao_direcao():
    conn = get_connection()
    c = conn.cursor()
    cols = _get_table_columns(conn, "interacoes")
    if "direcao" not in cols:
        c.execute("ALTER TABLE interacoes ADD COLUMN direcao TEXT")
        conn.commit()
    conn.close()


def _migrar_whatsapp_mensagens():
    conn = get_connection()
    c = conn.cursor()
    if not _table_exists(conn, "whatsapp_mensagens"):
        c.execute("""
            CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                wpp_msg_id      TEXT    UNIQUE,
                numero          TEXT    NOT NULL,
                nome_contato    TEXT,
                direcao         TEXT    NOT NULL CHECK(direcao IN ('enviado','recebido')),
                texto           TEXT,
                tipo_midia      TEXT    NOT NULL DEFAULT 'text',
                prestador_id    INTEGER REFERENCES prestadores(id),
                prospeccao_id   INTEGER REFERENCES prospeccoes(id),
                executivo_id    INTEGER REFERENCES usuarios(id),
                lido            INTEGER NOT NULL DEFAULT 0,
                data_hora       TEXT    NOT NULL,
                sincronizado_em TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
            )
        """)
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_wpp_numero ON whatsapp_mensagens(numero)"
        )
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_wpp_prospeccao ON whatsapp_mensagens(prospeccao_id)"
        )
        conn.commit()
    conn.close()


def _migrar_whatsapp():
    conn = get_connection()
    c = conn.cursor()
    cols_u = _get_table_columns(conn, "usuarios")
    if "whatsapp_instancia" not in cols_u:
        c.execute("ALTER TABLE usuarios ADD COLUMN whatsapp_instancia TEXT")
    cols_i = _get_table_columns(conn, "interacoes")
    if "data_interacao" not in cols_i:
        c.execute("ALTER TABLE interacoes ADD COLUMN data_interacao TEXT")
    conn.commit()
    conn.close()


def _migrar_prioridade():
    conn = get_connection()
    c = conn.cursor()
    cols = _get_table_columns(conn, "prospeccoes")
    if "prioridade" not in cols:
        c.execute(
            "ALTER TABLE prospeccoes ADD COLUMN prioridade INTEGER NOT NULL DEFAULT 0"
        )
        conn.commit()
    conn.close()


def _migrar_metas_unique():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS uq_metas_proj_mun_esp
        ON metas(projeto_id, municipio, especialidade)
    """)
    conn.commit()
    conn.close()


def _corrigir_municipio_araxa():
    conn = get_connection()
    c = conn.cursor()
    DE, PARA = "Araxá", "Araxa"
    c.execute("UPDATE prestadores SET cidade = ? WHERE cidade = ?", (PARA, DE))
    c.execute("UPDATE metas SET municipio = ? WHERE municipio = ?", (PARA, DE))
    c.execute(
        "UPDATE benchmark_especialidades SET cidade = ? WHERE cidade = ?", (PARA, DE)
    )
    try:
        c.execute(
            "UPDATE benchmark_prestadores SET cidade = ? WHERE cidade = ?", (PARA, DE)
        )
    except Exception:
        pass
    conn.commit()
    conn.close()


def _normalizar_municipios_existentes():
    conn = get_connection()
    c = conn.cursor()

    for row in c.execute(
        "SELECT id, cidade FROM prestadores WHERE cidade IS NOT NULL"
    ).fetchall():
        norm = normaliza_municipio(row["cidade"])
        if norm != row["cidade"]:
            c.execute("UPDATE prestadores SET cidade=? WHERE id=?", (norm, row["id"]))

    for row in c.execute(
        "SELECT id, municipio FROM metas WHERE municipio IS NOT NULL"
    ).fetchall():
        norm = normaliza_municipio(row["municipio"])
        if norm != row["municipio"]:
            c.execute("UPDATE metas SET municipio=? WHERE id=?", (norm, row["id"]))

    for row in c.execute(
        "SELECT id, cidade FROM benchmark_especialidades WHERE cidade IS NOT NULL"
    ).fetchall():
        norm = normaliza_municipio(row["cidade"])
        if norm != row["cidade"]:
            c.execute(
                "UPDATE benchmark_especialidades SET cidade=? WHERE id=?",
                (norm, row["id"]),
            )

    try:
        for row in c.execute(
            "SELECT id, cidade FROM benchmark_prestadores WHERE cidade IS NOT NULL"
        ).fetchall():
            norm = normaliza_municipio(row["cidade"])
            if norm != row["cidade"]:
                c.execute(
                    "UPDATE benchmark_prestadores SET cidade=? WHERE id=?",
                    (norm, row["id"]),
                )
    except Exception:
        pass

    for row in c.execute(
        "SELECT id, municipios FROM projetos WHERE municipios IS NOT NULL"
    ).fetchall():
        norm = normaliza_lista_municipios(row["municipios"])
        if norm != (row["municipios"] or ""):
            c.execute("UPDATE projetos SET municipios=? WHERE id=?", (norm, row["id"]))

    conn.commit()
    conn.close()


def _migrar_especialidade_legado():
    conn = get_connection()
    c = conn.cursor()
    legados = c.execute("""
        SELECT p.id, p.especialidade FROM prestadores p
        WHERE p.especialidade IS NOT NULL AND p.especialidade != ''
          AND NOT EXISTS (
              SELECT 1 FROM prestador_especialidades pe WHERE pe.prestador_id = p.id
          )
    """).fetchall()
    for row in legados:
        c.execute(
            """
            INSERT OR IGNORE INTO prestador_especialidades (prestador_id, especialidade, quantidade_profissionais)
            VALUES (?, ?, 1)
            """,
            (row["id"], row["especialidade"]),
        )
    if legados:
        conn.commit()
    conn.close()


def _criar_admin_padrao():
    """Cria o usuário administrador inicial.

    Em produção defina ADMIN_EMAIL e ADMIN_PASSWORD_HASH (ou ADMIN_PASSWORD)
    em st.secrets/.env para não depender das credenciais padrão de demo.
    """
    import os

    email_default = "admin@hocta.com.br"
    senha_default = "Hocta@2024"

    admin_email = email_default
    admin_senha = senha_default
    admin_nome = "Administrador"

    if st:
        try:
            admin_email = st.secrets.get("ADMIN_EMAIL", email_default)
            admin_nome = st.secrets.get("ADMIN_NAME", admin_nome)
            if "ADMIN_PASSWORD_HASH" in st.secrets:
                senha_hash = st.secrets.get("ADMIN_PASSWORD_HASH")
            else:
                admin_senha = st.secrets.get("ADMIN_PASSWORD", senha_default)
                senha_hash = bcrypt.hashpw(admin_senha.encode(), bcrypt.gensalt()).decode()
        except Exception:
            admin_email = os.environ.get("ADMIN_EMAIL", email_default)
            admin_nome = os.environ.get("ADMIN_NAME", admin_nome)
            admin_senha = os.environ.get("ADMIN_PASSWORD", senha_default)
            senha_hash = bcrypt.hashpw(admin_senha.encode(), bcrypt.gensalt()).decode()
    else:
        admin_email = os.environ.get("ADMIN_EMAIL", email_default)
        admin_nome = os.environ.get("ADMIN_NAME", admin_nome)
        admin_senha = os.environ.get("ADMIN_PASSWORD", senha_default)
        senha_hash = bcrypt.hashpw(admin_senha.encode(), bcrypt.gensalt()).decode()

    conn = get_connection()
    c = conn.cursor()
    existe = c.execute(
        "SELECT id FROM usuarios WHERE email = ?", (admin_email,)
    ).fetchone()
    if not existe:
        c.execute(
            "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
            (admin_nome, admin_email, senha_hash, "admin"),
        )
        conn.commit()
    conn.close()



def query(sql, params=()):
    """Executa SELECT e retorna lista de dicts."""
    conn = get_connection()
    rows = conn.execute(_translate_sql(sql), params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def execute(sql, params=()):
    """Executa INSERT/UPDATE/DELETE e retorna lastrowid quando disponível."""
    conn = get_connection()
    c = conn.execute(sql, params)
    conn.commit()
    last_id = 0
    if IS_POSTGRES:
        try:
            row = c.fetchone()
            if row:
                if isinstance(row, dict):
                    last_id = row.get("id", 0)
                else:
                    last_id = row[0]
        except Exception:
            last_id = 0
    else:
        last_id = c.lastrowid
    conn.close()
    return last_id
