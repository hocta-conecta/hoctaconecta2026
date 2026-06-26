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
    supabase.from("prospeccoes").select("etapa"),

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
      .select("etapa, prestadores(razao_social, nome_fantasia, especialidade)")
      .not("etapa", "in", '("credenciado","declinado")')
      .order("criado_em", { ascending: false })
      .limit(10),

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

  // Funil por etapa
  const etapaCounts: Record<string, number> = {};
  for (const p of prospeccoesTodas.data ?? []) {
    etapaCounts[p.etapa] = (etapaCounts[p.etapa] ?? 0) + 1;
  }
  const porEtapa = Object.entries(etapaCounts)
    .filter(([e]) => e !== "declinado")
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

  // Cobertura por especialidade
  const espMap: Record<string, number> = {};
  for (const p of especialidadesRes.data ?? []) {
    const esp = (p.prestadores as any)?.especialidade;
    if (esp) espMap[esp] = (espMap[esp] ?? 0) + 1;
  }
  const porEspecialidade = Object.entries(espMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nome, credenciados]) => ({ nome, credenciados }));

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
  const peRows = (prestadorEspRes.data ?? []) as Array<{
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
  const metaRows = (metasRes.data ?? []) as Array<{
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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Corporativo</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral e KPIs consolidados da rede prestadora
        </p>
      </header>

      {/* KPIs Globais */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <KpiCard label="Total Prestadores" value={data?.totalPrestadores ?? 0} icon={Users} tone="primary" />
        <KpiCard
          label="Especialidades cobertas"
          value={data?.totalEspecialidadesCobertas ?? 0}
          icon={Sparkles}
          tone="accent"
        />
        <KpiCard label="Prospecções Ativas" value={data?.totalProspectos ?? 0} icon={Target} tone="warning" />
        <KpiCard label="Credenciados" value={data?.credenciados ?? 0} icon={CheckCircle2} tone="success" />
        <KpiCard
          label="Taxa de Conversão"
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
            <Card>
              <CardHeader>
                <CardTitle>Credenciados por Especialidade</CardTitle>
                <CardDescription>Distribuição real da rede credenciada</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.porEspecialidade.length === 0 ? (
                  <EmptyState mensagem="Nenhum credenciado registrado ainda." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.porEspecialidade}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="credenciados" fill="#27AE60" name="Credenciados" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Cobertura por Município */}
            <Card>
              <CardHeader>
                <CardTitle>Prestadores por Município</CardTitle>
                <CardDescription>Quantidade de prestadores cadastrados por cidade</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.coberturaMunicipios.length === 0 ? (
                  <EmptyState mensagem="Nenhum prestador com cidade registrada." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data?.coberturaMunicipios.map((m) => (
                      <div key={m.municipio} className="p-4 border rounded-lg">
                        <p className="text-sm font-medium truncate">{m.municipio}</p>
                        <p className="text-2xl font-bold text-primary mt-2">{m.total}</p>
                        <p className="text-xs text-muted-foreground mt-1">prestadores</p>
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
                  <ResponsiveContainer width="100%" height={320}>
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

            <Card>
              <CardHeader>
                <CardTitle>Top prestadores multi-especialidade</CardTitle>
                <CardDescription>Concentração estratégica de cobertura</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.prestadoresMulti.length === 0 ? (
                  <EmptyState mensagem="Cadastre prestadores e vincule especialidades." />
                ) : (
                  <div className="space-y-3">
                    {data?.prestadoresMulti.map((p) => (
                      <div key={p.nome} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.nome}</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(100, (p.n / Math.max(1, data!.prestadoresMulti[0].n)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant={p.n >= 3 ? "success" : "secondary"}>
                          {p.n} esp.
                        </Badge>
                      </div>
                    ))}
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
            <Card>
              <CardHeader>
                <CardTitle>Funil de Etapas</CardTitle>
                <CardDescription>Prospecções em andamento por etapa</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.porEtapa.length === 0 ? (
                  <EmptyState mensagem="Nenhuma prospecção registrada." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.porEtapa} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="etapa" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1558a8" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Ranking Executivos */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Executivos</CardTitle>
                <CardDescription>Performance em prospecções e credenciamentos</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.rankingExecutivos.length === 0 ? (
                  <EmptyState mensagem="Nenhum executivo com prospecções vinculadas." />
                ) : (
                  <div className="space-y-4">
                    {data?.rankingExecutivos.map((exec, idx) => (
                      <div key={exec.nome} className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{exec.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {exec.interacoes} prospecções · {exec.credenciados} credenciados
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista Prestadores Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Prestadores em Prospecção</CardTitle>
              <CardDescription>Prospecções em andamento (excluídos credenciados e declinados)</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.prestadoresAtivos.length === 0 ? (
                <EmptyState mensagem="Nenhuma prospecção ativa no momento." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">Prestador</th>
                        <th className="text-left py-2 px-3 font-medium">Especialidade</th>
                        <th className="text-left py-2 px-3 font-medium">Etapa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.prestadoresAtivos.map((r, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3">{r.nome}</td>
                          <td className="py-2 px-3">{r.especialidade}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{r.etapa}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CREDENCIAMENTO */}
        <TabsContent value="credenciamento" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Evolução Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Credenciamentos</CardTitle>
                <CardDescription>Meses do ano atual</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.credenciamentosPorMes.every((m) => m.count === 0) ? (
                  <EmptyState mensagem="Nenhum credenciamento registrado este ano." />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data?.credenciamentosPorMes}>
                      <defs>
                        <linearGradient id="colorCred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" name="Credenciados" stroke="#27AE60" fillOpacity={1} fill="url(#colorCred)" />
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
          <Card>
            <CardHeader>
              <CardTitle>Prestadores Credenciados Recentes</CardTitle>
              <CardDescription>Rede credenciada ativa — últimos credenciados</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.prestadoresCredenciados.length === 0 ? (
                <EmptyState mensagem="Nenhum prestador credenciado ainda." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data?.prestadoresCredenciados.map((p, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                      <p className="font-medium text-sm">{p.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.especialidade}</p>
                      <p className="text-xs text-success mt-2">Credenciado em {p.data}</p>
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
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
  }[tone];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0", toneClass)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
