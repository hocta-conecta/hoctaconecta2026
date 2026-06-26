import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Municipio = {
  codigo_ibge: number;
  nome: string;
  uf: string;
};

async function fetchMunicipios(): Promise<Municipio[]> {
  const { data, error } = await supabase
    .from("municipios")
    .select("codigo_ibge, nome, uf")
    .order("uf")
    .order("nome");
  if (error) throw error;
  return (data ?? []) as Municipio[];
}

function useMunicipios() {
  return useQuery({
    queryKey: ["municipios"],
    queryFn: fetchMunicipios,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/** Seleção única */
export function MunicipioSingleCombobox({
  value,
  onChange,
  placeholder = "Selecione um município...",
}: {
  value: number | null;
  onChange: (codigo: number | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { data = [], isLoading } = useMunicipios();
  const selected = data.find((m) => m.codigo_ibge === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">{selected.nome} / {selected.uf}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={isLoading ? "Carregando..." : "Buscar município ou UF..."} />
          <CommandList>
            <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
            <CommandGroup>
              {data.map((m) => {
                const v = `${m.nome} ${m.uf}`;
                return (
                  <CommandItem
                    key={m.codigo_ibge}
                    value={v}
                    onSelect={() => {
                      onChange(m.codigo_ibge === value ? null : m.codigo_ibge);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === m.codigo_ibge ? "opacity-100" : "opacity-0")} />
                    <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1">{m.nome}</span>
                    <span className="text-xs text-muted-foreground">{m.uf}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Seleção múltipla com chips */
export function MunicipioMultiCombobox({
  value,
  onChange,
  placeholder = "Adicionar municípios...",
}: {
  value: number[];
  onChange: (codigos: number[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { data = [], isLoading } = useMunicipios();
  const map = React.useMemo(
    () => new Map(data.map((m) => [m.codigo_ibge, m])),
    [data],
  );

  const toggle = (codigo: number) => {
    if (value.includes(codigo)) onChange(value.filter((c) => c !== codigo));
    else onChange([...value, codigo]);
  };

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
            filter={(itemValue, search) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder={isLoading ? "Carregando..." : "Buscar município ou UF..."} />
            <CommandList>
              <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
              <CommandGroup>
                {data.map((m) => {
                  const checked = value.includes(m.codigo_ibge);
                  return (
                    <CommandItem
                      key={m.codigo_ibge}
                      value={`${m.nome} ${m.uf}`}
                      onSelect={() => toggle(m.codigo_ibge)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{m.nome}</span>
                      <span className="text-xs text-muted-foreground">{m.uf}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((c) => {
            const m = map.get(c);
            return (
              <Badge key={c} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {m ? `${m.nome}/${m.uf}` : `#${c}`}
                <button
                  type="button"
                  onClick={() => toggle(c)}
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