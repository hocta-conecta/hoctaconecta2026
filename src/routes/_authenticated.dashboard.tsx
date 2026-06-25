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
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
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
  // Globais
  totalPrestadores: number;
  totalProspectos: number;
  totalProjetos: number;
  taxaConversao: number;
  credenciados: number;
  
  // Por especialidade
  porEspecialidade: { nome: string; meta: number; credenciados: number; cobertura: number }[];
  
  // Prospecção
  porEtapa: { etapa: string; count: number }[];
  
  // Credenciamento
  credenciamentosPorData: { data: string; count: number }[];
  
  // Alertas
  inativosRecentes: { prestador: string; projeto: string; dias: number }[];
  
  // Executivos
  rankingExecutivos: { nome: string; interacoes: number; credenciados: number }[];
};

async function loadDashboardStats(): Promise<DashboardStats> {
  const [prestadores, prospeccoes, projetos, credenciados] = await Promise.all([
    supabase.from("prestadores").select("*", { count: "exact", head: true }),
    supabase.from("prospeccoes").select("*", { count: "exact", head: true }),
    supabase.from("projetos").select("*", { count: "exact", head: true }),
    supabase.from("prospeccoes").select("*").eq("etapa", "credenciado"),
  ]);

  const totalCred = credenciados.data?.length ?? 0;
  const totalProsp = prospeccoes.count ?? 1;
  const taxa = Math.round((totalCred / totalProsp) * 100);

  return {
    totalPrestadores: prestadores.count ?? 0,
    totalProspectos: prospeccoes.count ?? 0,
    totalProjetos: projetos.count ?? 0,
    taxaConversao: taxa,
    credenciados: totalCred,
    
    // Mock data - será substituído por queries reais
    porEspecialidade: [
      { nome: "Enfermagem", meta: 50, credenciados: 45, cobertura: 90 },
      { nome: "Fisioterapia", meta: 30, credenciados: 25, cobertura: 83 },
      { nome: "Nutrição", meta: 20, credenciados: 18, cobertura: 90 },
      { nome: "Psicologia", meta: 25, credenciados: 20, cobertura: 80 },
    ],
    
    porEtapa: [
      { etapa: "Identificado", count: 45 },
      { etapa: "Contato", count: 32 },
      { etapa: "Proposta", count: 18 },
      { etapa: "Credenciado", count: totalCred },
    ],
    
    credenciamentosPorData: [
      { data: "Jan", count: 12 },
      { data: "Fev", count: 19 },
      { data: "Mar", count: 15 },
      { data: "Abr", count: 25 },
      { data: "Mai", count: 22 },
      { data: "Jun", count: 31 },
    ],
    
    inativosRecentes: [
      { prestador: "Clinica A", projeto: "Projeto X", dias: 21 },
      { prestador: "Hosp. B", projeto: "Projeto Y", dias: 15 },
    ],
    
    rankingExecutivos: [
      { nome: "Ana Silva", interacoes: 156, credenciados: 34 },
      { nome: "Carlos Mendes", interacoes: 142, credenciados: 31 },
      { nome: "Marina Costa", interacoes: 128, credenciados: 28 },
    ],
  };
}

const COLORS = ["#1558a8", "#2A95B6", "#36BFE2", "#27AE60", "#f29900", "#d93025"];

