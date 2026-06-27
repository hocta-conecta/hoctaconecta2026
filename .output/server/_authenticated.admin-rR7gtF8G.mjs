import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { u as ue } from "./_libs/sonner.mjs";
import { D as Dialog, k as DialogTrigger, B as Button, S as Select, e as SelectTrigger, f as SelectValue, g as SelectContent, h as SelectItem, j as Badge, a as DialogContent, b as DialogHeader, d as DialogTitle, i as DialogFooter, s as supabase } from "./_ssr/router-9OAGKXBy.mjs";
import { u as useAuth } from "./_ssr/use-auth-Bt-qVQ-d.mjs";
import { A as APP_ROLES, l as labelOf, C as CLIENTE_TIPOS } from "./_ssr/domain-ZCtTbbBl.mjs";
import { C as Card, b as CardContent, a as CardHeader, c as CardTitle, d as CardDescription } from "./_ssr/card-BXTcmvZd.mjs";
import { L as Label, I as Input } from "./_ssr/label-B-REmIUr.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-DHAdtzXK.mjs";
import { b as LoaderCircle, v as ShieldAlert, w as UserCog, P as Plus, x as Building2, n as Pencil } from "./_libs/lucide-react.mjs";

import "./_libs/tanstack__query-core.mjs";
import "./_libs/react-dom.mjs";
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
function AdminPage() {
  const {
    isAdmin,
    loading
  } = useAuth();
  const qc = useQueryClient();
  const [openNewUser, setOpenNewUser] = reactExports.useState(false);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{
        data: profiles
      }, {
        data: roles
      }] = await Promise.all([supabase.from("profiles").select("*").order("criado_em"), supabase.from("user_roles").select("user_id, role")]);
      const roleMap = /* @__PURE__ */ new Map();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role));
      return (profiles ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? "cliente"
      }));
    }
  });
  const setRole = useMutation({
    mutationFn: async ({
      userId,
      role
    }) => {
      const del = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (del.error) throw del.error;
      const ins = await supabase.from("user_roles").insert({
        user_id: userId,
        role
      });
      if (ins.error) throw ins.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-users"]
      });
      ue.success("Papel atualizado");
    },
    onError: (e) => ue.error(e.message)
  });
  const toggleAtivo = useMutation({
    mutationFn: async ({
      userId,
      ativo
    }) => {
      const {
        error
      } = await supabase.from("profiles").update({
        ativo
      }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-users"]
      });
      ue.success("Status atualizado");
    },
    onError: (e) => ue.error(e.message)
  });
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
      " Carregando..."
    ] });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-6 w-6 text-warning-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Acesso restrito" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Apenas administradores podem gerenciar usuários e papéis." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Administração" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Gestão de usuários, papéis de acesso e clientes." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-5 w-5" }),
            " Usuários"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Gestão de usuários, papéis e status de acesso." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openNewUser, onOpenChange: setOpenNewUser, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            " Novo Usuário"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NewUserDialog, { onSuccess: () => {
            setOpenNewUser(false);
            qc.invalidateQueries({
              queryKey: ["admin-users"]
            });
          } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
        " Carregando..."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Papel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ação" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (data ?? []).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: u.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: u.role, onValueChange: (v) => setRole.mutate({
            userId: u.id,
            role: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APP_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.ativo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Ativo" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inativo" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => toggleAtivo.mutate({
            userId: u.id,
            ativo: !u.ativo
          }), children: u.ativo ? "Desativar" : "Ativar" }) })
        ] }, u.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClientesSection, {})
  ] });
}
function ClientesSection() {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const {
    data: clientes,
    isLoading
  } = useQuery({
    queryKey: ["admin-clientes"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("clientes").select("*").order("nome");
      if (error) throw error;
      return data ?? [];
    }
  });
  const upsert = useMutation({
    mutationFn: async (payload) => {
      if (editing) {
        const {
          error
        } = await supabase.from("clientes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("clientes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin-clientes"]
      });
      ue.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
      setOpen(false);
      setEditing(null);
    },
    onError: (e) => ue.error(e.message)
  });
  const toggleAtivo = useMutation({
    mutationFn: async (c) => {
      const {
        error
      } = await supabase.from("clientes").update({
        ativo: !c.ativo
      }).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["admin-clientes"]
    }),
    onError: (e) => ue.error(e.message)
  });
  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c) {
    setEditing(c);
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5" }),
          " Clientes / Operadoras"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Cadastro de operadoras, convênios e cartões de saúde." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Novo cliente"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClienteDialog, { editing, onSubmit: (payload) => upsert.mutate(payload), saving: upsert.isPending })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }),
      " Carregando..."
    ] }) : (clientes ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: 'Nenhum cliente cadastrado. Clique em "Novo cliente" para começar.' }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contato" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (clientes ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.nome }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: labelOf(CLIENTE_TIPOS, c.tipo) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.contato_nome || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.contato_email || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.contato_tel || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.ativo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", children: "Ativo" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inativo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEdit(c), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
            " Editar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => toggleAtivo.mutate(c), children: c.ativo ? "Desativar" : "Ativar" })
        ] })
      ] }, c.id)) })
    ] }) })
  ] });
}
function NewUserDialog({
  onSuccess
}) {
  const [nome, setNome] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [senha, setSenha] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("executivo");
  const [loading, setLoading] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      ue.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (senha.length < 6) {
      ue.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            nome: nome.trim()
          },
          emailRedirectTo: window.location.origin
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário");
      if (role !== "executivo") {
        await supabase.from("user_roles").delete().eq("user_id", authData.user.id);
        const {
          error: roleError
        } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role
        });
        if (roleError) throw roleError;
      }
      ue.success(`Usuário **${nome}** criado com sucesso! Papel: ${role}`);
      setNome("");
      setEmail("");
      setSenha("");
      setRole("executivo");
      onSuccess();
    } catch (err) {
      console.error(err);
      ue.error(err.message || "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Novo Usuário" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "novo-nome", children: "Nome Completo *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "novo-nome", placeholder: "Ex: João Silva", value: nome, onChange: (e) => setNome(e.target.value), disabled: loading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "novo-email", children: "E-mail *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "novo-email", type: "email", placeholder: "usuario@hocta.com.br", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "novo-senha", children: "Senha Temporária *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "novo-senha", type: "password", placeholder: "Mínimo 6 caracteres", value: senha, onChange: (e) => setSenha(e.target.value), disabled: loading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Papel (Role) *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: role, onValueChange: (v) => setRole(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { disabled: loading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APP_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Criar Usuário"
      ] }) })
    ] })
  ] });
}
function ClienteDialog({
  editing,
  onSubmit,
  saving
}) {
  const [nome, setNome] = reactExports.useState(editing?.nome ?? "");
  const [tipo, setTipo] = reactExports.useState(editing?.tipo ?? "convenio_ans");
  const [contatoNome, setContatoNome] = reactExports.useState(editing?.contato_nome ?? "");
  const [contatoEmail, setContatoEmail] = reactExports.useState(editing?.contato_email ?? "");
  const [contatoTel, setContatoTel] = reactExports.useState(editing?.contato_tel ?? "");
  reactExports.useEffect(() => {
    setNome(editing?.nome ?? "");
    setTipo(editing?.tipo ?? "convenio_ans");
    setContatoNome(editing?.contato_nome ?? "");
    setContatoEmail(editing?.contato_email ?? "");
    setContatoTel(editing?.contato_tel ?? "");
  }, [editing]);
  function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) {
      ue.error("Nome é obrigatório");
      return;
    }
    onSubmit({
      nome: nome.trim(),
      tipo,
      contato_nome: contatoNome.trim() || null,
      contato_email: contatoEmail.trim() || null,
      contato_tel: contatoTel.trim() || null
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar Cliente" : "Novo Cliente" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nome", children: "Nome da Operadora *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "nome", placeholder: "Ex: Unimed Nacional, Bradesco Saúde...", value: nome, onChange: (e) => setNome(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: setTipo, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CLIENTE_TIPOS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contato_nome", children: "Nome do Contato" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "contato_nome", placeholder: "Nome do gestor ou ponto focal", value: contatoNome, onChange: (e) => setContatoNome(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contato_email", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "contato_email", type: "email", placeholder: "contato@operadora.com.br", value: contatoEmail, onChange: (e) => setContatoEmail(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contato_tel", children: "Telefone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "contato_tel", placeholder: "(00) 00000-0000", value: contatoTel, onChange: (e) => setContatoTel(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        editing ? "Salvar" : "Cadastrar"
      ] }) })
    ] })
  ] });
}
export {
  AdminPage as component
};
