import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { u as ue } from "./_libs/sonner.mjs";
import { u as useSensors, a as useSensor, D as DndContext, b as DragOverlay, P as PointerSensor, c as useDroppable, d as useDraggable } from "./_libs/dnd-kit__core.mjs";
import { B as Button, s as supabase, D as Dialog, a as DialogContent, b as DialogHeader, d as DialogTitle, c as cn, T as Textarea, i as DialogFooter, j as Badge, S as Select, e as SelectTrigger, f as SelectValue, g as SelectContent, h as SelectItem } from "./_ssr/router-lpyZtYZ-.mjs";
import { u as useAuth } from "./_ssr/use-auth-DVId8zUg.mjs";
import { P as PROSPECCAO_ETAPAS } from "./_ssr/domain-ZCtTbbBl.mjs";
import { I as Input, L as Label } from "./_ssr/label-CIdfpU9P.mjs";
import { u as useForm } from "./_libs/react-hook-form.mjs";
import { P as Popover, a as PopoverTrigger, b as PopoverContent, C as Command, c as CommandInput, d as CommandList, e as CommandEmpty, f as CommandGroup, g as CommandItem, E as EspecialidadeMultiSelect, U as UfSingleSelect, h as CidadeSingleCombobox, M as MunicipioMultiCombobox } from "./_ssr/especialidade-multiselect-cqGDn8yP.mjs";
import { P as Plus, b as LoaderCircle, h as ChevronsUpDown, a as Check, H as History, i as Phone, j as Mail, k as MessageCircle, l as MapPin, m as CircleCheck, G as GripVertical, n as Pencil, T as Trash2 } from "./_libs/lucide-react.mjs";

