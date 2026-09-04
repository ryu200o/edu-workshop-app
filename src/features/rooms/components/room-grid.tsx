import {
  Building2,
  CalendarClock,
  DoorOpen,
  Edit3,
  Eye,
  MoreHorizontal,
  Power,
  RotateCcw,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import type { RoomStatus, RoomSummaryView } from "@/features/rooms/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { RoomStatusBadge } from "./room-status-badge";

interface RoomGridProps {
  rooms: RoomSummaryView[];
  isLoading: boolean;
  onViewDetail: (room: RoomSummaryView) => void;
  onEditRoom: (room: RoomSummaryView) => void;
  onScheduleMaintenance: (room: RoomSummaryView) => void;
  onChangeStatus: (room: RoomSummaryView, targetStatus: RoomStatus) => void;
}

export function RoomGrid({
  rooms,
  isLoading,
  onViewDetail,
  onEditRoom,
  onScheduleMaintenance,
  onChangeStatus,
}: RoomGridProps) {
  const { user } = useAuth();

  // RBAC Permission Check
  const canManage = Boolean(
    user?.roles?.some((r) => r === "FACILITY_MANAGER" || r === "ADMIN"),
  );

  // Natural code sorting: rooms.sort((a, b) => a.code - b.code)
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => Number(a.code) - Number(b.code));
  }, [rooms]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Card key={idx} className="rounded-2xl border-border p-4">
            <CardContent className="space-y-4 p-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sortedRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <DoorOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-semibold text-foreground text-lg">
          Không tìm thấy phòng học
        </h3>
        <p className="mt-1 text-muted-foreground text-sm">
          Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedRooms.map((room) => (
        <Card
          key={room.id}
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <CardContent className="flex h-full flex-col justify-between space-y-4 p-0">
            {/* Header: Code Badge + Action Menu */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono font-semibold text-primary text-xs">
                #{room.code}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu thao tác</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => onViewDetail(room)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Xem Chi Tiết</span>
                  </DropdownMenuItem>

                  {canManage && (
                    <>
                      <DropdownMenuItem onClick={() => onEditRoom(room)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        <span>Sửa Thông Tin</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onScheduleMaintenance(room)}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        <span>Lên Lịch Bảo Trì</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {room.state === "ACTIVE" && (
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(room, "MAINTENANCE")}
                          className="text-amber-600 focus:bg-amber-500/10 focus:text-amber-600"
                        >
                          <Wrench className="mr-2 h-4 w-4" />
                          <span>Bảo Trì Phòng</span>
                        </DropdownMenuItem>
                      )}

                      {room.state === "MAINTENANCE" && (
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(room, "ACTIVE")}
                          className="text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-600"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          <span>Kích Hoạt Lại</span>
                        </DropdownMenuItem>
                      )}

                      {room.state !== "DEACTIVATED" && (
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(room, "DEACTIVATED")}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Power className="mr-2 h-4 w-4" />
                          <span>Vô Hiệu Hóa</span>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Body: Room Name & Location */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onViewDetail(room)}
                className="text-left font-semibold text-foreground text-base tracking-tight transition-colors hover:text-primary"
              >
                {room.name}
              </button>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {room.building} • Tầng {room.floor}
                </span>
              </div>
            </div>

            {/* Footer: Capacity + Status Badge */}
            <div className="flex items-center justify-between border-border/60 border-t pt-3">
              <span className="inline-flex items-center gap-1 font-medium text-foreground text-xs">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {room.capacity} chỗ
              </span>

              <RoomStatusBadge
                state={room.state}
                currentMaintenanceSchedule={room.currentMaintenanceSchedule}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
