import { Link, useNavigate } from "@tanstack/react-router";
import {
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6">
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Mobile Menu Drawer Trigger */}
        <div className="md:hidden">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-y-0 left-0 top-0 z-50 h-full w-72 p-0 translate-x-0 translate-y-0 rounded-none border-r border-border bg-card duration-200">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Brand Logo -> Links to / (Dashboard) */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-foreground tracking-tight transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline font-bold text-base">
            Edu Workshop
          </span>
        </Link>

        {/* Top Navbar Links with Auto Active Highlight */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            activeProps={{
              className:
                "!bg-primary/10 !text-primary !font-semibold shadow-xs",
            }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/rooms"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            activeProps={{
              className:
                "!bg-primary/10 !text-primary !font-semibold shadow-xs",
            }}
          >
            <DoorOpen className="h-3.5 w-3.5" />
            <span>Quản Lý Phòng Học</span>
          </Link>
        </nav>
      </div>

      {/* Right: User Area (Identifier, Role, Theme Toggle, Logout) */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* User Account Info & Roles */}
        {user && (
          <div className="hidden flex-col items-end sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground max-w-[150px] truncate">
                {user.fullName || user.email}
              </span>
              {user.roles?.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-mono uppercase"
                >
                  <Shield className="mr-0.5 h-2.5 w-2.5" />
                  {role}
                </Badge>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {user.email}
            </span>
          </div>
        )}

        <ThemeToggle />

        {/* Direct Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-9 gap-1.5 rounded-xl border-border text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Đăng Xuất</span>
        </Button>
      </div>
    </header>
  );
}
