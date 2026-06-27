import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { u as useForm } from "./_libs/react-hook-form.mjs";
import { u as useSensors, a as useSensor, D as DndContext, b as DragOverlay, P as PointerSensor, c as useDroppable, d as useDraggable } from "./_libs/dnd-kit__core.mjs";
import { u as ue } from "./_libs/sonner.mjs";
import { B as Button, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, S as Select, e as SelectTrigger, f as SelectValue, g as SelectContent, h as SelectItem, T as Textarea, i as DialogFooter, s as supabase, j as Badge, c as cn } from "./_ssr/router-AKv_mo6E.mjs";
import { a as PROJETO_STATUS } from "./_ssr/domain-ZCtTbbBl.mjs";
import { L as Label, I as Input } from "./_ssr/label-CtNBz39V.mjs";
import { M as MunicipioMultiCombobox, u as useEspecialidades, i as MunicipioSingleCombobox } from "./_ssr/especialidade-multiselect-BJBkakir.mjs";
import { P as Papa } from "./_libs/papaparse.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-BezCmyBd.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-B1K3eDtr.mjs";
import { P as Plus, b as LoaderCircle, o as Target, p as ChartColumn, G as GripVertical, n as Pencil, T as Trash2, q as Upload } from "./_libs/lucide-react.mjs";

import "./_libs/tanstack__query-core.mjs";
import "./_libs/unenv.mjs";


