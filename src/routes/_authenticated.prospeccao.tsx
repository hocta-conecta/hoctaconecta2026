import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Search, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PROSPECCAO_ETAPAS, labelOf } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/prospeccao")({
  component: ProspeccaoPage,
});

type Prospeccao = {
  id: number;
  prestador_id: number;
  projeto_id: number | null;
  executivo_id: string | null;
  etapa: string;
  status_final: string | null;
  prioridade: number;
  data_inicio: string | null;
  observacoes: string | null;
  prestadores: { razao_social: string } | null;
  projetos: { nome: string } | null;
};

type FormValues = {
  prestador_id: string;
  projeto_id: string;
  etapa: string;
  prioridade: string;
  data_inicio: string;
  observacoes: string;
};

const etapaVariant = (etapa: string) => {
  if (etapa === "credenciado") return "success" as const;
  if (etapa === "declinado") return "destructive" as const;
  if (etapa === "em_negociacao" || etapa === "proposta_enviada")
    return "warning" as const;
  return "default" as const;
};

async function fetchProspeccoes(): Promise<Prospeccao[]> {
  const { data, error } = await supabase
    .from("prospeccoes")
    .select("*, prestadores(razao_social), projetos(nome)")
    .order("prioridade", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prospeccao[];
}

function ProspeccaoPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data = [], isLoading } = useQuery({
    queryKey: ["prospeccoes"],
    queryFn: fetchProspeccoes,
  });
  const { data: prestadores = [] } = useQuery({
    queryKey: ["prestadores-opts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prestadores")
        .select("id, razao_social")
        .order("razao_social");
      return (data ?? []) as { id: number; razao_social: string }[];
    },
  });
  const { data: projetos = [] } = useQuery({
    queryKey: ["projetos-opts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projetos")
        .select("id, nome")
        .order("nome");
      return (data ?? []) as { id: number; nome: string }[];
    },
  });

  const [q, setQ] = React.useState("");
  const [etapaFilter, setEtapaFilter] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prospeccao | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      prestador_id: "",
      projeto_id: "",
      etapa: "identificado",
      prioridade: "0",
      data_inicio: "",
      observacoes: "",
    },
  });

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((p) => {
      if (etapaFilter !== "all" && p.etapa !== etapaFilter) return false;
      if (!term) return true;
      return [p.prestadores?.razao_social, p.projetos?.nome, p.observacoes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, q, etapaFilter]);

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        prestador_id: Number(values.prestador_id),
        projeto_id: values.projeto_id ? Number(values.projeto_id) : null,
        etapa: values.etapa,
        prioridade: Number(values.prioridade) || 0,
        data_inicio: values.data_inicio || null,
        observacoes: values.observacoes || null,
        atualizado_em: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase
          .from("prospeccoes")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("prospeccoes")
          .insert({ ...payload, executivo_id: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success(editing ? "Prospecção atualizada" : "Prospecção criada");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("prospeccoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success("Prospecção removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      prestador_id: "",
      projeto_id: "",
      etapa: "identificado",
      prioridade: "0",
      data_inicio: "",
      observacoes: "",
    });
    setOpen(true);
  };
  const openEdit = (p: Prospeccao) => {
    setEditing(p);
    form.reset({
      prestador_id: String(p.prestador_id),
      projeto_id: p.projeto_id ? String(p.projeto_id) : "",
      etapa: p.etapa,
      prioridade: String(p.prioridade ?? 0),
      data_inicio: p.data_inicio ?? "",
      observacoes: p.observacoes ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospecção</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de prospecções de prestadores.
          </p>
        </div>
        <Button variant="gradient" onClick={openNew} disabled={prestadores.length === 0}>
          <Plus /> Nova prospecção
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por prestador, projeto..."
                className="pl-9"
              />
            </div>
            <Select value={etapaFilter} onValueChange={setEtapaFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {PROSPECCAO_ETAPAS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {prestadores.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre prestadores antes de criar prospecções.
            </p>
          )}
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="animate-spin h-4 w-4" /> Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="mx-auto h-10 w-10 opacity-30 mb-2" />
              Nenhuma prospecção encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prestador</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.prestadores?.razao_social ?? `#${p.prestador_id}`}
                    </TableCell>
                    <TableCell>{p.projetos?.nome ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={etapaVariant(p.etapa)}>
                        {labelOf(PROSPECCAO_ETAPAS, p.etapa)}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.prioridade}</TableCell>
                    <TableCell>{p.data_inicio ?? "—"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover esta prospecção?")) remove.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar prospecção" : "Nova prospecção"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => {
              if (!v.prestador_id) {
                toast.error("Selecione um prestador");
                return;
              }
              save.mutate(v);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Prestador *</Label>
              <Select
                value={form.watch("prestador_id")}
                onValueChange={(v) => form.setValue("prestador_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {prestadores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select
                value={form.watch("projeto_id")}
                onValueChange={(v) => form.setValue("projeto_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Etapa</Label>
                <Select
                  value={form.watch("etapa")}
                  onValueChange={(v) => form.setValue("etapa", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROSPECCAO_ETAPAS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Input type="number" {...form.register("prioridade")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data de início</Label>
              <Input type="date" {...form.register("data_inicio")} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea {...form.register("observacoes")} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={save.isPending}>
                {save.isPending && <Loader2 className="animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
