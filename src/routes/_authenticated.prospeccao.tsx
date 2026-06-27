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
  EspecialidadeMultiSelect, 
  MunicipioMultiCombobox, 
  UfSingleSelect, 
  CidadeSingleSelect 
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
          <div className="flex flex-col md:flex-row gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
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
      className={`rounded-xl border border-border bg-muted/40 p-3 min-h-[150px] md:min-w-[300px] md:w-[300px] flex-shrink-0 transition-colors ${
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {form.watch("prestador_id")
                    ? prestadores.find((p) => String(p.id) === form.watch("prestador_id"))?.razao_social
                    : "Selecione o prestador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar prestador..." />
                  <CommandList>
                    <CommandEmpty>Nenhum prestador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {prestadores.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.razao_social}
                          onSelect={() => {
                            form.setValue("prestador_id", String(p.id));
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
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>

        {showNewPrestador && (
          <NewPrestadorModal 
            open={showNewPrestador} 
            onClose={() => setShowNewPrestador(false)} 
            onSuccess={(id) => {
              form.setValue("prestador_id", String(id));
              qc.invalidateQueries({ queryKey: ["prestadores-opts"] });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewPrestadorModal({ 
  open, 
  onClose, 
  onSuccess 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSuccess: (id: number) => void;
}) {
  const qc = useQueryClient();
  const [municipiosSel, setMunicipiosSel] = React.useState<string[]>([]);
  const [especialidadesSel, setEspecialidadesSel] = React.useState<number[]>([]);
  const [ufSede, setUfSede] = React.useState("");
  const [cidadeSede, setCidadeSede] = React.useState("");

  const form = useForm({
    defaultValues: {
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      tipo: "clinica_medica",
      telefone: "",
      email: "",
      observacoes: "",
    }
  });

  const save = useMutation({
    mutationFn: async (v: any) => {
      // 1. Inserir prestador
      const { data: prestador, error } = await supabase
        .from("prestadores")
        .insert({
          ...v,
          uf: ufSede,
          cidade: cidadeSede,
          atualizado_em: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;
      const prestadorId = prestador.id;

      // 2. Salvar especialidades
      if (especialidadesSel.length) {
        const rows = especialidadesSel.map((eid) => ({
          prestador_id: prestadorId,
          especialidade_id: eid,
        }));
        const { error: eError } = await supabase.from("prestador_especialidades").insert(rows);
        if (eError) throw eError;
      }

      // 3. Salvar municípios
      if (municipiosSel.length) {
        const rows = municipiosSel.map((m) => ({
          prestador_id: prestadorId,
          municipio_codigo: m,
        }));
        const { error: mError } = await supabase.from("prestador_municipios").insert(rows);
        if (mError) throw mError;
      }

      return prestadorId;
    },
    onSuccess: (id) => {
      toast.success("Prestador cadastrado com sucesso");
      onSuccess(id);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Prestador</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-2">
            <Label>Razão social *</Label>
            <Input placeholder="Ex: Hospital Central de Exemplo Ltda" {...form.register("razao_social", { required: true })} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome fantasia</Label>
              <Input placeholder="Ex: Hospital Central" {...form.register("nome_fantasia")} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" {...form.register("cnpj")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "consultorio", label: "Consultório" },
                  { value: "clinica_medica", label: "Clínica Médica" },
                  { value: "clinica_nao_medica", label: "Clínica Não Médica" },
                  { value: "laboratorio", label: "Laboratório" },
                  { value: "servico_imagem", label: "Serviço de Imagem" },
                  { value: "policlinica", label: "Policlínica" },
                  { value: "hospital", label: "Hospital" },
                  { value: "outro", label: "Outro" },
                ].map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especialidades atendidas</Label>
            <EspecialidadeMultiSelect value={especialidadesSel} onChange={setEspecialidadesSel} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>UF *</Label>
              <UfSingleSelect 
                value={ufSede} 
                onChange={(val) => {
                  setUfSede(val);
                  setCidadeSede(""); // Limpa cidade ao trocar UF
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade-sede *</Label>
              <CidadeSingleSelect 
                uf={ufSede} 
                value={cidadeSede} 
                onChange={setCidadeSede} 
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
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
