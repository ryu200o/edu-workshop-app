import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  GraduationCap,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">Edu Workshop App</h1>
            <p className="text-xs text-slate-400">
              Hệ thống Điều phối & Điểm danh Workshop
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>Đăng xuất</span>
        </button>
      </header>

      <main className="mx-auto mt-8 max-w-6xl space-y-8">
        {/* User Greeting Card */}
        <section className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 to-slate-900/40 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white text-xl">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">
                  Xin chào, {user?.fullName || user?.email}
                </h2>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.roles?.map((role) => (
                <span
                  key={role}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-medium text-indigo-400 text-xs"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800/60 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-slate-500 text-xs">Mã Sinh Viên</p>
                <p className="font-medium text-slate-200 text-sm">
                  {user?.studentCode || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-slate-500 text-xs">Trạng Thái Tài Khoản</p>
                <p className="font-medium text-emerald-400 text-sm">
                  {user?.status || "ACTIVE"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-slate-500 text-xs">Thời Điểm Khởi Tạo</p>
                <p className="font-medium text-slate-200 text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Modules Shortcuts */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition-all hover:border-slate-700">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Quản Lý Workshop</h3>
            <p className="mt-1 text-slate-400 text-sm">
              Lên lịch, xuất bản và theo dõi vòng đời các phiên hội thảo.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition-all hover:border-slate-700">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Quản Lý Phòng Học</h3>
            <p className="mt-1 text-slate-400 text-sm">
              Điều phối sức chứa, cơ sở và xử lý xung đột phòng học.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition-all hover:border-slate-700">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Điểm Danh & Check-in</h3>
            <p className="mt-1 text-slate-400 text-sm">
              Quét mã QR sinh viên, cập nhật danh sách và đối soát dữ liệu.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
