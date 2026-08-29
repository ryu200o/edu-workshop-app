import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  workshops: "Quản lý Workshop",
  rooms: "Quản lý Phòng học",
  attendance: "Điểm danh & Check-in",
  users: "Quản lý Người dùng",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-muted-foreground text-sm">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Trang chủ</span>
      </Link>
      {pathnames.length === 0 ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Tổng quan</span>
        </>
      ) : (
        pathnames.map((segment, index) => {
          const isLast = index === pathnames.length - 1;
          const href = `/${pathnames.slice(0, index + 1).join("/")}`;
          const label = ROUTE_LABELS[segment] || decodeURIComponent(segment);

          return (
            <div key={href} className="flex items-center space-x-2">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  to={href}
                  className="hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })
      )}
    </nav>
  );
}
