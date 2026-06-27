import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { u as useForm } from "./_libs/react-hook-form.mjs";
import { u as ue } from "./_libs/sonner.mjs";
import { B as Button, S as Select, e as SelectTrigger, f as SelectValue, g as SelectContent, h as SelectItem, j as Badge, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, c as cn, T as Textarea, i as DialogFooter, s as supabase } from "./_ssr/router-CzHhAn6T.mjs";
import { l as labelOf, b as PRESTADOR_TIPOS$1 } from "./_ssr/domain-ZCtTbbBl.mjs";
import { I as Input, L as Label } from "./_ssr/label-DPvycArM.mjs";
import { C as Card, a as CardHeader, b as CardContent } from "./_ssr/card-CLj25OPk.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-wPGsv95N.mjs";
import { u as useEspecialidades, P as Popover, a as PopoverTrigger, b as PopoverContent, C as Command, c as CommandInput, d as CommandList, e as CommandEmpty, f as CommandGroup, g as CommandItem, E as EspecialidadeMultiSelect, U as UfSingleSelect, h as CidadeSingleCombobox, M as MunicipioMultiCombobox } from "./_ssr/especialidade-multiselect-Bh_cJTPo.mjs";
import { P as Plus, S as Search, b as LoaderCircle, U as Users, r as Sparkles, n as Pencil, T as Trash2, h as ChevronsUpDown, a as Check } from "./_libs/lucide-react.mjs";

import "./_libs/tanstack__query-core.mjs";
import "./_libs/unenv.mjs";


import "./_libs/react-dom.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";


