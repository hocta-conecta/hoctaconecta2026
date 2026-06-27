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
  Check,
  ChevronsUpDown,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PRESTADOR_TIPOS } from "@/lib/domain";
import { EspecialidadeMultiSelect } from "@/components/especialidade-multiselect";
import { 
  MunicipioMultiCombobox, 
  UfSingleSelect, 
  CidadeSingleCombobox 
} from "@/components/municipio-combobox";

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
  const [search, setSearch] = React.useState("");

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
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((p) => {
      const haystack = [
        p.prestadores?.razao_social,
        p.prestadores?.cidade,
        p.prestadores?.uf,
        p.projetos?.nome,
        p.observacoes,
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
          <div className="flex sm:grid gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-3 px-3 pb-2 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 overscroll-x-contain">
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
      className={`shrink-0 w-[78vw] max-w-xs sm:w-auto sm:max-w-none snap-start rounded-xl border border-border bg-muted/40 p-3 min-h-[160px] transition-colors ${
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
  prestadores: { id: number; razao_social: string; cidade: string; uf: string }[];
  projetos: { id: number; nome: string }[];
  userId: string | null;
}) {
  const qc = useQueryClient();
  const [showNewPrestador, setShowNewPrestador] = React.useState(false);
  const [prestadorOpen, setPrestadorOpen] = React.useState(false);
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
            <div className="flex items-center justify-between">
              <Label>Prestador *</Label>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={() => setShowNewPrestador(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Novo prestador
              </Button>
            </div>
            <Popover open={prestadorOpen} onOpenChange={setPrestadorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal h-10"
                >
                  {form.watch("prestador_id")
                    ? prestadores.find((p) => String(p.id) === form.watch("prestador_id"))?.razao_social
                    : "Selecione o prestador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar prestador..." />
                  <CommandList className="max-h-72 overscroll-contain touch-pan-y">
                    <CommandEmpty>Nenhum prestador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {prestadores.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.razao_social}
                          onSelect={() => {
                            form.setValue("prestador_id", String(p.id));
                            setPrestadorOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.watch("prestador_id") === String(p.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{p.razao_social}</span>
                            <span className="text-[10px] text-muted-foreground">{p.cidade}/{p.uf}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              <Input type="number" placeholder="Ex: 1 (Alta), 5 (Baixa)" {...form.register("prioridade")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de início</Label>
            <Input type="date" placeholder="Data de início" {...form.register("data_inicio")} />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Informações adicionais, observações ou detalhes importantes..." {...form.register("observacoes")} />
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

      <QuickPrestadorForm 
        open={showNewPrestador} 
        onClose={() => setShowNewPrestador(false)} 
        onCreated={(id) => {
          qc.invalidateQueries({ queryKey: ["prestadores-opts"] });
          form.setValue("prestador_id", String(id));
          setShowNewPrestador(false);
        }}
      />
    </Dialog>
  );
}

function QuickPrestadorForm({ 
  open, 
  onClose, 
  onCreated 
}: { 
  open: boolean; 
  onClose: () => void; 
  onCreated: (id: number) => void;
}) {
  const [especialidadesSel, setEspecialidadesSel] = React.useState<number[]>([]);
  const [municipiosSel, setMunicipiosSel] = React.useState<number[]>([]);
  const [tipoOpen, setTipoOpen] = React.useState(false);
  
  const form = useForm({
    defaultValues: {
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      tipo: "outro",
      cidade: "",
      uf: "",
      telefone: "",
      email: "",
      observacoes: "",
    }
  });

  const save = useMutation({
    mutationFn: async (values: any) => {
      // 1. Insere o prestador
      const { data, error } = await supabase
        .from("prestadores")
        .insert({
          ...values,
          uf: (values.uf || "").toUpperCase().slice(0, 2),
        })
        .select("id")
        .single();
      
      if (error) throw error;
      const prestadorId = data.id;

      // 2. Insere especialidades
      if (especialidadesSel.length > 0) {
        const { error: espErr } = await supabase.from("prestador_especialidades").insert(
          especialidadesSel.map(id => ({ prestador_id: prestadorId, especialidade_id: id }))
        );
        if (espErr) console.error("Erro ao salvar especialidades:", espErr);
      }

      // 3. Insere municípios
      if (municipiosSel.length > 0) {
        const { error: munErr } = await supabase.from("prestador_municipios").insert(
          municipiosSel.map(code => ({ prestador_id: prestadorId, municipio_codigo: code }))
        );
        if (munErr) console.error("Erro ao salvar municípios:", munErr);
      }

      return prestadorId;
    },
    onSuccess: (id) => {
      toast.success("Prestador cadastrado com sucesso!");
      onCreated(id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Prestador</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
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
            <Popover open={tipoOpen} onOpenChange={setTipoOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal h-10"
                >
                  {form.watch("tipo")
                    ? PRESTADOR_TIPOS.find((t) => t.value === form.watch("tipo"))?.label
                    : "Selecione o tipo..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar tipo..." />
                  <CommandList className="max-h-72 overscroll-contain touch-pan-y">
                    <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                    <CommandGroup>
                      {PRESTADOR_TIPOS.map((t) => (
                        <CommandItem
                          key={t.value}
                          value={t.label}
                          onSelect={() => {
                            form.setValue("tipo", t.value);
                            setTipoOpen(false);
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>UF *</Label>
              <UfSingleSelect 
                value={form.watch("uf")} 
                onChange={(v) => {
                  form.setValue("uf", v);
                  form.setValue("cidade", "");
                }} 
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Cidade-sede *</Label>
              <CidadeSingleCombobox 
                uf={form.watch("uf")} 
                value={form.watch("cidade")} 
                onChange={(v) => form.setValue("cidade", v)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Municípios cobertos</Label>
            <MunicipioMultiCombobox value={municipiosSel} onChange={setMunicipiosSel} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" {...form.register("telefone")} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="contato@exemplo.com" {...form.register("email")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Informações adicionais, observações ou detalhes importantes..." {...form.register("observacoes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="gradient" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} Cadastrar
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
      
      // 1. Atualiza a prospecção
      const { error: prospError } = await supabase
        .from("prospeccoes")
        .update({
          etapa: "credenciado",
          convertido_em: new Date().toISOString(),
          data_contratacao: new Date().toISOString().slice(0, 10),
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", prospeccaoId);
      
      if (prospError) throw prospError;

      // 2. Vínculo automático: Se houver um projeto, garante que o prestador está vinculado aos municípios do projeto
      if (prospeccao.projeto_id) {
        // Busca municípios do projeto
        const { data: projMuns } = await supabase
          .from("projeto_municipios")
          .select("municipio_codigo")
          .eq("projeto_id", prospeccao.projeto_id);

        if (projMuns && projMuns.length > 0) {
          const rows = projMuns.map(m => ({
            prestador_id: prospeccao.prestador_id,
            municipio_codigo: m.municipio_codigo
          }));
          
          // Insere ignorando duplicatas (upsert manual via on conflict não disponível em todas as configs, então usamos insert simples)
          await supabase.from("prestador_municipios").insert(rows);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      qc.invalidateQueries({ queryKey: ["prestadores"] });
      toast.success("Prospecção convertida e prestador vinculado ao projeto!");
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