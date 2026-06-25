import * as React from "react";
import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
const signupSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = React.useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nome: "", email: "", password: "" },
  });

  if (!loading && session) return <Navigate to="/dashboard" />;

  const onLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/dashboard" });
  });

  const onSignup = signupForm.handleSubmit(async (values) => {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        data: { nome: values.nome.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Conta criada! Bem-vindo.");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
      setMode("login");
    }
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[image:var(--gradient-surface)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)] mb-4">
            <LinkIcon className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Hocta Conecta
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de Rede Prestadora</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-elegant)]">
          <div className="grid grid-cols-2 gap-1 mb-6 rounded-lg bg-muted p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md py-2 text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={onLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com.br" autoComplete="email" {...loginForm.register("email")} />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...loginForm.register("password")} />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" variant="gradient" size="lg" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="animate-spin" />}
                Entrar no Sistema
              </Button>
            </form>
          ) : (
            <form onSubmit={onSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Seu nome" autoComplete="name" {...signupForm.register("nome")} />
                {signupForm.formState.errors.nome && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">E-mail</Label>
                <Input id="su-email" type="email" placeholder="seu@email.com.br" autoComplete="email" {...signupForm.register("email")} />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-password">Senha</Label>
                <Input id="su-password" type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" {...signupForm.register("password")} />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" variant="gradient" size="lg" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="animate-spin" />}
                Criar conta
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                O primeiro cadastro do sistema se torna administrador.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Hocta Conecta
        </p>
      </div>
    </div>
  );
}
