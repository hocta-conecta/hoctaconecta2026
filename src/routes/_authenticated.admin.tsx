import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert, UserCog } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { APP_ROLES } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();

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
          Gestão de usuários e papéis de acesso.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" /> Usuários
          </CardTitle>
          <CardDescription>
            Novos usuários entram pela tela de cadastro. Aqui você ajusta papéis e status.
          </CardDescription>
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
    </div>
  );
}
