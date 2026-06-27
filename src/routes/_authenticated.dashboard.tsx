import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type DashboardStats = {
  totalPrestadores: number;
  totalProspectos: number;
  totalProjetos: number;
  taxaConversao: number;
  credenciados: number;

  porEspecialidade: { nome: string; credenciados: number }[];
  prospeccaoPorEspecialidade: { nome: string; count: number }[];
  porEtapa: { etapa: string; count: number }[];
  credenciamentosPorMes: { mes: string; count: number }[];
  inativosRecentes: { prestador: string; projeto: string; dias: number }[];
  rankingExecutivos: { nome: string; interacoes: number; credenciados: number }[];
  prestadoresAtivos: { nome: string; especialidade: string; etapa: string }[];
  prestadoresCredenciados: { nome: string; especialidade: string; data: string }[];
  coberturaMunicipios: { municipio: string; total: number }[];
  metaAnual: number;
  totalEspecialidadesCobertas: number;
  prestadoresMulti: { nome: string; n: number }[];
  realizadoVsMeta: { especialidade: string; meta: number; realizado: number }[];
};

const ETAPA_LABEL: Record<string, string> = {
  identificado: "Identificado",
  contato_tentado: "Contato Tentado",
  contato_estabelecido: "Contato Estabelecido",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociação",
  credenciado: "Credenciado",
  declinado: "Declinado",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

async function loadDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const anoAtual = now.getFullYear();
  const inicioAno = `${anoAtual}-01-01`;

  const [
    prestadoresRes,
    prospeccoesTodas,
    projetosRes,
    credenciadosRes,
    inativosRes,
    executivosRes,
    prestadoresAtivosRes,
    prestadoresCredenciadosRes,
    municipiosRes,
    especialidadesRes,
    credPorMesRes,
    prestadorEspRes,
    metasRes,
  ] = await Promise.all([
    // Total prestadores
    supabase.from("prestadores").select("*", { count: "exact", head: true }),

    // Todas prospecções para funil
    supabase.from("prospeccoes").select("etapa, criado_em, atualizado_em"),

    // Total projetos ativos
    supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "ativo"),

    // Credenciados total
    supabase
      .from("prospeccoes")
      .select("*", { count: "exact", head: true })
      .eq("etapa", "credenciado"),

    // Inativos: prospecções sem atualização há mais de 14 dias
    supabase
      .from("prospeccoes")
      .select("id, atualizado_em, etapa, prestadores(razao_social, nome_fantasia), projetos(nome)")
      .not("etapa", "in", '("credenciado","declinado")')
      .lt("atualizado_em", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("atualizado_em", { ascending: true })
      .limit(5),

    // Ranking executivos: profiles com contagem de prospecções e credenciados
    supabase
      .from("prospeccoes")
      .select("executivo_id, etapa, profiles!prospeccoes_executivo_id_fkey(nome)")
      .not("executivo_id", "is", null),

    // Prestadores em prospecção ativa (não finalizados)
    supabase
      .from("prospeccoes")
      .select("etapa, criado_em, prestadores(razao_social, nome_fantasia, especialidade)")
      .not("etapa", "in", '("credenciado","declinado")')
      .order("criado_em", { ascending: false }),

    // Prestadores credenciados recentes
    supabase
      .from("prospeccoes")
      .select("data_contratacao, criado_em, prestadores(razao_social, nome_fantasia, especialidade)")
      .eq("etapa", "credenciado")
      .order("data_contratacao", { ascending: false, nullsFirst: false })
      .limit(6),

    // Cobertura por município
    supabase
      .from("prestadores")
      .select("cidade"),

    // Especialidades dos credenciados
    supabase
      .from("prospeccoes")
      .select("prestadores(especialidade)")
      .eq("etapa", "credenciado"),

    // Credenciamentos por mês no ano atual
    supabase
      .from("prospeccoes")
      .select("data_contratacao, criado_em")
      .eq("etapa", "credenciado")
      .gte("criado_em", inicioAno),

    // Vínculos prestador-especialidade (para métricas N:N)
    supabase
      .from("prestador_especialidades")
      .select("prestador_id, especialidade_id, especialidade, prestadores(razao_social, nome_fantasia)"),

    // Metas (todos projetos)
    supabase
      .from("metas_projeto")
      .select("especialidade_id, quantidade_meta, especialidades(nome)"),
  ]);

  const totalCred = credenciadosRes.count ?? 0;
  const totalProsp = prospeccoesTodas.data?.length ?? 1;
  const taxa = totalProsp > 0 ? Math.round((totalCred / totalProsp) * 100) : 0;

  // Funil por etapa - Garantir que todas as etapas apareçam mesmo com 0
  const etapaCounts: Record<string, number> = {};
  // Inicializa todas as etapas com 0
  Object.keys(ETAPA_LABEL).forEach(key => {
    if (key !== "declinado") etapaCounts[key] = 0;
  });

  for (const p of prospeccoesTodas.data ?? []) {
    if (p.etapa !== "declinado") {
      etapaCounts[p.etapa] = (etapaCounts[p.etapa] ?? 0) + 1;
    }
  }
  const porEtapa = Object.entries(etapaCounts)
    .map(([etapa, count]) => ({ etapa: ETAPA_LABEL[etapa] ?? etapa, count }));

  // Inativos
  const inativosRecentes = (inativosRes.data ?? []).map((p: any) => {
    const dias = Math.floor(
      (Date.now() - new Date(p.atualizado_em).getTime()) / (1000 * 60 * 60 * 24)
    );
    const prestNome =
      p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "Prestador";
    const projNome = p.projetos?.nome || "Projeto";
    return { prestador: prestNome, projeto: projNome, dias };
  });

  // Ranking executivos
  const execMap: Record<string, { nome: string; interacoes: number; credenciados: number }> = {};
  for (const p of executivosRes.data ?? []) {
    const id = p.executivo_id as string;
    const nome = (p.profiles as any)?.nome || "Executivo";
    if (!execMap[id]) execMap[id] = { nome, interacoes: 0, credenciados: 0 };
    execMap[id].interacoes += 1;
    if (p.etapa === "credenciado") execMap[id].credenciados += 1;
  }
  const rankingExecutivos = Object.values(execMap)
    .sort((a, b) => b.credenciados - a.credenciados || b.interacoes - a.interacoes)
    .slice(0, 5);

  // Prestadores ativos
  const prestadoresAtivos = (prestadoresAtivosRes.data ?? []).map((p: any) => ({
    nome: p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "—",
    especialidade: p.prestadores?.especialidade || "—",
    etapa: ETAPA_LABEL[p.etapa] ?? p.etapa,
  }));

  // Prestadores credenciados
  const prestadoresCredenciados = (prestadoresCredenciadosRes.data ?? []).map((p: any) => {
    const dataBase = p.data_contratacao || p.criado_em;
    const d = new Date(dataBase);
    const mesAno = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    return {
      nome: p.prestadores?.nome_fantasia || p.prestadores?.razao_social || "—",
      especialidade: p.prestadores?.especialidade || "—",
      data: mesAno,
    };
  });

  // Cobertura por município (top 6)
  const munMap: Record<string, number> = {};
  for (const p of municipiosRes.data ?? []) {
    if (p.cidade) munMap[p.cidade] = (munMap[p.cidade] ?? 0) + 1;
  }
  const coberturaMunicipios = Object.entries(munMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([municipio, total]) => ({ municipio, total }));

  // Cobertura por especialidade (Credenciados)
  const espMap: Record<string, number> = {};
  for (const p of especialidadesRes.data ?? []) {
    const esp = (p.prestadores as any)?.especialidade;
    if (esp) espMap[esp] = (espMap[esp] ?? 0) + 1;
  }
  const porEspecialidade = Object.entries(espMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nome, credenciados]) => ({ nome, credenciados }));

  // Distribuição de Prospecção por Especialidade
  const prospEspMap: Record<string, number> = {};
  for (const p of prestadoresAtivosRes.data ?? []) {
    const esp = (p.prestadores as any)?.especialidade || "Não informada";
    prospEspMap[esp] = (prospEspMap[esp] ?? 0) + 1;
  }
  const prospeccaoPorEspecialidade = Object.entries(prospEspMap)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, count]) => ({ nome, count }));

  // Credenciamentos por mês
  const mesMap: Record<number, number> = {};
  for (const p of credPorMesRes.data ?? []) {
    const d = new Date(p.data_contratacao || p.criado_em);
    const m = d.getMonth();
    mesMap[m] = (mesMap[m] ?? 0) + 1;
  }
  const credenciamentosPorMes = MESES.map((mes, i) => ({
    mes,
    count: mesMap[i] ?? 0,
  })).filter((_, i) => i <= now.getMonth());

  // ===== Métricas baseadas em N:N prestador_especialidades =====
  const peRows = (prestadorEspRes.data ?? []) as unknown as Array<{
    prestador_id: number;
    especialidade_id: number | null;
    especialidade: string;
    prestadores: { razao_social: string; nome_fantasia: string | null } | null;
  }>;

  const espSet = new Set<string>();
  const perPrestador: Record<number, { nome: string; n: number }> = {};
  const realizadoPorEsp: Record<string, number> = {};
  for (const r of peRows) {
    espSet.add(r.especialidade);
    const nome = r.prestadores?.nome_fantasia || r.prestadores?.razao_social || `#${r.prestador_id}`;
    if (!perPrestador[r.prestador_id]) perPrestador[r.prestador_id] = { nome, n: 0 };
    perPrestador[r.prestador_id].n += 1;
    realizadoPorEsp[r.especialidade] = (realizadoPorEsp[r.especialidade] ?? 0) + 1;
  }

  const prestadoresMulti = Object.values(perPrestador)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  // ===== Realizado vs Meta =====
  const metaRows = (metasRes.data ?? []) as unknown as Array<{
    especialidade_id: number | null;
    quantidade_meta: number;
    especialidades: { nome: string } | null;
  }>;
  const metaPorEsp: Record<string, number> = {};
  for (const m of metaRows) {
    const nome = m.especialidades?.nome ?? "Meta geral";
    metaPorEsp[nome] = (metaPorEsp[nome] ?? 0) + (m.quantidade_meta ?? 0);
  }
  const realizadoVsMeta = Object.keys({ ...metaPorEsp, ...realizadoPorEsp })
    .map((especialidade) => ({
      especialidade,
      meta: metaPorEsp[especialidade] ?? 0,
      realizado: realizadoPorEsp[especialidade] ?? 0,
    }))
    .sort((a, b) => b.meta - a.meta)
    .slice(0, 10);

  return {
    totalPrestadores: prestadoresRes.count ?? 0,
    totalProspectos: totalProsp,
    totalProjetos: projetosRes.count ?? 0,
    taxaConversao: taxa,
    credenciados: totalCred,
    porEspecialidade,
    prospeccaoPorEspecialidade,
    porEtapa,
    credenciamentosPorMes,
    inativosRecentes,
    rankingExecutivos,
    prestadoresAtivos,
    prestadoresCredenciados,
    coberturaMunicipios,
    metaAnual: 0, // sem meta definida no banco ainda
    totalEspecialidadesCobertas: espSet.size,
    prestadoresMulti,
    realizadoVsMeta,
  };
}

