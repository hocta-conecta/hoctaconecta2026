import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert, UserCog, Building2, Plus, Pencil, Mail } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { APP_ROLES, CLIENTE_TIPOS, labelOf } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Profile = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criado_em: string;
};
type UserRole = { user_id: string; role: AppRole };

type Cliente = {
  id: number;
  nome: string;
  tipo: string;
  contato_nome: string | null;
  contato_email: string | null;
  contato_tel: string | null;
  ativo: boolean;
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const [openNewUser, setOpenNewUser] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("criado_em"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, AppRole>();
      (roles as UserRole[] | null)?.forEach((r) => roleMap.set(r.user_id, r.role));
      return ((profiles ?? []) as Profile[]).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? ("cliente" as AppRole),
      }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const del = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (del.error) throw del.error;
      const ins = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (ins.error) throw ins.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Papel atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ userId, ativo }: { userId: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ativo })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="animate-spin h-4 w-4" /> Carregando...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg">
        <CardContent className="pt-6 flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-warning-foreground shrink-0" />
          <div>
            <p className="font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground mt-1">
              Apenas administradores podem gerenciar usuários e papéis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground mt-1">
          Gestão de usuários, papéis de acesso e clientes.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" /> Usuários
            </CardTitle>
            <CardDescription>
              Gestão de usuários, papéis e status de acesso.
            </CardDescription>
          </div>
          <Dialog open={openNewUser} onOpenChange={setOpenNewUser}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <NewUserDialog
              onSuccess={() => {
                setOpenNewUser(false);
                qc.invalidateQueries({ queryKey: ["admin-users"] });
              }}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="animate-spin h-4 w-4" /> Carregando...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="w-44">
                      <Select
                        value={u.role}
                        onValueChange={(v) =>
                          setRole.mutate({ userId: u.id, role: v as AppRole })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APP_ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {u.ativo ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleAtivo.mutate({ userId: u.id, ativo: !u.ativo })
                        }
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientesSection />
    </div>
  );
}

function ClientesSection() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["admin-clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Cliente[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Partial<Cliente>) => {
      if (editing) {
        const { error } = await supabase
          .from("clientes")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clientes"] });
      toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (c: Cliente) => {
      const { error } = await supabase
        .from("clientes")
        .update({ ativo: !c.ativo })
        .eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clientes"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c: Cliente) {
    setEditing(c);
    setOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Clientes / Operadoras
          </CardTitle>
          <CardDescription>
            Cadastro de operadoras, convênios e cartões de saúde.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo cliente
            </Button>
          </DialogTrigger>
          <ClienteDialog
            editing={editing}
            onSubmit={(payload) => upsert.mutate(payload)}
            saving={upsert.isPending}
          />
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="animate-spin h-4 w-4" /> Carregando...
          </div>
        ) : (clientes ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            Nenhum cliente cadastrado. Clique em "Novo cliente" para começar.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(clientes ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{labelOf(CLIENTE_TIPOS, c.tipo)}</TableCell>
                  <TableCell>{c.contato_nome || "—"}</TableCell>
                  <TableCell>{c.contato_email || "—"}</TableCell>
                  <TableCell>{c.contato_tel || "—"}</TableCell>
                  <TableCell>
                    {c.ativo ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAtivo.mutate(c)}
                    >
                      {c.ativo ? "Desativar" : "Ativar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function NewUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [role, setRole] = React.useState<AppRole>("executivo");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: { nome: nome.trim() },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário");

      // 2. Atualizar o papel (role) do usuário
      if (role !== "executivo") {
        // Remover papel anterior e inserir novo
        await supabase.from("user_roles").delete().eq("user_id", authData.user.id);
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role });
        if (roleError) throw roleError;
      }

      toast.success(
        `Usuário **${nome}** criado com sucesso! Papel: ${role}`
      );
      setNome("");
      setEmail("");
      setSenha("");
      setRole("executivo");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Novo Usuário</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="novo-nome">Nome Completo *</Label>
          <Input
            id="novo-nome"
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="novo-email">E-mail *</Label>
          <Input
            id="novo-email"
            type="email"
            placeholder="usuario@hocta.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="novo-senha">Senha Temporária *</Label>
          <Input
            id="novo-senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Papel (Role) *</Label>
          <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
            <SelectTrigger disabled={loading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Usuário
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function ClienteDialog({
  editing,
  onSubmit,
  saving,
}: {
  editing: Cliente | null;
  onSubmit: (payload: Partial<Cliente>) => void;
  saving: boolean;
}) {
  const [nome, setNome] = React.useState(editing?.nome ?? "");
  const [tipo, setTipo] = React.useState(editing?.tipo ?? "convenio_ans");
  const [contatoNome, setContatoNome] = React.useState(editing?.contato_nome ?? "");
  const [contatoEmail, setContatoEmail] = React.useState(editing?.contato_email ?? "");
  const [contatoTel, setContatoTel] = React.useState(editing?.contato_tel ?? "");

  React.useEffect(() => {
    setNome(editing?.nome ?? "");
    setTipo(editing?.tipo ?? "convenio_ans");
    setContatoNome(editing?.contato_nome ?? "");
    setContatoEmail(editing?.contato_email ?? "");
    setContatoTel(editing?.contato_tel ?? "");
  }, [editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    onSubmit({
      nome: nome.trim(),
      tipo,
      contato_nome: contatoNome.trim() || null,
      contato_email: contatoEmail.trim() || null,
      contato_tel: contatoTel.trim() || null,
    });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Operadora *</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENTE_TIPOS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contato_nome">Nome do Contato</Label>
          <Input
            id="contato_nome"
            value={contatoNome}
            onChange={(e) => setContatoNome(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="contato_email">E-mail</Label>
            <Input
              id="contato_email"
              type="email"
              value={contatoEmail}
              onChange={(e) => setContatoEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contato_tel">Telefone</Label>
            <Input
              id="contato_tel"
              value={contatoTel}
              onChange={(e) => setContatoTel(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
