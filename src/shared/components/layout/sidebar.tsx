import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CheckSquare,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: "Lịch & Tài nguyên",
    items: [
      {
        title: "Quản lý Workshop",
        href: "/workshops",
        icon: Calendar,
      },
      {
        title: "Quản lý Phòng học",
        href: "/rooms",
        icon: DoorOpen,
      },
    ],
  },
  {
    groupTitle: "Vận hành",
    items: [
      {
        title: "Điểm danh & Check-in",
        href: "/attendance",
        icon: CheckSquare,
      },
      {
        title: "Quản lý Người dùng",
        href: "/users",
        icon: Users,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-card text-card-foreground",
        className,
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-base text-foreground leading-tight">
            Edu Workshop
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Hệ thống Quản trị & Điều phối
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupTitle} className="space-y-1.5">
            <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.groupTitle}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavigate}
                    activeProps={{
                      className:
                        "bg-primary/10 text-primary font-semibold shadow-xs",
                    }}
                    inactiveProps={{
                      className:
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="border-t border-border p-4 text-center">
        <p className="text-muted-foreground text-xs">
          Phiên bản 1.0.0 (Staging)
        </p>
      </div>
    </aside>
  );
}
