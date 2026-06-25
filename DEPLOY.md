# Deploy — Hocta Conecta

Aplicativo Streamlit para gestão de rede prestadora. Antes de publicar, siga o checklist abaixo para garantir que tudo está configurado.

---

## ✅ Checklist pré-publicação

- [ ] `requirements.txt` está atualizado e sem dependências duplicadas.
- [ ] `.streamlit/secrets.toml` foi criado a partir de `.streamlit/secrets.toml.example` e **não está no GitHub**.
- [ ] Um banco PostgreSQL está disponível (Streamlit Community Cloud perde dados SQLite em `/tmp`).
- [ ] A variável `DATABASE_URL` está configurada nos secrets.
- [ ] As credenciais de admin padrão foram alteradas ou estão sobreescrevendo via secrets (`ADMIN_EMAIL` / `ADMIN_PASSWORD` ou `ADMIN_PASSWORD_HASH`).
- [ ] O repositório não contém arquivos de banco local (`*.db`) nem arquivos sensíveis.

---

## Rodando localmente

```bash
pip install -r requirements.txt
streamlit run app.py
```

Login inicial de demo: `admin@hocta.com.br` / `Hocta@2024`

> ⚠️ Em produção, altere a senha padrão ou configure credenciais via secrets (veja abaixo).

---

## Deploy no Streamlit Community Cloud (gratuito)

### 1. Repositório no GitHub

Suba o projeto para um repositório GitHub. Certifique-se de que os arquivos abaixo **não** estão versionados:

- `*.db`
- `.streamlit/secrets.toml`
- `.env`
- `node_modules/`, `.tanstack/`, `.workspace/`, `tsconfig.tsbuildinfo`

> O `.gitignore` já está configurado para ignorar esses arquivos.

### 2. Criar os secrets

Em [https://share.streamlit.io](https://share.streamlit.io), clique em **New app** e aponte para o repositório. Depois vá em **Advanced settings → Secrets** e adicione no formato TOML:

```toml
DATABASE_URL = "postgresql://user:password@host:port/database"

# Opcional, mas recomendado para segurança
ADMIN_EMAIL = "admin@seudominio.com.br"
ADMIN_PASSWORD = "SenhaForteMudar123!"
# ou, se preferir, use o hash pré-calculado:
# ADMIN_PASSWORD_HASH = "$2b$12$..."

# Para sincronização de e-mail (opcional)
EMAIL_FERNET_KEY = "sua-chave-fernet-aqui"

# Para webhook do WhatsApp (opcional)
WEBHOOK_SECRET = "sua-chave-webhook-aqui"
WPP_URL = ""
WPP_TOKEN = ""
WPP_SESSION = "hocta"
EXEC_DEFAULT_ID = "1"
```

### 3. Banco de dados

Para produção, use **PostgreSQL**. O app detecta automaticamente a variável `DATABASE_URL` e usa PostgreSQL; caso contrário, cai para SQLite.

Recomendado: [Supabase](https://supabase.com) ou qualquer serviço PostgreSQL. Crie o projeto e copie a connection string.

> SQLite em `/tmp` no Streamlit Cloud é perdido periodicamente quando o container reinicia. Use apenas para testes rápidos.

### 4. Deploy

Clique em **Deploy**. O banco será criado automaticamente na primeira execução e o admin padrão será inserido.

---

## Variáveis de ambiente / secrets suportadas

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `DATABASE_URL` | Não | — | Connection string PostgreSQL. Se omitida, usa SQLite. |
| `DB_PATH` | Não | `hocta_conecta.db` | Caminho do SQLite (apenas dev). |
| `ADMIN_EMAIL` | Não | `admin@hocta.com.br` | E-mail do admin criado automaticamente. |
| `ADMIN_PASSWORD` | Não | `Hocta@2024` | Senha em texto plano para criar o admin. |
| `ADMIN_PASSWORD_HASH` | Não | — | Hash bcrypt pré-calculado (mais seguro). |
| `ADMIN_NAME` | Não | `Administrador` | Nome do admin criado automaticamente. |
| `EMAIL_FERNET_KEY` | Não | — | Chave Fernet para criptografar senhas IMAP. |
| `WEBHOOK_SECRET` | Não | — | Chave para validar webhooks do WhatsApp. |
| `WPP_URL` | Não | — | URL do WPPConnect Server. |
| `WPP_TOKEN` | Não | — | Token do WPPConnect Server. |
| `WPP_SESSION` | Não | `hocta` | Nome da sessão do WPPConnect. |
| `EXEC_DEFAULT_ID` | Não | `1` | Executivo padrão para mensagens não identificadas. |

---

## Segurança

- **Nunca** comite `.streamlit/secrets.toml` no GitHub.
- **Sempre** altere a senha padrão do admin antes de disponibilizar o app para usuários reais.
- Para maior segurança, gere o hash bcrypt da senha e use `ADMIN_PASSWORD_HASH` em vez de `ADMIN_PASSWORD`.

---

## Migração de SQLite para PostgreSQL

Se você já tem dados em SQLite local e quer migrar para PostgreSQL, use uma ferramenta como `pgloader` ou exporte/importe os dados manualmente. O schema é criado automaticamente pelo app na primeira execução contra o PostgreSQL.

---

## Dúvidas?

- Streamlit Cloud docs: https://docs.streamlit.io/deploy/streamlit-community-cloud
- Supabase: https://supabase.com
