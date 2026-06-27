import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  History,
  CheckCircle2,
  GripVertical,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PROSPECCAO_ETAPAS } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { 
  MunicipioMultiCombobox, 
  UfSingleSelect, 
  CidadeSingleCombobox 
} from "@/components/municipio-combobox";
import { EspecialidadeMultiSelect } from "@/components/especialidade-multiselect";
import { NewPrestadorModal } from "@/components/new-prestador-modal";
import { ProspeccaoForm } from "@/components/prospeccao-form";
import { ProspeccaoDetailsDialog } from "@/components/prospeccao-details-dialog";

export const Route = createFileRoute("/_authenticated/prospeccao")({
  component: ProspeccaoPage,
});

type Prospeccao = {
  id: number;
  prestador_id: number;
  projeto_id: number | null;
  executivo_id: string | null;
  etapa: string;
  prioridade: number | null;
  data_inicio: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  convertido_em: string | null;
  prestadores?: {
    razao_social: string;
    cidade: string;
    uf: string;
    telefone: string | null;
    email: string | null;
  };
  projetos?: {
    nome: string;
  };
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
  const [search, setSearch] = React.useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["prospeccoes"],
    queryFn: fetchProspeccoes,
  });
  const { data: prestadores = [] } = useQuery({
    queryKey: ["prestadores-opts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prestadores")
        .select("id, razao_social, cidade, uf")
        .order("razao_social");
      return (data ?? []) as { id: number; razao_social: string; cidade: string; uf: string }[];
    },
  });
  const { data: projetos = [] } = useQuery({
    queryKey: ["projetos-opts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projetos")
        .select("id, nome, projeto_municipios(municipio_codigo)")
        .order("nome");
      return (data ?? []) as any[];
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

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((p) => {
      const haystack = [
        p.prestadores?.razao_social,
        p.prestadores?.cidade,
        p.projetos?.nome,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [data, search]);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">Funil de Prospecção</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Arraste os cards entre as etapas do funil.
          </p>
        </div>
        <Button variant="gradient" size="sm" onClick={openNew} disabled={prestadores.length === 0} className="shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova prospecção</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </header>

      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, cidade, projeto..."
          className="pl-3"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="animate-spin h-4 w-4" /> Carregando...
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-3 flex-wrap pb-4">
            {PROSPECCAO_ETAPAS.map((col) => (
              <KanbanColumn
                key={col.value}
                id={col.value}
                title={col.label}
                items={filtered.filter((p) => p.etapa === col.value)}
                onEdit={openEdit}
                onDetails={(id) => setDetailsId(id)}
                onRemove={(id) => {
                  if (confirm("Remover prospecção?")) remove.mutate(id);
                }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-elegant)] rotate-2">
                <p className="font-medium text-sm">{activeCard.prestadores?.razao_social}</p>
              </div>
            ) : null}
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
        <ProspeccaoDetailsDialog
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
      className={`rounded-xl border border-border bg-muted/40 p-3 min-h-[150px] w-full md:w-[300px] transition-colors ${
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



// ---------------- Form de criar/editar ----------------





// ---------------- Detalhes e Interações ----------------

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

  const { data: interacoes = [], isLoading } = useQuery({
    queryKey: ["interacoes", prospeccaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interacoes_prospeccao")
        .select("*")
        .eq("prospeccao_id", prospeccaoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Interacao[];
    },
  });

  const addInteracao = useMutation({
    mutationFn: async (v: { tipo: string; observacao: string }) => {
      const { error } = await supabase.from("interacoes_prospeccao").insert({
        prospeccao_id: prospeccaoId,
        tipo: v.tipo,
        observacao: v.observacao,
        data: new Date().toISOString(),
        autor_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interacoes", prospeccaoId] });
      toast.success("Interação registrada");
    },
  });

  const converter = useMutation({
    mutationFn: async () => {
      // 1. Atualiza status para credenciado e define data de conversão
      const { error } = await supabase
        .from("prospeccoes")
        .update({ 
          etapa: "credenciado", 
          convertido_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .eq("id", prospeccaoId);
      if (error) throw error;

      // 2. Se houver projeto e prestador, vincula o prestador aos municípios do projeto
      if (prospeccao?.projeto_id && prospeccao?.prestador_id) {
        // Busca municípios do projeto
        const { data: projMun } = await supabase
          .from("projeto_municipios")
          .select("municipio_codigo")
          .eq("projeto_id", prospeccao.projeto_id);
        
        if (projMun && projMun.length > 0) {
          const rows = projMun.map(m => ({
            prestador_id: prospeccao.prestador_id,
            municipio_codigo: m.municipio_codigo
          }));
          
          // Insere vínculos (ignora duplicados se houver)
          await supabase.from("prestador_municipios").upsert(rows, { onConflict: 'prestador_id,municipio_codigo' });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success("Prestador marcado como credenciado!");
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Prospecção</DialogTitle>
        </DialogHeader>

        {prospeccao && (
          <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="font-bold text-lg">{prospeccao.prestadores?.razao_social}</h3>
            <p className="text-sm text-muted-foreground">
              {prospeccao.prestadores?.cidade}/{prospeccao.prestadores?.uf}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{prospeccao.projetos?.nome || "Sem projeto"}</Badge>
              <Badge>{prospeccao.etapa}</Badge>
              {prospeccao.convertido_em && (
                <Badge variant="success">Credenciado em {new Date(prospeccao.convertido_em).toLocaleDateString()}</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4" /> Histórico de Interações
            </h4>
            <div className="space-y-3">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : interacoes.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma interação registrada.</p>
              ) : (
                interacoes.map((i) => (
                  <div key={i.id} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{i.tipo}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(i.data).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">{i.observacao}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Nova Interação</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                addInteracao.mutate({
                  tipo: String(fd.get("tipo")),
                  observacao: String(fd.get("observacao")),
                });
                (e.target as HTMLFormElement).reset();
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Select name="tipo" defaultValue="telefone">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACAO_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-3.5 w-3.5" /> {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea name="observacao" placeholder="O que foi conversado?" required />
              <Button type="submit" size="sm" disabled={addInteracao.isPending}>
                Registrar
              </Button>
            </form>
          </section>

          {!prospeccao?.convertido_em && (
            <section className="pt-4 border-t border-border flex justify-end">
              <Button 
                variant="success" 
                onClick={() => {
                  if (confirm("Confirmar credenciamento deste prestador?")) converter.mutate();
                }}
                disabled={converter.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como Credenciado
              </Button>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
