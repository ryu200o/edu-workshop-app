import {
  Building2,
  Calendar,
  Clock,
  DoorOpen,
  Hash,
  Shield,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { useRoomDetailQuery } from "@/features/rooms/hooks/useRoomQueries";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
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

interface RoomDetailModalProps {
  roomId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomDetailModal({
  roomId,
  open,
  onOpenChange,
}: RoomDetailModalProps) {
  const { data: room, isLoading } = useRoomDetailQuery(roomId || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {room?.name || "Chi Tiết Phòng Học"}
              </DialogTitle>
              <DialogDescription>
                Mã tọa độ định vị: #{room?.code} • {room?.building}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : !room ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Không tìm thấy thông tin phòng học.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Physical Specs Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  Vị Trí
                </span>
                <p className="mt-1 font-semibold text-sm">{room.building}</p>
                <span className="text-[11px] text-muted-foreground">
                  Tầng {room.floor}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  Mã Tọa Độ
                </span>
                <p className="mt-1 font-semibold text-sm">{room.code}</p>
                <span className="text-[11px] text-muted-foreground">
                  Floor Coordinate
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Sức Chứa
                </span>
                <p className="mt-1 font-semibold text-sm">
                  {room.capacity} chỗ
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Chỗ ngồi tối đa
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  Trạng Thái
                </span>
                <div className="mt-1">
                  <RoomStatusBadge state={room.state} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Audit Information Section */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                Nhật Ký Kiểm Toán (Audit Trail)
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Người Tạo:</span>
                  </div>
                  <p className="mt-1 font-medium text-foreground">
                    {room.createdBy?.identifier || "Hệ thống"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {room.createdBy?.roles?.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">
                        <Shield className="mr-1 h-2.5 w-2.5" />
                        {r}
                      </Badge>
                    ))}
                  </div>
                  {room.createdAt && (
                    <span className="mt-1.5 block text-[11px] text-muted-foreground">
                      {new Date(room.createdAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Cập Nhật Gần Nhất:</span>
                  </div>
                  <p className="mt-1 font-medium text-foreground">
                    {room.updatedBy?.identifier || "Chưa có cập nhật"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {room.updatedBy?.roles?.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">
                        <Shield className="mr-1 h-2.5 w-2.5" />
                        {r}
                      </Badge>
                    ))}
                  </div>
                  {room.updatedAt && (
                    <span className="mt-1.5 block text-[11px] text-muted-foreground">
                      {new Date(room.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Maintenance History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Lịch Sử & Lịch Trình Bảo Trì
                </h4>
                <Badge variant="outline">
                  {room.maintenanceSchedules?.length || 0} đợt
                </Badge>
              </div>

              {!room.maintenanceSchedules ||
              room.maintenanceSchedules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Phòng chưa có lịch bảo trì nào được ghi nhận.
                </div>
              ) : (
                <div className="rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khung Giờ</TableHead>
                        <TableHead>Lý Do</TableHead>
                        <TableHead>Người Lên Lịch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {room.maintenanceSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-foreground font-medium">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {new Date(schedule.startTime).toLocaleString(
                                  "vi-VN",
                                )}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                                <Clock className="h-3 w-3" />
                                đến{" "}
                                {new Date(schedule.endTime).toLocaleString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {schedule.reason || "Bảo trì định kỳ"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {schedule.createdBy?.identifier || "Admin"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
