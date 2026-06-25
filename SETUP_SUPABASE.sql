-- =============================================================
-- Hocta Conecta — Setup do Supabase (Auth + RLS)
-- Rode este script INTEIRO no SQL Editor do seu projeto Supabase.
-- Depois: Authentication -> Providers -> Email = ON
--         (opcional) Authentication -> desligar "Confirm email" para testes.
-- O PRIMEIRO usuário que se cadastrar vira admin automaticamente.
-- =============================================================

-- ---------- Limpeza (começo do zero) ----------
drop table if exists public.prospeccoes cascade;
drop table if exists public.prestador_especialidades cascade;
drop table if exists public.prestadores cascade;
drop table if exists public.projetos cascade;
drop table if exists public.clientes cascade;
drop table if exists public.usuarios cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;
drop type if exists public.app_role cascade;

-- ---------- Papéis ----------
create type public.app_role as enum ('admin', 'executivo', 'cliente');

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null default '',
  email      text not null default '',
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

create table public.user_roles (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     public.app_role not null,
  unique (user_id, role)
);

-- Função segura para checar papel (evita recursão em RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Trigger: cria profile + papel ao cadastrar.
-- Primeiro usuário do sistema => admin; demais => executivo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  );

  if not exists (select 1 from public.user_roles where role = 'admin') then
    v_role := 'admin';
  else
    v_role := 'executivo';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, v_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Tabelas de domínio ----------
create table public.clientes (
  id            serial primary key,
  nome          text not null,
  tipo          text not null default 'outro' check (tipo in ('convenio_ans','cartao_saude','outro')),
  contato_nome  text,
  contato_email text,
  contato_tel   text,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);

create table public.projetos (
  id             serial primary key,
  cliente_id     integer references public.clientes(id) on delete set null,
  nome           text not null,
  descricao      text,
  municipios     text,
  benchmark      text,
  data_inicio    date,
  data_prevista  date,
  status         text not null default 'ativo' check (status in ('ativo','pausado','encerrado')),
  criado_em      timestamptz not null default now()
);

create table public.prestadores (
  id             serial primary key,
  razao_social   text not null,
  nome_fantasia  text,
  cnpj           text,
  tipo           text not null default 'outro' check (tipo in (
                   'consultorio','clinica_medica','clinica_nao_medica',
                   'laboratorio','servico_imagem','policlinica','outro')),
  especialidade  text,
  cidade         text not null default '',
  uf             text not null default '',
  telefone       text,
  email          text,
  observacoes    text,
  criado_em      timestamptz not null default now()
);

create table public.prestador_especialidades (
  id                       serial primary key,
  prestador_id             integer not null references public.prestadores(id) on delete cascade,
  especialidade            text not null,
  quantidade_profissionais integer not null default 1,
  unique (prestador_id, especialidade)
);

create table public.prospeccoes (
  id               serial primary key,
  prestador_id     integer not null references public.prestadores(id) on delete cascade,
  projeto_id       integer references public.projetos(id) on delete set null,
  executivo_id     uuid references auth.users(id) on delete set null,
  etapa            text not null default 'identificado' check (etapa in (
                     'identificado','contato_tentado','contato_estabelecido',
                     'proposta_enviada','em_negociacao','credenciado','declinado')),
  status_final     text check (status_final in ('em_andamento','credenciado','declinado')),
  prioridade       integer not null default 0,
  data_inicio      date not null default current_date,
  data_contratacao date,
  dias_ciclo       integer,
  observacoes      text,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

-- ---------- GRANTs (necessário p/ Data API) ----------
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.clientes to authenticated;
grant select, insert, update, delete on public.projetos to authenticated;
grant select, insert, update, delete on public.prestadores to authenticated;
grant select, insert, update, delete on public.prestador_especialidades to authenticated;
grant select, insert, update, delete on public.prospeccoes to authenticated;

grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

grant all on public.profiles to service_role;
grant all on public.user_roles to service_role;
grant all on public.clientes to service_role;
grant all on public.projetos to service_role;
grant all on public.prestadores to service_role;
grant all on public.prestador_especialidades to service_role;
grant all on public.prospeccoes to service_role;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.clientes enable row level security;
alter table public.projetos enable row level security;
alter table public.prestadores enable row level security;
alter table public.prestador_especialidades enable row level security;
alter table public.prospeccoes enable row level security;

-- profiles: todos autenticados leem; cada um edita o seu; admin edita todos
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- user_roles: autenticados leem; só admin altera
create policy "user_roles_select" on public.user_roles
  for select to authenticated using (true);
create policy "user_roles_admin_write" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- tabelas de domínio: CRUD liberado a qualquer autenticado (CRM interno)
create policy "clientes_all" on public.clientes
  for all to authenticated using (true) with check (true);
create policy "projetos_all" on public.projetos
  for all to authenticated using (true) with check (true);
create policy "prestadores_all" on public.prestadores
  for all to authenticated using (true) with check (true);
create policy "prestador_especialidades_all" on public.prestador_especialidades
  for all to authenticated using (true) with check (true);
create policy "prospeccoes_all" on public.prospeccoes
  for all to authenticated using (true) with check (true);

-- ---------- Índices úteis ----------
create index if not exists idx_prosp_prestador on public.prospeccoes(prestador_id);
create index if not exists idx_prosp_projeto on public.prospeccoes(projeto_id);
create index if not exists idx_prosp_etapa on public.prospeccoes(etapa);
create index if not exists idx_prestadores_cidade on public.prestadores(cidade);

-- =============================================================
-- Fim. Agora cadastre o primeiro usuário pela tela de login do app.
-- =============================================================
