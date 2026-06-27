import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, j as Badge, c as cn, s as supabase, B as Button } from "./router-lpyZtYZ-.mjs";
import { u as ue } from "../_libs/sonner.mjs";
import { R as Root2, T as Trigger, C as Content2 } from "../_libs/radix-ui__react-popover.mjs";
import { _ as _e } from "../_libs/cmdk.mjs";
import { X, S as Search, h as ChevronsUpDown, P as Plus, a as Check, l as MapPin } from "../_libs/lucide-react.mjs";
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverContent = reactExports.forwardRef(({ className, align = "start", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border border-border bg-popover text-popover-foreground p-0 shadow-md outline-none",
      className
    ),
    ...props
  }
));
PopoverContent.displayName = "PopoverContent";
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = "Command";
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b border-border px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    _e.Input,
    {
      ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = "CommandInput";
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = "CommandList";
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Empty,
  {
    ref,
    className: "py-6 text-center text-sm text-muted-foreground",
    ...props
  }
));
CommandEmpty.displayName = "CommandEmpty";
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Group,
  {
    ref,
    className: cn("overflow-hidden p-1 text-foreground", className),
    ...props
  }
));
CommandGroup.displayName = "CommandGroup";
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground aria-selected:bg-accent",
      className
    ),
    ...props
  }
));
CommandItem.displayName = "CommandItem";
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
async function searchMunicipios(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  const { data, error } = await supabase.from("municipios").select("codigo_ibge, nome, uf").or(`nome.ilike.%${searchTerm}%,uf.ilike.%${searchTerm}%`).order("uf").order("nome").limit(100);
  if (error) throw error;
  return data ?? [];
}
async function fetchMunicipiosByIds(ids) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("municipios").select("codigo_ibge, nome, uf").in("codigo_ibge", ids);
  if (error) throw error;
  return data ?? [];
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
  toggle
}) {
  const isSelected = (codigo) => {
    if (isMulti && Array.isArray(value)) {
      return value.includes(codigo);
    }
    return value === codigo;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { shouldFilter: false, className: "flex h-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CommandInput,
      {
        placeholder: isLoading ? "Buscando..." : "Digite pelo menos 2 letras...",
        value: search,
        onValueChange: setSearch,
        className: "h-12 text-base",
        autoFocus: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommandList, { className: "flex-1 overflow-y-auto overscroll-contain touch-pan-y max-h-none", children: debouncedSearch.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-8 w-8 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Digite pelo menos 2 letras para buscar." })
    ] }) : searchResults.length === 0 && !isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { className: "py-12", children: "Nenhum município encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { className: "p-2", children: searchResults.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      CommandItem,
      {
        value: `${m.nome} ${m.uf}`,
        onSelect: () => {
          if (isMulti && toggle) {
            toggle(m.codigo_ibge);
          } else if (onChange) {
            onChange(m.codigo_ibge === value ? null : m.codigo_ibge);
            onClose();
          }
        },
        className: "py-3 px-4 mb-1 rounded-lg border border-transparent aria-selected:bg-accent aria-selected:border-accent/20",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: cn("mr-3 h-5 w-5", isSelected(m.codigo_ibge) ? "opacity-100" : "opacity-0") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-base", children: m.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground uppercase", children: m.uf })
          ] })
        ]
      },
      m.codigo_ibge
    )) }) })
  ] });
}
function MunicipioSingleCombobox({
  value,
  onChange,
  placeholder = "Selecione um município..."
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isMobile = useIsMobile();
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2
  });
  const { data: selectedData = [] } = useQuery({
    queryKey: ["municipios-selected", value],
    queryFn: () => fetchMunicipiosByIds(value ? [value] : []),
    enabled: !!value
  });
  const selected = selectedData[0];
  const trigger = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "outline",
      role: "combobox",
      className: "w-full justify-between font-normal h-10 px-3",
      onClick: () => setOpen(true),
      children: [
        selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
          selected.nome,
          " / ",
          selected.uf
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: placeholder }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
      ]
    }
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
    debouncedSearch
  };
  if (isMobile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      trigger,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "p-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Buscar Município" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioSearchContent, { ...contentProps }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: trigger }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        className: "w-[--radix-popover-trigger-width] p-0",
        align: "start",
        side: "bottom",
        sideOffset: 4,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioSearchContent, { ...contentProps }) })
      }
    )
  ] });
}
function MunicipioMultiCombobox({
  value,
  onChange,
  placeholder = "Adicionar municípios..."
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isMobile = useIsMobile();
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["municipios-search", debouncedSearch],
    queryFn: () => searchMunicipios(debouncedSearch),
    enabled: debouncedSearch.length >= 2
  });
  const { data: selectedMunicipios = [] } = useQuery({
    queryKey: ["municipios-selected-multi", value],
    queryFn: () => fetchMunicipiosByIds(value),
    enabled: value.length > 0,
    staleTime: Infinity
  });
  const toggle = (codigo) => {
    if (value.includes(codigo)) {
      onChange(value.filter((c) => c !== codigo));
    } else {
      onChange([...value, codigo]);
    }
  };
  const trigger = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "outline",
      className: "w-full justify-between font-normal h-10 px-3",
      onClick: () => setOpen(true),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground truncate", children: placeholder }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
      ]
    }
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
    toggle
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      trigger,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "p-0 sm:max-w-lg h-[90vh] sm:h-auto flex flex-col overflow-hidden top-[5vh] translate-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "p-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Adicionar Municípios" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioSearchContent, { ...contentProps }) })
      ] }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: trigger }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PopoverContent,
        {
          className: "w-[--radix-popover-trigger-width] p-0",
          align: "start",
          side: "bottom",
          sideOffset: 4,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioSearchContent, { ...contentProps }) })
        }
      )
    ] }),
    selectedMunicipios.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedMunicipios.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 pl-2 pr-1 py-1", children: [
      m.nome,
      "/",
      m.uf,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => toggle(m.codigo_ibge),
          className: "ml-0.5 rounded-sm hover:bg-background/50 p-0.5",
          "aria-label": "remover",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] }, m.codigo_ibge)) })
  ] });
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
  "TO"
];
function UfSingleSelect({
  value,
  onChange
}) {
  const ufs = BR_UFS;
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        className: "w-full justify-between font-normal h-10",
        children: [
          value || "Selecione a UF...",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        className: "w-[--radix-popover-trigger-width] p-0",
        onOpenAutoFocus: (e) => e.preventDefault(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Command,
          {
            className: "max-h-[300px] flex flex-col",
            filter: (value2, search) => {
              if (value2.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Buscar UF..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "overflow-y-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhuma UF encontrada." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: ufs.map((uf) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CommandItem,
                  {
                    value: uf,
                    onSelect: () => {
                      onChange(uf);
                      setOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Check,
                        {
                          className: cn(
                            "mr-2 h-4 w-4",
                            value === uf ? "opacity-100" : "opacity-0"
                          )
                        }
                      ),
                      uf
                    ]
                  },
                  uf
                )) })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function CidadeSingleCombobox({
  uf,
  value,
  onChange
}) {
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [open, setOpen] = reactExports.useState(false);
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
    enabled: !!uf
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        className: "w-full justify-between font-normal h-10",
        disabled: !uf,
        children: [
          value || (uf ? "Selecione a cidade..." : "Selecione a UF primeiro"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        className: "w-[--radix-popover-trigger-width] p-0",
        onOpenAutoFocus: (e) => e.preventDefault(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { shouldFilter: false, className: "max-h-[300px] flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CommandInput,
            {
              placeholder: "Buscar cidade...",
              onValueChange: setSearchTerm
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "overflow-y-auto", children: [
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-xs text-muted-foreground", children: "Carregando..." }),
            !isLoading && cidades.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhuma cidade encontrada." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: cidades.map((cidade) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CommandItem,
              {
                value: cidade,
                onSelect: () => {
                  onChange(cidade);
                  setOpen(false);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Check,
                    {
                      className: cn(
                        "mr-2 h-4 w-4",
                        value === cidade ? "opacity-100" : "opacity-0"
                      )
                    }
                  ),
                  cidade
                ]
              },
              cidade
            )) })
          ] })
        ] })
      }
    )
  ] });
}
function useEspecialidades() {
  return useQuery({
    queryKey: ["especialidades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("especialidades").select("id, nome, ativo").eq("ativo", true).order("nome");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
}
function EspecialidadeMultiSelect({
  value,
  onChange,
  allowCreate = true,
  placeholder = "Adicionar especialidades..."
}) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const { data = [] } = useEspecialidades();
  const map = reactExports.useMemo(() => new Map(data.map((e) => [e.id, e])), [data]);
  const create = useMutation({
    mutationFn: async (nome) => {
      const { data: inserted, error } = await supabase.from("especialidades").insert({ nome }).select().single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["especialidades"] });
      onChange([...value, e.id]);
      setSearch("");
      ue.success(`Especialidade "${e.nome}" criada`);
    },
    onError: (e) => ue.error(e.message)
  });
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  const exactMatch = data.find((e) => e.nome.toLowerCase() === search.trim().toLowerCase());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-between font-normal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: placeholder }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Command,
        {
          filter: (itemValue, q) => itemValue.toLowerCase().includes(q.toLowerCase()) ? 1 : 0,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CommandInput,
              {
                placeholder: "Buscar especialidade...",
                value: search,
                onValueChange: setSearch
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-72 overscroll-contain touch-pan-y", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: allowCreate && search.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded",
                  onClick: () => create.mutate(search.trim()),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "inline h-3.5 w-3.5 mr-1" }),
                    ' Criar "',
                    search.trim(),
                    '"'
                  ]
                }
              ) : "Nenhuma encontrada." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandGroup, { children: [
                data.map((e) => {
                  const checked = value.includes(e.id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandItem, { value: e.nome, onSelect: () => toggle(e.id), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: cn("mr-2 h-4 w-4", checked ? "opacity-100" : "opacity-0") }),
                    e.nome
                  ] }, e.id);
                }),
                allowCreate && search.trim() && !exactMatch && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CommandItem,
                  {
                    value: `__create__${search}`,
                    onSelect: () => create.mutate(search.trim()),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                      ' Criar "',
                      search.trim(),
                      '"'
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      ) })
    ] }),
    value.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: value.map((id) => {
      const e = map.get(id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 pl-2 pr-1 py-1", children: [
        e?.nome ?? `#${id}`,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => toggle(id),
            className: "ml-0.5 rounded-sm hover:bg-background/50 p-0.5",
            "aria-label": "remover",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
          }
        )
      ] }, id);
    }) })
  ] });
}
export {
  Command as C,
  EspecialidadeMultiSelect as E,
  MunicipioMultiCombobox as M,
  Popover as P,
  UfSingleSelect as U,
  PopoverTrigger as a,
  PopoverContent as b,
  CommandInput as c,
  CommandList as d,
  CommandEmpty as e,
  CommandGroup as f,
  CommandItem as g,
  CidadeSingleCombobox as h,
  MunicipioSingleCombobox as i,
  useEspecialidades as u
};
