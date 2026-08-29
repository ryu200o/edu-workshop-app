import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

const RECENT_WORKSHOPS = [
  {
    id: "ws-1",
    title: "Workshop: Lập trình Microservices với Spring Cloud",
    time: "30/08/2026 09:00 - 11:30",
    room: "Phòng Lab A2-401",
    capacity: "45/50",
    status: "PUBLISHED",
    statusVariant: "default" as const,
  },
  {
    id: "ws-2",
    title: "Workshop: Cloud Native Architecture & Docker",
    time: "31/08/2026 14:00 - 16:30",
    room: "Hội trường B1",
    capacity: "120/120",
    status: "IN_PROGRESS",
    statusVariant: "success" as const,
  },
  {
    id: "ws-3",
    title: "Workshop: UI/UX Design System với Figma & Radix",
    time: "02/09/2026 08:30 - 11:00",
    room: "Phòng C3-205",
    capacity: "28/35",
    status: "PLANNED",
    statusVariant: "secondary" as const,
  },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            Xin chào, {user?.fullName || user?.email?.split("@")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Tổng quan tình trạng điều phối workshop, phòng học và phiên điểm
            danh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/workshops">
              <Plus className="mr-2 h-4 w-4" />
              <span>Tạo Workshop Mới</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Tổng Số Workshop
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-foreground">12</div>
            <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-semibold">+3</span>
              <span className="text-muted-foreground">so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Phòng Học Đang Dùng
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <DoorOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-foreground">8 / 10</div>
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>2 phòng trống sẵn sàng</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Lượt Điểm Danh
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-foreground">193</div>
            <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
              <span className="font-semibold">96.8%</span>
              <span className="text-muted-foreground">tỷ lệ tham gia</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Người Dùng Hệ Thống
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-foreground">58</div>
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Phân quyền RBAC</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Workshops Table */}
        <Card className="rounded-2xl border-border bg-card shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-semibold text-lg">
                Workshop Gần Đây
              </CardTitle>
              <CardDescription>
                Danh sách các phiên hội thảo đang diễn ra và sắp tới
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workshops">
                <span>Xem tất cả</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Workshop</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead className="text-right">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_WORKSHOPS.map((ws) => (
                  <TableRow key={ws.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{ws.title}</span>
                        <span className="text-muted-foreground text-xs">
                          Sức chứa: {ws.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{ws.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {ws.room}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={ws.statusVariant}>{ws.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Profile & Quick Actions Card */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">
              Thông Tin Tài Khoản
            </CardTitle>
            <CardDescription>
              Trạng thái tài khoản đang đăng nhập
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground text-lg">
                {user?.fullName?.charAt(0) ||
                  user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-foreground text-sm">
                  {user?.fullName || "Người Dùng"}
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vai Trò (Roles):</span>
                <div className="flex flex-wrap gap-1">
                  {user?.roles?.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Mã Sinh Viên / GV:
                </span>
                <span className="font-medium">{user?.studentCode || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng Thái:</span>
                <Badge variant="success" className="text-[10px]">
                  {user?.status || "ACTIVE"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Thao Tác Nhanh
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success(
                      "Thông báo kiểm thử: Toast Sonner hoạt động tốt!",
                    )
                  }
                  className="w-full text-xs"
                >
                  Thử Toast
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="w-full text-xs"
                >
                  <Link to="/attendance">Điểm Danh</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
