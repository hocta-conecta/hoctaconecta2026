import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import * as React from "react";
import styles from "@/styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hocta Conecta — Gestão de Rede Prestadora" },
      {
        name: "description",
        content:
          "Plataforma para gestão da rede prestadora Hocta: prospecção, prestadores, projetos e administração.",
      },
      { property: "og:title", content: "Hocta Conecta — Gestão de Rede Prestadora" },
      { name: "twitter:title", content: "Hocta Conecta — Gestão de Rede Prestadora" },
      { name: "description", content: "A simple notepad application for creating and managing notes." },
      { property: "og:description", content: "A simple notepad application for creating and managing notes." },
      { name: "twitter:description", content: "A simple notepad application for creating and managing notes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86acfc4f-a1bc-44ed-8178-b40b26beae46/id-preview-c948a85f--838d786f-5570-46b0-9933-afe2f560e954.lovable.app-1782383861424.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/86acfc4f-a1bc-44ed-8178-b40b26beae46/id-preview-c948a85f--838d786f-5570-46b0-9933-afe2f560e954.lovable.app-1782383861424.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground mt-2">
          O endereço acessado não existe.
        </p>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext();
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
