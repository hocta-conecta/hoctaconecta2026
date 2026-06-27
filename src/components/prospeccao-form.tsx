import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { PROSPECCAO_ETAPAS } from "@/lib/domain";
import { NewPrestadorModal } from "@/components/new-prestador-modal";

type FormValues = {
  prestador_id: string;
  projeto_id: string;
  etapa: string;
  prioridade: string;
  data_inicio: string;
  observacoes: string;
};

export function ProspeccaoForm({
  open,
  onClose,
  editing,
  prestadores,
  projetos,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  editing: any | null;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-visible flex flex-col">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar prospecção" : "Nova prospecção"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          <form
            onSubmit={form.handleSubmit((v) => {
              if (!v.prestador_id) return toast.error("Selecione um prestador");
              save.mutate(v);
            })}
            className="space-y-4 py-1"
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
                <PopoverContent 
                  className="w-[--radix-popover-trigger-width] p-0" 
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command 
                    className="max-h-[300px] flex flex-col"
                    filter={(value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                      return 0;
                    }}
                  >
                    <CommandInput placeholder="Buscar prestador..." />
                    <CommandList className="overflow-y-auto">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {form.watch("projeto_id")
                      ? projetos.find((p) => String(p.id) === form.watch("projeto_id"))?.nome
                      : "Selecione o projeto..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[--radix-popover-trigger-width] p-0" 
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command 
                    className="max-h-[300px] flex flex-col"
                    filter={(value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                      return 0;
                    }}
                  >
                    <CommandInput placeholder="Buscar projeto..." />
                    <CommandList className="overflow-y-auto">
                      <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => form.setValue("projeto_id", "")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !form.watch("projeto_id") ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Nenhum
                        </CommandItem>
                        {projetos.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.nome}
                            onSelect={() => form.setValue("projeto_id", String(p.id))}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.watch("projeto_id") === String(p.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {p.nome}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Etapa</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {form.watch("etapa")
                        ? PROSPECCAO_ETAPAS.find((e) => e.value === form.watch("etapa"))?.label
                        : "Selecione a etapa..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[--radix-popover-trigger-width] p-0" 
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command 
                      className="max-h-[300px] flex flex-col"
                      filter={(value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                      }}
                    >
                      <CommandInput placeholder="Buscar etapa..." />
                      <CommandList className="overflow-y-auto">
                        <CommandEmpty>Nenhuma etapa encontrada.</CommandEmpty>
                        <CommandGroup>
                          {PROSPECCAO_ETAPAS.map((e) => (
                            <CommandItem
                              key={e.value}
                              value={e.label}
                              onSelect={() => form.setValue("etapa", e.value)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.watch("etapa") === e.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {e.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </div>

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
