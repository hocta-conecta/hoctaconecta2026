import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useRouter, e as useRouterState, L as Link$1, O as Outlet } from "./_libs/tanstack__react-router.mjs";
import { c as cn, B as Button, s as supabase } from "./_ssr/router-lpyZtYZ-.mjs";
import { u as useAuth } from "./_ssr/use-auth-DVId8zUg.mjs";
import { u as ue } from "./_libs/sonner.mjs";
import { L as Link, c as LayoutDashboard, S as Search, U as Users, d as SquareKanban, e as Settings, f as CircleUser, g as LogOut, M as Menu } from "./_libs/lucide-react.mjs";

import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/unenv.mjs";


import "./_libs/seroval-plugins.mjs";


import "./_libs/react-dom.mjs";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
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
const navItems = [{
  to: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  to: "/prospeccao",
  label: "Prospecção",
  icon: Search
}, {
  to: "/prestadores",
  label: "Prestadores",
  icon: Users
}, {
  to: "/projetos",
  label: "Projetos",
  icon: SquareKanban
}, {
  to: "/admin",
  label: "Administração",
  icon: Settings
}, {
  to: "/meu-perfil",
  label: "Meu Perfil",
  icon: CircleUser
}];
function AuthenticatedLayout() {
  const router = useRouter();
  const {
    user
  } = useAuth();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    ue.success("Sessão encerrada");
    router.navigate({
      to: "/login"
    });
  };
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-transform md:relative md:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 border-b border-sidebar-border flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground flex items-center justify-center shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold leading-tight", children: "Hocta Conecta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rede prestadora" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 px-3 py-4 space-y-1", children: navItems.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link$1, { to: item.to, onClick: () => setMobileOpen(false), className: cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-soft)]" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
          item.label
        ] }, item.to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold", children: initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: user?.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Conectado" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "w-full justify-start gap-2", onClick: handleLogout, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          "Sair"
        ] })
      ] })
    ] }),
    mobileOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-30 bg-black/30 md:hidden", onClick: () => setMobileOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "md:hidden h-14 border-b border-border bg-card px-4 flex items-center gap-3 sticky top-0 z-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setMobileOpen(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Hocta Conecta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AuthenticatedLayout as component
};