const COLORS = ["#1558a8", "#2A95B6", "#36BFE2", "#27AE60", "#f29900", "#d93025"];

function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: loadDashboardStats,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar dashboard. Tente recarregar a página.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dashboard Corporativo
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Visão estratégica e indicadores de performance da rede
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Dados em tempo real
          </Badge>
        </div>
      </header>

      {/* KPIs Globais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Prestadores" value={data?.totalPrestadores ?? 0} icon={Users} tone="primary" />
        <KpiCard
          label="Especialidades"
          value={data?.totalEspecialidadesCobertas ?? 0}
          icon={Sparkles}
          tone="accent"
        />
        <KpiCard label="Prospecções" value={data?.totalProspectos ?? 0} icon={Target} tone="warning" />
        <KpiCard label="Credenciados" value={data?.credenciados ?? 0} icon={CheckCircle2} tone="success" />
        <KpiCard
          label="Conversão"
          value={`${data?.taxaConversao ?? 0}%`}
          icon={TrendingUp}
          tone="accent"
          subtitle="Prospecção → Credenciado"
        />
        <KpiCard label="Projetos Ativos" value={data?.totalProjetos ?? 0} icon={Briefcase} tone="primary" />
      </div>

      {/* Alertas de Inatividade */}
      {data && data.inativosRecentes.length > 0 && (
        <Alert variant="destructive" className="border-orange-500/50 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>{data.inativosRecentes.length} prospecções sem atividade</strong> há mais de 14 dias:{" "}
            {data.inativosRecentes.map((i) => `${i.prestador} (${i.dias}d)`).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Principais */}
      <Tabs defaultValue="planejamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="planejamento">📋 Planejamento</TabsTrigger>
          <TabsTrigger value="metas">🎯 Metas</TabsTrigger>
          <TabsTrigger value="prospeccao">🎯 Prospecção Ativa</TabsTrigger>
          <TabsTrigger value="credenciamento">✅ Credenciamento</TabsTrigger>
        </TabsList>

        {/* ABA 1: PLANEJAMENTO */}
        <TabsContent value="planejamento" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Cobertura por Especialidade */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pb-4">
                <CardTitle className="text-lg">Credenciados por Especialidade</CardTitle>
                <CardDescription>Distribuição real da rede credenciada</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.porEspecialidade.length === 0 ? (
                  <EmptyState mensagem="Nenhum credenciado registrado ainda." />
                ) : (
                  <ResponsiveContainer width="100%" height={240} className="sm:!h-[320px]">
                    <BarChart data={data?.porEspecialidade} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#27AE60" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#1e8449" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#e0e0e0" />
                      <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}
                        cursor={{ fill: "rgba(39, 174, 96, 0.1)" }}
                      />
                      <Bar dataKey="credenciados" fill="url(#colorBar)" name="Credenciados" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Cobertura por Município */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Prestadores por Município</CardTitle>
                <CardDescription>Principais cidades da rede</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.coberturaMunicipios.length === 0 ? (
                  <EmptyState mensagem="Nenhum prestador com cidade registrada." />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data?.coberturaMunicipios.map((m) => (
                      <div key={m.municipio} className="group p-4 border rounded-xl bg-white hover:border-primary/50 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]" title={m.municipio}>
                            {m.municipio}
                          </p>
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                            {m.total}
                          </Badge>
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${(m.total / data!.coberturaMunicipios[0].total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA METAS */}
        <TabsContent value="metas" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Realizado vs Meta — por Especialidade</CardTitle>
                <CardDescription>Soma das metas cadastradas em todos os projetos</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.realizadoVsMeta.length === 0 ? (
                  <EmptyState mensagem="Nenhuma meta cadastrada ainda. Abra um projeto e use a aba Metas." />
                ) : (
                  <ResponsiveContainer width="100%" height={240} className="sm:!h-[320px]">
                    <BarChart data={data?.realizadoVsMeta}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="especialidade" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="meta" fill="#1558a8" name="Meta" />
                      <Bar dataKey="realizado" fill="#27AE60" name="Realizado" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 pb-4">
                <CardTitle className="text-lg">Top Prestadores Multi-Especialidade</CardTitle>
                <CardDescription>Concentração estratégica de cobertura</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.prestadoresMulti.length === 0 ? (
                  <EmptyState mensagem="Cadastre prestadores e vincule especialidades." />
                ) : (
                  <div className="space-y-4">
                    {data?.prestadoresMulti.map((p, idx) => {
                      const percentage = Math.min(100, (p.n / Math.max(1, data!.prestadoresMulti[0].n)) * 100);
                      return (
                        <div key={p.nome} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors" title={p.nome}>
                                {p.nome}
                              </p>
                            </div>
                            <Badge className={cn(
                              "ml-2 font-bold",
                              p.n >= 3 ? "bg-emerald-500/20 text-emerald-700 border-emerald-200" : "bg-primary/10 text-primary border-primary/20"
                            )}>
                              {p.n} esp.
                            </Badge>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: PROSPECÇÃO ATIVA */}
        <TabsContent value="prospeccao" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Funil de Prospecção */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">📊 Funil de Etapas</CardTitle>
                <CardDescription>Prospecções em andamento por etapa</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.porEtapa.length === 0 ? (
                  <EmptyState mensagem="Nenhuma prospecção registrada." />
                ) : (
                  <ResponsiveContainer width="100%" height={320} className="sm:!h-[380px]">
                    <BarChart 
                      data={data?.porEtapa} 
                      layout="vertical" 
                      margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorFunil" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1558a8" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#2A95B6" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="etapa" 
                        type="category" 
                        tick={{ fontSize: 12, fontWeight: 500, fill: "#4b5563" }}
                        width={150}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        cursor={{ fill: "rgba(21, 88, 168, 0.05)" }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#colorFunil)" 
                        radius={[0, 6, 6, 0]} 
                        barSize={32}
                        label={{ position: 'right', fill: '#1558a8', fontSize: 13, fontWeight: 'bold', offset: 10 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Ranking Executivos */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">🏆 Ranking de Executivos</CardTitle>
                <CardDescription>Performance em prospecções e credenciamentos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.rankingExecutivos.length === 0 ? (
                  <EmptyState mensagem="Nenhum executivo com prospecções vinculadas." />
                ) : (
                  <div className="space-y-3">
                    {data?.rankingExecutivos.map((exec, idx) => (
                      <div key={exec.nome} className="group p-3 rounded-lg hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm text-white transition-transform group-hover:scale-110",
                            idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                            idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500" :
                            idx === 2 ? "bg-gradient-to-br from-orange-300 to-orange-600" :
                            "bg-primary"
                          )}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{exec.nome}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                🆘 {exec.interacoes}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                ✅ {exec.credenciados}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Distribuição por Especialidade */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1 border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-blue-500/5 pb-2">
                <CardTitle className="text-lg">Foco por Especialidade</CardTitle>
                <CardDescription>Onde estão seus prospectos</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {data?.prospeccaoPorEspecialidade.length === 0 ? (
                  <EmptyState mensagem="Sem dados de especialidade." />
                ) : (
                  <div className="space-y-4">
                    {data?.prospeccaoPorEspecialidade.slice(0, 5).map((item, idx) => (
                      <div key={item.nome} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="truncate max-w-[150px]">{item.nome}</span>
                          <span className="text-primary font-bold">{item.count}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(item.count / data!.prospeccaoPorEspecialidade[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-md">
              <CardHeader>
                <CardTitle>Prestadores em Prospecção</CardTitle>
                <CardDescription>Acompanhamento de negociações em curso</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.prestadoresAtivos.length === 0 ? (
                  <EmptyState mensagem="Nenhuma prospecção ativa no momento." />
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground border-b border-muted/50">
                          <th className="text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]">Prestador</th>
                          <th className="text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]">Especialidade</th>
                          <th className="text-left py-3 px-3 font-semibold uppercase tracking-wider text-[10px]">Etapa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/30">
                        {data?.prestadoresAtivos.slice(0, 6).map((r, i) => (
                          <tr key={i} className="group hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-3 font-medium text-foreground truncate max-w-[180px]">{r.nome}</td>
                            <td className="py-4 px-3 text-muted-foreground truncate max-w-[120px]">{r.especialidade}</td>
                            <td className="py-4 px-3">
                              <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary whitespace-nowrap">
                                {r.etapa}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: CREDENCIAMENTO */}
        <TabsContent value="credenciamento" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Evolução Temporal */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">📈 Evolução de Credenciamentos</CardTitle>
                <CardDescription>Tendência ao longo do ano</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.credenciamentosPorMes.every((m) => m.count === 0) ? (
                  <EmptyState mensagem="Nenhum credenciamento registrado este ano." />
                ) : (
                  <ResponsiveContainer width="100%" height={240} className="sm:!h-[320px]">
                    <AreaChart data={data?.credenciamentosPorMes} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorCred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#27AE60" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#e0e0e0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px" }}
                        cursor={{ fill: "rgba(39, 174, 96, 0.1)" }}
                      />
                      <Area type="monotone" dataKey="count" name="Credenciados" stroke="#27AE60" strokeWidth={2} fillOpacity={1} fill="url(#colorCred)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Total credenciados vs prospecções */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Conversão</CardTitle>
                <CardDescription>Visão geral do pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Total Prospecções</span>
                      <span className="font-bold text-primary">{data?.totalProspectos ?? 0}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Credenciados</span>
                      <span className="font-bold text-success">{data?.credenciados ?? 0}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success"
                        style={{
                          width: `${data && data.totalProspectos > 0 ? Math.round((data.credenciados / data.totalProspectos) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Taxa de Conversão</span>
                      <span className="font-bold text-warning">{data?.taxaConversao ?? 0}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning" style={{ width: `${data?.taxaConversao ?? 0}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prestadores Credenciados */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Rede Credenciada Recente</CardTitle>
              <CardDescription>Novos parceiros integrados à rede</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.prestadoresCredenciados.length === 0 ? (
                <EmptyState mensagem="Nenhum prestador credenciado ainda." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {data?.prestadoresCredenciados.map((p, i) => (
                    <div key={i} className="relative p-5 border rounded-2xl bg-white hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                      </div>
                      <p className="font-bold text-base text-foreground group-hover:text-emerald-700 transition-colors truncate" title={p.nome}>
                        {p.nome}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">{p.especialidade}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[11px] font-bold text-emerald-600">Integrado em {p.data}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Clock className="h-8 w-8 mb-2 opacity-40" />
      <p className="text-sm">{mensagem}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "accent" | "warning";
  subtitle?: string;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  }[tone];

  return (
    <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            </div>
            {subtitle && <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>}
          </div>
          <div className={cn("p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
}
