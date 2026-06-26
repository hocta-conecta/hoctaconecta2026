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
import {
  Plus,
  Loader2,
  Pencil,
  GripVertical,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  CheckCircle2,
  History,
  UserPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PROSPECCAO_ETAPAS, labelOf } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/prospeccao")({
  component: ProspeccaoPage,
});

type Prospeccao = {
  id: number;
  prestador_id: number;
  projeto_id: number | null;
  executivo_id: string | null;
  etapa: string;
  prioridade: number;
  data_inicio: string | null;
  observacoes: string | null;
  convertido_em: string | null;
  prestadores: { razao_social: string; cidade: string; uf: string; telefone: string | null; email: string | null } | null;
  projetos: { nome: string } | null;
};

type Interacao = {
  id: number;
  prospeccao_id: number;
  tipo: string;
  data: string;
  observacao: string | null;
  autor_id: string | null;
};

const INTERACAO_TIPOS = [
  { value: "telefone", label: "Telefone", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "visita", label: "Visita", icon: MapPin },
  { value: "outro", label: "Outro", icon: History },
];

async function fetchProspeccoes(): Promise<Prospeccao[]> {
  const { data, error } = await supabase
    .from("prospeccoes")
    .select(
      "*, prestadores(razao_social,cidade,uf,telefone,email), projetos(nome)",
    )
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
      const { data } = await supabase.from("projetos").select("id, nome").order("nome");
      return (data ?? []) as { id: number; nome: string }[];
    },
  });

  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Prospeccao | null>(null);
  const [detailsId, setDetailsId] = React.useState<number | null>(null);
  const [activeId, setActiveId] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const move = useMutation({
    mutationFn: async ({ id, etapa }: { id: number; etapa: string }) => {
      const { error } = await supabase
        .from("prospeccoes")
        .update({ etapa, atualizado_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, etapa }) => {
      await qc.cancelQueries({ queryKey: ["prospeccoes"] });
      const prev = qc.getQueryData<Prospeccao[]>(["prospeccoes"]);
      qc.setQueryData<Prospeccao[]>(["prospeccoes"], (old) =>
        (old ?? []).map((p) => (p.id === id ? { ...p, etapa } : p)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["prospeccoes"], ctx.prev);
      toast.error("Não foi possível mover");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["prospeccoes"] }),
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
  });

  const onDragStart = (e: DragStartEvent) => setActiveId(Number(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const id = Number(e.active.id);
    const etapa = String(e.over.id);
    const card = data.find((p) => p.id === id);
    if (card && card.etapa !== etapa) move.mutate({ id, etapa });
  };

  const openNew = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const openEdit = (p: Prospeccao) => {
    setEditing(p);
    setOpenForm(true);
  };

  const activeCard = data.find((p) => p.id === activeId);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Funil de Prospecção</h1>
          <p className="text-muted-foreground mt-1">
            Arraste os cards entre as etapas do funil.
          </p>
        </div>
        <Button variant="gradient" onClick={openNew} disabled={prestadores.length === 0}>
          <Plus /> Nova prospecção
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="animate-spin h-4 w-4" /> Carregando...
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {PROSPECCAO_ETAPAS.map((col) => (
              <KanbanColumn
                key={col.value}
                id={col.value}
                title={col.label}
                items={data.filter((p) => p.etapa === col.value)}
                onEdit={openEdit}
                onDetails={(id) => setDetailsId(id)}
                onRemove={(id) => {
                  if (confirm("Remover prospecção?")) remove.mutate(id);
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? <CardBody p={activeCard} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {openForm && (
        <ProspeccaoForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          editing={editing}
          prestadores={prestadores}
          projetos={projetos}
          userId={user?.id ?? null}
        />
      )}

      {detailsId !== null && (
        <DetailsDialog
          prospeccaoId={detailsId}
          prospeccao={data.find((p) => p.id === detailsId) ?? null}
          onClose={() => setDetailsId(null)}
        />
      )}
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  items,
  onEdit,
  onDetails,
  onRemove,
}: {
  id: string;
  title: string;
  items: Prospeccao[];
  onEdit: (p: Prospeccao) => void;
  onDetails: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border border-border bg-muted/40 p-3 min-h-[200px] transition-colors ${
        isOver ? "ring-2 ring-primary bg-accent/40" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground rounded-full bg-card px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((p) => (
          <DraggableCard
            key={p.id}
            p={p}
            onEdit={onEdit}
            onDetails={onDetails}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({
  p,
  onEdit,
  onDetails,
  onRemove,
}: {
  p: Prospeccao;
  onEdit: (p: Prospeccao) => void;
  onDetails: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id });
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
          <p className="font-medium text-sm leading-tight">
            {p.prestadores?.razao_social ?? `#${p.prestador_id}`}
          </p>
          {p.projetos?.nome && (
            <p className="text-xs text-muted-foreground mt-0.5">{p.projetos.nome}</p>
          )}
          {p.prestadores && (
            <p className="text-xs text-muted-foreground">
              {p.prestadores.cidade}/{p.prestadores.uf}
            </p>
          )}
          {p.convertido_em && (
            <Badge variant="success" className="mt-1 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Convertido
            </Badge>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-0.5 mt-2">
        <Button variant="ghost" size="icon" onClick={() => onDetails(p.id)} title="Detalhes">
          <History className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(p)} title="Editar">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)} title="Remover">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function CardBody({ p, overlay }: { p: Prospeccao; overlay?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-3 ${
        overlay ? "shadow-[var(--shadow-elegant)] rotate-2" : ""
      }`}
    >
      <p className="font-medium text-sm">{p.prestadores?.razao_social}</p>
    </div>
  );
}

// ---------------- Form de criar/editar ----------------

type FormValues = {
  prestador_id: string;
  projeto_id: string;
  etapa: string;
  prioridade: string;
  data_inicio: string;
  observacoes: string;
};

function ProspeccaoForm({
  open,
  onClose,
  editing,
  prestadores,
  projetos,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  editing: Prospeccao | null;
  prestadores: { id: number; razao_social: string }[];
  projetos: { id: number; nome: string }[];
  userId: string | null;
}) {
  const qc = useQueryClient();
  const form = useForm<FormValues>({
    defaultValues: editing
      ? {
          prestador_id: String(editing.prestador_id),
          projeto_id: editing.projeto_id ? String(editing.projeto_id) : "",
          etapa: editing.etapa,
          prioridade: String(editing.prioridade ?? 0),
          data_inicio: editing.data_inicio ?? "",
          observacoes: editing.observacoes ?? "",
        }
      : {
          prestador_id: "",
          projeto_id: "",
          etapa: "identificado",
          prioridade: "0",
          data_inicio: "",
          observacoes: "",
        },
  });

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      const payload = {
        prestador_id: Number(v.prestador_id),
        projeto_id: v.projeto_id ? Number(v.projeto_id) : null,
        etapa: v.etapa,
        prioridade: Number(v.prioridade) || 0,
        data_inicio: v.data_inicio || null,
        observacoes: v.observacoes || null,
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
          .insert({ ...payload, executivo_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success(editing ? "Prospecção atualizada" : "Prospecção criada");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar prospecção" : "Nova prospecção"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((v) => {
            if (!v.prestador_id) return toast.error("Selecione um prestador");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Dialog de detalhes (interações + conversão) ----------------

function DetailsDialog({
  prospeccaoId,
  prospeccao,
  onClose,
}: {
  prospeccaoId: number;
  prospeccao: Prospeccao | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: interacoes = [] } = useQuery({
    queryKey: ["interacoes", prospeccaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospeccao_interacoes")
        .select("*")
        .eq("prospeccao_id", prospeccaoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Interacao[];
    },
  });

  const [tipo, setTipo] = React.useState("telefone");
  const [obs, setObs] = React.useState("");

  const addInteracao = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("prospeccao_interacoes").insert({
        prospeccao_id: prospeccaoId,
        tipo,
        observacao: obs || null,
        autor_id: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interacoes", prospeccaoId] });
      setObs("");
      toast.success("Interação registrada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const convert = useMutation({
    mutationFn: async () => {
      if (!prospeccao?.prestador_id) throw new Error("Sem prestador vinculado");
      // A prospecção já tem prestador associado — só marcamos como convertido e movemos para "credenciado"
      const { error } = await supabase
        .from("prospeccoes")
        .update({
          etapa: "credenciado",
          convertido_em: new Date().toISOString(),
          data_contratacao: new Date().toISOString().slice(0, 10),
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", prospeccaoId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success("Prospecção convertida em credenciamento");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!prospeccao) return null;
  const alreadyConverted = !!prospeccao.convertido_em || prospeccao.etapa === "credenciado";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {prospeccao.prestadores?.razao_social ?? "Prospecção"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="interacoes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interacoes">Histórico de interações</TabsTrigger>
            <TabsTrigger value="acoes">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="interacoes" className="space-y-4 pt-3">
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-medium">Registrar nova interação</p>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACAO_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  rows={2}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Observação..."
                />
              </div>
              <Button
                onClick={() => addInteracao.mutate()}
                disabled={addInteracao.isPending}
                size="sm"
              >
                {addInteracao.isPending && <Loader2 className="animate-spin" />} Registrar
              </Button>
            </div>

            <div className="space-y-2">
              {interacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma interação registrada ainda.
                </p>
              ) : (
                interacoes.map((i) => {
                  const meta = INTERACAO_TIPOS.find((t) => t.value === i.tipo);
                  const Icon = meta?.icon ?? History;
                  return (
                    <div key={i.id} className="flex gap-3 p-3 rounded-lg border border-border">
                      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{meta?.label ?? i.tipo}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(i.data), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        {i.observacao && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {i.observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="acoes" className="space-y-3 pt-3">
            <div className="rounded-lg border border-border p-4 space-y-2">
              <p className="text-sm font-medium">Converter em credenciamento</p>
              <p className="text-xs text-muted-foreground">
                Marca a prospecção como credenciada, move o card para a coluna "Credenciado"
                e registra a data de contratação. O prestador permanece vinculado.
              </p>
              <Button
                variant="gradient"
                onClick={() => convert.mutate()}
                disabled={alreadyConverted || convert.isPending}
              >
                {convert.isPending ? <Loader2 className="animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {alreadyConverted ? "Já convertida" : "Converter em credenciado"}
              </Button>
            </div>
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

export { labelOf };