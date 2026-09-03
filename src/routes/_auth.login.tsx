import { zodResolver } from "@hookform/resolvers/zod";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  type LoginFormValues,
  loginFormSchema,
} from "@/features/auth/types/schemas";
import type { ApiErrorResponse } from "@/shared/api/client";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});

function getSafeRedirect(target?: string): string {
  if (
    !target ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes(":")
  ) {
    return "/";
  }
  return target;
}

function LoginPage() {
  const { redirect: redirectParam } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Array<{ field?: string; message?: string }>
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setFieldErrors([]);

    try {
      await login(values);
      await router.invalidate();
      const safePath = getSafeRedirect(redirectParam);
      navigate({ to: safePath });
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      const problem = apiErr?.problem;

      if (problem) {
        setErrorMessage(
          problem.detail || problem.title || "Đăng nhập thất bại.",
        );
        if (problem.errors && Array.isArray(problem.errors)) {
          setFieldErrors(problem.errors);
        }
      } else {
        setErrorMessage(
          (err as Error)?.message ||
            "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
        );
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="font-bold text-2xl text-white tracking-tight">
          Đăng Nhập Hệ Thống
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          Hệ thống Quản lý Workshop & Điểm danh Sinh viên
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-rose-300/80 text-xs">
                {fieldErrors.map((fErr) => {
                  const key = `${fErr.field ?? "unknown"}-${fErr.message ?? "error"}`;
                  return (
                    <li key={key}>
                      {fErr.field ? `${fErr.field}: ` : ""}
                      {fErr.message}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-semibold text-slate-300 text-xs uppercase tracking-wider"
          >
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="admin@eduworkshop.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-rose-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-semibold text-slate-300 text-xs uppercase tracking-wider"
          >
            Mật Khẩu
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register("password")}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 py-2.5 pr-10 pl-10 text-sm text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-rose-400 text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-sm text-white shadow-indigo-600/25 shadow-lg transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <span>Đăng Nhập</span>
          )}
        </button>
      </form>
    </div>
  );
}
