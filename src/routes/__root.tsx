import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { AuthContextType } from "@/features/auth/types";
import { Toaster } from "@/shared/components/ui/sonner";
import { ThemeProvider } from "@/shared/lib/theme-provider";

import "../styles.css";

export interface MyRouterContext {
  auth: AuthContextType;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="edu_theme">
      <Outlet />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </ThemeProvider>
  );
}
