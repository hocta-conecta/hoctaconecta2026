import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Loader2, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PROJETO_STATUS } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/_authenticated/projetos")({
  component: ProjetosPage,
});

type Projeto = {
  id: number;
  cliente_id: number | null;
  nome: string;
  descricao: string | null;
  municipios: string | null;
  data_inicio: string | null;
  data_prevista: string | null;
  status: string;
  clientes: { nome: string } | null;
};

type FormValues = {
  nome: string;
  cliente_id: string;
  descricao: string;
  municipios: string;
  data_inicio: string;
  data_prevista: string;
  status: string;
};

async function fetchProjetos(): Promise<Projeto[]> {
  const { data, error } = await supabase
    .from("projetos")
    .select("*, clientes(nome)")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Projeto[];
}

function ProjetosPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["projetos"],
    queryFn: fetchProjetos,
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-opts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome");
      return (data ?? []) as { id: number; nome: string }[];
    },
  });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Projeto | null>(null);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      nome: "",
      cliente_id: "",
      descricao: "",
      municipios: "",
      data_inicio: "",
      data_prevista: "",
      status: "ativo",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase
        .from("projetos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["projetos"] });
      const prev = qc.getQueryData<Projeto[]>(["projetos"]);
      qc.setQueryData<Projeto[]>(["projetos"], (old) =>
        (old ?? []).map((p) => (p.id === id ? { ...p, status } : p)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["projetos"], ctx.prev);
      toast.error("Não foi possível mover o projeto");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["projetos"] }),
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        nome: values.nome,
        cliente_id: values.cliente_id ? Number(values.cliente_id) : null,
        descricao: values.descricao || null,
        municipios: values.municipios || null,
        data_inicio: values.data_inicio || null,
        data_prevista: values.data_prevista || null,
        status: values.status,
      };
      if (editing) {
        const { error } = await supabase
          .from("projetos")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projetos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      toast.success(editing ? "Projeto atualizado" : "Projeto criado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projetos"] });
      toast.success("Projeto removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      nome: "",
      cliente_id: "",
      descricao: "",
      municipios: "",
      data_inicio: "",
      data_prevista: "",
      status: "ativo",
    });
    setOpen(true);
  };
  const openEdit = (p: Projeto) => {
    setEditing(p);
    form.reset({
      nome: p.nome,
      cliente_id: p.cliente_id ? String(p.cliente_id) : "",
      descricao: p.descricao ?? "",
      municipios: p.municipios ?? "",
      data_inicio: p.data_inicio ?? "",
      data_prevista: p.data_prevista ?? "",
      status: p.status,
    });
    setOpen(true);
  };

  const onDragStart = (e: DragStartEvent) => setActiveId(Number(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = Number(active.id);
    const newStatus = String(over.id);
    const proj = data.find((p) => p.id === id);
    if (proj && proj.status !== newStatus) move.mutate({ id, status: newStatus });
  };

  const activeProj = data.find((p) => p.id === activeId) ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Arraste os cartões para alterar o status.
          </p>
        </div>
        <Button variant="gradient" onClick={openNew}>
          <Plus /> Novo projeto
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="animate-spin h-4 w-4" /> Carregando...
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {PROJETO_STATUS.map((col) => (
              <Column
                key={col.value}
                id={col.value}
                title={col.label}
                projetos={data.filter((p) => p.status === col.value)}
                onEdit={openEdit}
                onRemove={(id) => {
                  if (confirm("Remover este projeto?")) remove.mutate(id);
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeProj ? <ProjetoCard projeto={activeProj} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input {...form.register("nome", { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={form.watch("cliente_id")}
                  onValueChange={(v) => form.setValue("cliente_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJETO_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea {...form.register("descricao")} />
            </div>
            <div className="space-y-2">
              <Label>Municípios</Label>
              <Textarea
                {...form.register("municipios")}
                placeholder="Um por linha"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Input type="date" {...form.register("data_inicio")} />
              </div>
              <div className="space-y-2">
                <Label>Data prevista</Label>
                <Input type="date" {...form.register("data_prevista")} />
              </div>
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

function Column({
  id,
  title,
  projetos,
  onEdit,
  onRemove,
}: {
  id: string;
  title: string;
  projetos: Projeto[];
  onEdit: (p: Projeto) => void;
  onRemove: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border border-border bg-muted/40 p-3 transition-colors ${
        isOver ? "ring-2 ring-primary bg-accent/40" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground rounded-full bg-card px-2 py-0.5">
          {projetos.length}
        </span>
      </div>
      <div className="space-y-2 min-h-24">
        {projetos.map((p) => (
          <DraggableCard
            key={p.id}
            projeto={p}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({
  projeto,
  onEdit,
  onRemove,
}: {
  projeto: Projeto;
  onEdit: (p: Projeto) => void;
  onRemove: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: projeto.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)] ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight">{projeto.nome}</p>
          {projeto.clientes?.nome && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {projeto.clientes.nome}
            </p>
          )}
          {projeto.municipios && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {projeto.municipios.split("\n").join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-1 mt-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(projeto)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(projeto.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function ProjetoCard({ projeto, overlay }: { projeto: Projeto; overlay?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-3 ${
        overlay ? "shadow-[var(--shadow-elegant)] rotate-2" : ""
      }`}
    >
      <p className="font-medium leading-tight">{projeto.nome}</p>
      {projeto.clientes?.nome && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {projeto.clientes.nome}
        </p>
      )}
    </div>
  );
}