import "./_libs/tanstack__query-core.mjs";
import "./_libs/react-dom.mjs";
import "./_libs/dnd-kit__utilities.mjs";
import "./_libs/dnd-kit__accessibility.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/unenv.mjs";


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
function NewPrestadorModal({
  open,
  onClose,
  onSuccess
}) {
  useQueryClient();
  const [municipiosSel, setMunicipiosSel] = reactExports.useState([]);
  const [especialidadesSel, setEspecialidadesSel] = reactExports.useState([]);
  const [ufSede, setUfSede] = reactExports.useState("");
  const [cidadeSede, setCidadeSede] = reactExports.useState("");
  const form = useForm({
    defaultValues: {
      razao_social: "",
      nome_fantasia: "",
      cnpj: "",
      tipo: "clinica_medica",
      telefone: "",
      email: "",
      observacoes: ""
    }
  });
  const save = useMutation({
    mutationFn: async (v) => {
      const { data: prestador, error } = await supabase.from("prestadores").insert({
        ...v,
        uf: ufSede,
        cidade: cidadeSede
      }).select("id").single();
      if (error) throw error;
      const prestadorId = prestador.id;
      if (especialidadesSel.length) {
        const { data: espData } = await supabase.from("especialidades").select("id, nome").in("id", especialidadesSel);
        const rows = especialidadesSel.map((eid) => {
          const nome = espData?.find((e) => e.id === eid)?.nome || String(eid);
          return {
            prestador_id: prestadorId,
            especialidade_id: eid,
            especialidade: nome
          };
        });
        const { error: eError } = await supabase.from("prestador_especialidades").insert(rows);
        if (eError) throw eError;
      }
      if (municipiosSel.length) {
        const rows = municipiosSel.map((m) => ({
          prestador_id: prestadorId,
          municipio_codigo: m
        }));
        const { error: mError } = await supabase.from("prestador_municipios").insert(rows);
        if (mError) throw mError;
      }
      return prestadorId;
    },
    onSuccess: (id) => {
      ue.success("Prestador cadastrado com sucesso");
      onSuccess(id);
      onClose();
    },
    onError: (e) => ue.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Novo Prestador" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit((v) => save.mutate(v)), className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Razão social *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ex: Hospital Central de Exemplo Ltda", ...form.register("razao_social", { required: true }) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.watch("tipo"), onValueChange: (v) => form.setValue("tipo", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [
            { value: "consultorio", label: "Consultório" },
            { value: "clinica_medica", label: "Clínica Médica" },
            { value: "clinica_nao_medica", label: "Clínica Não Médica" },
            { value: "laboratorio", label: "Laboratório" },
            { value: "servico_imagem", label: "Serviço de Imagem" },
            { value: "policlinica", label: "Policlínica" },
            { value: "hospital", label: "Hospital" },
            { value: "servico_anestesiologia", label: "Serviços de Anestesiologia" },
            { value: "outro", label: "Outro" }
          ].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Especialidades atendidas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EspecialidadeMultiSelect, { value: especialidadesSel, onChange: setEspecialidadesSel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "UF *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            UfSingleSelect,
            {
              value: ufSede,
              onChange: (val) => {
                setUfSede(val);
                setCidadeSede("");
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cidade-sede *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CidadeSingleCombobox,
            {
              uf: ufSede,
              value: cidadeSede,
              onChange: setCidadeSede
            }
          )
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "contato@exemplo.com", ...form.register("email") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Informações adicionais, observações ou detalhes importantes...", ...form.register("observacoes") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
          "Cadastrar"
        ] })
      ] })
    ] })
  ] }) });
}
function ProspeccaoForm({
  open,
  onClose,
  editing,
  prestadores,
  projetos,
  userId
}) {
  const qc = useQueryClient();
  const [showNewPrestador, setShowNewPrestador] = reactExports.useState(false);
  const form = useForm({
    defaultValues: editing ? {
      prestador_id: String(editing.prestador_id),
      projeto_id: editing.projeto_id ? String(editing.projeto_id) : "",
      etapa: editing.etapa,
      prioridade: String(editing.prioridade ?? 0),
      data_inicio: editing.data_inicio ?? "",
      observacoes: editing.observacoes ?? ""
    } : {
      prestador_id: "",
      projeto_id: "",
      etapa: "identificado",
      prioridade: "0",
      data_inicio: "",
      observacoes: ""
    }
  });
  const save = useMutation({
    mutationFn: async (v) => {
      const payload = {
        prestador_id: Number(v.prestador_id),
        projeto_id: v.projeto_id ? Number(v.projeto_id) : null,
        etapa: v.etapa,
        prioridade: Number(v.prioridade) || 0,
        data_inicio: v.data_inicio || null,
        observacoes: v.observacoes || null,
        atualizado_em: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (editing) {
        const { error } = await supabase.from("prospeccoes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prospeccoes").insert({ ...payload, executivo_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      ue.success(editing ? "Prospecção atualizada" : "Prospecção criada");
      onClose();
    },
    onError: (e) => ue.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-visible flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar prospecção" : "Nova prospecção" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: form.handleSubmit((v) => {
          if (!v.prestador_id) return ue.error("Selecione um prestador");
          save.mutate(v);
        }),
        className: "space-y-4 py-1",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prestador *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "link",
                  size: "sm",
                  className: "h-auto p-0 text-xs",
                  onClick: () => setShowNewPrestador(true),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                    " Novo prestador"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  role: "combobox",
                  className: "w-full justify-between font-normal",
                  children: [
                    form.watch("prestador_id") ? prestadores.find((p) => String(p.id) === form.watch("prestador_id"))?.razao_social : "Selecione o prestador...",
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
                      filter: (value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Buscar prestador..." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "overflow-y-auto", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhum prestador encontrado." }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: prestadores.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            CommandItem,
                            {
                              value: p.razao_social,
                              onSelect: () => {
                                form.setValue("prestador_id", String(p.id));
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Check,
                                  {
                                    className: cn(
                                      "mr-2 h-4 w-4",
                                      form.watch("prestador_id") === String(p.id) ? "opacity-100" : "opacity-0"
                                    )
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.razao_social }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                                    p.cidade,
                                    "/",
                                    p.uf
                                  ] })
                                ] })
                              ]
                            },
                            p.id
                          )) })
                        ] })
                      ]
                    }
                  )
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Projeto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  role: "combobox",
                  className: "w-full justify-between font-normal",
                  children: [
                    form.watch("projeto_id") ? projetos.find((p) => String(p.id) === form.watch("projeto_id"))?.nome : "Selecione o projeto...",
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
                      filter: (value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Buscar projeto..." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "overflow-y-auto", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhum projeto encontrado." }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandGroup, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              CommandItem,
                              {
                                value: "",
                                onSelect: () => form.setValue("projeto_id", ""),
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Check,
                                    {
                                      className: cn(
                                        "mr-2 h-4 w-4",
                                        !form.watch("projeto_id") ? "opacity-100" : "opacity-0"
                                      )
                                    }
                                  ),
                                  "Nenhum"
                                ]
                              }
                            ),
                            projetos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              CommandItem,
                              {
                                value: p.nome,
                                onSelect: () => form.setValue("projeto_id", String(p.id)),
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Check,
                                    {
                                      className: cn(
                                        "mr-2 h-4 w-4",
                                        form.watch("projeto_id") === String(p.id) ? "opacity-100" : "opacity-0"
                                      )
                                    }
                                  ),
                                  p.nome
                                ]
                              },
                              p.id
                            ))
                          ] })
                        ] })
                      ]
                    }
                  )
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Etapa" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    role: "combobox",
                    className: "w-full justify-between font-normal",
                    children: [
                      form.watch("etapa") ? PROSPECCAO_ETAPAS.find((e) => e.value === form.watch("etapa"))?.label : "Selecione a etapa...",
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
                        filter: (value, search) => {
                          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                          return 0;
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Buscar etapa..." }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "overflow-y-auto", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Nenhuma etapa encontrada." }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: PROSPECCAO_ETAPAS.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              CommandItem,
                              {
                                value: e.label,
                                onSelect: () => form.setValue("etapa", e.value),
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Check,
                                    {
                                      className: cn(
                                        "mr-2 h-4 w-4",
                                        form.watch("etapa") === e.value ? "opacity-100" : "opacity-0"
                                      )
                                    }
                                  ),
                                  e.label
                                ]
                              },
                              e.value
                            )) })
                          ] })
                        ]
                      }
                    )
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prioridade" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "Ex: 1 (Alta), 5 (Baixa)", ...form.register("prioridade") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data de início" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", placeholder: "Data de início", ...form.register("data_inicio") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Informações adicionais, observações ou detalhes importantes...", ...form.register("observacoes") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending, children: [
              save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
              editing ? "Salvar" : "Criar"
            ] })
          ] })
        ]
      }
    ) }),
    showNewPrestador && /* @__PURE__ */ jsxRuntimeExports.jsx(
      NewPrestadorModal,
      {
        open: showNewPrestador,
        onClose: () => setShowNewPrestador(false),
        onSuccess: (id) => {
          form.setValue("prestador_id", String(id));
          qc.invalidateQueries({ queryKey: ["prestadores-opts"] });
        }
      }
    )
  ] }) });
}
const INTERACAO_TIPOS = [
  { value: "telefone", label: "Telefone", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "visita", label: "Visita", icon: MapPin },
  { value: "outro", label: "Outro", icon: History }
];
function ProspeccaoDetailsDialog({
  prospeccaoId,
  prospeccao,
  onClose
}) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: interacoes = [], isLoading } = useQuery({
    queryKey: ["interacoes", prospeccaoId],
    queryFn: async () => {
      const { data, error } = await supabase.from("interacoes_prospeccao").select("*").eq("prospeccao_id", prospeccaoId).order("data", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
  const addInteracao = useMutation({
    mutationFn: async (v) => {
      const { error } = await supabase.from("interacoes_prospeccao").insert({
        prospeccao_id: prospeccaoId,
        tipo: v.tipo,
        observacao: v.observacao,
        data: (/* @__PURE__ */ new Date()).toISOString(),
        autor_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interacoes", prospeccaoId] });
      ue.success("Interação registrada");
    }
  });
  const converter = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("prospeccoes").update({
        etapa: "credenciado",
        convertido_em: (/* @__PURE__ */ new Date()).toISOString(),
        atualizado_em: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", prospeccaoId);
      if (error) throw error;
      if (prospeccao?.projeto_id && prospeccao?.prestador_id) {
        const { data: projMun } = await supabase.from("projeto_municipios").select("municipio_codigo").eq("projeto_id", prospeccao.projeto_id);
        if (projMun && projMun.length > 0) {
          const rows = projMun.map((m) => ({
            prestador_id: prospeccao.prestador_id,
            municipio_codigo: m.municipio_codigo
          }));
          await supabase.from("prestador_municipios").upsert(rows, { onConflict: "prestador_id,municipio_codigo" });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      ue.success("Prestador marcado como credenciado!");
      onClose();
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Detalhes da Prospecção" }) }),
    prospeccao && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 rounded-lg bg-muted/30 border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: prospeccao.prestadores?.razao_social }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        prospeccao.prestadores?.cidade,
        "/",
        prospeccao.prestadores?.uf
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: prospeccao.projetos?.nome || "Sem projeto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: prospeccao.etapa }),
        prospeccao.convertido_em && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", children: [
          "Credenciado em ",
          new Date(prospeccao.convertido_em).toLocaleDateString()
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
          " Histórico de Interações"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : interacoes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nenhuma interação registrada." }) : interacoes.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border-l-2 border-primary/30 pl-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: i.tipo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(i.data).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: i.observacao })
        ] }, i.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-3", children: "Nova Interação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addInteracao.mutate({
                tipo: String(fd.get("tipo")),
                observacao: String(fd.get("observacao"))
              });
              e.target.reset();
            },
            className: "space-y-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { name: "tipo", defaultValue: "telefone", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INTERACAO_TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-3.5 w-3.5" }),
                  " ",
                  t.label
                ] }) }, t.value)) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { name: "observacao", placeholder: "O que foi conversado?", required: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", disabled: addInteracao.isPending, children: "Registrar" })
            ]
          }
        )
      ] }),
      !prospeccao?.convertido_em && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "pt-4 border-t border-border flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "success",
          onClick: () => {
            if (confirm("Confirmar credenciamento deste prestador?")) converter.mutate();
          },
          disabled: converter.isPending,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
            " Marcar como Credenciado"
          ]
        }
      ) })
    ] })
  ] }) });
}
async function fetchProspeccoes() {
  const {
    data,
    error
  } = await supabase.from("prospeccoes").select("*, prestadores(razao_social,cidade,uf,telefone,email), projetos(nome)").order("prioridade", {
    ascending: false
  }).order("id", {
    ascending: false
  });
  if (error) throw error;
  return data ?? [];
}
function ProspeccaoPage() {
  const qc = useQueryClient();
  const {
    user
  } = useAuth();
  const [search, setSearch] = reactExports.useState("");
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["prospeccoes"],
    queryFn: fetchProspeccoes
  });
  const {
    data: prestadores = []
  } = useQuery({
    queryKey: ["prestadores-opts"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("prestadores").select("id, razao_social, cidade, uf").order("razao_social");
      return data2 ?? [];
    }
  });
  const {
    data: projetos = []
  } = useQuery({
    queryKey: ["projetos-opts"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("projetos").select("id, nome, projeto_municipios(municipio_codigo)").order("nome");
      return data2 ?? [];
    }
  });
  const [openForm, setOpenForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [detailsId, setDetailsId] = reactExports.useState(null);
  const [activeId, setActiveId] = reactExports.useState(null);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6
    }
  }));
  const move = useMutation({
    mutationFn: async ({
      id,
      etapa
    }) => {
      const {
        error
      } = await supabase.from("prospeccoes").update({
        etapa,
        atualizado_em: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({
      id,
      etapa
    }) => {
      await qc.cancelQueries({
        queryKey: ["prospeccoes"]
      });
      const prev = qc.getQueryData(["prospeccoes"]);
      qc.setQueryData(["prospeccoes"], (old) => (old ?? []).map((p) => p.id === id ? {
        ...p,
        etapa
      } : p));
      return {
        prev
      };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["prospeccoes"], ctx.prev);
      ue.error("Não foi possível mover");
    },
    onSettled: () => qc.invalidateQueries({
      queryKey: ["prospeccoes"]
    })
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("prospeccoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["prospeccoes"]
      });
      ue.success("Prospecção removida");
    }
  });
  const onDragStart = (e) => setActiveId(Number(e.active.id));
  const onDragEnd = (e) => {
    setActiveId(null);
    if (!e.over) return;
    const id = Number(e.active.id);
    const etapa = String(e.over.id);
    const card = data.find((p) => p.id === id);
    if (card && card.etapa !== etapa) move.mutate({
      id,
      etapa
    });
  };
  const openNew = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setOpenForm(true);
  };
  const activeCard = data.find((p) => p.id === activeId);
  const filtered = reactExports.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((p) => {
      const haystack = [p.prestadores?.razao_social, p.prestadores?.cidade, p.projetos?.nome].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [data, search]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-3xl font-bold tracking-tight truncate", children: "Funil de Prospecção" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-muted-foreground mt-1", children: "Arraste os cards entre as etapas do funil." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "gradient", size: "sm", onClick: openNew, disabled: prestadores.length === 0, className: "shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Nova prospecção" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Nova" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar por nome, cidade, projeto...", className: "pl-3" }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
      " Carregando..."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(DndContext, { sensors, onDragStart, onDragEnd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col md:flex-row gap-3 flex-wrap pb-4", children: PROSPECCAO_ETAPAS.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(KanbanColumn, { id: col.value, title: col.label, items: filtered.filter((p) => p.etapa === col.value), onEdit: openEdit, onDetails: (id) => setDetailsId(id), onRemove: (id) => {
        if (confirm("Remover prospecção?")) remove.mutate(id);
      } }, col.value)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DragOverlay, { children: activeCard ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-elegant)] rotate-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: activeCard.prestadores?.razao_social }) }) : null })
    ] }),
    openForm && /* @__PURE__ */ jsxRuntimeExports.jsx(ProspeccaoForm, { open: openForm, onClose: () => setOpenForm(false), editing, prestadores, projetos, userId: user?.id ?? null }),
    detailsId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(ProspeccaoDetailsDialog, { prospeccaoId: detailsId, prospeccao: data.find((p) => p.id === detailsId) ?? null, onClose: () => setDetailsId(null) })
  ] });
}
function KanbanColumn({
  id,
  title,
  items,
  onEdit,
  onDetails,
  onRemove
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: `rounded-xl border border-border bg-muted/40 p-3 min-h-[150px] w-full md:w-[300px] transition-colors ${isOver ? "ring-2 ring-primary bg-accent/40" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground rounded-full bg-card px-2 py-0.5", children: items.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(DraggableCard, { p, onEdit, onDetails, onRemove }, p.id)) })
  ] });
}
function DraggableCard({
  p,
  onEdit,
  onDetails,
  onRemove
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useDraggable({
    id: p.id
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: `rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-soft)] ${isDragging ? "opacity-40" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 cursor-grab text-muted-foreground touch-none", ...attributes, ...listeners, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm leading-tight", children: p.prestadores?.razao_social ?? `#${p.prestador_id}` }),
        p.projetos?.nome && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: p.projetos.nome }),
        p.prestadores && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          p.prestadores.cidade,
          "/",
          p.prestadores.uf
        ] }),
        p.convertido_em && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "mt-1 gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
          " Convertido"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-0.5 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onDetails(p.id), title: "Detalhes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onEdit(p), title: "Editar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onRemove(p.id), title: "Remover", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
    ] })
  ] });
}
export {
  ProspeccaoPage as component
};
