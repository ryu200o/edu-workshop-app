import {
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
import { useAuth } from "@/features/auth/context/auth-context";
import type { RoomStatus, RoomSummaryView } from "@/features/rooms/types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { RoomStatusBadge } from "./room-status-badge";

interface RoomTableProps {
  rooms: RoomSummaryView[];
  isLoading: boolean;
  onViewDetail: (room: RoomSummaryView) => void;
  onEditRoom: (room: RoomSummaryView) => void;
  onScheduleMaintenance: (room: RoomSummaryView) => void;
  onChangeStatus: (room: RoomSummaryView, targetStatus: RoomStatus) => void;
}

export function RoomTable({
  rooms,
  isLoading,
  onViewDetail,
  onEditRoom,
  onScheduleMaintenance,
  onChangeStatus,
}: RoomTableProps) {
  const { user } = useAuth();

  // RBAC Permission Check
  const canManage = Boolean(
    user?.roles?.some((r) => r === "FACILITY_MANAGER" || r === "ADMIN"),
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã Tọa Độ</TableHead>
              <TableHead>Tên Phòng</TableHead>
              <TableHead>Vị Trí</TableHead>
              <TableHead>Sức Chứa</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeletons
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <DoorOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-semibold text-foreground text-base">
          Không Tìm Thấy Phòng Học Nào
        </h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Không có dữ liệu phòng học phù hợp với bộ lọc hiện tại. Thử thay đổi
          từ khóa hoặc tiêu chí tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Mã Tọa Độ</TableHead>
            <TableHead>Tên Phòng Học</TableHead>
            <TableHead>Vị Trí Mặt Bằng</TableHead>
            <TableHead>Sức Chứa</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead className="w-[90px] text-right">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow
              key={room.id}
              className="group hover:bg-muted/40 transition-colors"
            >
              {/* Code */}
              <TableCell className="font-semibold text-foreground">
                <span className="rounded-lg bg-muted/60 px-2 py-1 text-xs font-mono">
                  #{room.code}
                </span>
              </TableCell>

              {/* Name */}
              <TableCell>
                <button
                  type="button"
                  onClick={() => onViewDetail(room)}
                  className="font-medium text-foreground hover:text-primary transition-colors text-left"
                >
                  {room.name}
                </button>
              </TableCell>

              {/* Location */}
              <TableCell className="text-muted-foreground text-xs">
                <span>{room.building}</span> • <span>Tầng {room.floor}</span>
              </TableCell>

              {/* Capacity */}
              <TableCell>
                <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {room.capacity} chỗ
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <RoomStatusBadge
                  state={room.state}
                  currentMaintenanceSchedule={room.currentMaintenanceSchedule}
                />
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
