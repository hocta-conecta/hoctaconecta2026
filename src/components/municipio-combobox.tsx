import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type Municipio = {
  codigo_ibge: number;
  nome: string;
  uf: string;
};

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

async function searchMunicipios(searchTerm: string): Promise<Municipio[]> {
  if (!searchTerm || searchTerm.length < 2) return [];

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

async function fetchMunicipiosByIds(ids: number[]): Promise<Municipio[]> {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase.from("municipios").select("codigo_ibge, nome, uf").in("codigo_ibge", ids);

  if (error) throw error;
  return (data ?? []) as Municipio[];
}

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
    <div className="flex h-full flex-col overflow-hidden bg-popover text-popover-foreground">
      <div className="flex items-center border-b px-3" data-cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          placeholder={isLoading ? "Buscando..." : "Digite pelo menos 2 letras..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
          autoFocus
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <ScrollArea className="flex-1 max-h-[350px] p-2">
        {debouncedSearch.length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <MapPin className="h-8 w-8 opacity-20" />
            <span>Digite pelo menos 2 letras para buscar.</span>
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Nenhum município encontrado.</div>
        ) : (
          <div className="space-y-1">
            {searchResults.map((m) => (
              <button
                key={m.codigo_ibge}
                type="button"
                onClick={() => {
                  if (isMulti && toggle) {
                    toggle(m.codigo_ibge);
                  } else if (onChange) {
                    onChange(m.codigo_ibge === value ? null : m.codigo_ibge);
                    onClose();
                  }
                }}
                className={cn(
                  "relative flex w-full select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-left",
                  isSelected(m.codigo_ibge) && "bg-accent/50",
                )}
              >
                <Check className={cn("mr-2 h-4 w-4", isSelected(m.codigo_ibge) ? "opacity-100" : "opacity-0")} />
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm">{m.nome}</span>
                  <span className="text-xs text-muted-foreground uppercase">{m.uf}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

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

  const selected = selectedData?.[0];

  const trigger = (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      className="w-full justify-between font-normal h-10 px-3"
      onClick={() => setOpen(true)}
    >
      {selected ? (
        <span className="truncate">
          {selected.nome} / {selected.uf}
        </span>
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
          <DialogContent className="p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0 z-[150]">
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
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[100]"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <MunicipioSearchContent {...contentProps} />
      </PopoverContent>
    </Popover>
  );
}

export function MunicipioMultiCombobox({
  value = [],
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
    enabled: Object.keys(value || {}).length > 0,
  });

  const toggle = (codigo: number) => {
    const currentValues = value || [];
    if (currentValues.includes(codigo)) {
      onChange(currentValues.filter((c) => c !== codigo));
    } else {
      onChange([...currentValues, codigo]);
    }
  };

  const trigger = (
    <Button
      type="button"
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
            <DialogContent className="p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0 z-[150]">
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
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <MunicipioSearchContent {...contentProps} />
          </PopoverContent>
        </Popover>
      )}

      {selectedMunicipios && selectedMunicipios.length > 0 && (
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

const BR_UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function UfSingleSelect({ value, onChange }: { value: string; onChange: (uf: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredUfs = BR_UFS.filter((uf) => uf.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal h-10">
          {value || "Selecione a UF..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col max-h-[300px]">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar UF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ScrollArea className="overflow-y-auto flex-1 p-1">
            {filteredUfs.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma UF encontrada.</div>
            ) : (
              filteredUfs.map((uf) => (
                <button
                  key={uf}
                  type="button"
                  onClick={() => {
                    onChange(uf);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === uf ? "opacity-100" : "opacity-0")} />
                  {uf}
                </button>
              ))
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  const [open, setOpen] = React.useState(false);

  const { data: cidades = [], isLoading } = useQuery({
    queryKey: ["cidades-search", uf, debouncedSearch],
    queryFn: async () => {
      if (!uf) return [];
      let query = supabase.from("municipios").select("nome").eq("uf", uf).order("nome").limit(50);

      if (debouncedSearch) {
        query = query.ilike("nome", `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((m) => m.nome)));
    },
    enabled: !!uf,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal h-10"
          disabled={!uf}
        >
          {value || (uf ? "Selecione a cidade..." : "Selecione a UF primeiro")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col max-h-[300px]">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ScrollArea className="overflow-y-auto flex-1 p-1">
            {isLoading && (
              <div className="p-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Carregando...
              </div>
            )}
            {!isLoading && cidades.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma cidade encontrada.</div>
            )}
            <div className="space-y-1">
              {cidades.map((cidade) => (
                <button
                  key={cidade}
                  type="button"
                  onClick={() => {
                    onChange(cidade);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className="relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === cidade ? "opacity-100" : "opacity-0")} />
                  {cidade}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
