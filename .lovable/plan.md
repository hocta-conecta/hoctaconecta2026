## Visão geral

Substituir todo o frontend Streamlit por uma SPA TanStack Start (React 19 + Tailwind v4 + shadcn), mantendo as 6 telas atuais. Não usar Lovable Cloud — o app vai falar direto com seu Supabase externo via cliente JS (`@supabase/supabase-js`), respeitando as policies de RLS já existentes.

A identidade visual será modernizada mantendo a paleta azul atual (#1E6B8A como primário, fundo claro, tipografia Inter), com layouts mais limpos, cards com sombras suaves, sidebar moderna e melhor hierarquia.

## Pré-requisitos que preciso de você

1. **URL do projeto Supabase** (ex: `https://xxxxx.supabase.co`)
2. **Chave `anon` / `publishable**` (a pública, não a service_role)
3. Confirmação que o schema/tabelas do banco atual continuam os mesmos (já vou ler `database.py` e mapear os modelos)
4. Como tratar o `kanban_component` (componente customizado em `pages/04_projetos.py`)? Posso recriar como uma board React com drag-and-drop (`@dnd-kit`).

## Escopo das telas a recriar


| Streamlit           | Rota React     | Conteúdo principal               |
| ------------------- | -------------- | -------------------------------- |
| `app.py` (login)    | `/login`       | Form de login Supabase Auth      |
| `01_dashboard.py`   | `/` (auth)     | KPIs, gráficos (Recharts)        |
| `02_prospeccao.py`  | `/prospeccao`  | Lista/CRUD de prospects          |
| `03_prestadores.py` | `/prestadores` | Lista/CRUD prestadores + filtros |
| `04_projetos.py`    | `/projetos`    | Kanban board drag-and-drop       |
| `05_admin.py`       | `/admin`       | Gestão usuários, roles, configs  |
| `06_meu_perfil.py`  | `/meu-perfil`  | Edição perfil do usuário         |


Layout compartilhado: sidebar shadcn colapsável + header com avatar/logout, rota `_authenticated` protegendo tudo exceto `/login`.

## Backend Python — o que acontece

Como você quer migrar **só o frontend**:

- Os arquivos Python (`pages/`, `auth.py`, `database.py`, `app.py`, `ui.py`, `kanban_component/`, `webhook_server.py`, `whatsapp_service.py`, `sync_email.py`) ficam no repositório por enquanto.
- **Toda lógica de dados será refeita em JS** chamando o Supabase direto (mesmas tabelas, mesmas RLS).
- Funções que hoje rodam server-side em Python (envio de email, WhatsApp, sync) — me diga se viram Edge Functions Supabase, ficam no Python como serviço separado, ou viram TanStack server functions. Por padrão deixo de fora desta migração e você decide depois tela-por-tela.

## Estrutura técnica

```text
src/
  routes/
    __root.tsx              shell + providers + sidebar layout
    login.tsx               público
    _authenticated.tsx      gate: verifica sessão Supabase
    _authenticated.index.tsx           Dashboard
    _authenticated.prospeccao.tsx
    _authenticated.prestadores.tsx
    _authenticated.projetos.tsx        Kanban
    _authenticated.admin.tsx
    _authenticated.meu-perfil.tsx
  integrations/supabase/
    client.ts               createClient(URL, ANON_KEY) — VITE_SUPABASE_*
    types.ts                gerado via supabase-gen-types (opcional)
  components/
    app-sidebar.tsx
    ui/...                  shadcn
  styles.css                tokens (#1E6B8A → --primary), Inter via @fontsource
```

Stack: TanStack Start v1, React 19, Tailwind v4, shadcn/ui, `@supabase/supabase-js`, TanStack Query, Recharts (gráficos), `@dnd-kit` (kanban), `react-hook-form` + `zod` (forms), Sonner (toasts).

Login usa `supabase.auth.signInWithPassword`; sessão lida com `onAuthStateChange` + `getSession`. Rota `_authenticated` redireciona para `/login` se não houver sessão.

Sobre o erro de build (`build:dev not found`): hoje o projeto não tem `package.json` nenhum — só Python. Vou criar o esqueleto TanStack Start completo na primeira passada, o que resolve o erro automaticamente (o `lovable.toml` padrão para esse stack já espera `bun run build:dev`).

## Plano de execução

1. **Scaffold**: criar `package.json`, `vite.config.ts`, `tsconfig.json`, `src/styles.css`, `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx` mínimos. Rodar `bun install`. Configurar Tailwind v4 + shadcn base.
2. **Design system**: definir tokens (primary `#1E6B8A`, surfaces, sombras), instalar `@fontsource-variable/inter`, configurar componentes shadcn base (button, card, input, dialog, sidebar, table, etc).
3. **Supabase client + auth**: `client.ts` lendo `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, hook `useAuth`, rota `_authenticated` com gate.
4. **Tela de login** (`/login`) — primeiro alvo verificável visualmente.
5. **Layout autenticado**: sidebar com as 6 entradas + header.
6. **Telas em ordem**: Dashboard → Meu Perfil → Prospecção → Prestadores → Admin → Projetos (kanban por último). Cada tela: ler o `.py` correspondente, mapear queries Supabase, recriar UI moderna, validar.
7. **Limpeza**: remover/arquivar Streamlit só quando você confirmar que tudo está funcional.

## O que NÃO está neste plano

- Edge Functions / migração das integrações Python (WhatsApp, email, webhook)
- Mudança de schema do banco
- Testes automatizados
- Deploy/CI

## Próximo passo

Me passe URL + anon key do seu Supabase (ou confirme que prefere colocá-los como `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` num `.env` que você preenche). Assim que aprovar, começo pelo passo 1 (scaffold + login).  
  
`VITE_SUPABASE_URL =`[https://ogoaswmsdvnwkvgmbcpr.supabase.co](https://ogoaswmsdvnwkvgmbcpr.supabase.co)  
`VITE_SUPABASE_PUBLISHABLE_KEY =` sb_publishable_laRVOh3D8QTTwD5C7fNoKQ_ZVbQNekw