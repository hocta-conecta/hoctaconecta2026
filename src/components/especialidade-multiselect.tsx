import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Especialidade = { id: number; nome: string; ativo: boolean };

export function useEspecialidades() {
  return useQuery({
    queryKey: ["especialidades"],
    queryFn: async (): Promise<Especialidade[]> => {
      const { data, error } = await supabase
        .from("especialidades")
        .select("id, nome, ativo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Especialidade[];
    },
    staleTime: 60_000,
  });
}

export function EspecialidadeMultiSelect({
  value,
  onChange,
  allowCreate = true,
  placeholder = "Adicionar especialidades...",
}: {
  value: number[];
  onChange: (ids: number[]) => void;
  allowCreate?: boolean;
  placeholder?: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { data = [] } = useEspecialidades();
  const map = React.useMemo(() => new Map(data.map((e) => [e.id, e])), [data]);

  const create = useMutation({
    mutationFn: async (nome: string) => {
      const { data: inserted, error } = await supabase
        .from("especialidades")
        .insert({ nome })
        .select()
        .single();
      if (error) throw error;
      return inserted as Especialidade;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["especialidades"] });
      onChange([...value, e.id]);
      setSearch("");
      toast.success(`Especialidade "${e.nome}" criada`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const exactMatch = data.find((e) => e.nome.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="text-muted-foreground">{placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            filter={(itemValue, q) =>
              itemValue.toLowerCase().includes(q.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder="Buscar especialidade..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {allowCreate && search.trim() ? (
                  <button
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded"
                    onClick={() => create.mutate(search.trim())}
                  >
                    <Plus className="inline h-3.5 w-3.5 mr-1" /> Criar "{search.trim()}"
                  </button>
                ) : (
                  "Nenhuma encontrada."
                )}
              </CommandEmpty>
              <CommandGroup>
                {data.map((e) => {
                  const checked = value.includes(e.id);
                  return (
                    <CommandItem key={e.id} value={e.nome} onSelect={() => toggle(e.id)}>
                      <Check className={cn("mr-2 h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
                      {e.nome}
                    </CommandItem>
                  );
                })}
                {allowCreate && search.trim() && !exactMatch && (
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={() => create.mutate(search.trim())}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Criar "{search.trim()}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => {
            const e = map.get(id);
            return (
              <Badge key={id} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {e?.nome ?? `#${id}`}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-0.5 rounded-sm hover:bg-background/50 p-0.5"
                  aria-label="remover"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}