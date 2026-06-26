# Plano de implementação — 6 frentes em PR único

Escopo grande. Vou entregar tudo numa sequência que minimiza retrabalho: primeiro o banco (schema novo + seed de municípios), depois as telas que consomem esse banco.

## Fase A — Schema Supabase (migration única)

**Novas tabelas**
- `municipios` — `codigo_ibge` (PK), `nome`, `uf`. Seed completo via migration usando dump compacto do IBGE (~5.570 linhas, ~200 KB SQL).
- `especialidades` — `id`, `nome` (unique), `ativo`.
- `prestador_especialidades` — N:N `prestador_id` + `especialidade_id` (PK composta).
- `projeto_municipios` — substitui o campo texto livre `projetos.municipios`. FK pra `municipios.codigo_ibge`.
- `metas_projeto` — `projeto_id`, `especialidade_id` (nullable = geral), `municipio_codigo` (nullable = projeto inteiro), `quantidade_meta`.
- `benchmarks` — `id`, `origem` (`mercado` | `projeto_anterior`), `especialidade_id`, `municipio_codigo`, `quantidade`, `referencia_texto`, `projeto_origem_id` (nullable).
- `prospeccao_interacoes` — `id`, `prospeccao_id`, `tipo` (`telefone`|`email`|`whatsapp`|`visita`|`outro`), `data`, `observacao`, `autor_id`.
- `prestador_municipios` — N:N prestador↔município (cobertura geográfica).

**Alterações**
- `prestadores.tipo` — manter, mas card destaca visualmente quando `multi-especialidade` (>1 vínculo em `prestador_especialidades`).
- `prospeccoes` — adicionar `prestador_id` (nullable) pra rastrear conversão.

**Grants + RLS** pra cada tabela nova: `authenticated` full, `service_role` all, policies via `has_role` ou `auth.uid()` conforme padrão atual. Municípios e especialidades: leitura pública pra `authenticated` (catálogo).

## Fase B — Componentes compartilhados

- `MunicipioCombobox` — Shadcn Command + Popover, busca por nome/UF, virtualização (lista grande). Suporta seleção única e múltipla.
- `EspecialidadeMultiSelect` — multi-select com chips, criar nova inline (admin).
- `ResponsiveActions` — agrupa botões em DropdownMenu quando `sm:` ↓.
- Sidebar atual já tem mobile? Verifico e adiciono Sheet (Shadcn) com hamburger se faltar.

## Fase C — Módulo Projetos

- Aba "Detalhes" (atual) — troca textarea de municípios pelo `MunicipioCombobox` múltiplo gravando em `projeto_municipios`.
- Aba "Metas" — CRUD em `metas_projeto`. Form: especialidade (opcional) × município (opcional) × quantidade. Tabela com filtros.
- Aba "Benchmark" — CRUD + import CSV (papaparse). Modal de upload com preview e mapeamento de colunas.

## Fase D — Módulo Prestadores

- Form: substituir tipo único por `EspecialidadeMultiSelect` salvando em `prestador_especialidades`; manter `tipo` como classificação macro.
- Form: cobertura por municípios via `MunicipioCombobox` múltiplo.
- Lista: badge "Multi" destacado quando ≥3 especialidades; ordenação por nº de especialidades desc por padrão.

## Fase E — Prospecção (Kanban + interações + conversão)

- Refactor: reaproveitar o padrão dnd-kit que já existe em `_authenticated.projetos.tsx` aplicado a `prospeccoes` agrupadas por `etapa` (PROSPECCAO_ETAPAS).
- Card: botão "Detalhes" → Dialog com timeline de `prospeccao_interacoes` + form de nova interação.
- Botão "Converter em prestador" no card e no dialog: cria `prestadores` herdando nome/contato, copia especialidades/municípios já preenchidos, marca `prospeccoes.prestador_id` e move pra etapa `credenciado`.

## Fase F — Dashboard

- Cards de topo: total prestadores, total especialidades cobertas, % meta geral atingida, gap por município (com alert vermelho se >50%).
- Recharts:
  - BarChart "Realizado vs Meta" por especialidade.
  - BarChart horizontal "Realizado vs Meta" por município.
  - PieChart "Distribuição de prestadores por tipo".
  - BarChart "Prestadores por nº de especialidades" (mostra concentração multi-esp).
- Filtros: projeto + município + especialidade (querystring via `validateSearch`).

## Fase G — Responsividade global

- Auditoria rápida em cada tela: grid → `grid-cols-1 md:grid-cols-2 lg:grid-cols-N`, headers em `grid grid-cols-[minmax(0,1fr)_auto]`, tabelas em `overflow-x-auto`, modais com `max-h-[90vh] overflow-y-auto`.
- Botões: aplica `ResponsiveActions` nas barras de ação.

## Detalhes técnicos

- **Migration municípios**: faço download do dataset oficial IBGE em build-time (script Python no plano), gero `INSERT` em batches de 500. Tamanho final ~250KB SQL, aceitável em migration única.
- **Dependências novas**: `papaparse` (CSV), `cmdk` (já vem com Shadcn Command — verificar), `@radix-ui/react-popover`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-sheet` (não existe — uso Dialog).
- **Verificação final**: build + browser via Playwright nas 5 telas principais.

## Premissas que estou assumindo

1. Catálogo de especialidades começa vazio — admin cadastra; ofereço seed opcional de ~30 especialidades médicas comuns.
2. Conversão prospecção→prestador NÃO duplica o card (fica como "credenciado" no kanban com badge "Convertido"); o `prestador_id` faz a ligação.
3. Benchmark CSV padrão: colunas `origem,especialidade,municipio_uf,municipio_nome,quantidade,referencia`.
4. Métrica "especialistas credenciados" = soma de `(prestador × especialidade)` distinct, não nº de prestadores.

Confirma o plano e eu sigo direto pra implementação. Se algo desses 4 pontos acima estiver errado, corrige antes que eu comece.