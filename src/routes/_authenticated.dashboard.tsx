import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type Stats = {
  prestadores: number;
  prospects: number;
  projetos: number;
  ativosUltimoMes: number;
  porStatus: { name: string; total: number }[];
};

async function loadStats(): Promise<Stats> {
  const [prestadores, prospects, projetos] = await Promise.all([
    supabase.from("prestadores").select("*", { count: "exact", head: true }),
    supabase.from("prospeccoes").select("*", { count: "exact", head: true }),
    supabase.from("projetos").select("status", { count: "exact" }),
  ]);

  const projetosData = (projetos.data ?? []) as { status: string | null }[];
  const counts: Record<string, number> = {};
  for (const p of projetosData) {
    const key = p.status ?? "Sem status";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return {
    prestadores: prestadores.count ?? 0,
    prospects: prospects.count ?? 0,
    projetos: projetos.count ?? 0,
    ativosUltimoMes: 0,
    porStatus: Object.entries(counts).map(([name, total]) => ({ name, total })),
  };
}

function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: loadStats,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da rede prestadora.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" /> Carregando indicadores...
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            Não foi possível carregar os indicadores. Verifique se as tabelas
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5">prestadores</code>,
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5">prospects</code> e
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5">projetos</code>
            existem no Supabase.
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Prestadores"
              value={data.prestadores}
              icon={Users}
              tone="primary"
            />
            <KpiCard
              label="Prospects"
              value={data.prospects}
              icon={TrendingUp}
              tone="success"
            />
            <KpiCard
              label="Projetos"
              value={data.projetos}
              icon={Briefcase}
              tone="accent"
            />
            <KpiCard
              label="Status únicos"
              value={data.porStatus.length}
              icon={LayoutDashboard}
              tone="warning"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projetos por status</CardTitle>
              <CardDescription>
                Distribuição atual dos projetos cadastrados.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {data.porStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum projeto cadastrado ainda.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.porStatus}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "accent" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning-foreground",
  }[tone];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
