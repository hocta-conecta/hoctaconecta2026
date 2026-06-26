import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Papa from "papaparse";
import { Plus, Loader2, Trash2, Upload, Target, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MunicipioSingleCombobox } from "@/components/municipio-combobox";
import { useEspecialidades } from "@/components/especialidade-multiselect";

type Meta = {
  id: number;
  projeto_id: number;
  especialidade_id: number | null;
  municipio_codigo: number | null;
  quantidade_meta: number;
  observacao: string | null;
};

type Benchmark = {
  id: number;
  origem: string;
  especialidade_id: number | null;
  especialidade_texto: string | null;
  municipio_codigo: number | null;
  uf: string | null;
  quantidade: number;
  referencia_texto: string | null;
};

export function ProjetoDetailsDialog({
  projetoId,
  projetoNome,
  onClose,
}: {
  projetoId: number;
  projetoNome: string;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{projetoNome}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="metas">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metas">
              <Target className="h-4 w-4 mr-1" /> Metas
            </TabsTrigger>
            <TabsTrigger value="benchmark">
              <BarChart3 className="h-4 w-4 mr-1" /> Benchmark
            </TabsTrigger>
          </TabsList>
          <TabsContent value="metas" className="pt-3">
            <MetasPanel projetoId={projetoId} />
          </TabsContent>
          <TabsContent value="benchmark" className="pt-3">
            <BenchmarkPanel />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetasPanel({ projetoId }: { projetoId: number }) {
  const qc = useQueryClient();
  const { data: especialidades = [] } = useEspecialidades();

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ["metas", projetoId],
    queryFn: async (): Promise<(Meta & { atual: number })[]> => {
      const { data: metasData, error: metasError } = await supabase
        .from("metas_projeto")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("id");
      
      if (metasError) throw metasError;

      // Busca prestadores credenciados para este projeto para calcular o real
      const { data: credenciados, error: credError } = await supabase
        .from("prospeccoes")
        .select("prestador_id, prestadores(prestador_especialidades(especialidade_id), prestador_municipios(municipio_codigo))")
        .eq("projeto_id", projetoId)
        .eq("etapa", "credenciado");

      if (credError) throw credError;

      return (metasData ?? []).map(meta => {
        const atingido = (credenciados ?? []).filter(c => {
          const p = c.prestadores as any;
          if (!p) return false;
          
          const matchEsp = !meta.especialidade_id || 
            p.prestador_especialidades?.some((e: any) => e.especialidade_id === meta.especialidade_id);
          
          const matchMun = !meta.municipio_codigo || 
            p.prestador_municipios?.some((m: any) => m.municipio_codigo === meta.municipio_codigo);
          
          return matchEsp && matchMun;
        }).length;

        return { ...meta, atual: atingido };
      }) as (Meta & { atual: number })[];
    },
  });

  const form = useForm<{
    especialidade_id: string;
    municipio_codigo: number | null;
    quantidade_meta: string;
    observacao: string;
  }>({
    defaultValues: {
      especialidade_id: "",
      municipio_codigo: null,
      quantidade_meta: "0",
      observacao: "",
    },
  });

  const add = useMutation({
    mutationFn: async (v: {
      especialidade_id: string;
      municipio_codigo: number | null;
      quantidade_meta: string;
      observacao: string;
    }) => {
      const { error } = await supabase.from("metas_projeto").insert({
        projeto_id: projetoId,
        especialidade_id: v.especialidade_id ? Number(v.especialidade_id) : null,
        municipio_codigo: v.municipio_codigo,
        quantidade_meta: Number(v.quantidade_meta) || 0,
        observacao: v.observacao || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas", projetoId] });
      form.reset({ especialidade_id: "", municipio_codigo: null, quantidade_meta: "0", observacao: "" });
      toast.success("Meta adicionada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("metas_projeto").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas", projetoId] }),
  });

  // Carrega municípios pra label
  const { data: municipios = [] } = useQuery({
    queryKey: ["municipios"],
    queryFn: async () => {
      const { data } = await supabase
        .from("municipios")
        .select("codigo_ibge, nome, uf");
      return (data ?? []) as { codigo_ibge: number; nome: string; uf: string }[];
    },
    staleTime: Infinity,
  });
  const munMap = React.useMemo(
    () => new Map(municipios.map((m) => [m.codigo_ibge, m])),
    [municipios],
  );
  const espMap = React.useMemo(
    () => new Map(especialidades.map((e) => [e.id, e])),
    [especialidades],
  );

  return (
    <div className="space-y-4">
      <form
        onSubmit={form.handleSubmit((v) => add.mutate(v))}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/30"
      >
        <div className="space-y-1.5">
          <Label className="text-xs">Especialidade (vazio = geral)</Label>
          <Select
            value={form.watch("especialidade_id") || "all"}
            onValueChange={(v) => form.setValue("especialidade_id", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas (meta geral)</SelectItem>
              {especialidades.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Município (vazio = projeto todo)</Label>
          <MunicipioSingleCombobox
            value={form.watch("municipio_codigo")}
            onChange={(c) => form.setValue("municipio_codigo", c)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Quantidade *</Label>
          <Input type="number" min={0} {...form.register("quantidade_meta", { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Observação</Label>
          <Input {...form.register("observacao")} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" size="sm" disabled={add.isPending}>
            {add.isPending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar meta
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : metas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma meta cadastrada para este projeto.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Especialidade</TableHead>
              <TableHead>Município</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Meta</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metas.map((m) => {
              const e = m.especialidade_id ? espMap.get(m.especialidade_id) : null;
              const mun = m.municipio_codigo ? munMap.get(m.municipio_codigo) : null;
              return (
                <TableRow key={m.id}>
                  <TableCell>{e?.nome ?? <Badge variant="outline">Geral</Badge>}</TableCell>
                  <TableCell>
                    {mun ? `${mun.nome}/${mun.uf}` : <Badge variant="outline">Projeto todo</Badge>}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{m.atual} de {m.quantidade_meta}</span>
                        <span>{Math.min(100, Math.round((m.atual / (m.quantidade_meta || 1)) * 100))}%</span>
                      </div>
                      <Progress value={(m.atual / (m.quantidade_meta || 1)) * 100} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{m.quantidade_meta}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function BenchmarkPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["benchmarks"],
    queryFn: async (): Promise<Benchmark[]> => {
      const { data, error } = await supabase
        .from("benchmarks")
        .select("*")
        .order("id", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Benchmark[];
    },
  });

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [importing, setImporting] = React.useState(false);

  const form = useForm<{
    origem: string;
    especialidade_texto: string;
    uf: string;
    quantidade: string;
    referencia_texto: string;
  }>({
    defaultValues: {
      origem: "mercado",
      especialidade_texto: "",
      uf: "",
      quantidade: "0",
      referencia_texto: "",
    },
  });

  const add = useMutation({
    mutationFn: async (v: {
      origem: string;
      especialidade_texto: string;
      uf: string;
      quantidade: string;
      referencia_texto: string;
    }) => {
      const { error } = await supabase.from("benchmarks").insert({
        origem: v.origem,
        especialidade_texto: v.especialidade_texto || null,
        uf: v.uf ? v.uf.toUpperCase().slice(0, 2) : null,
        quantidade: Number(v.quantidade) || 0,
        referencia_texto: v.referencia_texto || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["benchmarks"] });
      toast.success("Benchmark adicionado");
      form.reset({ origem: "mercado", especialidade_texto: "", uf: "", quantidade: "0", referencia_texto: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("benchmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benchmarks"] }),
  });

  const importCSV = async (file: File) => {
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = (res.data as Record<string, string>[])
          .map((r) => ({
            origem:
              ["mercado", "projeto_anterior"].includes((r.origem || "").trim())
                ? (r.origem || "").trim()
                : "mercado",
            especialidade_texto: (r.especialidade || "").trim() || null,
            uf: (r.uf || "").trim().toUpperCase().slice(0, 2) || null,
            quantidade: Number(r.quantidade) || 0,
            referencia_texto: (r.referencia || "").trim() || null,
          }))
          .filter((r) => r.quantidade > 0);
        if (rows.length === 0) {
          toast.error("CSV vazio ou inválido");
          setImporting(false);
          return;
        }
        const { error } = await supabase.from("benchmarks").insert(rows);
        setImporting(false);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(`${rows.length} benchmarks importados`);
        qc.invalidateQueries({ queryKey: ["benchmarks"] });
      },
      error: (err) => {
        setImporting(false);
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importCSV(f);
            e.target.value = "";
          }}
        />
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? <Loader2 className="animate-spin" /> : <Upload className="h-4 w-4" />}
          Importar CSV
        </Button>
        <span className="text-xs text-muted-foreground">
          Colunas: <code>origem,especialidade,uf,quantidade,referencia</code>
        </span>
      </div>

      <form
        onSubmit={form.handleSubmit((v) => add.mutate(v))}
        className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 rounded-lg border border-border bg-muted/30"
      >
        <Select value={form.watch("origem")} onValueChange={(v) => form.setValue("origem", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mercado">Mercado</SelectItem>
            <SelectItem value="projeto_anterior">Projeto anterior</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Especialidade" {...form.register("especialidade_texto")} />
        <Input placeholder="UF" maxLength={2} {...form.register("uf")} />
        <Input placeholder="Qtd" type="number" {...form.register("quantidade")} />
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
        <Input
          placeholder="Referência (opcional)"
          className="sm:col-span-5"
          {...form.register("referencia_texto")}
        />
      </form>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum benchmark cadastrado.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origem</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>UF</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <Badge variant={b.origem === "mercado" ? "default" : "secondary"}>
                    {b.origem === "mercado" ? "Mercado" : "Projeto anterior"}
                  </Badge>
                </TableCell>
                <TableCell>{b.especialidade_texto ?? "—"}</TableCell>
                <TableCell>{b.uf ?? "—"}</TableCell>
                <TableCell className="text-right font-semibold">{b.quantidade}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                  {b.referencia_texto ?? "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(b.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}