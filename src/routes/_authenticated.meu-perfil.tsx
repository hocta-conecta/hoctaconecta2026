import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/meu-perfil")({
  component: MeuPerfilPage,
});

function MeuPerfilPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Seus dados de acesso.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Informações da sua conta atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>ID do usuário</Label>
            <Input value={user?.id ?? ""} readOnly className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