import "./_libs/react-dom.mjs";
import "./_libs/dnd-kit__utilities.mjs";
import "./_libs/dnd-kit__accessibility.mjs";
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
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
const Progress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = "Progress";
function ProjetoDetailsDialog({
  projetoId,
  projetoNome,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: projetoNome }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "metas", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "metas", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 mr-1" }),
          " Metas"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "benchmark", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 mr-1" }),
          " Benchmark"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "metas", className: "pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MetasPanel, { projetoId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "benchmark", className: "pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BenchmarkPanel, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Fechar" }) })
  ] }) });
}
function MetasPanel({ projetoId }) {
  const qc = useQueryClient();
  const { data: especialidades = [] } = useEspecialidades();
  const { data: metas = [], isLoading } = useQuery({
    queryKey: ["metas", projetoId],
    queryFn: async () => {
      const { data: metasData, error: metasError } = await supabase.from("metas_projeto").select("*").eq("projeto_id", projetoId).order("id");
      if (metasError) throw metasError;
      const { data: credenciados, error: credError } = await supabase.from("prospeccoes").select("prestador_id, prestadores(prestador_especialidades(especialidade_id), prestador_municipios(municipio_codigo))").eq("projeto_id", projetoId).eq("etapa", "credenciado");
      if (credError) throw credError;
      return (metasData ?? []).map((meta) => {
        const atingido = (credenciados ?? []).filter((c) => {
          const p = c.prestadores;
          if (!p) return false;
          const matchEsp = !meta.especialidade_id || p.prestador_especialidades?.some((e) => e.especialidade_id === meta.especialidade_id);
          const matchMun = !meta.municipio_codigo || p.prestador_municipios?.some((m) => m.municipio_codigo === meta.municipio_codigo);
          return matchEsp && matchMun;
        }).length;
        return { ...meta, atual: atingido };
      });
    }
  });
  const form = useForm({
    defaultValues: {
      especialidade_id: "",
      municipio_codigo: null,
      quantidade_meta: "0",
      observacao: ""
    }
  });
  const add = useMutation({
    mutationFn: async (v) => {
      const { error } = await supabase.from("metas_projeto").insert({
        projeto_id: projetoId,
        especialidade_id: v.especialidade_id ? Number(v.especialidade_id) : null,
        municipio_codigo: v.municipio_codigo,
        quantidade_meta: Number(v.quantidade_meta) || 0,
        observacao: v.observacao || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["metas", projetoId] });
      form.reset({ especialidade_id: "", municipio_codigo: null, quantidade_meta: "0", observacao: "" });
      ue.success("Meta adicionada");
    },
    onError: (e) => ue.error(e.message)
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("metas_projeto").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas", projetoId] })
  });
  const { data: municipios = [] } = useQuery({
    queryKey: ["municipios"],
    queryFn: async () => {
      const { data } = await supabase.from("municipios").select("codigo_ibge, nome, uf");
      return data ?? [];
    },
    staleTime: Infinity
  });
  const munMap = reactExports.useMemo(
    () => new Map(municipios.map((m) => [m.codigo_ibge, m])),
    [municipios]
  );
  const espMap = reactExports.useMemo(
    () => new Map(especialidades.map((e) => [e.id, e])),
    [especialidades]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: form.handleSubmit((v) => add.mutate(v)),
        className: "grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/30",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Especialidade (vazio = geral)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.watch("especialidade_id") || "all",
                onValueChange: (v) => form.setValue("especialidade_id", v === "all" ? "" : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Todas" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todas (meta geral)" }),
                    especialidades.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(e.id), children: e.nome }, e.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Município (vazio = projeto todo)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MunicipioSingleCombobox,
              {
                value: form.watch("municipio_codigo"),
                onChange: (c) => form.setValue("municipio_codigo", c)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Quantidade *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, ...form.register("quantidade_meta", { required: true }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Observação" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...form.register("observacao") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "sm", disabled: add.isPending, children: [
            add.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Adicionar meta"
          ] }) })
        ]
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando..." }) : metas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Nenhuma meta cadastrada para este projeto." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Especialidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Município" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Progresso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Meta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: metas.map((m) => {
        const e = m.especialidade_id ? espMap.get(m.especialidade_id) : null;
        const mun = m.municipio_codigo ? munMap.get(m.municipio_codigo) : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e?.nome ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Geral" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: mun ? `${mun.nome}/${mun.uf}` : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Projeto todo" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "min-w-[120px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                m.atual,
                " de ",
                m.quantidade_meta
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                Math.min(100, Math.round(m.atual / (m.quantidade_meta || 1) * 100)),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: m.atual / (m.quantidade_meta || 1) * 100, className: "h-1.5" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-semibold", children: m.quantidade_meta }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(m.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) }) })
        ] }, m.id);
      }) })
    ] })
  ] });
}
function BenchmarkPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["benchmarks"],
    queryFn: async () => {
      const { data: data2, error } = await supabase.from("benchmarks").select("*").order("id", { ascending: false }).limit(200);
      if (error) throw error;
      return data2 ?? [];
    }
  });
  const fileRef = reactExports.useRef(null);
  const [importing, setImporting] = reactExports.useState(false);
  const form = useForm({
    defaultValues: {
      origem: "mercado",
      especialidade_texto: "",
      uf: "",
      quantidade: "0",
      referencia_texto: ""
    }
  });
  const add = useMutation({
    mutationFn: async (v) => {
      const { error } = await supabase.from("benchmarks").insert({
        origem: v.origem,
        especialidade_texto: v.especialidade_texto || null,
        uf: v.uf ? v.uf.toUpperCase().slice(0, 2) : null,
        quantidade: Number(v.quantidade) || 0,
        referencia_texto: v.referencia_texto || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["benchmarks"] });
      ue.success("Benchmark adicionado");
      form.reset({ origem: "mercado", especialidade_texto: "", uf: "", quantidade: "0", referencia_texto: "" });
    },
    onError: (e) => ue.error(e.message)
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("benchmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benchmarks"] })
  });
  const importCSV = async (file) => {
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data.map((r) => ({
          origem: ["mercado", "projeto_anterior"].includes((r.origem || "").trim()) ? (r.origem || "").trim() : "mercado",
          especialidade_texto: (r.especialidade || "").trim() || null,
          uf: (r.uf || "").trim().toUpperCase().slice(0, 2) || null,
          quantidade: Number(r.quantidade) || 0,
          referencia_texto: (r.referencia || "").trim() || null
        })).filter((r) => r.quantidade > 0);
        if (rows.length === 0) {
          ue.error("CSV vazio ou inválido");
          setImporting(false);
          return;
        }
        const { error } = await supabase.from("benchmarks").insert(rows);
        setImporting(false);
        if (error) {
          ue.error(error.message);
          return;
        }
        ue.success(`${rows.length} benchmarks importados`);
        qc.invalidateQueries({ queryKey: ["benchmarks"] });
      },
      error: (err) => {
        setImporting(false);
        ue.error(err.message);
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: ".csv",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) importCSV(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => fileRef.current?.click(), disabled: importing, children: [
        importing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
        "Importar CSV"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Colunas: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "origem,especialidade,uf,quantidade,referencia" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: form.handleSubmit((v) => add.mutate(v)),
        className: "grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 rounded-lg border border-border bg-muted/30",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.watch("origem"), onValueChange: (v) => form.setValue("origem", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mercado", children: "Mercado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "projeto_anterior", children: "Projeto anterior" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Especialidade", ...form.register("especialidade_texto") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "UF", maxLength: 2, ...form.register("uf") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Qtd", type: "number", ...form.register("quantidade") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Adicionar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Referência (opcional)",
              className: "sm:col-span-5",
              ...form.register("referencia_texto")
            }
          )
        ]
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Carregando..." }) : data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Nenhum benchmark cadastrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Origem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Especialidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "UF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Qtd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Referência" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: data.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: b.origem === "mercado" ? "default" : "secondary", children: b.origem === "mercado" ? "Mercado" : "Projeto anterior" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.especialidade_texto ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.uf ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-semibold", children: b.quantidade }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground max-w-xs truncate", children: b.referencia_texto ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(b.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) }) })
      ] }, b.id)) })
    ] })
  ] });
}
async function fetchProjetos() {
  const {
    data,
    error
  } = await supabase.from("projetos").select("*, clientes(nome), projeto_municipios(municipio_codigo)").order("id", {
    ascending: false
  });
  if (error) throw error;
  return data ?? [];
}
function ProjetosPage() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["projetos"],
    queryFn: fetchProjetos
  });
  const {
    data: clientes = []
  } = useQuery({
    queryKey: ["clientes-opts"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("clientes").select("id, nome").order("nome");
      return data2 ?? [];
    }
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [activeId, setActiveId] = reactExports.useState(null);
  const [municipiosSel, setMunicipiosSel] = reactExports.useState([]);
  const [detailsProjeto, setDetailsProjeto] = reactExports.useState(null);
  const form = useForm({
    defaultValues: {
      nome: "",
      cliente_id: "",
      descricao: "",
      data_inicio: "",
      data_prevista: "",
      status: "ativo"
    }
  });
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6
    }
  }));
  const move = useMutation({
    mutationFn: async ({
      id,
      status
    }) => {
      const {
        error
      } = await supabase.from("projetos").update({
        status
      }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({
      id,
      status
    }) => {
      await qc.cancelQueries({
        queryKey: ["projetos"]
      });
      const prev = qc.getQueryData(["projetos"]);
      qc.setQueryData(["projetos"], (old) => (old ?? []).map((p) => p.id === id ? {
        ...p,
        status
      } : p));
      return {
        prev
      };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["projetos"], ctx.prev);
      ue.error("Não foi possível mover o projeto");
    },
    onSettled: () => qc.invalidateQueries({
      queryKey: ["projetos"]
    })
  });
  const save = useMutation({
    mutationFn: async (values) => {
      const payload = {
        nome: values.nome,
        cliente_id: values.cliente_id ? Number(values.cliente_id) : null,
        descricao: values.descricao || null,
        data_inicio: values.data_inicio || null,
        data_prevista: values.data_prevista || null,
        status: values.status
      };
      let projetoId;
      if (editing) {
        const {
          error
        } = await supabase.from("projetos").update(payload).eq("id", editing.id);
        if (error) throw error;
        projetoId = editing.id;
      } else {
        const {
          data: inserted,
          error
        } = await supabase.from("projetos").insert(payload).select("id").single();
        if (error) throw error;
        projetoId = inserted.id;
      }
      await supabase.from("projeto_municipios").delete().eq("projeto_id", projetoId);
      if (municipiosSel.length) {
        const rows = municipiosSel.map((c) => ({
          projeto_id: projetoId,
          municipio_codigo: c
        }));
        const {
          error: e2
        } = await supabase.from("projeto_municipios").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projetos"]
      });
      ue.success(editing ? "Projeto atualizado" : "Projeto criado");
      setOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projetos"]
      });
      ue.success("Projeto removido");
    },
    onError: (e) => ue.error(e.message)
  });
  const openNew = () => {
    setEditing(null);
    form.reset({
      nome: "",
      cliente_id: "",
      descricao: "",
      data_inicio: "",
      data_prevista: "",
      status: "ativo"
    });
    setMunicipiosSel([]);
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    form.reset({
      nome: p.nome,
      cliente_id: p.cliente_id ? String(p.cliente_id) : "",
      descricao: p.descricao ?? "",
      data_inicio: p.data_inicio ?? "",
      data_prevista: p.data_prevista ?? "",
      status: p.status
    });
    setMunicipiosSel((p.projeto_municipios ?? []).map((m) => m.municipio_codigo));
    setOpen(true);
  };
  const onDragStart = (e) => setActiveId(Number(e.active.id));
  const onDragEnd = (e) => {
    setActiveId(null);
    const {
      active,
      over
    } = e;
    if (!over) return;
    const id = Number(active.id);
    const newStatus = String(over.id);
    const proj = data.find((p) => p.id === id);
    if (proj && proj.status !== newStatus) move.mutate({
      id,
      status: newStatus
    });
  };
  const activeProj = data.find((p) => p.id === activeId) ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-3xl font-bold tracking-tight truncate", children: "Projetos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: "Arraste os cartões para alterar o status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "gradient", size: "sm", onClick: openNew, className: "shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Novo projeto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Novo" })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
      " Carregando..."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(DndContext, { sensors, onDragStart, onDragEnd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-3", children: PROJETO_STATUS.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(Column, { id: col.value, title: col.label, projetos: data.filter((p) => p.status === col.value), onEdit: openEdit, onOpenDetails: (p) => setDetailsProjeto(p), onRemove: (id) => {
        if (confirm("Remover este projeto?")) remove.mutate(id);
      } }, col.value)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DragOverlay, { children: activeProj ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProjetoCard, { projeto: activeProj, overlay: true }) : null })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar projeto" : "Novo projeto" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit((v) => save.mutate(v)), className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ex: Credenciamento Nacional 2024", ...form.register("nome", {
            required: true
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.watch("cliente_id"), onValueChange: (v) => form.setValue("cliente_id", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Nenhum" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: clientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.nome }, c.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.watch("status"), onValueChange: (v) => form.setValue("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PROJETO_STATUS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descrição" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Descreva os objetivos e escopo do projeto...", ...form.register("descricao") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Municípios do projeto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MunicipioMultiCombobox, { value: municipiosSel, onChange: setMunicipiosSel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data de início" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", placeholder: "Data de início", ...form.register("data_inicio") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data prevista" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", placeholder: "Data prevista", ...form.register("data_prevista") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", variant: "gradient", disabled: save.isPending, children: [
            save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] }) }),
    detailsProjeto && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjetoDetailsDialog, { projetoId: detailsProjeto.id, projetoNome: detailsProjeto.nome, onClose: () => setDetailsProjeto(null) })
  ] });
}
function Column({
  id,
  title,
  projetos,
  onEdit,
  onOpenDetails,
  onRemove
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: `rounded-xl border border-border bg-muted/40 p-3 transition-colors ${isOver ? "ring-2 ring-primary bg-accent/40" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground rounded-full bg-card px-2 py-0.5", children: projetos.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 min-h-24", children: projetos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(DraggableCard, { projeto: p, onEdit, onOpenDetails, onRemove }, p.id)) })
  ] });
}
function DraggableCard({
  projeto,
  onEdit,
  onOpenDetails,
  onRemove
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useDraggable({
    id: projeto.id
  });
  const nMun = projeto.projeto_municipios?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: `rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)] ${isDragging ? "opacity-40" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 cursor-grab text-muted-foreground touch-none", ...attributes, ...listeners, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium leading-tight", children: projeto.nome }),
        projeto.clientes?.nome && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: projeto.clientes.nome }),
        nMun > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          nMun,
          " ",
          nMun === 1 ? "município" : "municípios"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onOpenDetails(projeto), title: "Metas e benchmark", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onEdit(projeto), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onRemove(projeto.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
    ] })
  ] });
}
function ProjetoCard({
  projeto,
  overlay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border border-border bg-card p-3 ${overlay ? "shadow-[var(--shadow-elegant)] rotate-2" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium leading-tight", children: projeto.nome }),
    projeto.clientes?.nome && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: projeto.clientes.nome })
  ] });
}
export {
  ProjetosPage as component
};
