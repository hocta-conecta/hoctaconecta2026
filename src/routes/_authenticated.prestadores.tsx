import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Search, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PRESTADOR_TIPOS, labelOf } from "@/lib/domain";
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
    .select("*")
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

  const [q, setQ] = React.useState("");
  const [tipo, setTipo] = React.useState("all");
  const [uf, setUf] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prestador | null>(null);

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
      if (editing) {
        const { error } = await supabase
          .from("prestadores")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prestadores").insert(payload);
        if (error) throw error;
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
    setOpen(true);
  };
  const openEdit = (p: Prestador) => {
    setEditing(p);
    form.reset({ ...empty, ...p });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prestadores</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro e filtros da rede prestadora.
          </p>
        </div>
        <Button variant="gradient" onClick={openNew}>
          <Plus /> Novo prestador
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
                placeholder="Buscar por nome, cidade, especialidade..."
                className="pl-9"
              />
            </div>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-28">
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
          ) : filtered.length === 0 ? (
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
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.razao_social}</div>
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
                    <TableCell>{p.especialidade || "—"}</TableCell>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome fantasia</Label>
                <Input {...form.register("nome_fantasia")} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input {...form.register("cnpj")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.watch("tipo")}
                  onValueChange={(v) => form.setValue("tipo", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESTADOR_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Input {...form.register("especialidade")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Cidade *</Label>
                <Input {...form.register("cidade", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>UF *</Label>
                <Input maxLength={2} {...form.register("uf", { required: true })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
