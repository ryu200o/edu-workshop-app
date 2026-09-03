import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "@/features/auth/context/auth-context";
import type { AuthContextType } from "@/features/auth/types";
import { queryClient } from "@/shared/api/query-client";
import { AppSplashLoader } from "@/shared/components/feedback/app-splash-loader";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  context: {
    auth: undefined as unknown as AuthContextType,
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();

  // Deterministic Auth Bootstrapping: Do not mount RouterProvider until initial auth state is resolved
  if (auth.isLoading) {
    return <AppSplashLoader />;
  }

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("app");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
