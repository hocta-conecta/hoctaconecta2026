import { createFileRoute, Outlet, redirect, Link, useRouter, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import {
  LayoutDashboard,
  Search,
  Users,
  KanbanSquare,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href } as never,
      });
    }
  },
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prospeccao", label: "Prospecção", icon: Search },
  { to: "/prestadores", label: "Prestadores", icon: Users },
  { to: "/projetos", label: "Projetos", icon: KanbanSquare },
  { to: "/admin", label: "Administração", icon: Settings },
  { to: "/meu-perfil", label: "Meu Perfil", icon: UserCircle },
] as const;

function AuthenticatedLayout() {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    router.navigate({ to: "/login" });
  };

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-transform md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-6 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground flex items-center justify-center shadow-[var(--shadow-soft)]">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Hocta Conecta</p>
            <p className="text-xs text-muted-foreground">Rede prestadora</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Conectado</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-border bg-card px-4 flex items-center gap-3 sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <p className="text-sm font-semibold">Hocta Conecta</p>
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
