import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tokenManager } from "@/shared/api/token-manager";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    const isAuth =
      context.auth?.isAuthenticated || Boolean(tokenManager.getAccessToken());
    if (isAuth) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 text-slate-100">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
