import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { a as useQuery } from "./_libs/tanstack__react-query.mjs";
import { j as Badge, c as cn, s as supabase } from "./_ssr/router-CzHhAn6T.mjs";
import { C as Card, a as CardHeader, c as CardTitle, d as CardDescription, b as CardContent } from "./_ssr/card-CLj25OPk.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-BVPUHq7I.mjs";
import { c as cva } from "./_libs/class-variance-authority.mjs";
import "./_libs/sonner.mjs";
import { b as LoaderCircle, s as CircleAlert, U as Users, r as Sparkles, o as Target, m as CircleCheck, t as TrendingUp, B as Briefcase, u as Clock } from "./_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, L as Legend, A as AreaChart, b as Area } from "./_libs/recharts.mjs";

import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/unenv.mjs";


import "./_libs/seroval-plugins.mjs";


import "./_libs/react-dom.mjs";
import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "./_libs/tslib.mjs";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/zod.mjs";
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/lodash.mjs";
import "./_libs/tiny-invariant.mjs";
import "./_libs/react-is.mjs";
import "./_libs/d3-shape.mjs";
import "./_libs/d3-path.mjs";
import "./_libs/react-smooth.mjs";
import "./_libs/prop-types.mjs";
import "./_libs/fast-equals.mjs";
import "./_libs/victory-vendor.mjs";
import "./_libs/d3-scale.mjs";
import "./_libs/internmap.mjs";
import "./_libs/d3-array.mjs";
import "./_libs/d3-time-format.mjs";
import "./_libs/d3-time.mjs";
import "./_libs/d3-interpolate.mjs";
import "./_libs/d3-color.mjs";
import "./_libs/d3-format.mjs";
import "./_libs/recharts-scale.mjs";
import "./_libs/decimal.js-light.mjs";
import "./_libs/eventemitter3.mjs";
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground",
        destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/80"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Alert({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant }), className),
      ...props
    }
  );
}
function AlertDescription({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: cn("col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className),
      ...props
    }
  );
}
const ETAPA_LABEL = {
  identificado: "Identificado",
  contato_tentado: "Contato Tentado",
  contato_estabelecido: "Contato Estabelecido",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociação",
  credenciado: "Credenciado",
  declinado: "Declinado"
};
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
async function loadDashboardStats() {
  const now = /* @__PURE__ */ new Date();
  const anoAtual = now.getFullYear();
  const inicioAno = `${anoAtual}-01-01`;
  const [prestadoresRes, prospeccoesTodas, projetosRes, credenciadosRes, inativosRes, executivosRes, prestadoresAtivosRes, prestadoresCredenciadosRes, municipiosRes, especialidadesRes, credPorMesRes, prestadorEspRes, metasRes] = await Promise.all([
    // Total prestadores
    supabase.from("prestadores").select("*", {
      count: "exact",
      head: true
    }),
    // Todas prospecções para funil
    supabase.from("prospeccoes").select("etapa"),
    // Total projetos ativos
    supabase.from("projetos").select("*", {
      count: "exact",
      head: true
    }).eq("status", "ativo"),
    // Credenciados total
    supabase.from("prospeccoes").select("*", {
      count: "exact",
      head: true
    }).eq("etapa", "credenciado"),
    // Inativos: prospecções sem atualização há mais de 14 dias
    supabase.from("prospeccoes").select("id, atualizado_em, etapa, prestadores(razao_social, nome_fantasia), projetos(nome)").not("etapa", "in", '("credenciado","declinado")').lt("atualizado_em", new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString()).order("atualizado_em", {
      ascending: true
    }).limit(5),
    // Ranking executivos: profiles com contagem de prospecções e credenciados
    supabase.from("prospeccoes").select("executivo_id, etapa, profiles!prospeccoes_executivo_id_fkey(nome)").not("executivo_id", "is", null),
    // Prestadores em prospecção ativa (não finalizados)
    supabase.from("prospeccoes").select("etapa, prestadores(razao_social, nome_fantasia, especialidade)").not("etapa", "in", '("credenciado","declinado")').order("criado_em", {
      ascending: false
    }).limit(10),
    // Prestadores credenciados recentes
    supabase.from("prospeccoes").select("data_contratacao, criado_em, prestadores(razao_social, nome_fantasia, especialidade)").eq("etapa", "credenciado").order("data_contratacao", {
      ascending: false,
      nullsFirst: false
    }).limit(6),
    // Cobertura por município
    supabase.from("prestadores").select("cidade"),
    // Especialidades dos credenciados
    supabase.from("prospeccoes").select("prestadores(especialidade)").eq("etapa", "credenciado"),
    // Credenciamentos por mês no ano atual
    supabase.from("prospeccoes").select("data_contratacao, criado_em").eq("etapa", "credenciado").gte("criado_em", inicioAno),
    // Vínculos prestador-especialidade (para métricas N:N)
    supabase.from("prestador_especialidades").select("prestador_id, especialidade_id, especialidade, prestadores(razao_social, nome_fantasia)"),
    // Metas (todos projetos)
    supabase.from("metas_projeto").select("especialidade_id, quantidade_meta, especialidades(nome)")
  ]);
  const totalCred = credenciadosRes.count ?? 0;
  const totalProsp = prospeccoesTodas.data?.length ?? 1;
  const taxa = totalProsp > 0 ? Math.round(totalCred / totalProsp * 100) : 0;
  const etapaCounts = {};
  for (const p of prospeccoesTodas.data ?? []) {
    etapaCounts[p.etapa] = (etapaCounts[p.etapa] ?? 0) + 1;
  }
  const porEtapa = Object.entries(etapaCounts).filter(([e]) => e !== "declinado").map(([etapa, count]) => ({
    etapa: ETAPA_LABEL[etapa] ?? etapa,
    count
  }));
  const inativosRecentes = (inativosRes.data ?? []).map((p) => {
    const dias = Math.floor((Date.now() - new Date(p.atualizado_em).getTime()) / (1e3 * 60 * 60 * 24));
    const prestNome = p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "Prestador";
    const projNome = p.projetos?.nome || "Projeto";
    return {
      prestador: prestNome,
      projeto: projNome,
      dias
    };
  });
  const execMap = {};
  for (const p of executivosRes.data ?? []) {
    const id = p.executivo_id;
    const nome = p.profiles?.nome || "Executivo";
    if (!execMap[id]) execMap[id] = {
      nome,
      interacoes: 0,
      credenciados: 0
    };
    execMap[id].interacoes += 1;
    if (p.etapa === "credenciado") execMap[id].credenciados += 1;
  }
  const rankingExecutivos = Object.values(execMap).sort((a, b) => b.credenciados - a.credenciados || b.interacoes - a.interacoes).slice(0, 5);
  const prestadoresAtivos = (prestadoresAtivosRes.data ?? []).map((p) => ({
    nome: p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "—",
    especialidade: p.prestadores?.especialidade || "—",
    etapa: ETAPA_LABEL[p.etapa] ?? p.etapa
  }));
  const prestadoresCredenciados = (prestadoresCredenciadosRes.data ?? []).map((p) => {
    const dataBase = p.data_contratacao || p.criado_em;
    const d = new Date(dataBase);
    const mesAno = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    return {
      nome: p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "—",
      especialidade: p.prestadores?.especialidade || "—",
      data: mesAno
    };
  });
  const munMap = {};
  for (const p of municipiosRes.data ?? []) {
    if (p.cidade) munMap[p.cidade] = (munMap[p.cidade] ?? 0) + 1;
  }
  const coberturaMunicipios = Object.entries(munMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([municipio, total]) => ({
    municipio,
    total
  }));
  const espMap = {};
  for (const p of especialidadesRes.data ?? []) {
    const esp = p.prestadores?.especialidade;
    if (esp) espMap[esp] = (espMap[esp] ?? 0) + 1;
  }
  const porEspecialidade = Object.entries(espMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([nome, credenciados]) => ({
    nome,
    credenciados
  }));
  const mesMap = {};
  for (const p of credPorMesRes.data ?? []) {
    const d = new Date(p.data_contratacao || p.criado_em);
    const m = d.getMonth();
    mesMap[m] = (mesMap[m] ?? 0) + 1;
  }
  const credenciamentosPorMes = MESES.map((mes, i) => ({
    mes,
    count: mesMap[i] ?? 0
  })).filter((_, i) => i <= now.getMonth());
  const peRows = prestadorEspRes.data ?? [];
  const espSet = /* @__PURE__ */ new Set();
  const perPrestador = {};
  const realizadoPorEsp = {};
  for (const r of peRows) {
    espSet.add(r.especialidade);
    const nome = r.prestadores?.nome_fantasia || r.prestadores?.razao_social || `#${r.prestador_id}`;
    if (!perPrestador[r.prestador_id]) perPrestador[r.prestador_id] = {
      nome,
      n: 0
    };
    perPrestador[r.prestador_id].n += 1;
    realizadoPorEsp[r.especialidade] = (realizadoPorEsp[r.especialidade] ?? 0) + 1;
  }
  const prestadoresMulti = Object.values(perPrestador).sort((a, b) => b.n - a.n).slice(0, 6);
  const metaRows = metasRes.data ?? [];
  const metaPorEsp = {};
  for (const m of metaRows) {
    const nome = m.especialidades?.nome ?? "Meta geral";
    metaPorEsp[nome] = (metaPorEsp[nome] ?? 0) + (m.quantidade_meta ?? 0);
  }
  const realizadoVsMeta = Object.keys({
    ...metaPorEsp,
    ...realizadoPorEsp
  }).map((especialidade) => ({
    especialidade,
    meta: metaPorEsp[especialidade] ?? 0,
    realizado: realizadoPorEsp[especialidade] ?? 0
  })).sort((a, b) => b.meta - a.meta).slice(0, 10);
  return {
    totalPrestadores: prestadoresRes.count ?? 0,
    totalProspectos: totalProsp,
    totalProjetos: projetosRes.count ?? 0,
    taxaConversao: taxa,
    credenciados: totalCred,
    porEspecialidade,
    porEtapa,
    credenciamentosPorMes,
    inativosRecentes,
    rankingExecutivos,
    prestadoresAtivos,
    prestadoresCredenciados,
    coberturaMunicipios,
    metaAnual: 0,
    // sem meta definida no banco ainda
    totalEspecialidadesCobertas: espSet.size,
    prestadoresMulti,
    realizadoVsMeta
  };
}
function DashboardPage() {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: loadDashboardStats,
    staleTime: 6e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-8 w-8 text-primary" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Erro ao carregar dashboard. Tente recarregar a página." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent", children: "Dashboard Corporativo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 font-medium", children: "Visão estratégica e indicadores de performance da rede" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-lg border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" }),
        "Dados em tempo real"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Prestadores", value: data?.totalPrestadores ?? 0, icon: Users, tone: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Especialidades", value: data?.totalEspecialidadesCobertas ?? 0, icon: Sparkles, tone: "accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Prospecções", value: data?.totalProspectos ?? 0, icon: Target, tone: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Credenciados", value: data?.credenciados ?? 0, icon: CircleCheck, tone: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Conversão", value: `${data?.taxaConversao ?? 0}%`, icon: TrendingUp, tone: "accent", subtitle: "Prospecção → Credenciado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Projetos Ativos", value: data?.totalProjetos ?? 0, icon: Briefcase, tone: "primary" })
    ] }),
    data && data.inativosRecentes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", className: "border-orange-500/50 bg-orange-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-orange-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-orange-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          data.inativosRecentes.length,
          " prospecções sem atividade"
        ] }),
        " há mais de 14 dias:",
        " ",
        data.inativosRecentes.map((i) => `${i.prestador} (${i.dias}d)`).join(", ")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "planejamento", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2 sm:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "planejamento", children: "📋 Planejamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "metas", children: "🎯 Metas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "prospeccao", children: "🎯 Prospecção Ativa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "credenciamento", children: "✅ Credenciamento" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "planejamento", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Credenciados por Especialidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Distribuição real da rede credenciada" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.porEspecialidade.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhum credenciado registrado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, className: "sm:!h-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data?.porEspecialidade, margin: {
            top: 20,
            right: 30,
            left: 0,
            bottom: 60
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "colorBar", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "5%", stopColor: "#27AE60", stopOpacity: 0.9 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "95%", stopColor: "#1e8449", stopOpacity: 0.7 })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, stroke: "#e0e0e0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "nome", tick: {
              fontSize: 10
            }, angle: -45, textAnchor: "end", height: 80 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
              fontSize: 11
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px"
            }, cursor: {
              fill: "rgba(39, 174, 96, 0.1)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "credenciados", fill: "url(#colorBar)", name: "Credenciados", radius: [8, 8, 0, 0] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-muted/30 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Prestadores por Município" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Principais cidades da rede" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.coberturaMunicipios.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhum prestador com cidade registrada." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: data?.coberturaMunicipios.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-4 border rounded-xl bg-white hover:border-primary/50 hover:shadow-md transition-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]", title: m.municipio, children: m.municipio }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "bg-primary/5 text-primary border-none", children: m.total })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all duration-1000", style: {
              width: `${m.total / data.coberturaMunicipios[0].total * 100}%`
            } }) })
          ] }, m.municipio)) }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "metas", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Realizado vs Meta — por Especialidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Soma das metas cadastradas em todos os projetos" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: data?.realizadoVsMeta.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhuma meta cadastrada ainda. Abra um projeto e use a aba Metas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, className: "sm:!h-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data?.realizadoVsMeta, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "especialidade", tick: {
              fontSize: 10
            }, angle: -15, textAnchor: "end", height: 60 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
              fontSize: 11
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "meta", fill: "#1558a8", name: "Meta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "realizado", fill: "#27AE60", name: "Realizado" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-primary/5 to-blue-500/5 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Top Prestadores Multi-Especialidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Concentração estratégica de cobertura" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.prestadoresMulti.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Cadastre prestadores e vincule especialidades." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: data?.prestadoresMulti.map((p, idx) => {
            const percentage = Math.min(100, p.n / Math.max(1, data.prestadoresMulti[0].n) * 100);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold", children: idx + 1 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors", title: p.nome, children: p.nome })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: cn("ml-2 font-bold", p.n >= 3 ? "bg-emerald-500/20 text-emerald-700 border-emerald-200" : "bg-primary/10 text-primary border-primary/20"), children: [
                  p.n,
                  " esp."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000 rounded-full", style: {
                width: `${percentage}%`
              } }) })
            ] }, p.nome);
          }) }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "prospeccao", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg flex items-center gap-2", children: "📊 Funil de Etapas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Prospecções em andamento por etapa" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.porEtapa.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhuma prospecção registrada." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, className: "sm:!h-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data?.porEtapa, layout: "vertical", margin: {
              top: 10,
              right: 30,
              left: 140,
              bottom: 10
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "colorFunil", x1: "0", y1: "0", x2: "1", y2: "0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#1558a8", stopOpacity: 0.8 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#2A95B6", stopOpacity: 0.6 })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, stroke: "#e0e0e0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: {
                fontSize: 11
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "etapa", type: "category", tick: {
                fontSize: 10
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px"
              }, cursor: {
                fill: "rgba(21, 88, 168, 0.1)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "url(#colorFunil)", radius: [0, 8, 8, 0] })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-amber-500/5 to-orange-500/5 pb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg flex items-center gap-2", children: "🏆 Ranking de Executivos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Performance em prospecções e credenciamentos" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.rankingExecutivos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhum executivo com prospecções vinculadas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data?.rankingExecutivos.map((exec, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group p-3 rounded-lg hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm text-white transition-transform group-hover:scale-110", idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500" : idx === 2 ? "bg-gradient-to-br from-orange-300 to-orange-600" : "bg-primary"), children: idx + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm text-foreground group-hover:text-primary transition-colors", children: exec.nome }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium", children: [
                    "🆘 ",
                    exec.interacoes
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium", children: [
                    "✅ ",
                    exec.credenciados
                  ] })
                ] })
              ] })
            ] }) }, exec.nome)) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Prestadores em Prospecção" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Acompanhamento de negociações em curso" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: data?.prestadoresAtivos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhuma prospecção ativa no momento." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto -mx-6 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-muted-foreground border-b border-muted/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]", children: "Prestador" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]", children: "Especialidade" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]", children: "Etapa" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-muted/30", children: data?.prestadoresAtivos.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "group hover:bg-primary/5 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-3 font-medium text-foreground min-w-[200px]", children: r.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-3 text-muted-foreground", children: r.especialidade }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-4 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-semibold border-primary/20 bg-primary/5 text-primary", children: r.etapa }) })
            ] }, i)) })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "credenciamento", className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "bg-gradient-to-r from-emerald-500/5 to-green-500/5 pb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg flex items-center gap-2", children: "📈 Evolução de Credenciamentos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Tendência ao longo do ano" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: data?.credenciamentosPorMes.every((m) => m.count === 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhum credenciamento registrado este ano." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, className: "sm:!h-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: data?.credenciamentosPorMes, margin: {
              top: 10,
              right: 30,
              left: 0,
              bottom: 10
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "colorCred", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "5%", stopColor: "#27AE60", stopOpacity: 0.9 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "95%", stopColor: "#27AE60", stopOpacity: 0 })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, stroke: "#e0e0e0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", tick: {
                fontSize: 11
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
                fontSize: 11
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px"
              }, cursor: {
                fill: "rgba(39, 174, 96, 0.1)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "count", name: "Credenciados", stroke: "#27AE60", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorCred)" })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Resumo de Conversão" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Visão geral do pipeline" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Total Prospecções" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: data?.totalProspectos ?? 0 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
                  width: "100%"
                } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Credenciados" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-success", children: data?.credenciados ?? 0 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-success", style: {
                  width: `${data && data.totalProspectos > 0 ? Math.round(data.credenciados / data.totalProspectos * 100) : 0}%`
                } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Taxa de Conversão" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-warning", children: [
                    data?.taxaConversao ?? 0,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-warning", style: {
                  width: `${data?.taxaConversao ?? 0}%`
                } }) })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Rede Credenciada Recente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Novos parceiros integrados à rede" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: data?.prestadoresCredenciados.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { mensagem: "Nenhum prestador credenciado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3", children: data?.prestadoresCredenciados.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-5 border rounded-2xl bg-white hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 group overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-emerald-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base text-foreground group-hover:text-emerald-700 transition-colors truncate", title: p.nome, children: p.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide", children: p.especialidade }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-bold text-emerald-600", children: [
                "Integrado em ",
                p.data
              ] })
            ] })
          ] }, i)) }) })
        ] })
      ] })
    ] })
  ] });
}
function EmptyState({
  mensagem
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 mb-2 opacity-40" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: mensagem })
  ] });
}
function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  subtitle
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  }[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-baseline gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold tracking-tight text-foreground", children: value }) }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-medium", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110", toneClass), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" })
  ] }) });
}
export {
  DashboardPage as component
};
