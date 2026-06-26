import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Search, Loader2, Users, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PRESTADOR_TIPOS as DOMAIN_PRESTADOR_TIPOS, labelOf } from "@/lib/domain";

const PRESTADOR_TIPOS = [
  ...DOMAIN_PRESTADOR_TIPOS.filter(t => t.value !== 'hospital'),
  { value: "hospital", label: "Hospital" }
].sort((a, b) => {
  if (a.value === 'outro') return 1;
  if (b.value === 'outro') return -1;
  return 0;
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { EspecialidadeMultiSelect, useEspecialidades } from "@/components/especialidade-multiselect";
import { MunicipioMultiCombobox } from "@/components/municipio-combobox";

export const Route = createFileRoute("/_authenticated/prestadores")({
  component: PrestadoresPage,
});

type Prestador = {
  id: number;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  tipo: string;
  especialidade: string | null;
  cidade: string;
  uf: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  prestador_especialidades?: { especialidade_id: number | null; especialidade: string }[];
  prestador_municipios?: { municipio_codigo: number }[];
};

type FormValues = Omit<Prestador, "id">;

const empty: FormValues = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  tipo: "outro",
  especialidade: "",
  cidade: "",
  uf: "",
  telefone: "",
  email: "",
  observacoes: "",
};

async function fetchPrestadores(): Promise<Prestador[]> {
  const { data, error } = await supabase
    .from("prestadores")
    .select("*, prestador_especialidades(especialidade_id,especialidade), prestador_municipios(municipio_codigo)")
    .order("razao_social");
  if (error) throw error;
  return (data ?? []) as Prestador[];
}

function PrestadoresPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["prestadores"],
    queryFn: fetchPrestadores,
  });
  const { data: especialidadesCat = [] } = useEspecialidades();

  const [q, setQ] = React.useState("");
  const [tipo, setTipo] = React.useState("all");
  const [uf, setUf] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prestador | null>(null);
  const [especialidadesSel, setEspecialidadesSel] = React.useState<number[]>([]);
  const [municipiosSel, setMunicipiosSel] = React.useState<number[]>([]);

  const form = useForm<FormValues>({ defaultValues: empty });

  const ufs = React.useMemo(
    () => Array.from(new Set(data.map((p) => p.uf).filter(Boolean))).sort(),
    [data],
  );

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((p) => {
      if (tipo !== "all" && p.tipo !== tipo) return false;
      if (uf !== "all" && p.uf !== uf) return false;
      if (!term) return true;
      return [p.razao_social, p.nome_fantasia, p.cidade, p.especialidade, p.cnpj]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, q, tipo, uf]);

  // Ordena por nº de especialidades desc (estratégia multi-especialidade)
  const sorted = React.useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          (b.prestador_especialidades?.length ?? 0) -
          (a.prestador_especialidades?.length ?? 0),
      ),
    [filtered],
  );

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        nome_fantasia: values.nome_fantasia || null,
        cnpj: values.cnpj || null,
        especialidade: values.especialidade || null,
        telefone: values.telefone || null,
        email: values.email || null,
        observacoes: values.observacoes || null,
        uf: values.uf.toUpperCase().slice(0, 2),
      };
      let prestadorId: number;
      if (editing) {
        const { error } = await supabase
          .from("prestadores")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        prestadorId = editing.id;
      } else {
        const { data: inserted, error } = await supabase
          .from("prestadores")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        prestadorId = (inserted as { id: number }).id;
      }

      // Sincroniza especialidades (N:N) — apaga e recria
      await supabase
        .from("prestador_especialidades")
        .delete()
        .eq("prestador_id", prestadorId);
      if (especialidadesSel.length) {
        const rows = especialidadesSel.map((id) => {
          const nome = especialidadesCat.find((e) => e.id === id)?.nome ?? "";
          return { prestador_id: prestadorId, especialidade_id: id, especialidade: nome };
        });
        const { error: e2 } = await supabase.from("prestador_especialidades").insert(rows);
        if (e2) throw e2;
      }

      // Sincroniza municípios cobertos
      await supabase
        .from("prestador_municipios")
        .delete()
        .eq("prestador_id", prestadorId);
      if (municipiosSel.length) {
        const rows = municipiosSel.map((c) => ({
          prestador_id: prestadorId,
          municipio_codigo: c,
        }));
        const { error: e3 } = await supabase.from("prestador_municipios").insert(rows);
        if (e3) throw e3;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prestadores"] });
      toast.success(editing ? "Prestador atualizado" : "Prestador cadastrado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("prestadores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prestadores"] });
      toast.success("Prestador removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    form.reset(empty);
    setEspecialidadesSel([]);
    setMunicipiosSel([]);
    setOpen(true);
  };
  const openEdit = (p: Prestador) => {
    setEditing(p);
    form.reset({ ...empty, ...p });
    setEspecialidadesSel(
      (p.prestador_especialidades ?? [])
        .map((pe) => pe.especialidade_id)
        .filter((v): v is number => v != null),
    );
    setMunicipiosSel((p.prestador_municipios ?? []).map((m) => m.municipio_codigo));
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Prestadores</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro e filtros da rede prestadora.
          </p>
        </div>
        <Button variant="gradient" onClick={openNew} className="w-auto">
          <Plus /> Novo prestador
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, cidade, especialidade..."
                className="pl-9"
              />
            </div>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {PRESTADOR_TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">UF</SelectItem>
                {ufs.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="animate-spin h-4 w-4" /> Carregando...
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-10 w-10 opacity-30 mb-2" />
              Nenhum prestador encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => {
                  const nEsp = p.prestador_especialidades?.length ?? 0;
                  return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {p.razao_social}
                        {nEsp >= 3 && (
                          <Badge variant="success" className="gap-1">
                            <Sparkles className="h-3 w-3" /> MULTI
                          </Badge>
                        )}
                      </div>
                      {p.nome_fantasia && (
                        <div className="text-xs text-muted-foreground">
                          {p.nome_fantasia}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {labelOf(PRESTADOR_TIPOS, p.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nEsp > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.prestador_especialidades!.slice(0, 3).map((e, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {e.especialidade}
                            </Badge>
                          ))}
                          {nEsp > 3 && (
                            <Badge variant="outline" className="text-xs">+{nEsp - 3}</Badge>
                          )}
                        </div>
                      ) : (
                        p.especialidade || "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {p.cidade}
                      {p.uf ? `/${p.uf}` : ""}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{p.telefone || "—"}</div>
                      {p.email && (
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remover ${p.razao_social}?`)) remove.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar prestador" : "Novo prestador"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Razão social *</Label>
              <Input {...form.register("razao_social", { required: true })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome fantasia</Label>
                <Input {...form.register("nome_fantasia")} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input {...form.register("cnpj")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {form.watch("tipo")
                      ? PRESTADOR_TIPOS.find((t) => t.value === form.watch("tipo"))?.label
                      : "Selecione o tipo..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar tipo..." />
                    <CommandList>
                      <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                      <CommandGroup>
                        {PRESTADOR_TIPOS.map((t) => (
                          <CommandItem
                            key={t.value}
                            value={t.label}
                            onSelect={() => {
                              form.setValue("tipo", t.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.watch("tipo") === t.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {t.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Especialidades atendidas</Label>
              <EspecialidadeMultiSelect
                value={especialidadesSel}
                onChange={setEspecialidadesSel}
              />
              <p className="text-xs text-muted-foreground">
                Clínicas multiespecialidade (≥3) ganham destaque na listagem.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Cidade-sede *</Label>
                <Input {...form.register("cidade", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>UF *</Label>
                <Input maxLength={2} {...form.register("uf", { required: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Municípios cobertos</Label>
              <MunicipioMultiCombobox value={municipiosSel} onChange={setMunicipiosSel} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input {...form.register("telefone")} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" {...form.register("email")} />
              </div>
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
