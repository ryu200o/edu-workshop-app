import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useAuth } from "@/features/auth/context/auth-context";
import { tokenManager } from "@/shared/api/token-manager";
import { Header } from "@/shared/components/layout/header";
import { Sidebar } from "@/shared/components/layout/sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const isAuth =
      context.auth?.isAuthenticated || Boolean(tokenManager.getAccessToken());
    if (!isAuth) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuth = isAuthenticated || Boolean(tokenManager.getAccessToken());

  // Safety net: In case route guard was bypassed, securely redirect to /login instead of returning null
  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        search={{
          redirect: location.href,
        }}
        replace
      />
    );
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden shrink-0 md:flex" />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