function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: loadDashboardStats,
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total Prestadores"
          value={data?.totalPrestadores ?? 0}
          icon={Users}
          tone="primary"
        />
        <KpiCard
          label="Prospecções Ativas"
          value={data?.totalProspectos ?? 0}
          icon={Target}
          tone="warning"
        />
        <KpiCard
          label="Credenciados"
          value={data?.credenciados ?? 0}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="Taxa de Conversão"
          value={`${data?.taxaConversao ?? 0}%`}
          icon={TrendingUp}
          tone="accent"
          subtitle="Prospecção → Credenciado"
        />
        <KpiCard
          label="Projetos Ativos"
          value={data?.totalProjetos ?? 0}
          icon={Briefcase}
          tone="primary"
        />
      </div>

      {/* Alertas de Inatividade */}
      {data && data.inativosRecentes.length > 0 && (
        <Alert variant="destructive" className="border-orange-500/50 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>{data.inativosRecentes.length} prospecções sem atividade</strong> há mais de 14 dias
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Principais */}
      <Tabs defaultValue="planejamento" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planejamento">📋 Planejamento</TabsTrigger>
          <TabsTrigger value="prospeccao">🎯 Prospecção Ativa</TabsTrigger>
          <TabsTrigger value="credenciamento">✅ Credenciamento</TabsTrigger>
        </TabsList>

        {/* ABA 1: PLANEJAMENTO */}
        <TabsContent value="planejamento" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Meta vs Benchmark */}
            <Card>
              <CardHeader>
                <CardTitle>Cobertura por Especialidade</CardTitle>
                <CardDescription>Meta vs Credenciados Atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.porEspecialidade}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="meta" fill="#2A95B6" name="Meta" />
                    <Bar dataKey="credenciados" fill="#27AE60" name="Credenciados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cobertura % */}
            <Card>
              <CardHeader>
                <CardTitle>% Cobertura por Especialidade</CardTitle>
                <CardDescription>Progresso em relação à meta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.porEspecialidade.map((esp) => (
                  <div key={esp.nome} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{esp.nome}</span>
                      <Badge variant={esp.cobertura >= 80 ? "default" : "secondary"}>
                        {esp.cobertura}%
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${esp.cobertura}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cards de Municipios */}
          <Card>
            <CardHeader>
              <CardTitle>Cobertura por Município</CardTitle>
              <CardDescription>% de meta atingido em cada região</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { municipio: "São Paulo", cobertura: 95 },
                  { municipio: "Campinas", cobertura: 87 },
                  { municipio: "Sorocaba", cobertura: 72 },
                  { municipio: "Ribeirão Preto", cobertura: 68 },
                ].map((m) => (
                  <div key={m.municipio} className="p-4 border rounded-lg">
                    <p className="text-sm font-medium">{m.municipio}</p>
                    <p className="text-2xl font-bold text-primary mt-2">{m.cobertura}%</p>
                    <p className="text-xs text-muted-foreground mt-1">meta atingida</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: PROSPECÇÃO ATIVA */}
        <TabsContent value="prospeccao" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Funil de Prospecção */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Etapas</CardTitle>
                <CardDescription>Prospecções em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.porEtapa} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="etapa" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1558a8" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ranking Executivos */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Executivos</CardTitle>
                <CardDescription>Performance em prospecções e credenciamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.rankingExecutivos.map((exec, idx) => (
                    <div key={exec.nome} className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{exec.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {exec.interacoes} interações · {exec.credenciados} credenciados
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista Prestadores Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Prestadores Ativos</CardTitle>
              <CardDescription>Prospecções em andamento por prestador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Prestador</th>
                      <th className="text-left py-2 px-3 font-medium">Especialidade</th>
                      <th className="text-left py-2 px-3 font-medium">Etapa</th>
                      <th className="text-right py-2 px-3 font-medium">% Conclusão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nome: "Clínica A", esp: "Enfermagem", etapa: "Proposta", pct: 75 },
                      { nome: "Hospital B", esp: "Cardiologia", etapa: "Contato", pct: 45 },
                      { nome: "Lab C", esp: "Análises", etapa: "Negociação", pct: 60 },
                    ].map((r) => (
                      <tr key={r.nome} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3">{r.nome}</td>
                        <td className="py-2 px-3">{r.esp}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline">{r.etapa}</Badge>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success"
                                style={{ width: `${r.pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{r.pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.credenciamentosPorData}>
                    <defs>
                      <linearGradient id="colorCred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#27AE60"
                      fillOpacity={1}
                      fill="url(#colorCred)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Conclusão</CardTitle>
                <CardDescription>Meta vs Projeção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Meta Anual</span>
                      <span className="font-bold text-primary">500</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Atual</span>
                      <span className="font-bold text-success">245</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: "49%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Projeção (EOP)</span>
                      <span className="font-bold text-warning">420</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prestadores Credenciados */}
          <Card>
            <CardHeader>
              <CardTitle>Prestadores Credenciados</CardTitle>
              <CardDescription>Rede credenciada ativa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { nome: "Clinica Premium", esp: "Enfermagem", data: "Jun 2024" },
                  { nome: "Hospital Central", esp: "Cirurgia", data: "Mai 2024" },
                  { nome: "Lab Diagnostico", esp: "Análises", data: "Abr 2024" },
                  { nome: "Fisio Vital", esp: "Fisioterapia", data: "Mar 2024" },
                  { nome: "Psico Centro", esp: "Psicologia", data: "Fev 2024" },
                  { nome: "Nutri Health", esp: "Nutrição", data: "Jan 2024" },
                ].map((p) => (
                  <div key={p.nome} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                    <p className="font-medium text-sm">{p.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.esp}</p>
                    <p className="text-xs text-success mt-2">Credenciado em {p.data}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
