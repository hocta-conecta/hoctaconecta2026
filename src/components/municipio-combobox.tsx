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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Municipio = {
  codigo_ibge: number;
  nome: string;
  uf: string;
};

/**
 * Hook para detectar se é dispositivo móvel
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

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

/** Componente interno de busca compartilhado entre Popover e Dialog */
function MunicipioSearchContent({
  value,
  onChange,
  onClose,
  search,
  setSearch,
  searchResults,
  isLoading,
  debouncedSearch,
  isMulti = false,
  toggle,
}: {
  value: number | number[] | null;
  onChange?: (codigo: number | null) => void;
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
  searchResults: Municipio[];
  isLoading: boolean;
  debouncedSearch: string;
  isMulti?: boolean;
  toggle?: (codigo: number) => void;
}) {
  const isSelected = (codigo: number) => {
    if (isMulti && Array.isArray(value)) {
      return value.includes(codigo);
    }
    return value === codigo;
  };

  return (
    <Command shouldFilter={false} className="flex h-full flex-col overflow-hidden">
      <CommandInput 
        placeholder={isLoading ? "Buscando..." : "Digite pelo menos 2 letras..."} 
        value={search}
        onValueChange={setSearch}
        className="h-12 text-base"
        autoFocus
      />
      <CommandList className="flex-1 overflow-y-auto overscroll-contain touch-pan-y max-h-none">
        {debouncedSearch.length < 2 ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <MapPin className="h-8 w-8 opacity-20" />
            <span>Digite pelo menos 2 letras para buscar.</span>
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <CommandEmpty className="py-12">Nenhum município encontrado.</CommandEmpty>
        ) : (
          <CommandGroup className="p-2">
            {searchResults.map((m) => (
              <CommandItem
                key={m.codigo_ibge}
                value={`${m.nome} ${m.uf}`}
                onSelect={() => {
                  if (isMulti && toggle) {
                    toggle(m.codigo_ibge);
                  } else if (onChange) {
                    onChange(m.codigo_ibge === value ? null : m.codigo_ibge);
                    onClose();
                  }
                }}
                className="py-3 px-4 mb-1 rounded-lg border border-transparent aria-selected:bg-accent aria-selected:border-accent/20"
              >
                <Check className={cn("mr-3 h-5 w-5", isSelected(m.codigo_ibge) ? "opacity-100" : "opacity-0")} />
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-base">{m.nome}</span>
                  <span className="text-xs text-muted-foreground uppercase">{m.uf}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
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
  const isMobile = useIsMobile();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  const { data: selectedData = [] } = useQuery({
    queryKey: ["municipios-selected", value],
    queryFn: () => fetchMunicipiosByIds(value ? [value] : []),
    enabled: !!value,
  });

  const selected = selectedData[0];

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      className="w-full justify-between font-normal h-10 px-3"
      onClick={() => setOpen(true)}
    >
      {selected ? (
        <span className="truncate">{selected.nome} / {selected.uf}</span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const contentProps = {
    value,
    onChange,
    onClose: () => {
      setOpen(false);
      setSearch("");
    },
    search,
    setSearch,
    searchResults,
    isLoading,
    debouncedSearch,
  };

  if (isMobile) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Buscar Município</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <MunicipioSearchContent {...contentProps} />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="h-[400px]">
          <MunicipioSearchContent {...contentProps} />
        </div>
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
  const isMobile = useIsMobile();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

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

  const trigger = (
    <Button 
      variant="outline" 
      className="w-full justify-between font-normal h-10 px-3"
      onClick={() => setOpen(true)}
    >
      <span className="text-muted-foreground truncate">{placeholder}</span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const contentProps = {
    value,
    onClose: () => {
      setOpen(false);
      setSearch("");
    },
    search,
    setSearch,
    searchResults,
    isLoading,
    debouncedSearch,
    isMulti: true,
    toggle,
  };

  return (
    <div className="space-y-2">
      {isMobile ? (
        <>
          {trigger}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Adicionar Municípios</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <MunicipioSearchContent {...contentProps} />
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {trigger}
          </PopoverTrigger>
          <PopoverContent 
            className="w-[--radix-popover-trigger-width] p-0" 
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="h-[400px]">
              <MunicipioSearchContent {...contentProps} />
            </div>
          </PopoverContent>
        </Popover>
      )}

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

/**
 * Componente para seleção de UF única
 */
export function UfSingleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (uf: string) => void;
}) {
  const { data: ufs = [] } = useQuery({
    queryKey: ["ufs-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("municipios")
        .select("uf");
      
      if (error) throw error;
      
      const uniqueUfs = Array.from(new Set((data ?? [])
        .map((m) => m.uf)
        .filter(Boolean)))
        .sort();
        
      return uniqueUfs;
    },
    staleTime: Infinity,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {value || "Selecione a UF..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar UF..." />
          <CommandList>
            <CommandEmpty>Nenhuma UF encontrada.</CommandEmpty>
            <CommandGroup>
              {ufs.map((uf) => (
                <CommandItem
                  key={uf}
                  value={uf}
                  onSelect={() => {
                    onChange(uf);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === uf ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {uf}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Componente para seleção de Cidade única com filtro por UF
 */
export function CidadeSingleCombobox({
  uf,
  value,
  onChange,
}: {
  uf: string;
  value: string;
  onChange: (cidade: string) => void;
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: cidades = [], isLoading } = useQuery({
    queryKey: ["cidades-search", uf, debouncedSearch],
    queryFn: async () => {
      if (!uf) return [];
      let query = supabase
        .from("municipios")
        .select("nome")
        .eq("uf", uf)
        .order("nome")
        .limit(50);
      
      if (debouncedSearch) {
        query = query.ilike("nome", `%${debouncedSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return Array.from(new Set((data ?? []).map(m => m.nome)));
    },
    enabled: !!uf,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={!uf}
        >
          {value || (uf ? "Selecione a cidade..." : "Selecione a UF primeiro")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar cidade..." 
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && <div className="p-2 text-xs text-muted-foreground">Carregando...</div>}
            {!isLoading && cidades.length === 0 && <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>}
            <CommandGroup>
              {cidades.map((cidade) => (
                <CommandItem
                  key={cidade}
                  value={cidade}
                  onSelect={() => {
                    onChange(cidade);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cidade ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cidade}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
