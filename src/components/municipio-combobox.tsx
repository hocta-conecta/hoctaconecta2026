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

/**
 * Hook para debounce de valores
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Busca municípios no servidor com filtro ilike
 */
async function searchMunicipios(searchTerm: string): Promise<Municipio[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("municipios")
    .select("codigo_ibge, nome, uf")
    .or(`nome.ilike.%${searchTerm}%,uf.ilike.%${searchTerm}%`)
    .order("uf")
    .order("nome")
    .limit(100);

  if (error) throw error;
  return (data ?? []) as Municipio[];
}

/**
 * Busca municípios específicos pelos códigos IBGE (para preservar chips)
 */
async function fetchMunicipiosByIds(ids: number[]): Promise<Municipio[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("municipios")
    .select("codigo_ibge, nome, uf")
    .in("codigo_ibge", ids);

  if (error) throw error;
  return (data ?? []) as Municipio[];
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
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Busca os resultados da pesquisa
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  // Busca o item selecionado para exibir o label correto
  const { data: selectedData = [] } = useQuery({
    queryKey: ["municipios-selected", value],
    queryFn: () => fetchMunicipiosByIds(value ? [value] : []),
    enabled: !!value,
  });

  const selected = selectedData[0];

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
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={isLoading ? "Buscando..." : "Digite pelo menos 2 letras..."} 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {debouncedSearch.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 letras para buscar.
              </div>
            ) : searchResults.length === 0 && !isLoading ? (
              <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
            ) : (
              <CommandGroup>
                {searchResults.map((m) => (
                  <CommandItem
                    key={m.codigo_ibge}
                    value={`${m.nome} ${m.uf}`}
                    onSelect={() => {
                      onChange(m.codigo_ibge === value ? null : m.codigo_ibge);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === m.codigo_ibge ? "opacity-100" : "opacity-0")} />
                    <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1">{m.nome}</span>
                    <span className="text-xs text-muted-foreground">{m.uf}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
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
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Busca os resultados da pesquisa
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  // Busca os itens já selecionados para exibir nos chips
  const { data: selectedMunicipios = [] } = useQuery({
    queryKey: ["municipios-selected-multi", value],
    queryFn: () => fetchMunicipiosByIds(value),
    enabled: value.length > 0,
    staleTime: Infinity,
  });

  const toggle = (codigo: number) => {
    if (value.includes(codigo)) {
      onChange(value.filter((c) => c !== codigo));
    } else {
      onChange([...value, codigo]);
    }
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
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={isLoading ? "Buscando..." : "Buscar município ou UF..."} 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {debouncedSearch.length < 2 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 letras para buscar.
                </div>
              ) : searchResults.length === 0 && !isLoading ? (
                <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map((m) => {
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
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMunicipios.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMunicipios.map((m) => (
            <Badge key={m.codigo_ibge} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
              {m.nome}/{m.uf}
              <button
                type="button"
                onClick={() => toggle(m.codigo_ibge)}
                className="ml-0.5 rounded-sm hover:bg-background/50 p-0.5"
                aria-label="remover"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
