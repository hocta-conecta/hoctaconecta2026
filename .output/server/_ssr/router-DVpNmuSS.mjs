import { c as createRouter, a as createRootRouteWithContext, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect } from "../_libs/tanstack__router-core.mjs";
import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { $ as $e } from "../_libs/sonner.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as DialogPortal, b as DialogOverlay, c as DialogContent$1, d as DialogClose, e as DialogTitle$1, f as DialogDescription$1, D as Dialog$1, g as DialogTrigger$1 } from "../_libs/radix-ui__react-dialog.mjs";
import { S as SelectTrigger$1, a as SelectIcon, b as SelectPortal, c as SelectContent$1, d as SelectViewport, e as SelectItem$1, f as SelectItemIndicator, g as SelectItemText, h as Select$1, i as SelectValue$1 } from "../_libs/radix-ui__react-select.mjs";
import { X, C as ChevronDown, a as Check } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";

import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const styles = "/assets/styles-Bc0sI3CW.css";
const Route$9 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hocta Conecta — Gestão de Rede Prestadora" },
      {
        name: "description",
        content: "Plataforma para gestão da rede prestadora Hocta: prospecção, prestadores, projetos e administração."
      },
      { property: "og:title", content: "Hocta Conecta — Gestão de Rede Prestadora" },
      { name: "twitter:title", content: "Hocta Conecta — Gestão de Rede Prestadora" },
      { name: "description", content: "A simple notepad application for creating and managing notes." },
      { property: "og:description", content: "A simple notepad application for creating and managing notes." },
      { name: "twitter:description", content: "A simple notepad application for creating and managing notes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86acfc4f-a1bc-44ed-8178-b40b26beae46/id-preview-c948a85f--838d786f-5570-46b0-9933-afe2f560e954.lovable.app-1782383861424.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86acfc4f-a1bc-44ed-8178-b40b26beae46/id-preview-c948a85f--838d786f-5570-46b0-9933-afe2f560e954.lovable.app-1782383861424.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [{ rel: "stylesheet", href: styles }]
  }),
  shellComponent: RootShell,
  component: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
  notFoundComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Página não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "O endereço acessado não existe." })
  ] }) })
});
function RootShell({ children }) {
  const { queryClient } = Route$9.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx($e, { richColors: true, position: "top-right" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$7 = () => import("./login-rjanuEzY.mjs");
objectType({
  email: stringType().email("E-mail inválido"),
  password: stringType().min(1, "Informe a senha")
});
const Route$8 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const SUPABASE_URL = "https://ogoaswmsdvnwkvgmbcpr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_laRVOh3D8QTTwD5C7fNoKQ_ZVbQNekw";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : void 0
  }
});
const $$splitComponentImporter$6 = () => import("../_authenticated-Cn0sCubO.mjs");
const Route$7 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({
    location
  }) => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const Route$6 = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  }
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-soft)]",
        gradient: "text-primary-foreground hover:opacity-95 shadow-[var(--shadow-elegant)] bg-[image:var(--gradient-primary)]",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/20 text-warning-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground"
      }
    },
    defaultVariants: { variant: "default" }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Dialog = Dialog$1;
const DialogTrigger = DialogTrigger$1;
const DialogContent = reactExports.forwardRef(({ className, children, onInteractOutside, onPointerDownOutside, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, { className: "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent$1,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-elegant)] rounded-xl max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      ),
      onPointerDownOutside: (e) => {
        const target = e.target;
        if (target?.closest("[data-radix-popper-content-wrapper]") || target?.closest("[data-sonner-toaster]") || target?.closest("[role='listbox']")) {
          e.preventDefault();
          return;
        }
        onPointerDownOutside?.(e);
      },
      onInteractOutside: (e) => {
        const target = e.target;
        if (target?.closest("[data-radix-popper-content-wrapper]") || target?.closest("[data-sonner-toaster]") || target?.closest("[role='listbox']")) {
          e.preventDefault();
          return;
        }
        onInteractOutside?.(e);
      },
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogClose, { className: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Fechar" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = "DialogContent";
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-1.5 text-left", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className),
      ...props
    }
  );
}
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogTitle$1,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = "DialogTitle";
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogDescription$1,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = "DialogDescription";
const Select = Select$1;
const SelectValue = SelectValue$1;
const SelectTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectTrigger$1,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectIcon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
const SelectContent = reactExports.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectContent$1,
  {
    ref,
    className: cn(
      "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-[var(--shadow-elegant)] data-[state=open]:animate-in data-[state=open]:fade-in-0",
      position === "popper" && "data-[side=bottom]:translate-y-1",
      className
    ),
    position,
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectViewport,
      {
        className: cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        ),
        children
      }
    )
  }
) }));
SelectContent.displayName = "SelectContent";
const SelectItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectItem$1,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
const Textarea = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      ref,
      className: cn(
        "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
});
Textarea.displayName = "Textarea";
const $$splitComponentImporter$5 = () => import("../_authenticated.prospeccao-gOWvSCs4.mjs");
const Route$5 = createFileRoute("/_authenticated/prospeccao")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("../_authenticated.projetos-D3sPRIGT.mjs");
const Route$4 = createFileRoute("/_authenticated/projetos")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("../_authenticated.prestadores-BQMe92e-.mjs");
const Route$3 = createFileRoute("/_authenticated/prestadores")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("../_authenticated.meu-perfil-D2NPEUp2.mjs");
const Route$2 = createFileRoute("/_authenticated/meu-perfil")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("../_authenticated.dashboard-Czgs25O5.mjs");
const Route$1 = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("../_authenticated.admin-CBdHuFKc.mjs");
const Route = createFileRoute("/_authenticated/admin")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$8.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$9
});
const AuthenticatedRoute = Route$7.update({
  id: "/_authenticated",
  getParentRoute: () => Route$9
});
const IndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const AuthenticatedProspeccaoRoute = Route$5.update({
  id: "/prospeccao",
  path: "/prospeccao",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedProjetosRoute = Route$4.update({
  id: "/projetos",
  path: "/projetos",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedPrestadoresRoute = Route$3.update({
  id: "/prestadores",
  path: "/prestadores",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedMeuPerfilRoute = Route$2.update({
  id: "/meu-perfil",
  path: "/meu-perfil",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedDashboardRoute = Route$1.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminRoute = Route.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedRouteChildren = {
  AuthenticatedAdminRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedMeuPerfilRoute,
  AuthenticatedPrestadoresRoute,
  AuthenticatedProjetosRoute,
  AuthenticatedProspeccaoRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 3e4, refetchOnWindowFocus: false }
    }
  });
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true
  });
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Button as B,
  Dialog as D,
  Select as S,
  Textarea as T,
  DialogContent as a,
  DialogHeader as b,
  cn as c,
  DialogTitle as d,
  SelectTrigger as e,
  SelectValue as f,
  SelectContent as g,
  SelectItem as h,
  DialogFooter as i,
  Badge as j,
  DialogTrigger as k,
  router as r,
  supabase as s
};