import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "./_libs/tslib.mjs";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/zod.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-popover.mjs";
import "./_libs/cmdk.mjs";
const PRESTADOR_TIPOS = [...PRESTADOR_TIPOS$1.filter((t) => t.value !== "hospital"), {
  value: "hospital",
  label: "Hospital"
}].sort((a, b) => {
  if (a.value === "outro") return 1;
  if (b.value === "outro") return -1;
  return 0;
});
const empty = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  tipo: "outro",
  especialidade: "",
  cidade: "",
  uf: "",
  telefone: "",
  email: "",
  observacoes: ""
};
async function fetchPrestadores() {
  const {
    data,
    error
  } = await supabase.from("prestadores").select("*, prestador_especialidades(especialidade_id,especialidade), prestador_municipios(municipio_codigo)").order("razao_social");
  if (error) throw error;
  return data ?? [];
}
function PrestadoresPage() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["prestadores"],
    queryFn: fetchPrestadores
  });
  const {
    data: especialidadesCat = []
  } = useEspecialidades();
  const [q, setQ] = reactExports.useState("");
  const [tipo, setTipo] = reactExports.useState("all");
  const [uf, setUf] = reactExports.useState("all");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [especialidadesSel, setEspecialidadesSel] = reactExports.useState([]);
  const [municipiosSel, setMunicipiosSel] = reactExports.useState([]);
  const [tipoOpen, setTipoOpen] = reactExports.useState(false);
  const form = useForm({
    defaultValues: empty
  });
  const ufs = reactExports.useMemo(() => Array.from(new Set(data.map((p) => p.uf).filter(Boolean))).sort(), [data]);
  const filtered = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((p) => {
      if (tipo !== "all" && p.tipo !== tipo) return false;
      if (uf !== "all" && p.uf !== uf) return false;
      if (!term) return true;
      return [p.razao_social, p.nome_fantasia, p.cidade, p.especialidade, p.cnpj].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));
    });
  }, [data, q, tipo, uf]);
  const sorted = reactExports.useMemo(() => [...filtered].sort((a, b) => (b.prestador_especialidades?.length ?? 0) - (a.prestador_especialidades?.length ?? 0)), [filtered]);
  const save = useMutation({
    mutationFn: async (values) => {
      const {
        prestador_especialidades,
        prestador_municipios,
        ...rest
      } = values;
      const payload = {
        ...rest,
        nome_fantasia: rest.nome_fantasia || null,
        cnpj: rest.cnpj || null,
        especialidade: rest.especialidade || null,
        telefone: rest.telefone || null,
        email: rest.email || null,
        observacoes: rest.observacoes || null,
        uf: rest.uf.toUpperCase().slice(0, 2)
      };
      let prestadorId;
      if (editing) {
        const {
          error
        } = await supabase.from("prestadores").update(payload).eq("id", editing.id);
        if (error) throw error;
        prestadorId = editing.id;
      } else {
        const {
          data: inserted,
          error
        } = await supabase.from("prestadores").insert(payload).select("id").single();
        if (error) throw error;
        prestadorId = inserted.id;
      }
      await supabase.from("prestador_especialidades").delete().eq("prestador_id", prestadorId);
      if (especialidadesSel.length) {
        const rows = especialidadesSel.map((id) => {
          const nome = especialidadesCat.find((e) => e.id === id)?.nome ?? "";
          return {
            prestador_id: prestadorId,
            especialidade_id: id,
            especialidade: nome
          };
        });
        const {
          error: e2
        } = await supabase.from("prestador_especialidades").insert(rows);
        if (e2) throw e2;
      }
      await supabase.from("prestador_municipios").delete().eq("prestador_id", prestadorId);
      if (municipiosSel.length) {
        const rows = municipiosSel.map((c) => ({
          prestador_id: prestadorId,
          municipio_codigo: c
        }));
        const {
          error: e3
        } = await supabase.from("prestador_municipios").insert(rows);
        if (e3) throw e3;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["prestadores"]
      });
      ue.success(editing ? "Prestador atualizado" : "Prestador cadastrado");
      setOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("prestadores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["prestadores"]
      });
      ue.success("Prestador removido");
    },
    onError: (e) => ue.error(e.message)
  });
  const openNew = () => {
    setEditing(null);
    form.reset(empty);
    setEspecialidadesSel([]);
    setMunicipiosSel([]);
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    form.reset({
      ...empty,
      ...p
    });
    setEspecialidadesSel((p.prestador_especialidades ?? []).map((pe) => pe.especialidade_id).filter((v) => v != null));
    setMunicipiosSel((p.prestador_municipios ?? []).map((m) => m.municipio_codigo));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-3xl font-bold tracking-tight truncate", children: "Prestadores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: "Cadastro e filtros da rede prestadora." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "gradient", size: "sm", onClick: openNew, className: "w-auto shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Novo prestador" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Novo" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-56", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar por nome, cidade, especialidade...", className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: setTipo, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tipo" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todos os tipos" }),
            PRESTADOR_TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: uf, onValueChange: setUf, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "UF" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "UF" }),
            ufs.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
        " Carregando..."
      ] }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto h-10 w-10 opacity-30 mb-2" }),
        "Nenhum prestador encontrado."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Razão social" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Especialidades" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cidade/UF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contato" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sorted.map((p) => {
          const nEsp = p.prestador_especialidades?.length ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
                p.razao_social,
                nEsp >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                  " MULTI"
                ] })
              ] }),
              p.nome_fantasia && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: p.nome_fantasia })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: labelOf(PRESTADOR_TIPOS, p.tipo) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nEsp > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 max-w-xs", children: [
              p.prestador_especialidades.slice(0, 3).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: e.especialidade }, i)),
              nEsp > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                "+",
                nEsp - 3
              ] })
            ] }) : p.especialidade || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              p.cidade,
              p.uf ? `/${p.uf}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: p.telefone || "—" }),
              p.email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: p.email })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
                if (confirm(`Remover ${p.razao_social}?`)) remove.mutate(p.id);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] })
          ] }, p.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar prestador" : "Novo prestador" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit((v) => save.mutate(v)), className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Razão social *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ex: Hospital Central de Exemplo Ltda", ...form.register("razao_social", {
            required: true
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome fantasia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ex: Hospital Central", ...form.register("nome_fantasia") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CNPJ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "00.000.000/0000-00", ...form.register("cnpj") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: tipoOpen, onOpenChange: setTipoOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", role: "combobox", className: "w-full justify-between font-normal h-10", children: [
              form.watch("tipo") ? PRESTADOR_TIPOS.find((t) => t.value === form.watch("tipo"))?.label : "Selecione o tipo...",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Buscar tipo..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-72 overscroll-contain touch-pan-y", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhum tipo encontrado." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: PRESTADOR_TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandItem, { value: t.label, onSelect: () => {
                  form.setValue("tipo", t.value);
                  setTipoOpen(false);
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: cn("mr-2 h-4 w-4", form.watch("tipo") === t.value ? "opacity-100" : "opacity-0") }),
                  t.label
                ] }, t.value)) })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Especialidades atendidas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EspecialidadeMultiSelect, { value: especialidadesSel, onChange: setEspecialidadesSel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clínicas multiespecialidade (≥3) ganham destaque na listagem." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UF *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(UfSingleSelect, { value: form.watch("uf"), onChange: (v) => {
              form.setValue("uf", v);
              form.setValue("cidade", "");
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cidade-sede *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CidadeSingleCombobox, { uf: form.watch("uf"), value: form.watch("cidade"), onChange: (v) => form.setValue("cidade", v) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Municípios cobertos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioMultiCombobox, { value: municipiosSel, onChange: setMunicipiosSel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Telefone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "(00) 00000-0000", ...form.register("telefone") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "E-mail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "contato@prestador.com.br", ...form.register("email") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Informações adicionais, pontos de referência, etc.", ...form.register("observacoes") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", variant: "gradient", disabled: save.isPending, children: [
            save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  PrestadoresPage as component
};
